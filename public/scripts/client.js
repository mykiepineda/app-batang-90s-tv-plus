window.addEventListener("load", function () {

    // const bookmarkButton = document.querySelector("#bookmark-button > i");
    //
    // bookmarkButton.addEventListener("click", function() {
    //     for (let i = 0; i < bookmarkButton.classList.length; i++) {
    //         if (bookmarkButton.classList[i] === "fa-bookmark-o") {
    //             bookmarkButton.classList.remove("fa-bookmark-o");
    //             bookmarkButton.classList.add("fa-bookmark");
    //             break;
    //         } else if (bookmarkButton.classList[i] === "fa-bookmark") {
    //             bookmarkButton.classList.remove("fa-bookmark");
    //             bookmarkButton.classList.add("fa-bookmark-o");
    //             break;
    //         }
    //     }
    //
    // });

    const dropdown = document.querySelector(".nav-item.dropdown");
    const dropdownMenu =document.querySelector(".dropdown-menu");

    dropdown.addEventListener("click", function() {
        dropdown.classList.toggle("show");
        dropdownMenu.classList.toggle("show");
    });

});