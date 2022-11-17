const btn = document.querySelectorAll(".comment-display");
let all_posts = document.querySelectorAll(".post");

function getElementsById(elementID) {
    var elementCollection = new Array();
    var allElements = document.getElementsByTagName("*");
    for (i = 0; i < allElements.length; i++) {
        if (allElements[i].id == elementID) elementCollection.push(allElements[i]);
    }
    return elementCollection;
}

all_posts.forEach((post) => {
    let comment_display = post.querySelector(".comment-display");
    if (comment_display) {
        comment_display.addEventListener("click", () => {
            post.querySelectorAll(".comment").forEach((e) => {
                e.classList.add("comments-visible");
            });
            post.querySelector(".beforeCommentContainer").classList.add("commentContainer");
        });
        let hide = post.querySelector(".closeComment");
        hide.addEventListener("click", () => {
            post.querySelectorAll(".comment").forEach((e) => {
                e.classList.remove("comments-visible");
            });
            post.querySelector(".beforeCommentContainer").classList.remove("commentContainer");
        });
    }
});

const tx = document.querySelectorAll(".textarea");
tx.forEach((area) => {
    area.addEventListener("keypress", (e) => {
        if (13 == e.keyCode) {
            area.parentElement.parentElement.submit();
        }
    });
});

const newPostText = document.querySelector(".newPostType");
const postContainer = document.querySelector(".newpostinside");
const expanded = document.querySelector(".expanded");
if (postContainer) {
    postContainer.style.display = "none";
}

for (let i = 0; i < tx.length; i++) {
    tx[i].scrollHeight = 20;
    tx[i].setAttribute("style", "height:" + 35 + "px;overflow-y:hidden;resize:none;");
    tx[i].addEventListener("input", OnInput, false);
}
if (newPostText) {
    newPostText.addEventListener("click", () => {
        openNewPostModal();
    });
}
if (document.querySelector(".close")) {
    document.querySelector(".close").addEventListener("click", () => {
        console.log("test");
        postContainer.style.display = "none";
        // modal.style.display = "none";
    });
}

window.document.addEventListener("click", (e) => {
    if (e.target == postContainer) {
        postContainer.style.display = "none";
    }
});

if (window.location.search.includes("?msg=Comment%20added%20successfully")) {
    let post_id = window.location.search.split("post=")[1];
    let button = document.getElementById(post_id);
    button.click();
}

const initial = document.querySelector(".initial");

function openNewPostModal() {
    postContainer.style.display = "block";
    document.getElementById("modalType").focus();
    modal.classList.remove("expanded");
}

function OnInput() {
    this.style.height = 20;
    this.style.height = this.scrollHeight + "px";
}
