# Papago Quick Translate

Chrome extension that adds a right-click menu item to translate selected text with [Naver Papago](https://papago.naver.com).

> Not affiliated with Naver. Papago is a trademark of Naver Corporation.

## Features

- Select text on any page, right-click, choose **Translate with Papago**
- Automatic direction based on the text:
  - Contains Hangul (Korean) → **Korean → English**
  - Otherwise → **Auto-detect → Korean**
- Opens papago.naver.com in a new tab with the text pre-filled
- No API keys, no data collection

## Install (Developer mode)

1. Download or clone this repository
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder
5. Select text on any page → right-click → **Translate with Papago**

## How it works

| Selected text | Opens |
|---|---|
| `hello world` | `papago.naver.com/?sk=auto&tk=ko&st=hello world` |
| `안녕하세요` | `papago.naver.com/?sk=ko&tk=en&st=안녕하세요` |
| `hello 안녕` (mixed) | treated as Korean |

Language check is a simple Hangul character-range test (`papago.js`) — instant and offline. Papago handles source-language detection for non-Korean text.

## Project structure

```
manifest.json      # Manifest V3, contextMenus permission only
background.js      # Service worker: menu registration + click handler
papago.js          # Hangul detection + Papago URL builder (pure functions)
icons/             # 16/48/128 px icons
test/              # Plain-Node tests: node test/papago.test.js
scripts/           # Icon generation (PowerShell)
```

## Testing

```
node test/papago.test.js
```

## License

MIT
