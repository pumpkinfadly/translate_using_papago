# Papago Context Menu Translator — Design

## Purpose

Chrome extension that lets the user select text on any webpage, right-click, and open Naver Papago with that text ready to translate.

- Selected text contains Hangul → Papago opens with Korean → English.
- Selected text has no Hangul → Papago opens with Auto-detect → Korean.

## Architecture (Manifest V3)

| File | Role |
|---|---|
| `manifest.json` | MV3 manifest; `contextMenus` permission only; icon metadata |
| `background.js` | Service worker: registers context menu on install; handles click |
| `icons/icon16.png`, `icon48.png`, `icon128.png` | Toolbar/extension icons |

## Behavior

1. `chrome.runtime.onInstalled` → create context menu item "Translate with Papago" with `contexts: ["selection"]`.
2. `chrome.contextMenus.onClicked` → read `info.selectionText`.
3. Hangul check: regex `[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]` (any Hangul jamo/syllable counts as Korean — mixed text counts as Korean).
4. Open new foreground tab:
   - Hangul found: `https://papago.naver.com/?sk=ko&tk=en&st=<encodeURIComponent(text)>`
   - No Hangul: `https://papago.naver.com/?sk=auto&tk=ko&st=<encodeURIComponent(text)>`

## Non-Goals

- No Papago API keys, no in-page popup, no options page.
- No romanized-Korean handling (e.g. "annyeong" is treated as non-Korean).

## Testing / Verification

- Load unpacked in `chrome://extensions`, select English text → Papago opens auto→ko.
- Select Korean text → Papago opens ko→en.
- Select mixed text → treated as ko→en.
