window.addEventListener("load", function () {

    const showsDropdown = document.querySelector("#shows-dropdown");
    const showsDropdownMenu = showsDropdown.querySelector(".dropdown-menu");

    showsDropdown.addEventListener("click", function() {
        showsDropdown.classList.toggle("show");
        showsDropdownMenu.classList.toggle("show");
    });

    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navbarToggler.addEventListener("click", function () {
        navbarToggler.classList.toggle("collapsed");
        navbarCollapse.classList.toggle("show");
    });

    const carouselInners = document.querySelectorAll(".carousel-inner");
    const cards = document.querySelectorAll(".card");

    const dropdown = document.querySelector("#seasons-sff-dropdown");
    const dropdownButton = dropdown.querySelector("button");
    const dropdownMenu = dropdown.querySelector(".dropdown-menu");

    dropdown.addEventListener("click", function () {
        dropdown.classList.toggle("show");
        dropdownMenu.classList.toggle("show");
    });

    const s1DropdownItem = document.querySelector("#s1-dropdown-item");
    const s2DropdownItem = document.querySelector("#s2-dropdown-item");
    const s3DropdownItem = document.querySelector("#s3-dropdown-item");
    const sfDropdownItem = document.querySelector("#sf-dropdown-item");

    const cardDecks = document.querySelectorAll("#card-deck-container .card-deck");

    function activateSeasonDropdownInContext(options) {

        const dropdownItems = [];

        dropdownItems.push(s1DropdownItem);
        dropdownItems.push(s2DropdownItem);
        dropdownItems.push(s3DropdownItem);
        dropdownItems.push(sfDropdownItem);

        for (let i = 0; i < options.length; i++) {
            if (options[i] === true) {
                dropdownItems[i].classList.add("active");
            } else {
                dropdownItems[i].classList.remove("active");
            }
        }

        const s1Active = options[0];
        const s2Active = options[1];
        const s3Active = options[2];
        const s4Active = options[3];

        for (let i = 0; i < cardDecks.length; i++) {
            switch (true) {
                case s1Active:
                    if (cardDecks[i].id === "s1") {
                        cardDecks[i].style.display = "block";
                    } else {
                        cardDecks[i].style.display = "none";
                    }
                    break;
                case s2Active:
                    if (cardDecks[i].id === "s2") {
                        cardDecks[i].style.display = "block";
                    } else {
                        cardDecks[i].style.display = "none";
                    }
                    break;
                case s3Active:
                    if (cardDecks[i].id === "s3") {
                        cardDecks[i].style.display = "block";
                    } else {
                        cardDecks[i].style.display = "none";
                    }
                    break;
                case s4Active:
                    if (cardDecks[i].id === "s4") {
                        cardDecks[i].style.display = "block";
                    } else {
                        cardDecks[i].style.display = "none";
                    }
                    break;
            }
        }
    }

    activateSeasonDropdownInContext([true, false, false, false]);

    s1DropdownItem.addEventListener("click", function () {
        dropdownButton.innerHTML = "Season 01";
        activateSeasonDropdownInContext([true, false, false, false]);
    });

    s2DropdownItem.addEventListener("click", function () {
        dropdownButton.innerHTML = "Season 02";
        activateSeasonDropdownInContext([false, true, false, false]);
    });

    s3DropdownItem.addEventListener("click", function () {
        dropdownButton.innerHTML = "Season 03";
        activateSeasonDropdownInContext([false, false, true, false]);
    });

    sfDropdownItem.addEventListener("click", function () {
        dropdownButton.innerHTML = "Season Finale";
        activateSeasonDropdownInContext([false, false, false, true]);
    });

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

            for(let k = 0; k < carouselItems.length; k++) {
                if (carouselItems[k].classList.contains(`my-carousel-group-${i+1}`)) {
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