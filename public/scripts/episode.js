window.addEventListener("load", function () {

    const videoOuterContainer = document.querySelector("#video-outer-container");
    const videoContainer = document.querySelector("#video-container");
    const videoInnerContainer = document.querySelector("#video-inner-container");
    const videoPlayer = document.querySelector("#video-player");
    const videoControls = document.querySelector("#video-controls");
    const playPauseButton = document.querySelector("#play-pause-button");
    const playPauseIcon = playPauseButton.querySelector("i");
    const centreVideoControlsContainer = document.querySelector("#centre-video-controls-container");
    const seek10secForwardButton = document.querySelector("#seek-10sec-forward-btn");
    const seek10secBackwardButton = document.querySelector("#seek-10sec-backward-btn");
    const volumeButton = document.querySelector("#volume-button");
    const volumeHighIcon = document.querySelector("#volume-high-icon");
    const volumeMediumIcon = document.querySelector("#volume-medium-icon");
    const volumeLowIcon = document.querySelector("#volume-low-icon");
    const volumeNoneIcon = document.querySelector("#volume-none-icon");
    const volumeSlider = document.querySelector("#volume-slider");
    const current = document.querySelector("#current");
    const duration = document.querySelector("#duration");
    const fullscreen = document.querySelector("#fullscreen");
    const fullscreenIcon = fullscreen.querySelector("i");

    let videoControlsDisplayTimeout;

    function hideVideoControls() {
        videoControls.style.opacity = "0";
        centreVideoControlsContainer.style.opacity = "0";
    }

    videoOuterContainer.addEventListener("mousemove", function (event) {
        clearTimeout(videoControlsDisplayTimeout);
        videoControls.style.opacity = "1";
        centreVideoControlsContainer.style.opacity = "1";
        videoControlsDisplayTimeout = setTimeout(hideVideoControls, 2000);
    });

    // videoOuterContainer.addEventListener("mouseout", hideVideoControls);

    function playPauseVideo() {
        if (!(videoPlayer.currentTime > 0 && !videoPlayer.paused && !videoPlayer.ended && videoPlayer.readyState > 2)) {
            videoPlayer.play();
            playPauseIcon.classList.remove("fa-play");
            playPauseIcon.classList.add("fa-pause");
        } else {
            videoPlayer.pause();
            playPauseIcon.classList.add("fa-play");
            playPauseIcon.classList.remove("fa-pause");
        }
    }

    playPauseButton.addEventListener("click", function (event) {
        event.stopPropagation();
        playPauseVideo();
    });

    // videoOuterContainer.addEventListener("click", function () {
    //     playPauseVideo();
    // });

    seek10secForwardButton.addEventListener("click", function (event) {
        event.stopPropagation();
        videoPlayer.currentTime = videoPlayer.currentTime + 10;
        currentTime();
    });

    seek10secBackwardButton.addEventListener("click", function (event) {
        event.stopPropagation();
        videoPlayer.currentTime = videoPlayer.currentTime - 10;
        currentTime();
    });

    function setVolumeMuteState() {
        volumeHighIcon.classList.add("display-none");
        volumeMediumIcon.classList.add("display-none");
        volumeLowIcon.classList.add("display-none");
        volumeNoneIcon.classList.remove("display-none");
    }

    function setVolumeUnmuteState() {

        if (videoPlayer.volume >= 0.8) {
            volumeHighIcon.classList.remove("display-none");
            volumeMediumIcon.classList.add("display-none");
            volumeLowIcon.classList.add("display-none");
            volumeNoneIcon.classList.add("display-none");
        } else if (videoPlayer.volume >= 0.4) {
            volumeHighIcon.classList.add("display-none");
            volumeMediumIcon.classList.remove("display-none");
            volumeLowIcon.classList.add("display-none");
            volumeNoneIcon.classList.add("display-none");
        } else {
            volumeHighIcon.classList.add("display-none");
            volumeMediumIcon.classList.add("display-none");
            volumeLowIcon.classList.remove("display-none");
            volumeNoneIcon.classList.add("display-none");
        }

    }

    function toggleVolumeState() {
        if (videoPlayer.muted) {
            setVolumeMuteState();
            volumeSlider.value = "0";
        } else {
            setVolumeUnmuteState();
            volumeSlider.value = videoPlayer.volume;
        }
    }

    // On load state
    toggleVolumeState();

    volumeButton.addEventListener("click", function (event) {
        if (event.pointerType === "touch") {
            // Prevent overlapping of elements in mobile devices
            centreVideoControlsContainer.style.opacity = "0";
        }
        event.stopPropagation();
        clearTimeout(videoControlsDisplayTimeout);
        videoPlayer.muted = !videoPlayer.muted;
        if (!videoPlayer.muted && videoPlayer.volume === 0) {
            videoPlayer.volume = 0.1; // Set default
        }
        toggleVolumeState();
        videoControlsDisplayTimeout = setTimeout(hideVideoControls, 2000);
    });

    volumeSlider.addEventListener("mousemove", function (event) {
        event.stopPropagation();
        clearTimeout(videoControlsDisplayTimeout);
        videoPlayer.volume = event.target.value;
        videoPlayer.muted = !(videoPlayer.volume > 0);
        if (videoPlayer.muted) {
            setVolumeMuteState();
        } else {
            setVolumeUnmuteState();
        }
        videoControlsDisplayTimeout = setTimeout(hideVideoControls, 2000);
    });

    function currentTime() {
        let currentMinutes = Math.floor(videoPlayer.currentTime / 60);
        let currentSeconds = Math.floor(videoPlayer.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(videoPlayer.duration / 60);
        let durationSeconds = Math.floor(videoPlayer.duration - durationMinutes * 60);

        current.innerHTML = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds : currentSeconds}`;
        duration.innerHTML = `${durationMinutes}:${durationSeconds < 10 ? '0' + durationSeconds : durationSeconds}`;
    }

    videoPlayer.addEventListener("timeupdate", currentTime);

    fullscreen.addEventListener("click", async function (event) {
        event.stopPropagation();
        if (document.fullscreenElement !== null) {
            await document.exitFullscreen();
        } else {
            await videoOuterContainer.requestFullscreen();
            screen.orientation.lock("landscape-primary").then(function () {
                console.log("Locked screen orientation to landscape");
            }).catch(function (error) {
                console.log(error);
            });
        }
        videoContainer.classList.toggle("height-100pct");
        videoInnerContainer.classList.toggle("height-100pct");
        videoPlayer.classList.toggle("height-100pct");
        fullscreenIcon.classList.toggle("fa-expand");
        fullscreenIcon.classList.toggle("fa-compress");
    });

    const spinner = document.querySelector(".lds-spinner");
    const sliderContainer = document.querySelector("#video-slide-container");
    const progressBar = document.querySelector("#video-progress");
    const thumb = document.querySelector("#video-thumb");

    let percentage = 0;
    let dragging = false;
    let translate;

    function setPercentage() {
        progressBar.style.transform = `scaleX(${percentage / 100})`;
        thumb.style.transform = `translate(-50%) translate(${(percentage / 100) * sliderContainer.offsetWidth}px)`;
    }

    function seekVideo(event) {
        const totalOffsetLeft = videoOuterContainer.offsetLeft + videoContainer.offsetLeft + sliderContainer.offsetLeft;
        if (event.clientX < totalOffsetLeft) {
            percentage = 0;
        } else if (event.clientX > (sliderContainer.offsetWidth + totalOffsetLeft)) {
            percentage = 100;
        } else {
            translate = event.clientX - totalOffsetLeft;
            percentage = (translate / sliderContainer.offsetWidth) * 100;
        }
        videoPlayer.currentTime = (percentage / 100) * videoPlayer.duration;
        setPercentage();
    }

    // Call on initial load
    setPercentage();

    sliderContainer.addEventListener("click", function (event) {
        seekVideo(event);
    });

    const videoNotFoundBanner = document.querySelector("#video-not-found-banner");
    // NETWORK_NO_SOURCE
    if (videoPlayer.networkState === 3) {
        videoNotFoundBanner.style.display = "block";
        spinner.classList.add("hide");
        centreVideoControlsContainer.classList.add("hide");
        videoControls.classList.add("hide");
    }

    videoPlayer.addEventListener("timeupdate", function (event) {
        percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        setPercentage();
        if (videoPlayer.ended) {
            // Play video again
            playPauseIcon.classList.add("fa-play");
            playPauseIcon.classList.remove("fa-pause");
        }
    });

    videoPlayer.addEventListener("playing", function (event) {
        spinner.classList.add("hide");
        centreVideoControlsContainer.classList.remove("hide");
    });

    videoPlayer.addEventListener("waiting", function (event) {
        spinner.classList.remove("hide");
        centreVideoControlsContainer.classList.add("hide");
    });

    thumb.addEventListener("mousedown", function (event) {
        dragging = true;
    });

    window.addEventListener("mousemove", function (event) {
        if (dragging) {
            seekVideo(event);
        }
    });

    window.addEventListener("mouseup", function (event) {
        dragging = false;
    });

    videoOuterContainer.addEventListener("touchstart", function () {
        videoControls.classList.toggle("opacity-1");
    });

    const addRemoveMyListButton = document.querySelector("#add-remove-my-list-btn");
    const iconDom = addRemoveMyListButton.querySelector("i");
    const textDom = addRemoveMyListButton.querySelector("span");
    const showSlug = addRemoveMyListButton.dataset.showSlug;

    addRemoveMyListButton.addEventListener("click", async function () {
        const responsePromise = await fetch(`/watchlist/${showSlug}`);
        const responseJson = await responsePromise.json();
        if (responseJson.success) {
            if (responseJson.action === "add") {
                iconDom.classList.remove("fa-plus-circle");
                iconDom.classList.add("fa-minus-circle");
                textDom.innerHTML = "Remove from My List";
            } else {
                iconDom.classList.add("fa-plus-circle");
                iconDom.classList.remove("fa-minus-circle");
                textDom.innerHTML = "Add to My List";
            }
        } else {
            console.log(responseJson.message);
        }
    });

    const likeButton = document.querySelector("#like-btn");
    const dislikeButton = document.querySelector("#dislike-btn");

    async function updateLikeDislikeCounter(action, targetDom) {
        const responsePromise = await fetch(`/${action}/${targetDom.dataset.showSlug}/episode/${targetDom.dataset.episode}`);
        const responseJson = await responsePromise.json();
        if (responseJson.success) {
            targetDom.querySelector("span").innerHTML = responseJson.count;
        } else {
            console.log(responseJson.message);
        }
    }

    likeButton.addEventListener("click", async function () {
        await updateLikeDislikeCounter("like", this);
    });
    dislikeButton.addEventListener("click", async function () {
        await updateLikeDislikeCounter("dislike", this);
    });

    const episodeListFilters = document.querySelectorAll("#episode-list-filter-container button");
    const otherEpisodeCards = document.querySelectorAll("#other-episodes-card-container .my-card-container");

    // Other Episodes Dropdown Filter

    const dropdown = document.querySelector("#other-episodes-sff-dropdown");
    const dropdownButton = dropdown.querySelector("#dropdownMenuButton");
    const dropdownMenu = dropdown.querySelector(".dropdown-menu");
    const dropdownItems = dropdown.querySelectorAll(".dropdown-item");

    function hideShowOtherEpisodeCards(i) {
        for (let j = 0; j < otherEpisodeCards.length; j++) {
            const otherEpisodeCard = otherEpisodeCards[j];
            if (i === parseInt(otherEpisodeCard.dataset.season) || i === 0) {
                otherEpisodeCard.style.display = "block";
            } else {
                otherEpisodeCard.style.display = "none";
            }
        }
    }

    dropdown.addEventListener("click", function () {
        dropdown.classList.toggle("show");
        dropdownMenu.classList.toggle("show");
    });

    for (let i = 0; i < dropdownItems.length; i++) {
        const dropdownItem = dropdownItems[i];
        dropdownItem.addEventListener("click", () => {
            dropdownButton.innerText = dropdownItem.innerText;
            hideShowOtherEpisodeCards(i);
            for (let k = 0; k < dropdownItems.length; k++) {
                if (i === k) {
                    dropdownItem.classList.add("active");
                } else {
                    dropdownItems[k].classList.remove("active");
                }
            }
        });
    }

    for (let i = 0; i < episodeListFilters.length; i++) {
        const filterBtn = episodeListFilters[i];
        filterBtn.addEventListener("click", function () {
            hideShowOtherEpisodeCards(i);
            for (let k = 0; k < episodeListFilters.length; k++) {
                if (i === k) {
                    filterBtn.classList.add("active");
                } else {
                    episodeListFilters[k].classList.remove("active");
                }
            }
        })
    }

    const episodeSynopsis = document.querySelector("#episode-synopsis p");
    const showMore = document.querySelector("#episode-show-more");
    const showMoreText = showMore.querySelector("span");
    const showMoreIcon = showMore.querySelector("i");

    function displayShowMore() {
        if (episodeSynopsis.scrollHeight === episodeSynopsis.clientHeight) {
            // TODO: if you resize the window while the episode synopsis is expanded, it will hide the show more/less button
            showMore.style.display = "none";
        } else {
            showMore.style.display = "block";
        }
    }

    displayShowMore();

    showMore.addEventListener("click", function () {
        episodeSynopsis.classList.toggle("synopsis-overflow");
        console.log(episodeSynopsis);
        if (showMoreIcon.classList.contains("fa-chevron-down")) {
            showMoreIcon.classList.replace("fa-chevron-down", "fa-chevron-up");
            showMoreText.innerHTML = "SHOW LESS";
        } else {
            showMoreIcon.classList.replace("fa-chevron-up", "fa-chevron-down");
            showMoreText.innerHTML = "SHOW MORE";
        }
    });

    window.addEventListener("resize", () => {
        displayShowMore();
    });

});
