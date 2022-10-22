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
