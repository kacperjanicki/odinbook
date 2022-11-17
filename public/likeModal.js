const new_modal = document.querySelectorAll(".modal-bg");

new_modal.forEach((modal) => {
    const modal_parent = modal.parentElement;
    const modalContent = modal.querySelector(".modal-content");
    console.log(modalContent);
    // console.log(modal_parent);
    const close = modal_parent.querySelector(".close");

    // const close = modal.querySelector(".close");
    const btn = modal_parent.querySelector(".modal-btn");
    // const btn = modal.nextElementSibling.childNodes[1].childNodes[9];
    btn.onclick = () => {
        modal.style.setProperty("display", "block");
    };
    close.onclick = () => {
        modal.style.setProperty("display", "none");
    };
    window.onclick = (e) => {
        // console.log(e.target, modalContent);
        // console.log(modal.querySelector(e.target.classList[0]));
        // console.log(e.target.classList[0] == modalContent.classList[0]);
    };

    // window.onclick = (e) => {
    //     if (e.target.id == modal.id) {
    //         e.target.style.setProperty("display", "none");
    //         // e.target.style.setProperty("display", "none");
    //     }
    //     // if (e.target.tagName == "BODY") {
    //     //     console.log("catch");
    //     //     document.querySelectorAll(".close").forEach((e) => {
    //     //         if (e) {
    //     //             e.click();
    //     //         }
    //     //     });
    //     // }
    //     // if (e.target.id == modal.id) {
    //     //     close.click();
    //     //     // close.click();
    //     //     // modal.parentElement.classList.add("non-visible");
    //     // }
    // };
});
