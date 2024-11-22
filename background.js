const patterns = [
    "*://*.bilibili.com/video/*",

    "*://*.instagram.com/p/*",
    "*://*.instagram.com/reels/*",
    "*://*.instagram.com/reel/*",

    "*://*.twitter.com/*/status/*",
    "*://*.twitter.com/*/status/*/video/*",
    "*://*.twitter.com/i/spaces/*",

    "*://*.x.com/*/status/*",
    "*://*.x.com/*/status/*/video/*",
    "*://*.x.com/i/spaces/*",
    
    "*://*.reddit.com/r/*/comments/*/*",

    "*://*.soundcloud.com/*",
    "*://*.soundcloud.app.goo.gl/*",

    "*://*.tumblr.com/post/*",
    "*://*.tumblr.com/*/*",
    "*://*.tumblr.com/*/*/*",
    "*://*.tumblr.com/blog/view/*/*",

    "*://*.tiktok.com/*",
    
    "*://*.vimeo.com/*",

    "*://*.youtube.com/watch?*",
    "*://*.youtu.be/*",
    "*://*.youtube.com/shorts/*",

    "*://*.vk.com/video*",
    "*://*.vk.com/*?w=wall*",
    "*://*.vk.com/clip*",

    "*://*.vine.co/*",

    "*://*.streamable.com/*",
    "*://*.pinterest.com/pin/*"
];

chrome.contextMenus.create({
    title: "download media from link",
    contexts: ["link"],
    id: "download-media-from-link",
    targetUrlPatterns: patterns
});
chrome.contextMenus.create({
    title: "download media from this page",
    contexts: ["page"],
    id: "download-media-from-page",
    documentUrlPatterns: patterns
});
chrome.action.onClicked.addListener(tab => {
    let matched = false;
    for(let pattern of patterns) {
        if(tab.url.includes(pattern.split("*://*.")[1].split("/")[0])) {
            matched = true;
            break;
        }
    }
    if(!matched) {
        return;
    }
    chrome.storage.sync.get(
        { apiurl: 'api.cobalt.tools' },
        (items) => {
            downloadItem(items.apiurl, tab.url);
        }
    );
});

chrome.contextMenus.onClicked.addListener((info, tab) => {  
    if(info.menuItemId === "download-media-from-link") {
        chrome.storage.sync.get(
            { apiurl: 'api.cobalt.tools' },
            (items) => {
                downloadItem(items.apiurl, info.linkUrl)
            }
        );
    } else if(info.menuItemId === "download-media-from-page") {
        chrome.storage.sync.get(
            { apiurl: 'api.cobalt.tools' },
            (items) => {
                downloadItem(items.apiurl, tab.url);
            }
        );
    }
});
async function downloadItem(apiUrl, targetUrl) {
    try {
        const v = await getApiVersion(apiUrl);
        const fetchFn = v?.startsWith?.('7.') ? fetchv7 : fetchv10;
        const res = await fetchFn(apiUrl, targetUrl);
        const json = await res.json();
        if(!json.url) throw new Error("no url");
        chrome.tabs.create({url: json.url});
    } catch(e) {
        let au = apiUrl;
        if(!au.startsWith("https://") && !au.startsWith("http://")) au = `https://` + au;
        au = au.replace("https://api.", "https://").replace("http://api.", "http://");
        if(!au.endsWith("/")) au += '/';
        au += `?u=${targetUrl}`;
        chrome.tabs.create({url: au });
        console.error(e);
    }
}
async function getApiVersion(url) {
    const res = await fetch(`https://${url}/api/serverInfo`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    const info = await res.json();
    return info.cobalt !== undefined ? info.cobalt.version : info.version;
}
function fetchv10(url, targetUrl) {
    return fetch(`https://${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            url: targetUrl,
            filenameStyle: 'pretty'
        })
    });
}
function fetchv7(url, targetUrl) {
    return fetch(`https://${url}/api/json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            url: targetUrl,
            filenamePattern: 'pretty'
        })
    });
}

