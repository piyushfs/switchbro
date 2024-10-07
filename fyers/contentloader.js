import { getStoredAccounts, getAccountList, delAllStoredAccounts, delStoredAccounts, clearAccount, reloadOrOpenTab, switchUser } from "./fyers.js"
import { capitalizeWords, SEEPWD, HIDEPWD, CHROMESTORAGE } from "../utils.js"
import { getStoredCreds, addStoredCreds } from "./creds.js";

async function displayAccounts() {
    const fyers_users = await getAccountList()
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
    fyers_users.forEach((item) => {
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
                <span class="badge rounded-pill editAcc" role="button" id="${item['id']}" data-bs-toggle="modal" data-bs-target="#fyersEdit">
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
                <span class="badge rounded-pill editAcc" role="button"  id="${item['id']}" data-bs-toggle="modal" data-bs-target="#fyersEdit">
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
    const fyersPanel = document.getElementById('fyersData');
    fyersPanel.addEventListener('click', async function (event) {
        if (event.target.id == 'addAccFyers') {
            await clearAccount()
            reloadOrOpenTab()
        }
        else if (event.target.classList.contains('switchAcc')) {
            const userid = event.target.id;
            const allaccs = await getStoredAccounts()
            if (userid in allaccs) {
                await switchUser(allaccs[userid])
            }
            reloadOrOpenTab();
        } else if (event.target.classList.contains('deleteAcc')) {
            const userid = event.target.id;
            await delStoredAccounts(userid)
        }
        await displayAccounts()
    });

    const deleteFyersAll = document.getElementById('deleteAllFyers')
    deleteFyersAll.addEventListener('click', async function (event) {
        await delAllStoredAccounts()
        await clearAccount()
        await displayAccounts()
        reloadOrOpenTab()
    });

    document.getElementById('saveFyersCreds').addEventListener('click', async function (event) {
        const fyersEdit = document.getElementById('fyersEdit');
        const accId = fyersEdit.querySelector(".currentuser").id
        var user = {}
        user[accId] = {}
        user[accId]['pin'] = fyersEdit.querySelector("#pin").value;
        user[accId]['totp'] = fyersEdit.querySelector("#totp").value;
        await addStoredCreds(user)
    });

    document.getElementById('toggleFyersPwd').addEventListener('click', async function (event) {
        const fyersEdit = document.getElementById('fyersEdit');
        const pinfield = fyersEdit.querySelector("#pin")
        const togglepwd = fyersEdit.querySelector("#toggleFyersPwd")

        if (pinfield.type == "password") {
            pinfield.type = "text"
            togglepwd.innerHTML = HIDEPWD
        } else {
            pinfield.type = "password"
            togglepwd.innerHTML = SEEPWD
        }
    });

    document.getElementById('fyersEdit').addEventListener('show.bs.modal', async function (event) {
        const triggerElement = event.relatedTarget;
        const accId = triggerElement.closest('.switchAcc').id;
        const fyersEdit = document.getElementById('fyersEdit');
        fyersEdit.querySelector("#toggleFyersPwd").innerHTML = SEEPWD
        fyersEdit.querySelector(".currentuser").id = accId
        fyersEdit.querySelector("#pin").type = "password"

        const fyers_users = await getStoredCreds()
        console.log(fyers_users, 'users')
        if (accId in fyers_users) {
            const item = fyers_users[accId]
            const pin = item['pin']
            const totp = item['totp']
            if (pin) {
                fyersEdit.querySelector('#pin').value = pin;
            }
            if (totp) {
                fyersEdit.querySelector('#totp').value = totp;
            }
        }
    });
});

chrome.runtime.onMessage.addListener(
    async function (request) {
        if (request.action === "repaintFyers") {
            await displayAccounts();
        }
    }
);