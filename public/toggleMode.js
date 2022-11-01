let button = document.getElementById("lightmodeToggle");
let root = document.querySelector(".bg-img");
let navbar = document.querySelector(".navbar");
let posts = document.querySelectorAll(".post");
let modals = document.querySelectorAll(".modalBody");
let loginRowText = document.querySelectorAll(".login-row > label");

document.body.classList.add("no-transition");
document.body.classList.remove("no-transition");

var lightMode = true;
button.addEventListener("click", () => {
    if (lightMode) {
        lightMode = false;
        button.innerText = "Dark mode";
        root.classList.remove("light");
        root.classList.add("dark");
        document.body.classList.add("dark");
        document.body.classList.remove("light");
        navbar.classList.remove("navLight");
        navbar.classList.add("navDark");
        posts.forEach((post) => {
            post.classList.remove("lighPost");
            post.classList.add("darkPost");
        });
        loginRowText.forEach((row) => {
            row.classList.add("blackText");
        });
    } else {
        lightMode = true;
        navbar.classList.remove("navDark");
        navbar.classList.add("navLight");
        button.innerText = "Light mode";
        root.classList.remove("dark");
        root.classList.add("light");

        document.body.classList.add("light");
        document.body.classList.remove("dark");
    }
    console.log("Light mode: " + lightMode);
});
