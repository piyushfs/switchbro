
import { CHROMESTORAGE } from "./utils.js";

const AUTOLOGIN = "autologin"

document.addEventListener('DOMContentLoaded', async function () {

    var currbroker = await CHROMESTORAGE.get('currentBroker')
    if (Object.keys(currbroker).length == 0) {
        currbroker = "FYERS"
    }

    const disFyersBtn = document.getElementById('displayFyers');
    const disZerdhaBtn = document.getElementById('displayZerodha');
    const disDhanBtn = document.getElementById('displayDhan');


    const disFyersWdw = document.getElementById('fyersData');
    const disZerodhaWdw = document.getElementById('zerodhaData');
    const disDhanWdw = document.getElementById('dhanData');


    switch (currbroker) {
        case "FYERS":
            disFyersWdw.style.display = 'block';
            disFyersBtn.className = 'btn shadow-none brokerbtn';
            break;
        case "ZERODHA":
            disZerodhaWdw.style.display = 'block';
            disZerdhaBtn.className = 'btn shadow-none brokerbtn';
            break;
        case "DHAN":
            disDhanWdw.style.display = 'block';
            disDhanBtn.className = 'btn shadow-none brokerbtn';
            break;
    }

    disFyersBtn.addEventListener('click', async function (event) {
        disFyersWdw.style.display = 'block';
        disFyersBtn.className = 'btn shadow-none brokerbtn';

        disZerodhaWdw.style.display = 'none';
        disZerdhaBtn.className = 'btn shadow-none';

        disDhanWdw.style.display = 'none';
        disDhanBtn.className = 'btn shadow-none';

        await CHROMESTORAGE.set("currentBroker", "FYERS")
    })

    disZerdhaBtn.addEventListener('click', async function (event) {
        disFyersWdw.style.display = 'none';
        disFyersBtn.className = 'btn shadow-none';

        disZerodhaWdw.style.display = 'block';
        disZerdhaBtn.className = 'btn shadow-none brokerbtn';

        disDhanWdw.style.display = 'none';
        disDhanBtn.className = 'btn shadow-none';

        await CHROMESTORAGE.set("currentBroker", "ZERODHA")
    })

    disDhanBtn.addEventListener('click', async function (event) {
        disFyersWdw.style.display = 'none';
        disFyersBtn.className = 'btn shadow-none';

        disZerodhaWdw.style.display = 'none';
        disZerdhaBtn.className = 'btn shadow-none';

        disDhanWdw.style.display = 'block';
        disDhanBtn.className = 'btn shadow-none brokerbtn';

        await CHROMESTORAGE.set("currentBroker", "DHAN")
    })

    document.getElementById('autologin').addEventListener('click', async function (event) {
        console.log('storing', { 'enabled': !document.getElementById('autologin').checked })
        const state = document.getElementById('autologin').checked
        await CHROMESTORAGE.set(AUTOLOGIN, { 'enabled': state })

        if (state) {
            document.querySelector('.toast-body').innerHTML = 'Auto-login is enabled!'
            document.getElementById('liveToast').style.backgroundColor = '#c8e6c9'
        } else {
            document.querySelector('.toast-body').innerHTML = 'Auto-login is disabled!'
            document.getElementById('liveToast').style.backgroundColor = '#ffcdd2'
        }

        // show toasts
        var toastElList = [].slice.call(document.querySelectorAll('.toast'))
        var toastList = toastElList.map(function (toastEl) {
            return new bootstrap.Toast(toastEl)
        })
        toastList.forEach(toast => toast.show())

    });

    const active = await CHROMESTORAGE.get(AUTOLOGIN)
    if (active && active['enabled']) {
        document.getElementById('autologin').checked = true
    }


    const helpelem = document.querySelectorAll('.help');
    helpelem.forEach(element => {
        element.addEventListener('click', function () {
            chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
        });
    });

});
