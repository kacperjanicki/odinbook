let button = document.getElementById("lightmodeToggle");
let root = document.querySelector(".bg-img");
let posts = document.querySelectorAll(".post");
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

        posts.forEach((post) => {
            post.classList.remove("lighPost");
            post.classList.add("darkPost");
        });
    } else {
        lightMode = true;
        button.innerText = "Light mode";
        root.classList.remove("dark");
        root.classList.add("light");
        document.body.classList.add("light");
        document.body.classList.remove("dark");
    }
    console.log("Light mode: " + lightMode);
});
