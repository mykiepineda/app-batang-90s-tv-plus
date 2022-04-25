window.addEventListener("load", function () {

    const buttonGoToTop = document.querySelector("#goto-top");
    const scrollDistance = 500; // px

    document.addEventListener("scroll", function () {
        if (document.body.scrollTop > scrollDistance || document.documentElement.scrollTop > scrollDistance) {
            buttonGoToTop.style.display = "block";
        } else {
            buttonGoToTop.style.display = "none";
        }
    });

    buttonGoToTop.addEventListener("click", function () {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    });

    // Top Navigation Bar - Hamburger button

    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navbarToggler.addEventListener("click", function () {
        navbarToggler.classList.toggle("collapsed");
        navbarCollapse.classList.toggle("show");
    });

    // Top Navigation Bar - Shows Dropdown

    const showsDropdown = document.querySelector("#shows-dropdown");
    const showsDropdownMenu = showsDropdown.querySelector(".dropdown-menu");

    showsDropdown.addEventListener("click", function () {
        showsDropdown.classList.toggle("show");
        showsDropdownMenu.classList.toggle("show");
    });

    // Top Navigation Bar - My Watchlist Dropdown

    const myWatchlistDropdown = document.querySelector("#my-watchlist-dropdown");
    const myWatchlistDropdownMenu = myWatchlistDropdown.querySelector(".dropdown-menu");

    myWatchlistDropdown.addEventListener("click", function () {
        myWatchlistDropdown.classList.toggle("show");
        myWatchlistDropdownMenu.classList.toggle("show");
    });

});