

import { CHROMESTORAGE, combineObjects } from "../utils.js"

const STORAGE_KEY_FYERS = "stored_data_fyers"

// ----------------------------------------------------------------------------------------------------------------
export async function getStoredAccountsFyers() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    return result
}

export async function addStoredAccountsFyers(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_FYERS, combined)
        return combined
    }
    return result
}

export async function delStoredAccountsFyers(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_FYERS, result)
}

export async function delAllStoredAccountsFyers() {
    await CHROMESTORAGE.remove(STORAGE_KEY_FYERS)
}


export function getCurrentAccountFyers() {
    const domain = ".fyers.in"
    const cookies = chrome.cookies.getAll({ domain });
    return cookies.then(result => {
        console.log(result, 'cookie')
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

export async function getFyersAccountList() {
    const curr_user = await getCurrentAccountFyers()
    const storedUsers = await addStoredAccountsFyers(curr_user)
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

