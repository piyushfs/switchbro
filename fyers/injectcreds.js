var FYERS_SECTIONINFO = {}

function monitorSections() {
    const sections = document.querySelectorAll('section')
    sections.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const displayValue = computedStyle.display;
        const sectionId = element.id; // Get the section's ID
        if ((sectionId in FYERS_SECTIONINFO && FYERS_SECTIONINFO[sectionId] != displayValue && displayValue === 'block') || (FYERS_SECTIONINFO[sectionId] == undefined && displayValue == "block")) {
            chrome.runtime.sendMessage({ action: "shouldAutoLogin" }, function (response) {
                const resp = response.data
                console.log(resp, response)
                if (resp && resp['enabled']) {
                    if (sectionId === 'confirm-otp-page') {
                        automateTotp()
                        FYERS_SECTIONINFO = {}
                        return
                    } else if (sectionId === 'verify-pin-page') {
                        automatePin()
                        FYERS_SECTIONINFO = {}
                        return
                    }
                }
            })
        }
        FYERS_SECTIONINFO[sectionId] = displayValue
    });
}


function automateTotp() {
    try {
        var clientname = document.querySelector('.cookies-link').textContent
        clientname = clientname.split(' ')[1].split('?')[0]
        const submit = document.getElementById('confirmOtpSubmit')

        if (submit && submit.textContent.toLowerCase() === 'confirm totp') {
            chrome.runtime.sendMessage({ action: "fyersCreds" }, async function (response) {
                console.log("Data from storage:", response, clientname);
                if (clientname in response.data) {
                    const totpsecret = response.data[clientname]['totp']
                    console.log(totpsecret)
                    if (totpsecret != undefined && totpsecret !== "") {

                        chrome.runtime.sendMessage({ action: "totp", data: totpsecret }, function (response) {
                            const totp = response.data
                            console.log(totp)
                            const section = document.getElementById('confirm-otp-page')
                            section.querySelector('#first').value = totp[0]
                            section.querySelector('#second').value = totp[1]
                            section.querySelector('#third').value = totp[2]
                            section.querySelector('#fourth').value = totp[3]
                            section.querySelector('#fifth').value = totp[4]
                            section.querySelector('#sixth').value = totp[5]
                            submit.click()
                        })
                    }
                }
            });
        }
    } catch { }
}

function automatePin() {
    try {
        const section = document.getElementById('verify-pin-page')

        var clientname = section.querySelector('.cookies-link').textContent
        clientname = clientname.split(' ')[1].split('?')[0]
        const submit = document.getElementById('verifyPinSubmit')
        if (submit) {
            chrome.runtime.sendMessage({ action: "fyersCreds" }, async function (response) {
                console.log('gotdata')
                console.log("Data from storage:", response, clientname);
                if (clientname in response.data) {
                    const pin = response.data[clientname]['pin']
                    if (pin != undefined && pin !== "") {
                        section.querySelector('#first').value = pin[0]
                        section.querySelector('#second').value = pin[1]
                        section.querySelector('#third').value = pin[2]
                        section.querySelector('#fourth').value = pin[3]
                        submit.click()
                    }
                }
            });
        }
    } catch (error) { console.error(error) }
}

setInterval(() => {
    monitorSections()
}, 2000);
