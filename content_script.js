chrome.storage.sync.get(
    { instance: 'cobalt.tools', auto: true },
    (items) => {
        const u = new URLSearchParams(window.location.search).get('u');
        if(location.host === items.instance && items.auto && u) {
            let int = setInterval(() => {
                let urlInput = document.getElementById('url-input-area');
                if(urlInput.value) {
                    clearInterval(int);
                    let btn = document.getElementById('download-button');
                    if(btn) {
                        btn.click();
                    }
                }
            }, 100);
        }
    }
);