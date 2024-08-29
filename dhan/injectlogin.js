const login_cookie_name_clear = "login_dhan_clear"
const login_cookie_name_switch = "login_dhan_switch"


function getCookies() {
    let cookies = document.cookie.split(';');
    let cookieObject = {};

    cookies.forEach(cookie => {
        let [name, value] = cookie.split('=');
        name = name.trim();
        if (name && value !== undefined) {
            cookieObject[name] = decodeURIComponent(value.trim());
        }
    });
    return cookieObject;
}

function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.dhan.co;';
}

// actual action
const cookies = getCookies()
console.log(cookies, 'cookies')
// If login cookie is set to true clear localstorage
if (login_cookie_name_clear in cookies) {
    if (cookies[login_cookie_name_clear] == "true") {
        localStorage.clear()
        console.log('cleared local storage')
    }
    deleteCookie(login_cookie_name_clear)
    console.log(cookies, 'cookies')

}


// If switch cookie is set to true clear localstorage
if (login_cookie_name_switch in cookies) {
    if (cookies[login_cookie_name_switch] == "true") {
        for (let [key, value] of Object.entries(cookies)) {
            if (key.includes('switchbro_')) {
                localStorage.setItem(key.split("_")[1], value);
            }
        }
        console.log('set local storage')
    }
    deleteCookie(login_cookie_name_switch)
}
