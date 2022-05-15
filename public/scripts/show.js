window.addEventListener("load", function () {

    const carouselInners = document.querySelectorAll(".carousel-inner");
    const cards = document.querySelectorAll(".card");

    // Seasons Dropdown

    const dropdown = document.querySelector("#seasons-sff-dropdown");
    const dropdownButton = dropdown.querySelector("#dropdownMenuButton");
    const dropdownMenu = dropdown.querySelector(".dropdown-menu");
    const dropdownItems = dropdown.querySelectorAll(".dropdown-item");

    const cardDecks = document.querySelectorAll("#card-deck-container .card-deck");

    dropdown.addEventListener("click", function () {
        dropdown.classList.toggle("show");
        dropdownMenu.classList.toggle("show");
    });

    function activateSeasonDropdownInContext(i) {

        dropdownButton.innerText = dropdownItems[i].innerText;

        for (let j = 0; j < dropdownItems.length; j++) {
            if (i === j) {
                dropdownItems[j].classList.add("active");
            } else {
                dropdownItems[j].classList.remove("active");
            }
        }

        for (let k = 0; k < cardDecks.length; k++) {
            if (cardDecks[k].classList.contains(`my-card-deck-${i + 1}`)) {
                cardDecks[k].style.display = "block";
            } else {
                cardDecks[k].style.display = "none";
            }
        }
    }

    for (let i = 0; i < dropdownItems.length; i++) {
        dropdownItems[i].addEventListener("click", function () {
            activateSeasonDropdownInContext(i);
        });
    }

    activateSeasonDropdownInContext(0);

    // Seasons Tabs

    function activateSeasonNavItemInContext(options) {

        const navItems = document.querySelectorAll("#seasons-navbar .nav-item");

        for (let i = 0; i < options.length; i++) {
            if (options[i] === true) {
                navItems[i].classList.add("active");
            } else {
                navItems[i].classList.remove("active");
            }
        }
    }

    const defaultActiveSeasonNavItem = document.querySelector("#seasons-navbar li:nth-child(1)");
    defaultActiveSeasonNavItem.classList.add("active");

    const seasonsLinks = document.querySelectorAll(".my-seasons-link");
    const carouselItems = document.querySelectorAll(".carousel-item");

    for (let i = 0; i < seasonsLinks.length; i++) {

        seasonsLinks[i].addEventListener("click", function (event) {

            let options = [];
            for (let j = 0; j < seasonsLinks.length; j++) {
                if (i === j) {
                    options.push(true);
                } else {
                    options.push(false);
                }
            }
            activateSeasonNavItemInContext(options);

            for (let k = 0; k < carouselItems.length; k++) {
                if (carouselItems[k].classList.contains(`my-carousel-group-${i + 1}`)) {
                    $("#episodes-carousel").carousel(k);
                    break;
                }
            }
        });
    }

    const episodesCarousel = document.querySelector("#episodes-carousel");

    let sliding = false;

    episodesCarousel.addEventListener("slide.bs.carousel", function (item) {

        sliding = true;

        for (let i = 0; i < carouselInners.length; i++) {
            carouselInners[i].style.overflow = "hidden";
        }

        // my-carousel-group-x
        const myCarouselGroupClass = carouselItems[item.to].classList[0];
        const index = parseInt(myCarouselGroupClass.substr(18, (myCarouselGroupClass.length - 18))) - 1;

        let options = [];
        for (let i = 0; i < seasonsLinks.length; i++) {
            if (index === i) {
                options.push(true);
            } else {
                options.push(false);
            }
        }
        activateSeasonNavItemInContext(options);

    });

    episodesCarousel.addEventListener("slid.bs.carousel", function () {
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

    // Assumption: On page load, EPISODES tab link is active by default
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

    const showSummary = document.querySelector("#show-summary");
    const showMore = document.querySelector("#show-more");
    const showMoreText = showMore.querySelector("span");
    const showMoreIcon = showMore.querySelector("i");

    showMore.addEventListener("click", function() {
        showSummary.classList.toggle("summary-overflow");
        if (showMoreIcon.classList.contains("fa-chevron-down")) {
            showMoreIcon.classList.replace("fa-chevron-down", "fa-chevron-up");
            showMoreText.innerHTML = "SHOW LESS";
        } else {
            showMoreIcon.classList.replace("fa-chevron-up", "fa-chevron-down");
            showMoreText.innerHTML = "SHOW MORE";
        }
    });

});