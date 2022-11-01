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

const tx = document.getElementsByTagName("textarea");
const modal = document.querySelector(".newpostModal");
const expanded = document.querySelector(".expanded");

console.log(tx[0]);
for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute("style", "height:" + tx[i].scrollHeight + "px;overflow-y:hidden;resize:none;");
    tx[i].addEventListener("input", OnInput, false);
}
tx[0].addEventListener("click", () => {
    openNewPostModal();
});

function openNewPostModal() {
    expanded.classList.add("visible");
    modal.classList.add("bigModal");
}

function OnInput() {
    this.style.height = 0;
    this.style.height = this.scrollHeight + "px";
}
