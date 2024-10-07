import { CHROMESTORAGE, combineObjects } from "../utils.js"


const CREDS_KEY_FYERS = "creds_data_fyers"

export async function getStoredCreds() {
    const result = await CHROMESTORAGE.get(CREDS_KEY_FYERS)
    return result
}

export async function addStoredCreds(user) {
    const result = await CHROMESTORAGE.get(CREDS_KEY_FYERS)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(CREDS_KEY_FYERS, combined)
        return combined
    }
    return result
}

export async function delStoredCreds(user_id) {
    const result = await CHROMESTORAGE.get(CREDS_KEY_FYERS)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(CREDS_KEY_FYERS, result)
}

export async function delAllStoredAccounts() {
    await CHROMESTORAGE.remove(CREDS_KEY_FYERS)
}

