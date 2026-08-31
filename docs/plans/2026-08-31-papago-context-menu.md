# Papago Context Menu Translator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chrome MV3 extension: right-click selected text → opens Papago (Hangul present → ko→en, otherwise → auto→ko).

**Architecture:** Classic service worker (`background.js`) registers one context menu on install and opens a Papago URL built by pure helper functions in `papago.js` (shared with a plain-Node test via `module.exports` guard). Icons are static PNGs.

**Tech Stack:** Vanilla JS, Chrome Extensions MV3 (`contextMenus`), Node 24 (tests only), PowerShell System.Drawing (icon generation).

---

### Task 1: Core logic (TDD)

**Files:**
- Test: `test/papago.test.js`
- Create: `papago.js`

**Step 1: Write the failing test**

```js
const assert = require("assert");
const { isKorean, buildPapagoUrl } = require("../papago.js");

// isKorean
assert.strictEqual(isKorean("hello"), false);
assert.strictEqual(isKorean("안녕하세요"), true);
assert.strictEqual(isKorean("hello 안녕"), true); // mixed counts as Korean
assert.strictEqual(isKorean("ㄱㄴㄸ ㅏㅣ"), true); // jamo counts
assert.strictEqual(isKorean("日本語"), false);
assert.strictEqual(isKorean(""), false);

// buildPapagoUrl
assert.strictEqual(
  buildPapagoUrl("hello world"),
  "https://papago.naver.com/?sk=auto&tk=ko&st=hello%20world"
);
assert.strictEqual(
  buildPapagoUrl("안녕"),
  "https://papago.naver.com/?sk=ko&tk=en&st=%EC%95%88%EB%85%95"
);

console.log("All papago tests passed");
```

**Step 2: Run test to verify it fails**

Run: `node test/papago.test.js`
Expected: FAIL — `Cannot find module '..\papago.js'`

**Step 3: Write minimal implementation**

```js
const HANGUL_RE = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

function isKorean(text) {
  return HANGUL_RE.test(text);
}

function buildPapagoUrl(text) {
  const st = encodeURIComponent(text);
  return isKorean(text)
    ? `https://papago.naver.com/?sk=ko&tk=en&st=${st}`
    : `https://papago.naver.com/?sk=auto&tk=ko&st=${st}`;
}

if (typeof module !== "undefined") module.exports = { isKorean, buildPapagoUrl };
```

**Step 4: Run test to verify it passes**

Run: `node test/papago.test.js`
Expected: `All papago tests passed`

**Step 5: Commit**

```bash
git add papago.js test/papago.test.js
git commit -m "feat: papago URL builder with hangul detection"
```

### Task 2: manifest.json + background service worker

**Files:**
- Create: `manifest.json`
- Create: `background.js`

**Step 1: Write manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Papago Quick Translate",
  "version": "1.0.0",
  "description": "Right-click selected text to open Papago. Non-Korean → Korean, Korean → English.",
  "permissions": ["contextMenus"],
  "background": { "service_worker": "background.js" },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Step 2: Write background.js**

```js
importScripts("papago.js");

const MENU_ID = "papago-translate";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Translate with Papago",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  chrome.tabs.create({ url: buildPapagoUrl(info.selectionText), active: true });
});
```

**Step 3: Validate manifest JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8')); console.log('manifest OK')"`
Expected: `manifest OK`

**Step 4: Commit**

```bash
git add manifest.json background.js
git commit -m "feat: context menu opens papago in new tab"
```

### Task 3: Icons

**Files:**
- Create: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`

**Step 1: Generate PNGs with PowerShell System.Drawing**

Run (single command, per size 16/48/128): green rounded square `#03C75A` (Naver green), white bold "P" centered:

```powershell
powershell -Command "Add-Type -AssemblyName System.Drawing; foreach($s in 16,48,128){ $bmp=New-Object System.Drawing.Bitmap($s,$s); $g=[System.Drawing.Graphics]::FromImage($bmp); $g.SmoothingMode='AntiAlias'; $g.Clear([System.Drawing.Color]::Transparent); $b=New-Object System.Drawing.Drawing2D.GraphicsPath; $r=20; $b.AddArc(0,0,$r,$r,180,90); $b.AddArc($s-$r,0,$r,$r,270,90); $b.AddArc($s-$r,$s-$r,$r,$r,0,90); $b.AddArc(0,$s-$r,$r,$r,90,90); $b.CloseFigure(); $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,3,199,90))),$b); $f=New-Object System.Drawing.Font('Arial',[int]($s*0.62),[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel); $sf=New-Object System.Drawing.StringFormat; $sf.Alignment='Center'; $sf.LineAlignment='Center'; $g.DrawString('P',$f,[System.Drawing.Brushes]::White,(New-Object System.Drawing.RectangleF(0,0,$s,$s)),$sf); $g.Dispose(); $bmp.Save(\"icons\icon$s.png\",[System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose() }"
```

(If `$r=20` radius is invalid at 16px, use `$r=[Math]::Max(4,[int]($s*0.2))`.)

**Step 2: Verify files exist and are valid PNGs**

Run: `node -e "const fs=require('fs'); for(const s of [16,48,128]){const b=fs.readFileSync('icons/icon'+s+'.png'); if(b.readUInt32BE(0)!==0x89504E47) throw new Error('bad png '+s)} console.log('icons OK')"`
Expected: `icons OK`

**Step 3: Commit**

```bash
git add icons
git commit -m "feat: extension icons"
```

### Task 4: Final verification

**Step 1:** Run `node test/papago.test.js` → `All papago tests passed`
**Step 2:** Confirm file tree: `manifest.json`, `background.js`, `papago.js`, `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`, `test/papago.test.js`
**Step 3:** Manual QA (user): `chrome://extensions` → Developer mode → Load unpacked → select English text, right-click → Papago opens auto→ko; select Korean text → ko→en; mixed text → ko→en.
