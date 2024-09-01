

import { CHROMESTORAGE, combineObjects, deleteCookie } from "../utils.js"

const STORAGE_KEY_FYERS = "stored_data_fyers"

// ----------------------------------------------------------------------------------------------------------------
export async function getStoredAccounts() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    return result
}

export async function addStoredAccounts(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_FYERS, combined)
        return combined
    }
    return result
}

export async function delStoredAccounts(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_FYERS, result)
}

export async function delAllStoredAccounts() {
    await CHROMESTORAGE.remove(STORAGE_KEY_FYERS)
}


export function getCurrentAccount() {
    const domain = ".fyers.in"
    const cookies = chrome.cookies.getAll({ domain });
    return cookies.then(result => {
        var user = {}
        user['broker'] = 'FYERS'
        user['cookies'] = []
        for (const item of result) {
            if (item['name'] == "_FYERS") {
                user['token'] = item['value']
                user['cookies'].push(item)
            }
            if (item['name'] == "refresh_token") {
                user['rtoken'] = item['value']
                user['cookies'].push(item)
            }
            if ('token' in user && 'rtoken' in user) {
                break
            }
        }
        if ('token' in user && user['token'] != '') {
            try {
                const decodedPayload = atob(user['token'].split('.')[1]);
                const data = JSON.parse(decodedPayload);
                user['id'] = data['fy_id']
                user['display_name'] = data['display_name']
                return { [user['id']]: user }
            } catch (error) {
                console.error(error)
            }
        }
        return {}
    }).catch(error => {
        console.error(error);
        return {}
    })
}

export async function getAccountList() {
    const curr_user = await getCurrentAccount()
    const storedUsers = await addStoredAccounts(curr_user)
    const user_id = Object.keys(curr_user)[0]
    var fyers_users = []
    Object.keys(storedUsers).forEach(key => {
        fyers_users.push(storedUsers[key])
        if (key == user_id) {
            storedUsers[key]['active'] = true
        } else {
            storedUsers[key]['active'] = false
        }

    })
    fyers_users.sort((a, b) => b['id'] > a['id']);
    return fyers_users
}

export async function clearAccount() {
    const curr_user = await getCurrentAccount()
    if (Object.keys(curr_user).length !== 0) {
        var key = Object.keys(curr_user)[0]
        for (const c of curr_user[key]['cookies']) {
            await deleteCookie(c);
        }
    }
}

export async function reloadOrOpenTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({}, function (tabs) {
            var reloaded = false;
            const tabIds = [];
            var activeTabId = "";
            for (const item of tabs) {
                if (item['url'].includes('trade.fyers.in') || item['url'].includes('login.fyers.in')) {
                    tabIds.push(item.id);
                    chrome.tabs.reload(item.id);
                    reloaded = true;
                    if (item.active) {
                        activeTabId = item.id;
                    }
                }
            }
            if (!reloaded) {
                chrome.tabs.create({ url: 'https://trade.fyers.in' }, (tab) => {
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
    for (const cookie of user['cookies']) {
        await chrome.cookies.set({
            url: 'https://trade.fyers.in',
            domain: cookie.domain,
            name: cookie.name,
            value: cookie.value
        })
    }
}

// ----------------------------------------------------------------------------------------------------------------



// cookieitemstructure:
// domain: ".fyers.in"
// hostOnly: false
// httpOnly: false
// name: "_clientMN"
// path: "/"
// sameSite: "unspecified"
// secure: true
// session: true
// storeId: "0"
// value: "1234567890"

