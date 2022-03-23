window.addEventListener("load", function () {

    const navbarHome = document.querySelector("#navbar-home");
    const navbarBookmarked = document.querySelector("#navbar-bookmarked");

    switch (window.location.href) {
        case "http://localhost:3000/bookmarked":
            navbarHome.classList.remove("active");
            navbarBookmarked.classList.add("active");
            break;
        case "http://localhost:3000/":
            navbarHome.classList.add("active");
            navbarBookmarked.classList.remove("active");
    }

    const dropdown = document.querySelector(".nav-item.dropdown");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    dropdown.addEventListener("click", function () {
        dropdown.classList.toggle("show");
        dropdownMenu.classList.toggle("show");
    });

    function activateSeasonNavItemInContext(options) {

        const navItems = [];

        navItems.push(document.querySelector("#s1-nav-item"));
        navItems.push(document.querySelector("#s2-nav-item"));
        navItems.push(document.querySelector("#s3-nav-item"));
        navItems.push(document.querySelector("#sf-nav-item"));

        for (let i = 0; i < options.length; i++) {
            if (options[i] === true) {
                navItems[i].classList.add("active");
            } else {
                navItems[i].classList.remove("active");
            }
        }
    }

    // jQuery carousel methods
    $("#season01Link").click(function () {
        $("#episodes-carousel").carousel(0);
        activateSeasonNavItemInContext([true, false, false, false]);
    });

    $("#season02Link").click(function () {
        $("#episodes-carousel").carousel(3);
        activateSeasonNavItemInContext([false, true, false, false]);
    });

    $("#season03Link").click(function () {
        $("#episodes-carousel").carousel(6);
        activateSeasonNavItemInContext([false, false, true, false]);
    });

    $("#seasonFinaleLink").click(function () {
        $("#episodes-carousel").carousel(9);
        activateSeasonNavItemInContext([false, false, false, true]);
    });

    // Enable Carousel Controls
    $(".carousel-control-prev").click(function () {
        $("#episodes-carousel").carousel("prev");
    });

    $(".carousel-control-next").click(function () {
        $("#episodes-carousel").carousel("next");
    });

    $("#episodes-carousel").on("slide.bs.carousel", function (item) {

        const slideToIndex = item.to;

        switch (true) {
            case slideToIndex >= 9:
                // Season Finale
                activateSeasonNavItemInContext([false, false, false, true]);
                break;
            case slideToIndex >= 6:
                // Season 03
                activateSeasonNavItemInContext([false, false, true, false]);
                break;
            case slideToIndex >= 3:
                // Season 02
                activateSeasonNavItemInContext([false, true, false, false]);
                break;
            default:
                // Season 01
                activateSeasonNavItemInContext([true, false, false, false]);
        }
    });

    const detailsTabLink = document.querySelector("#details-tab-link");
    const episodesTabLink = document.querySelector("#episodes-tab-link");
    const suggestedTabLink = document.querySelector("#suggested-tab-link");

    // Containers
    const seasonsNavbar = document.querySelector("#seasons-navbar-container");
    const episodesCarousel = document.querySelector("#episodes-carousel");

    function activateNavItemTabsInContext(options) {

        const navItems = [];

        navItems.push(document.querySelector("#episodes-tab-nav-item"));
        navItems.push(document.querySelector("#suggested-tab-nav-item"));
        navItems.push(document.querySelector("#details-tab-nav-item"));

        for(let i = 0; i < options.length; i++) {
            if (options[i] === true) {
                navItems[i].classList.add("active");
                navItems[i].classList.add("navbar-tab-active");
            } else {
                navItems[i].classList.remove("active");
                navItems[i].classList.remove("navbar-tab-active");
            }
        }
    }

    episodesTabLink.addEventListener("click", function () {
        episodesCarousel.style.visibility = "visible";
        seasonsNavbar.style.visibility = "visible";
        activateNavItemTabsInContext([true, false, false]);
    });

    suggestedTabLink.addEventListener("click", function () {
        episodesCarousel.style.visibility = "hidden";
        seasonsNavbar.style.visibility = "hidden";
        activateNavItemTabsInContext([false, true, false]);
    });

    detailsTabLink.addEventListener("click", function () {
        episodesCarousel.style.visibility = "hidden";
        seasonsNavbar.style.visibility = "hidden";
        activateNavItemTabsInContext([false, false, true]);
    });

});