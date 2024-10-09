import { CHROMESTORAGE, combineObjects } from "../utils.js"


const CREDS_KEY_ZDHA = "creds_data_zerodha"

export async function getStoredCreds() {
    const result = await CHROMESTORAGE.get(CREDS_KEY_ZDHA)
    return result
}

export async function addStoredCreds(user) {
    const result = await CHROMESTORAGE.get(CREDS_KEY_ZDHA)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(CREDS_KEY_ZDHA, combined)
        return combined
    }
    return result
}

