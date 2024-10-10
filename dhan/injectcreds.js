var DHAN_SECTIONINFO = {}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return ""; // If cookie is not found
}

function monitorSections() {
    const pin = document.querySelectorAll('input[type="password"]')
    if (pin && (DHAN_SECTIONINFO['pin'])) {
        return
    }
    if (pin) {
        chrome.runtime.sendMessage({ action: "shouldAutoLogin" }, function (response) {
            const resp = response.data
            if (resp && resp['enabled']) {
                chrome.runtime.sendMessage({ action: "decryptdhanCreds", data: getCookie('switchbro_loginId') }, function (response) {
                    const userid = response.data
                    console.log(userid)
                    if (userid) {
                        if (pin) {
                            automatePin(userid, pin)
                        }
                    }
                })
            }
        })
    }
}

function automatePin(clientname, pincomponent) {
    console.log(clientname, pincomponent, 'automating')
    try {
        chrome.runtime.sendMessage({ action: "dhanCreds" }, async function (response) {
            console.log("Data from storage:", response, clientname);
            if (clientname in response.data) {
                const pin = response.data[clientname]['pin']
                console.log(pin)
                if (pin != undefined && pin !== "" && pin.length == 6) {
                    pincomponent.forEach((element, i) => {
                        console.log(element, i)
                        element.value = pin[i]
                        element.dispatchEvent(new Event('input', { bubbles: true }));

                    });
                    if (pincomponent.length != 0) {
                        DHAN_SECTIONINFO['pin'] = true
                    }
                }
            }
        });
    } catch (error) { console.error(error) }
}

setInterval(() => {
    monitorSections()
}, 2000);