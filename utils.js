import { getCurrentAccountZerodha } from "./zerodha/zerodha.js";


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

export async function switchUser(user, broker) {
    if (broker === "ZERODHA") {
        const tabs = await chrome.tabs.query({});
        const reqTabs = tabs.filter(tab => tab.url.includes("kite.zerodha.com"));
        for (const tab of reqTabs) {
            await executeScriptAsync(tab.id, clearLocalStorageData, []);
            await executeScriptAsync(tab.id, setLocalStorageData, [user['localdata']]);
        }
        for (const cookie of user['cookies']) {
            var domain = cookie.domain
            if (domain.includes('kite.zerodha.com')) {
                domain = ""
            }
            await chrome.cookies.set({
                url: 'https://kite.zerodha.com',
                domain: domain,
                name: cookie.name,
                value: cookie.value,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure
            })
        }
    }
}

export async function reloadOrOpenTab(broker) {
    return new Promise((resolve) => {

        chrome.tabs.query({}, function (tabs) {
            var reloaded = false;
            var tabId;
            var active = true;
            if (broker == "ZERODHA") {
                for (const item of tabs) {
                    if (item['url'].includes('kite.zerodha.com')) {
                        tabId = item.id;
                        chrome.tabs.reload(tabId);
                        reloaded = true;
                        break;
                    }
                }
                if (!reloaded) {
                    chrome.tabs.create({ url: 'https://kite.zerodha.com' }, (tab) => {
                        tabId = tab.id;
                    });
                }
            }
            const listener = function (tabIdUpdated, changeInfo, tab) {
                console.log(tabIdUpdated, tabId)
                if (tabIdUpdated === tabId && changeInfo.status === 'complete') {
                    chrome.tabs.update(tabId, { active: true });
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        })
    })
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


export async function addAccount(broker) {
    if (broker === "ZERODHA") {
        const curr_user = await getCurrentAccountZerodha()
        if (Object.keys(curr_user).length !== 0) {
            var key = Object.keys(curr_user)[0]
            for (const c of curr_user[key]['cookies']) {
                await deleteCookie(c);
            }
        }

        const tabs = await chrome.tabs.query({});
        const reqTabs = tabs.filter(tab => tab.url.includes("kite.zerodha.com"));
        for (const tab of reqTabs) {
            const results = await executeScriptAsync(tab.id, clearLocalStorageData, []);
            const output = results[0].result;
        }
    }
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


