chrome.contextMenus.create({
    title: "Download media from link",
    contexts: ["link"],
    id: "download-media-from-link"
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if(info.menuItemId === "download-media-from-link") {
        chrome.storage.sync.get(
            { instance: 'co.wukko.me' },
            (items) => {
                chrome.tabs.create({
                    url: `https://${items.instance}/?u=${info.linkUrl}`
                });
            }
        );
    };
});