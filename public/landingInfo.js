function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + (exdays == null ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

checkSession();

function checkSession() {
    var c = getCookie("visited");
    console.log(c);
    if (c === null) {
        // liveServer extension cause problem with redirection, so this alert will inform users about it
        let container = document.createElement("div");
        container.classList.add("alertContainer", "topRight");
        let alert = document.createElement("div");
        alert.classList.add("alert", "alertActive");
        alert.innerHTML =
            "Note: if you are using LiveServer extension it might cause problems with redirection.";
        let timer = document.createElement("div");
        timer.classList.add("timer", "timerActive");
        alert.appendChild(timer);
        container.appendChild(alert);
        document.body.appendChild(container);
    }
    setCookie("visited", "yes", 365); // this 'visited' cookie will expire in 1 year
}
