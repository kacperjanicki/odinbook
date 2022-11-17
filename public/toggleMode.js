let button = document.getElementById("lightmodeToggle");
let root = document.querySelector(".bg-img");

let navbar = document.querySelector(".navbar");
let leftSidebar = document.querySelector(".leftSidebar");

var posts = document.querySelectorAll(".post");
let alert = document.querySelector(".alert");
let profile = document.querySelector(".profile");

let likeModalBG = document.querySelector(".likeModalContent");

let newPostSmall = document.querySelector(".newpostModal");
let newPostBig = document.querySelector(".bigPost");

let loginRowText = document.querySelectorAll(".login-row > label");
let loginForm = document.querySelector(".login");

let modal = document.querySelector(".modal-content");

let allUsersRowText = document.querySelectorAll(".modalBody");

document.body.classList.add("no-transition");
document.body.classList.remove("no-transition");
var lightMode;

if (localStorage.getItem("dark") == undefined) {
    localStorage.setItem("dark", false);
}

button.addEventListener("click", () => {
    if (lightMode) {
        applyDarkMode();
    } else {
        applyLightMode();
    }
});

//persist dark/light mode
function persistMode() {
    if (localStorage.getItem("dark") != null) {
        if (localStorage.getItem("dark") == "true") {
            applyDarkMode();
        } else if (localStorage.getItem("dark") == "false") {
            applyLightMode();
        }
    }
}

persistMode();

function applyDarkMode() {
    lightMode = false;
    localStorage.setItem("dark", true);
    button.innerText = "Dark mode";

    root.classList.remove("light");
    root.classList.add("dark");
    root.classList.add("transition");

    if (newPostSmall) {
        newPostSmall.classList.add("greyBg");
        newPostBig.classList.add("greyBg");
        newPostSmall.classList.remove("whiteBg");
        newPostBig.classList.remove("whiteBg");
    }
    if (modal) {
        modal.classList.add("greyBg", "whiteText");
        modal.classList.remove("whiteBg", "blackText");
    }
    if (alert) {
        alert.classList.add("greyBg");
        alert.classList.remove("whiteBg");
    }
    if (profile) {
        profile.classList.add("greyBg");
        profile.classList.remove("whiteBg");
    }
    document.body.classList.remove("light");
    document.body.classList.add("dark");

    navbar.classList.remove("navLight");
    navbar.classList.add("navDark");
    if (leftSidebar) {
        leftSidebar.classList.remove("navLight", "blackText");
        leftSidebar.classList.add("navDark", "whiteText");
    }
    posts.forEach((post) => {
        post.classList.remove("whiteBg");
        post.classList.add("postDarkBg");
    });
    loginRowText.forEach((row) => {
        row.classList.add("whiteText");
        row.classList.remove("blackText");
    });
    allUsersRowText.forEach((row) => {
        row.classList.add("whiteText", "greyBg");
        row.classList.remove("blackText", "whiteBg");
    });
    if (likeModalBG) {
        likeModalBG.classList.add("greyBg");
        likeModalBG.classList.remove("whiteBg");
    }
    if (loginForm && allUsersRowText.length == 0) {
        loginForm.classList.add("greyBg");
        loginForm.classList.remove("whiteBg");
    }
}

function applyLightMode() {
    lightMode = true;
    localStorage.setItem("dark", false);

    navbar.classList.add("navLight");
    navbar.classList.remove("navDark");
    if (leftSidebar) {
        leftSidebar.classList.add("navLight", "blackText");
        leftSidebar.classList.remove("navDark", "whiteText");
    }
    button.innerText = "Light mode";
    root.classList.remove("dark");
    root.classList.add("light");
    if (modal) {
        modal.classList.add("whiteBg", "blackText");
        modal.classList.remove("greyBg", "whiteText");
    }
    if (alert) {
        alert.classList.add("whiteBg");
        alert.classList.remove("greyBg");
    }
    if (profile) {
        profile.classList.add("whiteBg");
        profile.classList.remove("greyBg");
    }

    posts.forEach((post) => {
        console.log(post.classList);
        post.classList.remove("postDarkBg");
        post.classList.add("whiteBg");
    });
    if (newPostSmall) {
        newPostSmall.classList.add("whiteBg");
        newPostBig.classList.add("whiteBg");
        newPostSmall.classList.remove("greyBg");
        newPostBig.classList.remove("greyBg");
    }

    if (loginForm && allUsersRowText.length == 0) {
        loginForm.classList.remove("greyBg");
        loginForm.classList.add("whiteBg");
        loginRowText.forEach((row) => {
            row.classList.add("blackText");
            row.classList.remove("whiteText");
        });
    }

    allUsersRowText.forEach((row) => {
        row.classList.add("blackText", "whiteBg");
        row.classList.remove("whiteText", "greyBg");
    });
    if (likeModalBG) {
        likeModalBG.classList.add("whiteBg");
        likeModalBG.classList.remove("greyBg");
    }
}
