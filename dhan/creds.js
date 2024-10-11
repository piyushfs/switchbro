import { CHROMESTORAGE, combineObjects } from "../utils.js"


const CREDS_KEY_DHAN = "creds_data_dhan"

export async function getStoredCreds() {
    const result = await CHROMESTORAGE.get(CREDS_KEY_DHAN)
    return result
}

export async function addStoredCreds(user) {
    const result = await CHROMESTORAGE.get(CREDS_KEY_DHAN)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(CREDS_KEY_DHAN, combined)
        return combined
    }
    return result
}

