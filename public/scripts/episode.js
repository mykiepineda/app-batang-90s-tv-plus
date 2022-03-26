window.addEventListener("load", function () {

    const videoContainer = document.querySelector("#video-container");
    const videoPlayer = document.querySelector("#video-player");
    const playPauseButton = document.querySelector("#play-pause-button");
    const playPauseIcon = playPauseButton.querySelector("i");
    const volumeButton = document.querySelector("#volume-button");
    const volumeIcon = volumeButton.querySelector("i");
    const volumeSlider = document.querySelector("#volume-slider");
    const current = document.querySelector("#current");
    const duration = document.querySelector("#duration");
    const progress = document.querySelector("#video-progress-background");
    const progressBar = document.querySelector("#video-progress-filled");
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
        volumeIcon.classList.remove("fa-volume-xmark");
        if (videoPlayer.volume > 0.5) {
            volumeIcon.classList.add("fa-volume-high");
            volumeIcon.classList.remove("fa-volume-low");
        } else if (videoPlayer.volume > 0) {
            volumeIcon.classList.remove("fa-volume-high");
            volumeIcon.classList.add("fa-volume-low");
        }
    }

    // On load state
    if (videoPlayer.muted) {
        setVolumeMuteState();
        volumeSlider.value = "0";
    } else {
        setVolumeUnmuteState();
        volumeSlider.value = videoPlayer.volume;
    }

    volumeButton.addEventListener("click", function (event) {
        videoPlayer.muted = !videoPlayer.muted;
        if (videoPlayer.muted) {
            setVolumeMuteState();
            volumeSlider.value = "0";
        } else {
            setVolumeUnmuteState();
            volumeSlider.value = videoPlayer.volume;
        }
    });

    volumeSlider.addEventListener("mousemove", function (event) {
        videoPlayer.volume = event.target.value;
        if (videoPlayer.muted) {
            setVolumeMuteState();
            volumeSlider.value = "0";
        } else {
            setVolumeUnmuteState();
            volumeSlider.value = videoPlayer.volume;
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

    videoPlayer.addEventListener("timeupdate", function (event) {
        const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    });


    function progressVideo(event) {
        const progressTime = (event.offsetX / progress.offsetWidth) * videoPlayer.duration;
        videoPlayer.currentTime = progressTime;
    }

    progress.addEventListener("click", function (event) {
        progressVideo(event);
    });

    progressBar.addEventListener("click", function (event) {
        progressVideo(event);
    });

    fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement && document.fullscreenElement.id === "video-container") {
            document.exitFullscreen();
        } else {
            videoContainer.requestFullscreen();
        }
        fullscreenIcon.classList.toggle("fa-expand");
        fullscreenIcon.classList.toggle("fa-compress");
    });

});