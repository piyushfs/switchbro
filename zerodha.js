

const STORAGE_KEY_ZERODHA = "stored_data_zerodha"

// ----------------------------------------------------------------------------------------------------------------
async function getStoredAccountsZerodha() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    return result
}

async function addStoredAccountsZerodha(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_ZERODHA, combined)
        return combined
    }
    return result
}

async function delStoredAccountsZerodha(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_ZERODHA, result)
}

async function delAllStoredAccountsZerodha() {
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
            console.log(storeddata, userid)
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


async function getLocalStorageStoredData(userid) {
    if (userid == undefined || userid == "" || userid == null) {
        return ""
    }
    var obj = {}
    const storeddata = await CHROMESTORAGE.get(STORAGE_KEY_ZERODHA)
    console.log(storeddata, userid)
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

async function getCurrentAccountZerodha() {


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


// ----------------------------------------------------------------------------------------------------------------

async function displayZerodhaAccounts() {


    const curr_user = await getCurrentAccountZerodha()
    const storedUsers = await addStoredAccountsZerodha(curr_user)
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
    console.log(zerodha_users, curr_user)
    zerodha_users.sort((a, b) => b['id'] > a['id']);
    const ul = document.getElementById('zerodhaData');
    ul.innerHTML = '';
    var headerhtml = `
            <li class="list-group-item d-flex justify-content-between align-items-start" style="background-color: #272727; color: white; margin-bottom: 0.5em;border-radius:0.5em;">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">ZERODHA</div>
                </div>
                <span class="badge bg-success rounded-pill" id="addAccZerodha" role="button" style="margin-right: 0.5em;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                    </svg>
                </span>
                
        `
    if (zerodha_users.length == 0) {
        headerhtml += `</li>`
    } else {
        headerhtml += `
        <span class="badge bg-secondary rounded-pill" role="button" data-bs-toggle="modal" data-bs-target="#zerodhaModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </span>
            </li>`
    }
    ul.innerHTML += headerhtml
    zerodha_users.forEach((item, index) => {
        var color = "#272727;"
        var txtcolor = "white"
        if (item['active']) {
            color = "#484545"
            color = "white"
            txtcolor = "black"
        }
        var listhtml = `
                <li type="button" id="${item['id']}"  class="list-group-item d-flex justify-content-between align-items-start switchAcc" style="background-color: ${color}; color: ${txtcolor}; margin-bottom: 0.5em;border-radius:0.5em;">
                    <div class="ms-2 me-auto switchAcc" id="${item['id']}">
                        <div class="fw-bold switchAcc" id="${item['id']}" >${item['id']} <span class="switchAcc" id="${item['id']}" style="font-size: 0.75em; font-weight: 200;padding-left:1em">${capitalizeWords(item['display_name'])}</span></div>
                    </div>
            `;
        if (item['active']) {
            listhtml += `
                </li>
                `
        } else {
            listhtml += `
                <span class="badge rounded-pill deleteAcc" role="button"  id="${item['id']}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>
                
                </span>
            </li>
            `
        }
        ul.innerHTML += listhtml
    });
}


document.addEventListener('DOMContentLoaded', async function () {

    // load accounts
    await displayZerodhaAccounts()

    const addAccountBtn = document.getElementById('zerodhaData');
    addAccountBtn.addEventListener('click', async function (event) {
        if (event.target.classList.contains('switchAcc')) {
            const userid = event.target.id;
            const allaccs = await getStoredAccountsZerodha()
            if (userid in allaccs) {
                await switchUser(allaccs[userid], "ZERODHA")
            }
            await reloadOrOpenTab('ZERODHA');
            await displayZerodhaAccounts()
        } else if (event.target.id == 'addAccZerodha') {
            await addAccount('ZERODHA')
            reloadOrOpenTab('ZERODHA')
        } else if (event.target.classList.contains('deleteAcc')) {
            const userid = event.target.id;
            await delStoredAccountsZerodha(userid)
            await displayZerodhaAccounts()
        }
    });

    const deleteZerodhaAll = document.getElementById('deleteAllZerodha')
    deleteZerodhaAll.addEventListener('click', async function (event) {
        await delAllStoredAccountsZerodha()
        await addAccount('ZERODHA')
        await displayZerodhaAccounts()
        reloadOrOpenTab('ZERODHA')
    });
});




