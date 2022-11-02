const btn = document.querySelectorAll(".comment-display");
function getElementsById(elementID) {
    var elementCollection = new Array();
    var allElements = document.getElementsByTagName("*");
    for (i = 0; i < allElements.length; i++) {
        if (allElements[i].id == elementID) elementCollection.push(allElements[i]);
    }
    return elementCollection;
}

btn.forEach((button) => {
    button.addEventListener("click", (e) => {
        let id = e.target.id;
        const elements = getElementsById(id);
        elements[1].classList.add("comments-visible");
        elements[3].classList.add("comments-visible");
        elements[2].addEventListener("click", () => {
            elements[1].classList.remove("comments-visible");
            elements[3].classList.remove("comments-visible");
        });
    });
});

const tx = document.querySelectorAll(".textarea");
const newPostText = document.querySelector(".newPostType");
const postContainer = document.querySelector(".newpostinside");
const modal = document.querySelector(".newpostModal");
const close = document.querySelector(".close");
const expanded = document.querySelector(".expanded");
postContainer.style.display = "none";

console.log(tx[0]);
for (let i = 0; i < tx.length; i++) {
    tx[i].scrollHeight = 20;
    tx[i].setAttribute("style", "height:" + 20 + "px;overflow-y:hidden;resize:none;");
    tx[i].addEventListener("input", OnInput, false);
}
newPostText.addEventListener("click", () => {
    openNewPostModal();
});

close.addEventListener("click", () => {
    console.log("test");
    postContainer.style.display = "none";
    // modal.style.display = "none";
});

window.document.addEventListener("click", (e) => {
    if (e.target == postContainer) {
        postContainer.style.display = "none";
    }
    console.log(postContainer);
});

if (window.location.search.includes("?msg=Comment%20added%20successfully")) {
    let post_id = window.location.search.split("post=")[1];
    let button = document.getElementById(post_id);
    button.click();
}

const initial = document.querySelector(".initial");

function openNewPostModal() {
    postContainer.style.display = "block";
    modal.classList.remove("expanded");
}

function OnInput() {
    this.style.height = 20;
    this.style.height = this.scrollHeight + "px";
}
