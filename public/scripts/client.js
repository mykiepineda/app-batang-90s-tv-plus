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

    const s1NavItem = document.querySelector("#s1-nav-item");
    const s2NavItem = document.querySelector("#s2-nav-item");
    const s3NavItem = document.querySelector("#s3-nav-item");
    const sfNavItem = document.querySelector("#sf-nav-item");

    // jQuery carousel methods
    $("#season01Link").click(function () {
        $("#episodesCarousel").carousel(0);
        s1NavItem.classList.add("active");
        s2NavItem.classList.remove("active");
        s3NavItem.classList.remove("active");
        sfNavItem.classList.remove("active");
    });
    $("#season02Link").click(function () {
        $("#episodesCarousel").carousel(3);
        s1NavItem.classList.remove("active");
        s2NavItem.classList.add("active");
        s3NavItem.classList.remove("active");
        sfNavItem.classList.remove("active");
    });
    $("#season03Link").click(function () {
        $("#episodesCarousel").carousel(6);
        s1NavItem.classList.remove("active");
        s2NavItem.classList.remove("active");
        s3NavItem.classList.add("active");
        sfNavItem.classList.remove("active");
    });
    $("#seasonFinaleLink").click(function () {
        $("#episodesCarousel").carousel(9);
        s1NavItem.classList.remove("active");
        s2NavItem.classList.remove("active");
        s3NavItem.classList.remove("active");
        sfNavItem.classList.add("active");
    });

    // Enable Carousel Controls
    $(".carousel-control-prev").click(function () {
        $("#episodesCarousel").carousel("prev");
    });
    $(".carousel-control-next").click(function () {
        $("#episodesCarousel").carousel("next");
    });

    $("#episodesCarousel").on('slide.bs.carousel', function (item) {
        switch (item.to) {
            case 0:
                s1NavItem.classList.add("active");
                s2NavItem.classList.remove("active");
                s3NavItem.classList.remove("active");
                sfNavItem.classList.remove("active");
                break;
            case 3:
                s1NavItem.classList.remove("active");
                s2NavItem.classList.add("active");
                s3NavItem.classList.remove("active");
                sfNavItem.classList.remove("active");
                break;
            case 6:
                s1NavItem.classList.remove("active");
                s2NavItem.classList.remove("active");
                s3NavItem.classList.add("active");
                sfNavItem.classList.remove("active");
                break;
            case 9:
                s1NavItem.classList.remove("active");
                s2NavItem.classList.remove("active");
                s3NavItem.classList.remove("active");
                sfNavItem.classList.add("active");
        }
    });

    const detailsTabLink = document.querySelector("#details-tab-link");
    const detailsTabNavItem = document.querySelector("#details-tab-nav-item");
    const episodesTabLink = document.querySelector("#episodes-tab-link");
    const episodesTabNavItem = document.querySelector("#episodes-tab-nav-item");
    const suggestedTabLink = document.querySelector("#suggested-tab-link");
    const suggestedTabNavItem = document.querySelector("#suggested-tab-nav-item");
    const seasonsNavbar = document.querySelector("#seasons-navbar-container");
    const episodesCarousel = document.querySelector("#episodesCarousel");

    detailsTabLink.addEventListener("click", function () {
        episodesCarousel.style.visibility = "hidden";
        seasonsNavbar.style.visibility = "hidden";
        detailsTabNavItem.classList.add("active");
        detailsTabNavItem.classList.add("navbar-tab-active");
        episodesTabNavItem.classList.remove("active");
        episodesTabNavItem.classList.remove("navbar-tab-active");
        suggestedTabNavItem.classList.remove("active");
        suggestedTabNavItem.classList.remove("navbar-tab-active");
    });

    episodesTabLink.addEventListener("click", function () {
        episodesCarousel.style.visibility = "visible";
        seasonsNavbar.style.visibility = "visible";
        detailsTabNavItem.classList.remove("active");
        detailsTabNavItem.classList.remove("navbar-tab-active");
        episodesTabNavItem.classList.add("active");
        episodesTabNavItem.classList.add("navbar-tab-active");
        suggestedTabNavItem.classList.remove("active");
        suggestedTabNavItem.classList.remove("navbar-tab-active");
    });

    suggestedTabLink.addEventListener("click", function () {
        episodesCarousel.style.visibility = "hidden";
        seasonsNavbar.style.visibility = "hidden";
        detailsTabNavItem.classList.remove("active");
        detailsTabNavItem.classList.remove("navbar-tab-active");
        episodesTabNavItem.classList.remove("active");
        episodesTabNavItem.classList.remove("navbar-tab-active");
        suggestedTabNavItem.classList.add("active");
        suggestedTabNavItem.classList.add("navbar-tab-active");
    });

});