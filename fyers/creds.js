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

