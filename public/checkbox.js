function onlyOneChecked(id) {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(i).checked = false;
    }
    document.getElementById(id).checked = true;
}
