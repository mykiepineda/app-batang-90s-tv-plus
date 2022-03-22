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

});