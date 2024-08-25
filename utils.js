export const CHROMESTORAGE = {
    get: function (key) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (result) => {
                resolve(result[key] || {});
            });
        });
    },

    set: function (key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, resolve);
        });
    },

    remove: function (key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, resolve);
        });
    },
};

export function capitalizeWords(str) {
    return str.toLowerCase().replace(/\b\w/g, function (match) {
        return match.toUpperCase();
    });
}

export function combineObjects(obj1, obj2) {
    return Object.assign({}, obj1, obj2);
}


export async function deleteCookie(cookie) {
    const protocol = cookie.secure ? 'https:' : 'http:';
    const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
    await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId
    });
}




export function executeScriptAsync(tabId, func, args) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: func,
                args: args
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

export function getLocalStorageData() {
    let data = {};
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            data[key] = localStorage.getItem(key);
        }
    }
    return data;
}

export function setLocalStorageData(data) {
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            localStorage.setItem(key, data[key]);
        }
    }
}

export function clearLocalStorageData() {
    localStorage.clear();
}


