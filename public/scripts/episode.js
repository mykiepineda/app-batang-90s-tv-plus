window.addEventListener("load", function () {

    const videoOuterContainer = document.querySelector("#video-outer-container");
    const videoContainer = document.querySelector("#video-container");
    const videoPlayer = document.querySelector("#video-player");
    const playPauseButton = document.querySelector("#play-pause-button");
    const playPauseIcon = playPauseButton.querySelector("i");
    const volumeButton = document.querySelector("#volume-button");
    const volumeIcon = volumeButton.querySelector("i");
    const volumeSlider = document.querySelector("#volume-slider");
    const current = document.querySelector("#current");
    const duration = document.querySelector("#duration");
    const fullscreen = document.querySelector("#fullscreen");
    const fullscreenIcon = fullscreen.querySelector("i");

    playPauseButton.addEventListener("click", function (event) {
        if (!(videoPlayer.currentTime > 0 && !videoPlayer.paused && !videoPlayer.ended && videoPlayer.readyState > 2)) {
            videoPlayer.play();
            playPauseIcon.classList.remove("fa-play");
            playPauseIcon.classList.add("fa-pause");
        } else {
            videoPlayer.pause();
            playPauseIcon.classList.add("fa-play");
            playPauseIcon.classList.remove("fa-pause");
        }
    })

    function setVolumeMuteState() {
        volumeIcon.classList.add("fa-volume-xmark");
        volumeIcon.classList.remove("fa-volume-high");
        volumeIcon.classList.remove("fa-volume-low");
    }

    function setVolumeUnmuteState() {
        if (videoPlayer.volume > 0.5) {
            volumeIcon.classList.remove("fa-volume-xmark");
            volumeIcon.classList.add("fa-volume-high");
            volumeIcon.classList.remove("fa-volume-low");
        } else if (videoPlayer.volume > 0) {
            volumeIcon.classList.remove("fa-volume-xmark");
            volumeIcon.classList.remove("fa-volume-high");
            volumeIcon.classList.add("fa-volume-low");
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
        videoPlayer.muted = !videoPlayer.muted;
        if (!videoPlayer.muted && videoPlayer.volume === 0) {
            videoPlayer.volume = 0.1; // Set default
        }
        toggleVolumeState();
    });

    volumeSlider.addEventListener("mousemove", function (event) {
        videoPlayer.volume = event.target.value;
        videoPlayer.muted = !(videoPlayer.volume > 0);
        if (videoPlayer.muted) {
            setVolumeMuteState();
        } else {
            setVolumeUnmuteState();
        }
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

    fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement && document.fullscreenElement.id === "video-outer-container") {
            document.exitFullscreen();
        } else {
            videoOuterContainer.requestFullscreen();
        }
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
    });

    videoPlayer.addEventListener("waiting", function (event) {
        spinner.classList.remove("hide");
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

});