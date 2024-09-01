

import { CHROMESTORAGE, combineObjects, getLocalStorageData, executeScriptAsync, deleteCookie } from "../utils.js"
import { decryptDataDhan } from "./decrypt.js"

const STORAGE_KEY_DHAN = "stored_data_dhan"

// ----------------------------------------------------------------------------------------------------------------
export async function getStoredAccounts() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    return result
}

export async function addStoredAccounts(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_DHAN, combined)
        return combined
    }
    return result
}

export async function delStoredAccounts(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_DHAN, result)
}

export async function delAllStoredAccounts() {
    await CHROMESTORAGE.remove(STORAGE_KEY_DHAN)
}

async function getCurrentUserDetails() {
    try {
        const tabs = await chrome.tabs.query({});
        const reqTabs = tabs.filter(tab => tab.url.includes("web.dhan.co"));
        for (const tab of reqTabs) {
            const results = await executeScriptAsync(tab.id, getLocalStorageData, []);
            const output = results[0].result;
            return output
        }
    } catch (error) {
        console.error('Error injecting script:', error);
    }
    return {}
}


export async function getLocalStorageStoredData(userid) {
    if (userid == undefined || userid == "" || userid == null) {
        return ""
    }
    var obj = {}
    const storeddata = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    console.log(storeddata, userid)
    if (userid in storeddata && storeddata[userid]['localdata'] != undefined && Object.keys(storeddata[userid]['localdata']).length != 0) {
        return storeddata[userid]['localdata']
    }
    const tabs = await chrome.tabs.query({});
    const reqTabs = tabs.filter(tab => tab.url.includes("kite.dhan.com"));
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


    const domain = ".dhan.co"
    const cookies = await chrome.cookies.getAll({ domain });

    var user = {}
    user['broker'] = 'DHAN'
    user['cookies'] = []
    for (const item of cookies) {
        if (item["value"] == "null") {
            continue
        }
        if (item['name'].includes('hjSession')) {
            user['cookies'].push(item)
        }
    }
    if (user['cookies'].length != 0) {
        const data = await getCurrentUserDetails(user['id'])
        try {
            if (data.length != 0 && (data['userdata'] != undefined && data['userdata'] != "")) {
                const decrypted = await decryptDataDhan(data['userdata'])
                const parsed = JSON.parse(decrypted)
                user['localdata'] = data
                console.log(parsed, 'decrypted')
                user['id'] = parsed['login_id']
                user['display_name'] = parsed['display_name']
                return { [user['id']]: user }
            }
        } catch {

        }
    }
    return {}

}


export async function getAccountList() {
    const curr_user = await getCurrentAccount()
    const storedUsers = await addStoredAccounts(curr_user)
    const user_id = Object.keys(curr_user)[0]
    var dhan_users = []
    Object.keys(storedUsers).forEach(key => {
        dhan_users.push(storedUsers[key])
        if (key == user_id) {
            storedUsers[key]['active'] = true
        } else {
            storedUsers[key]['active'] = false
        }

    })
    console.log(dhan_users, curr_user)
    dhan_users.sort((a, b) => b['id'] > a['id']);
    return dhan_users
}

export async function dhanNewLogin() {
    return new Promise((resolve) => {
        chrome.tabs.query({}, async function (tabs) {
            var reloaded = false;
            for (const item of tabs) {
                if (item['url'].includes('web.dhan.co') || item['url'].includes('login.dhan.co')) {
                    await setNewLoginCookie()
                    chrome.tabs.update(item.id, { url: 'https://login.dhan.co' })
                    reloaded = true;
                }
            }
            if (!reloaded) {
                chrome.tabs.create({ url: 'https://login.dhan.co' },)
            }
            resolve();
        });
    });
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
                if (item['url'].includes('web.dhan.co') || item['url'].includes('login.dhan.co')) {
                    tabIds.push(item.id);
                    chrome.tabs.update(item.id, { url: 'https://web.dhan.co' })
                    reloaded = true;
                    if (item.active) {
                        activeTabId = item.id;
                    }
                }
            }
            if (!reloaded) {
                chrome.tabs.create({ url: 'https://web.dhan.co' }, (tab) => {
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
    const reqTabs = tabs.filter(tab => tab.url.includes("web.dhan.co") || tab.url.includes('login.dhan.co'));
    await setSwitchAccCookie(user['localdata'])
}

export async function setNewLoginCookie() {
    const web_cookie_name_clear = "web_dhan_clear"
    const web_cookie_name_switch = "web_dhan_switch"
    await setCookiePromise(web_cookie_name_clear, "true")
    await setCookiePromise(web_cookie_name_switch, "false")
    const login_cookie_name_clear = "login_dhan_clear"
    const login_cookie_name_switch = "login_dhan_switch"
    await setCookiePromise(login_cookie_name_clear, "true")
    await setCookiePromise(login_cookie_name_switch, "false")
}

const setCookiePromise = (key, value) => {
    return new Promise((resolve, reject) => {
        chrome.cookies.set({
            url: "https://dhan.co",
            domain: ".dhan.co", // Replace with your domain
            name: key,
            value: value,
            path: "/"
        }, function (cookie) {
            if (chrome.runtime.lastError) {
                console.log("Error setting cookie:", chrome.runtime.lastError);
                resolve(cookie);
            } else {
                console.log("New login cookie set:", cookie);
                resolve(cookie);
            }
        });
    });
};


async function setSwitchAccCookie(data) {
    try {
        const cookiePromises = Object.entries(data).map(([key, value]) =>
            setCookiePromise("switchbro_" + key, value)
        );
        await Promise.all(cookiePromises);
        console.log("setting cookies")
        const web_cookie_name_clear = "web_dhan_clear"
        const web_cookie_name_switch = "web_dhan_switch"
        await setCookiePromise(web_cookie_name_clear, "true")
        await setCookiePromise(web_cookie_name_switch, "true")
        const login_cookie_name_clear = "login_dhan_clear"
        const login_cookie_name_switch = "login_dhan_switch"
        await setCookiePromise(login_cookie_name_clear, "true")
        await setCookiePromise(login_cookie_name_switch, "true")
        console.log("All cookies have been set successfully");
    } catch (error) {
        console.error("An error occurred while setting cookies:", error);
    }
}
