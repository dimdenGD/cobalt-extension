const saveOptions = () => {
    const apiurl = document.getElementById('instance').value;
    const auto = document.getElementById('auto').checked;

    chrome.storage.sync.set(
        { instance, auto },
        () => {
            alert('Options saved.')
        }
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        { apiurl: 'api.cobalt.tools', auto: true },
        (items) => {
            document.getElementById('instance').value = items.apiurl;
            document.getElementById('auto').checked = items.auto;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
