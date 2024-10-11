import * as fyersModule from "./fyers/fyers.js";
import * as zerodhaModule from "./zerodha/zerodha.js";
import * as dhanModule from "./dhan/dhan.js";
import * as dhandecryptModule from "./dhan/decrypt.js";

import { CHROMESTORAGE } from "./utils.js";


import * as fyersCredModule from "./fyers/creds.js";
import * as zerodhaCredModule from "./zerodha/creds.js";
import * as dhanCredModule from "./dhan/creds.js";


import { generateTOTP } from "./totp.js";

const AUTOLOGIN = "autologin"

chrome.commands.onCommand.addListener(async (command) => {
    if (command == "switch-up" || command == "switch-down") {
        const currtab = await chrome.tabs.query({ active: true })
        if (currtab.length != 0) {
            if (currtab[0].url.includes('trade.fyers.in')) {
                const users = await fyersModule.getAccountList()
                if (users.length > 1) {
                    var activeidx = -1
                    var nextidx = -1
                    users.forEach((item, index) => {
                        if (item['active']) {
                            activeidx = index
                        }
                    })
                    if (activeidx != -1) {
                        if (command == "switch-up") {
                            nextidx = activeidx == 0 ? users.length - 1 : activeidx - 1
                        } else if (command == "switch-down") {
                            nextidx = activeidx == users.length - 1 ? 0 : activeidx + 1
                        }
                        await fyersModule.switchUser(users[nextidx])
                        fyersModule.reloadOrOpenTab()
                        chrome.runtime.sendMessage({ action: "repaintFyers" });
                    }
                }
            } else if (currtab[0].url.includes('kite.zerodha.com')) {
                const users = await zerodhaModule.getAccountList()
                if (users.length > 1) {
                    var activeidx = -1
                    var nextidx = -1
                    users.forEach((item, index) => {
                        if (item['active']) {
                            activeidx = index
                        }
                    })
                    if (activeidx != -1) {
                        if (command == "switch-up") {
                            nextidx = activeidx == 0 ? users.length - 1 : activeidx - 1
                        } else if (command == "switch-down") {
                            nextidx = activeidx == users.length - 1 ? 0 : activeidx + 1
                        }
                        await zerodhaModule.switchUser(users[nextidx])
                        zerodhaModule.reloadOrOpenTab()
                        chrome.runtime.sendMessage({ action: "repaintZerodha" });
                    }
                }
            } else if (currtab[0].url.includes('web.dhan.co')) {
                const users = await dhanModule.getAccountList()
                if (users.length > 1) {
                    var activeidx = -1
                    var nextidx = -1
                    users.forEach((item, index) => {
                        if (item['active']) {
                            activeidx = index
                        }
                    })
                    if (activeidx != -1) {
                        if (command == "switch-up") {
                            nextidx = activeidx == 0 ? users.length - 1 : activeidx - 1
                        } else if (command == "switch-down") {
                            nextidx = activeidx == users.length - 1 ? 0 : activeidx + 1
                        }
                        await dhanModule.switchUser(users[nextidx])
                        await dhanModule.reloadOrOpenTab()
                        chrome.runtime.sendMessage({ action: "repaintDhan" });
                    }
                }
            }
        }
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fyersCreds") {
        fyersCredModule.getStoredCreds().then(data => {
            sendResponse({ data: data });
        })
        return true;
    }

    if (request.action === "zerodhaCreds") {
        zerodhaCredModule.getStoredCreds().then(data => {
            sendResponse({ data: data });
        })
        return true;
    }

    if (request.action === "dhanCreds") {
        dhanCredModule.getStoredCreds().then(data => {
            sendResponse({ data: data });
        })
        return true;
    }

    if (request.action === "decryptdhanCreds") {
        dhandecryptModule.decryptDataDhan(request.data).then(data => {
            sendResponse({ data: data });
        })
        return true;
    }

    if (request.action === "totp") {
        generateTOTP(request.data).then(data => {
            sendResponse({ data: data });
        })
        return true;
    }

    if (request.action === "shouldAutoLogin") {
        CHROMESTORAGE.get(AUTOLOGIN).then(active => {
            sendResponse({ data: active })
        })
        return true;
    }
});
