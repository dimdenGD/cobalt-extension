let patterns = [
    "*://*.bilibili.com/video/*",

    "*://*.instagram.com/p/*",
    "*://*.instagram.com/reels/*",
    "*://*.instagram.com/reel/*",

    "*://*.twitter.com/*/status/*",
    "*://*.twitter.com/*/status/*/video/*",
    "*://*.twitter.com/i/spaces/*",
    
    "*://*.reddit.com/r/*/comments/*/*",

    "*://*.soundcloud.com/*/*",
    "*://*.soundcloud.app.goo.gl/*",

    "*://*.tumblr.com/post/*",
    "*://*.tumblr.com/*/*",
    "*://*.tumblr.com/*/*/*",
    "*://*.tumblr.com/blog/view/*/*",

    "*://*.tiktok.com/*",
    
    "*://*.vimeo.com/*",

    "*://*.youtube.com/watch?*",
    "*://*.youtu.be/*",

    "*://*.vk.com/video*",
    "*://*.vk.com/*?w=wall*",
    "*://*.vk.com/clip*",

    "*://*.vine.co/*",
];

chrome.contextMenus.create({
    title: "Download media from link",
    contexts: ["link"],
    id: "download-media-from-link",
    targetUrlPatterns: patterns
});
chrome.contextMenus.create({
    title: "Download media from this page",
    contexts: ["page"],
    id: "download-media-from-page",
    documentUrlPatterns: patterns
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
    } else if(info.menuItemId === "download-media-from-page") {
        chrome.storage.sync.get(
            { instance: 'co.wukko.me' },
            (items) => {
                chrome.tabs.create({
                    url: `https://${items.instance}/?u=${tab.url}`
                });
            }
        );
    }
});