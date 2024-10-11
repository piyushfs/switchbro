var ZERODHA_SECTIONINFO = {}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function monitorSections() {
    const pwd = document.getElementById('password')
    const totp = document.getElementById('userid')
    if (pwd && (ZERODHA_SECTIONINFO['pwd'])) {
        return
    }
    if (totp && (ZERODHA_SECTIONINFO['totp'])) {
        return
    }
    chrome.runtime.sendMessage({ action: "shouldAutoLogin" }, function (response) {
        const resp = response.data
        console.log(resp, response)
        if (resp && resp['enabled']) {
            const userid = document.querySelector('.userid')
            if (userid) {
                const username = userid.innerHTML
                if (pwd) {
                    ZERODHA_SECTIONINFO['pwd'] = true
                    automatePwd(username, pwd)
                } else if (totp) {
                    ZERODHA_SECTIONINFO['totp'] = true
                    automateTotp(username, totp)
                }
            }
        }
    })
}


function automateTotp(clientname, totpcomponent) {
    try {


        chrome.runtime.sendMessage({ action: "zerodhaCreds" }, async function (response) {
            console.log("Data from storage:", response, clientname);
            if (clientname in response.data) {
                const totpsecret = response.data[clientname]['totp']
                if (totpsecret != undefined && totpsecret !== "") {
                    chrome.runtime.sendMessage({ action: "totp", data: totpsecret }, function (response) {
                        const totp = response.data
                        totpcomponent.value = totp
                        fillInput("#userid", totp)
                        sleep(100).then(() => {
                            document.querySelector('button[type="submit"]').click()
                        })
                    })

                }
            }
        });
    } catch { }
}

function automatePwd(clientname, pwdcomponent) {
    try {
        chrome.runtime.sendMessage({ action: "zerodhaCreds" }, async function (response) {
            console.log("Data from storage:", response, clientname);
            if (clientname in response.data) {
                const pwd = response.data[clientname]['pwd']
                if (pwd != undefined && pwd !== "") {
                    pwdcomponent.value = pwd
                    fillInput("#password", pwd)
                    sleep(100).then(() => {
                        document.querySelector('button[type="submit"]').click()
                    })
                }
            }
        });
    } catch (error) { console.error(error) }
}

setInterval(() => {
    monitorSections()
}, 2000);


function fillInput(selector, value) {
    const input = document.querySelector(selector);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true
    }
    return false
}