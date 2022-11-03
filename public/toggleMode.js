let button = document.getElementById("lightmodeToggle");
let root = document.querySelector(".bg-img");
let navbar = document.querySelector(".navbar");
let posts = document.querySelectorAll(".post");
let modals = document.querySelectorAll(".modalBody");

let loginRowText = document.querySelectorAll(".login-row > label");
let loginForm = document.querySelector(".login");

document.body.classList.add("no-transition");
document.body.classList.remove("no-transition");
var lightMode;

if (localStorage.getItem("dark") == undefined) {
    localStorage.setItem("dark", false);
}

console.log(localStorage.getItem("black") == true);

button.addEventListener("click", () => {
    if (lightMode) {
        applyDarkMode();
    } else {
        applyLightMode();
    }
});

//persist dark/light mode
function persistMode() {
    if (localStorage.getItem("dark") == "true") {
        applyDarkMode();
    } else if (localStorage.getItem("dark") == "false") {
        applyLightMode();
    }

    root.classList.add("transition");
}

persistMode();

function applyDarkMode() {
    lightMode = false;
    localStorage.setItem("dark", true);
    button.innerText = "Dark mode";
    root.classList.remove("light");
    root.classList.add("dark");
    document.body.classList.add("dark");
    root.classList.add("transition");

    document.body.classList.remove("light");
    navbar.classList.remove("navLight");
    navbar.classList.add("navDark");
    posts.forEach((post) => {
        post.classList.remove("lighPost");
        post.classList.add("darkPost");
    });
    loginRowText.forEach((row) => {
        row.classList.add("whiteText");
        row.classList.remove("blackText");
    });
    loginForm.classList.add("greyBg");
    loginForm.classList.remove("whiteBg");
}

function applyLightMode() {
    lightMode = true;
    localStorage.setItem("dark", false);
    navbar.classList.remove("navDark");
    navbar.classList.add("navLight");
    button.innerText = "Light mode";
    root.classList.remove("dark");
    root.classList.add("light");

    loginForm.classList.add("whiteBg");
    loginForm.classList.add("transition");
    setTimeout(function () {
        loginForm.classList.remove("transition");
    }, 1600);

    loginForm.classList.remove("greyBg");
    loginRowText.forEach((row) => {
        row.classList.add("blackText");
        row.classList.remove("whiteText");
    });

    document.body.classList.add("light");
    document.body.classList.remove("dark");
}
