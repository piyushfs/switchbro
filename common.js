
import { CHROMESTORAGE } from "./utils.js";

document.addEventListener('DOMContentLoaded', async function () {

    var currbroker = await CHROMESTORAGE.get('currentBroker')
    if (Object.keys(currbroker).length == 0) {
        currbroker = "FYERS"
    }

    const disFyersBtn = document.getElementById('displayFyers');
    const disZerdhaBtn = document.getElementById('displayZerodha');

    const disFyersWdw = document.getElementById('fyersData');
    const disZerodhaWdw = document.getElementById('zerodhaData');

    switch (currbroker) {
        case "FYERS":
            disFyersWdw.style.display = 'block';
            disFyersBtn.className = 'btn shadow-none brokerbtn';
            break;
        case "ZERODHA":
            disZerodhaWdw.style.display = 'block';
            disZerdhaBtn.className = 'btn shadow-none brokerbtn';
            break;
    }

    disFyersBtn.addEventListener('click', async function (event) {
        disFyersWdw.style.display = 'block';
        disFyersBtn.className = 'btn shadow-none brokerbtn';

        disZerodhaWdw.style.display = 'none';
        disZerdhaBtn.className = 'btn shadow-none';

        await CHROMESTORAGE.set("currentBroker", "FYERS")
    })

    disZerdhaBtn.addEventListener('click', async function (event) {
        disFyersWdw.style.display = 'none';
        disFyersBtn.className = 'btn shadow-none';

        disZerodhaWdw.style.display = 'block';
        disZerdhaBtn.className = 'btn shadow-none brokerbtn';

        await CHROMESTORAGE.set("currentBroker", "ZERODHA")
    })

});
