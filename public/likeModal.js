var modalBtn = document.querySelectorAll(".likecount");
var modalDiv = document.querySelectorAll(".modaldiv");
modalDiv.forEach((div) => {
    let modal = div.childNodes[1];
    let actualModal = modal.parentElement.childNodes[3];
    let close = actualModal.childNodes[1].childNodes[1];

    if (modal.outerText != "No one liked this post yet") {
        modal.addEventListener("click", () => {
            actualModal.style.display = "block";
        });
        close.addEventListener("click", () => {
            actualModal.style.display = "none";
        });
        window.addEventListener("click", (e) => {
            if (e.target == actualModal) {
                actualModal.style.display = "none";
            }
        });
    }
});
