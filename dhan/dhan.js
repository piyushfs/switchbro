

import { CHROMESTORAGE, combineObjects, getLocalStorageData, executeScriptAsync, clearLocalStorageData, reloadOrOpenTab, setLocalStorageData } from "../utils.js"
import { decryptDataDhan } from "./decrypt.js"

const STORAGE_KEY_DHAN = "stored_data_dhan"

// ----------------------------------------------------------------------------------------------------------------
export async function getStoredAccountsDhan() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    return result
}

export async function addStoredAccountsDhan(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_DHAN, combined)
        return combined
    }
    return result
}

export async function delStoredAccountsDhan(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_DHAN)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_DHAN, result)
}

export async function delAllStoredAccountsDhan() {
    await CHROMESTORAGE.remove(STORAGE_KEY_DHAN)
}

async function getCurrentUserDetails() {
    try {
        const tabs = await chrome.tabs.query({});
        const reqTabs = tabs.filter(tab => tab.url.includes("web.dhan.co"));
        for (const tab of reqTabs) {
            const results = await executeScriptAsync(tab.id, getLocalStorageData, []);
            const output = results[0].result;
            return output['userdata']
        }
    } catch (error) {
        console.error('Error injecting script:', error);
    }
    return ""
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

export async function getCurrentAccountDhan() {


    const domain = ".dhan.co"
    const cookies = await chrome.cookies.getAll({ domain });

    var user = {}
    user['broker'] = 'DHAN'
    // user['localdata'] = await getLocalStorageStoredData(user['id'])
    user['cookies'] = []
    // console.log(user, 'dhan', cookies)
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
        console.log('userdata', data)
        try {
            if (data != "") {
                const decrypted = await decryptDataDhan(data)
                const parsed = JSON.parse(decrypted)
                user['userdata'] = data
                console.log(parsed, 'decrypted')
                user['id'] = parsed['login_id']
                user['display_name'] = parsed['display_name']
                console.log(user)
                return { [user['id']]: user }
            }
        } catch {

        }
    }
    return {}

}


export async function getDhanAccountList() {
    const curr_user = await getCurrentAccountDhan()
    const storedUsers = await addStoredAccountsDhan(curr_user)
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
        chrome.tabs.query({}, function (tabs) {
            var reloaded = false;
            var tabId;

            console.log('tabs', tabs)
            for (const item of tabs) {
                if (item['url'].includes('web.dhan.co')) {
                    tabId = item.id;
                    chrome.tabs.update(tabId, { url: 'https://login.dhan.co' }, async (tab) => {
                        tabId = tab.id;
                        console.log('clearing')
                        var domain = "dhan.co"
                        const cookies = await chrome.cookies.getAll({ domain });
                        console.log(cookies)
                        for (const c of cookies) {
                            await deleteCookie(c);
                        }
                        const cookie2s = await chrome.cookies.getAll({ domain });
                        console.log(cookie2s)

                        await executeScriptAsync(tab.id, setLocalStorageData, [{ 'userdata': '' }]);

                        await chrome.tabs.onUpdated.addListener(async function listener(updatedTabId, info) {
                            // console.log('completed')

                            console.log(info.status, 'status', await executeScriptAsync(tab.id, getLocalStorageData, []))
                            if (updatedTabId == tabId) {
                                await executeScriptAsync(updatedTabId, clearLocalStorageData, []);
                                await executeScriptAsync(tab.id, setLocalStorageData, [{ 'userdata': '' }]);

                            }

                            if (updatedTabId === tabId && info.status === 'loading') {
                                chrome.tabs.onUpdated.removeListener(listener);
                                console.log('completed')
                                console.log('clearing')
                                const results = await executeScriptAsync(tab.id, getLocalStorageData, []);

                                const results2 = await executeScriptAsync(tab.id, setLocalStorageData, [{ 'userdata': '' }]);
                                // const r = await executeScriptAsync(tab.id, clearLocalStorageData, []);
                                const results3 = await executeScriptAsync(tab.id, getLocalStorageData, []);

                                console.log(results3, 'cleard', results, results2)
                                // await chrome.tabs.update(tabId, { url: 'https://login.dhan.co' })
                            }
                        });

                        // await new Promise(resolve => setTimeout(resolve, 1000));



                    });
                    reloaded = true;
                    break;
                }
            }
            if (!reloaded) {
                chrome.tabs.create({ url: 'https://login.dhan.co' }, (tab) => {
                    tabId = tab.id;
                });
            }

            const listener = function (tabIdUpdated, changeInfo, tab) {
                if (tabIdUpdated === tabId && changeInfo.status === 'complete') {
                    chrome.tabs.update(tabId, { active: true });
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            };

            chrome.tabs.onUpdated.addListener(listener);
        });
    });
}

async function deleteCookie(cookie) {
    const protocol = cookie.secure ? 'https:' : 'http:';
    const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
    await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId
    });
}
