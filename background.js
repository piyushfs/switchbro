import * as fyersModule from "./fyers/fyers.js";
import { switchUser, reloadOrOpenTab } from "./utils.js";
import { getZerodhaAccountList } from "./zerodha/zerodha.js";

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
                const users = await getZerodhaAccountList()
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
                        console.log(nextidx)

                        await switchUser(users[nextidx], "ZERODHA")
                        reloadOrOpenTab("ZERODHA")
                        chrome.runtime.sendMessage({ action: "repaintZerodha" });
                    }
                }
            }
        }
    }
});