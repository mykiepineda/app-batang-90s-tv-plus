window.addEventListener("load", function () {

    // Continue Watching Carousel

    const carouselInners = document.querySelectorAll(".carousel-inner");
    const episodesCarousel = document.querySelector("#episodes-carousel");
    const cards = document.querySelectorAll("#episodes-carousel .card");
    const carouselControlPrevButton = document.querySelector("button.carousel-control-prev");
    const carouselControlNextButton = document.querySelector("button.carousel-control-next");

    let sliding = false;

    episodesCarousel.addEventListener("slide.bs.carousel", function (item) {
        sliding = true;
        for (let i = 0; i < carouselInners.length; i++) {
            carouselInners[i].style.overflow = "hidden";
        }
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

    if (cards.length < 6) {
        carouselControlPrevButton.style.setProperty("display", "none", "important");
        carouselControlNextButton.style.setProperty("display", "none", "important");
    }

    // All Shows Section
    const categoryButtons = document.querySelectorAll("#categories-button-container button");
    const showCards = document.querySelectorAll("#suggested-section .my-card");

    for (let i = 0; i < categoryButtons.length; i++) {
        const categoryButton = categoryButtons[i];
        categoryButton.addEventListener("click", function() {
            this.classList.add("active");
            for (let j = 0; j < categoryButtons.length; j++) {
                const otherButton = categoryButtons[j];
                if (this.dataset.categoryId !== otherButton.dataset.categoryId) {
                    otherButton.classList.remove("active");
                }
            }
            for (let k = 0; k < showCards.length; k++) {
                const showCard = showCards[k];
                if (showCard.dataset.categoryId !== this.dataset.categoryId && this.dataset.categoryId !== "01") {
                    showCard.style.display = "none";
                } else {
                    showCard.style.display = "block";
                }
            }
        });
    }

});