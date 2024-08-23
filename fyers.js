

const STORAGE_KEY_FYERS = "stored_data_fyers"

// ----------------------------------------------------------------------------------------------------------------
async function getStoredAccountsFyers() {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    return result
}

async function addStoredAccountsFyers(user) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    if (Object.keys(user).length !== 0) {
        const combined = combineObjects(result, user)
        await CHROMESTORAGE.set(STORAGE_KEY_FYERS, combined)
        return combined
    }
    return result
}

async function delStoredAccountsFyers(user_id) {
    const result = await CHROMESTORAGE.get(STORAGE_KEY_FYERS)
    if (user_id in result) {
        delete result[user_id];
    }
    await CHROMESTORAGE.set(STORAGE_KEY_FYERS, result)
}

async function delAllStoredAccountsFyers() {
    await CHROMESTORAGE.remove(STORAGE_KEY_FYERS)
}


function getCurrentAccountFyers() {
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
                data = JSON.parse(decodedPayload);
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

// ----------------------------------------------------------------------------------------------------------------

async function displayFyersAccounts() {
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
    const ul = document.getElementById('fyersData');
    ul.innerHTML = '';
    var headerhtml = `
            <li class="list-group-item d-flex justify-content-between align-items-start" style="background-color: #272727; color: white; margin-bottom: 0.5em;border-radius:0.5em;">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">FYERS</div>
                </div>
                <span class="badge bg-success rounded-pill" id="addAccFyers" role="button" style="margin-right: 0.5em;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                    </svg>
                </span>
        `
    if (fyers_users.length == 0) {
        headerhtml += `</li>`
    } else {
        headerhtml += `<span class="badge bg-secondary rounded-pill" role="button" data-bs-toggle="modal" data-bs-target="#fyersModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </span>
            </li>
        `
    }
    ul.innerHTML += headerhtml
    fyers_users.forEach((item, index) => {
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


document.addEventListener('DOMContentLoaded', async function () {

    // load accounts
    await displayFyersAccounts()
    const addAccountBtn = document.getElementById('fyersData');
    addAccountBtn.addEventListener('click', async function (event) {
        if (event.target.classList.contains('switchAcc')) {
            const userid = event.target.id;
            const allaccs = await getStoredAccountsFyers()
            if (userid in allaccs) {
                await switchUser(allaccs[userid], "FYERS")
            }
            reloadOrOpenTab('FYERS');
            await displayFyersAccounts()
        } else if (event.target.id == 'addAccFyers') {
            await addAccount('FYERS')
            reloadOrOpenTab('FYERS')
        } else if (event.target.classList.contains('deleteAcc')) {
            const userid = event.target.id;
            await delStoredAccountsFyers(userid)
            await displayFyersAccounts()
        }
    });

    const deleteFyersAll = document.getElementById('deleteAllFyers')
    deleteFyersAll.addEventListener('click', async function (event) {
        await delAllStoredAccountsFyers()
        await addAccount('FYERS')
        await displayFyersAccounts()
        reloadOrOpenTab('FYERS')
    });
});

// main()