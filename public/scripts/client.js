window.addEventListener("load", function () {

    const carouselInners = document.querySelectorAll(".carousel-inner");
    const cards = document.querySelectorAll(".card");

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

    const episodesCarousel = document.querySelector("#episodes-carousel");
    const season1Link = document.querySelector("#season01Link");
    const season2Link = document.querySelector("#season02Link");
    const season3Link = document.querySelector("#season03Link");
    const seasonFLink = document.querySelector("#seasonFinaleLink");

    // jQuery carousel methods
    season1Link.addEventListener("click", function () {
        $("#episodes-carousel").carousel(0);
        activateSeasonNavItemInContext([true, false, false, false]);
    });

    season2Link.addEventListener("click", function () {
        $("#episodes-carousel").carousel(3);
        activateSeasonNavItemInContext([false, true, false, false]);
    });

    season3Link.addEventListener("click", function () {
        $("#episodes-carousel").carousel(6);
        activateSeasonNavItemInContext([false, false, true, false]);
    });

    seasonFLink.addEventListener("click", function () {
        $("#episodes-carousel").carousel(9);
        activateSeasonNavItemInContext([false, false, false, true]);
    });

    let sliding = false;

    episodesCarousel.addEventListener("slide.bs.carousel", function (item) {

        sliding = true;

        for (let i = 0; i < carouselInners.length; i++) {
            carouselInners[i].style.overflow = "hidden";
        }

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

    episodesCarousel.addEventListener("slid.bs.carousel", function() {
        sliding = false;
    });

    for (let i = 0; i < cards.length; i++) {
        cards[i].addEventListener("mouseover", function () {
            for (let j = 0; j < carouselInners.length; j++) {
                if (!sliding) {
                    carouselInners[j].style.overflow = "visible";
                }
            }
        });
    }

    const episodesTabLink = document.querySelector("#episodes-tab-link");
    const suggestedTabLink = document.querySelector("#suggested-tab-link");
    const detailsTabLink = document.querySelector("#details-tab-link");

    const episodesSection = document.querySelector("#episodes-section");
    const suggestedSection = document.querySelector("#suggested-section");
    const detailsSection = document.querySelector("#details-section");

    // Assumption: On page load, EPISODES tab link is always active by default
    suggestedSection.style.display = "none";
    detailsSection.style.display = "none";

    function activateNavItemTabsInContext(options) {

        const navItems = [];

        navItems.push(document.querySelector("#episodes-tab-nav-item"));
        navItems.push(document.querySelector("#suggested-tab-nav-item"));
        navItems.push(document.querySelector("#details-tab-nav-item"));

        const sections = [];

        sections.push(episodesSection);
        sections.push(suggestedSection);
        sections.push(detailsSection);

        for (let i = 0; i < options.length; i++) {
            if (options[i] === true) {
                navItems[i].classList.add("active");
                navItems[i].classList.add("navbar-tab-active");
                sections[i].style.display = "block";
            } else {
                navItems[i].classList.remove("active");
                navItems[i].classList.remove("navbar-tab-active");
                sections[i].style.display = "none";
            }
        }

    }

    episodesTabLink.addEventListener("click", function () {
        activateNavItemTabsInContext([true, false, false]);
    });

    suggestedTabLink.addEventListener("click", function () {
        activateNavItemTabsInContext([false, true, false]);
    });

    detailsTabLink.addEventListener("click", function () {
        activateNavItemTabsInContext([false, false, true]);
    });

});