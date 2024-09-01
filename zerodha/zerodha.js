

import { CHROMESTORAGE, combineObjects, getLocalStorageData, executeScriptAsync, clearLocalStorageData, setLocalStorageData, deleteCookie } from "../utils.js"

const STORAGE_KEY_ZERODHA = "stored_data_zerodha"

// ----------------------------------------------------------------------------------------------------------------
export async function getStoredAccounts() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    return result
}

export async function addStoredAccounts(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_ZERODHA, combined)
        return combined
    }
    return result
}

export async function delStoredAccounts(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_ZERODHA, result)
}

export async function delAllStoredAccounts() {
    await CHROMESTORAGE.remove(STORAGE_KEY_ZERODHA)
}

async function getUserName(userid) {
    if (userid == undefined || userid == "" || userid == null) {
        return ""
    }
    var count = 0
    try {
        while (count < 5) {
            const storeddata = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
            if (userid in storeddata && storeddata[userid]['display_name'] != "") {
                return storeddata[userid]['display_name']
            }
            const tabs = await chrome.tabs.query({});
            const reqTabs = tabs.filter(tab => tab.url.includes("kite.zerodha.com"));
            for (const tab of reqTabs) {
                const results = await executeScriptAsync(tab.id, getLocalStorageData, []);
                const output = results[0].result;
                if (output["__storejs_kite_user_id"].includes(userid)) {
                    try {
                        const username = JSON.parse(output['__storejs_kite_user/user_name'])['userName']
                        return username
                    } catch {
                        return ""
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            count += 1
        }
    } catch (error) {
        console.error('Error injecting script:', error);
    }
    return ""
}


export async function getLocalStorageStoredData(userid) {
    if (userid == undefined || userid == "" || userid == null) {
        return {}
    }
    var obj = {}
    const storeddata = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    if (userid in storeddata && storeddata[userid]['localdata'] != undefined && Object.keys(storeddata[userid]['localdata']).length != 0) {
        return storeddata[userid]['localdata']
    }
    const tabs = await chrome.tabs.query({});
    const reqTabs = tabs.filter(tab => tab.url.includes("kite.zerodha.com"));
    for (const tab of reqTabs) {
        const results = await executeScriptAsync(tab.id, getLocalStorageData, []);
        const output = results[0].result;
        Object.keys(output).forEach(key => {
            if (key.includes("_storejs")) {
                obj[key] = output[key]
            }
        })
        break
    }
    return obj
}

export async function getCurrentAccount() {


    const domain = ".zerodha.com"
    const cookies = await chrome.cookies.getAll({ domain });

    var user = {}
    user['broker'] = 'ZERODHA'
    user['cookies'] = []
    for (const item of cookies) {
        if (item["value"] == "null") {
            continue
        }
        if (item['name'] == "enctoken") {
            user['token'] = item['value']
            user['cookies'].push(item)
        }
        if (item['name'] == "kf_session") {
            user['session'] = item['value']
            user['cookies'].push(item)
        }
        if (item['name'] == "public_token") {
            user['publictoken'] = item['value']
            user['cookies'].push(item)
        }
        if (item['name'] == "user_id") {
            user['id'] = item['value']
            user['cookies'].push(item)
        }
    }
    if ('token' in user && user['token'] != '' && user['id'] != undefined) {
        user['display_name'] = await getUserName(user['id'])
        user['localdata'] = await getLocalStorageStoredData(user['id'])
        return { [user['id']]: user }
    }
    return {}

}


export async function getAccountList() {
    const curr_user = await getCurrentAccount()
    const storedUsers = await addStoredAccounts(curr_user)
    const user_id = Object.keys(curr_user)[0]
    var zerodha_users = []
    Object.keys(storedUsers).forEach(key => {
        zerodha_users.push(storedUsers[key])
        if (key == user_id) {
            storedUsers[key]['active'] = true
        } else {
            storedUsers[key]['active'] = false
        }

    })
    zerodha_users.sort((a, b) => b['id'] > a['id']);
    return zerodha_users
}

export async function clearAccount() {
    const curr_user = await getCurrentAccount()
    if (Object.keys(curr_user).length !== 0) {
        var key = Object.keys(curr_user)[0]
        for (const c of curr_user[key]['cookies']) {
            await deleteCookie(c);
        }
    }

    const tabs = await chrome.tabs.query({});
    const reqTabs = tabs.filter(tab => tab.url.includes("kite.zerodha.com"));
    for (const tab of reqTabs) {
        await executeScriptAsync(tab.id, clearLocalStorageData, []);
    }
}

export async function reloadOrOpenTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({}, function (tabs) {
            var reloaded = false;
            const tabIds = [];
            var activeTabId = "";
            for (const item of tabs) {
                if (item['url'].includes('kite.zerodha.com')) {
                    tabIds.push(item.id);
                    chrome.tabs.reload(item.id);
                    reloaded = true;
                    if (item.active) {
                        activeTabId = item.id;
                    }
                }
            }
            if (!reloaded) {
                chrome.tabs.create({ url: 'https://kite.zerodha.com' }, (tab) => {
                    tabIds.push(item.id);
                });
            }
            const listener = function (tabIdUpdated, changeInfo, tab) {
                if (activeTabId == "") {
                    if (tabIds.includes(tabIdUpdated) && changeInfo.status === 'complete') {
                        chrome.tabs.update(tabIdUpdated, { active: true });
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve();
                    }
                } else {
                    if (tabIdUpdated == activeTabId && changeInfo.status === 'complete') {
                        chrome.tabs.update(tabIdUpdated, { active: true });
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve();
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        })
    })
}

export async function switchUser(user) {
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
