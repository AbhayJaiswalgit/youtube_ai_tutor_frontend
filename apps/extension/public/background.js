// Allows users to open the side panel by clicking the extension icon in the Chrome toolbar
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
