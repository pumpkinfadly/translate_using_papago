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
