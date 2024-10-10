import { delAllStoredAccounts, getAccountList, delStoredAccounts, getStoredAccounts, clearAccount, reloadOrOpenTab, switchUser } from "./zerodha.js"
import { capitalizeWords, SEEPWD, HIDEPWD, CHROMESTORAGE } from "../utils.js"
import { getStoredCreds, addStoredCreds } from "./creds.js";

async function displayAccounts() {
    const zerodha_users = await getAccountList()
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
                <span class="badge rounded-pill editAcc" role="button" id="${item['id']}" data-bs-toggle="modal" data-bs-target="#zerodhaEdit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-pencil" viewBox="0 0 16 16">
                        <path
                            d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"
                        />
                    </svg>
                </span>
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
                <span class="badge rounded-pill editAcc" role="button"  id="${item['id']}" data-bs-toggle="modal" data-bs-target="#zerodhaEdit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                    </svg>
                </span>
            </li>
            `
        }
        ul.innerHTML += listhtml
    });
}


document.addEventListener('DOMContentLoaded', async function () {
    await displayAccounts()
    const addAccountBtn = document.getElementById('zerodhaData');
    addAccountBtn.addEventListener('click', async function (event) {
        if (event.target.id == 'addAccZerodha') {
            await clearAccount()
            reloadOrOpenTab()
        } else if (event.target.classList.contains('switchAcc')) {
            const userid = event.target.id;
            const allaccs = await getStoredAccounts()
            if (userid in allaccs) {
                await switchUser(allaccs[userid])
            }
            await reloadOrOpenTab();
        } else if (event.target.classList.contains('deleteAcc')) {
            const userid = event.target.id;
            await delStoredAccounts(userid)
        }
        await displayAccounts()
    });

    const deleteZerodhaAll = document.getElementById('deleteAllZerodha')
    deleteZerodhaAll.addEventListener('click', async function (event) {
        await delAllStoredAccounts()
        await clearAccount()
        await displayAccounts()
        reloadOrOpenTab()
    });

    document.getElementById('saveZerodhaCreds').addEventListener('click', async function (event) {
        const zerodhaEdit = document.getElementById('zerodhaEdit');
        const accId = zerodhaEdit.querySelector(".currentuser").id
        var user = {}
        user[accId] = {}
        user[accId]['pwd'] = zerodhaEdit.querySelector("#pwd").value;
        user[accId]['totp'] = zerodhaEdit.querySelector("#totp").value;
        await addStoredCreds(user)
    });

    document.getElementById('toggleZerodhaPwd').addEventListener('click', async function (event) {
        const zerodhaEdit = document.getElementById('zerodhaEdit');
        const pinfield = zerodhaEdit.querySelector("#pwd")
        const togglepwd = zerodhaEdit.querySelector("#toggleZerodhaPwd")

        if (pinfield.type == "password") {
            pinfield.type = "text"
            togglepwd.innerHTML = HIDEPWD
        } else {
            pinfield.type = "password"
            togglepwd.innerHTML = SEEPWD
        }
    });

    document.getElementById('zerodhaEdit').addEventListener('show.bs.modal', async function (event) {
        const triggerElement = event.relatedTarget;
        const accId = triggerElement.closest('.switchAcc').id;
        const zerodhaEdit = document.getElementById('zerodhaEdit');
        zerodhaEdit.querySelector("#toggleZerodhaPwd").innerHTML = SEEPWD
        zerodhaEdit.querySelector(".currentuser").id = accId
        zerodhaEdit.querySelector("#pwd").type = "password"

        const zerodha_users = await getStoredCreds()
        console.log(zerodha_users, 'users')
        if (accId in zerodha_users) {
            const item = zerodha_users[accId]
            const pin = item['pwd']
            const totp = item['totp']
            if (pin) {
                zerodhaEdit.querySelector('#pwd').value = pin;
            }
            if (totp) {
                zerodhaEdit.querySelector('#totp').value = totp;
            }
        }
    });
});


chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.action === "repaintZerodha") {
            await displayAccounts()
        }
    }
);