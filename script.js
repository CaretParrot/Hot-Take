let counter = 1;
let takeList = {};
let currentVideo;
let countdownTimeout;

const options = {
    mimeType: "video/mp4"
}

if (localStorage.getItem("gainControl") === null) {
    localStorage.setItem("gainControl", "true");
}

if (localStorage.getItem("originalSound") === null) {
    localStorage.setItem("originalSound", "true");
}

if (localStorage.getItem("countdown") === null) {
    localStorage.setItem("countdown", "5");
}

if (localStorage.getItem("volumeCorrection") === "true") {
    document.getElementById("volumeCorrection").classList.add("active");
} else {
    document.getElementById("volumeCorrection").classList.remove("active");
}

if (localStorage.getItem("originalSound") === "true") {
    document.getElementById("originalSound").classList.add("active");
} else {
    document.getElementById("volumeCorrection").classList.remove("active");
}

document.getElementById("countdown").value = localStorage.getItem("countdown");

window.onload = function () {
    let mediaRecorder;

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
        audio: {
            autoGainControl: JSON.parse(localStorage.getItem("volumeCorrection")),
            echoCancellation: !JSON.parse(localStorage.getItem("originalSound")),
            noiseSuppression: !JSON.parse(localStorage.getItem("originalSound"))
        }

    }).then(stream => {
        document.getElementById("video").srcObject = stream;

        document.getElementById("start").onclick = function () {
            currentVideo = undefined;
            document.getElementById("download").href = undefined;
            document.getElementById("video").srcObject = stream;
            document.getElementById("source").src = undefined;
            document.getElementById("video").muted = true;
            document.getElementById("video").controls = false;
            document.getElementById("delete").style.display = "none";

            mediaRecorder = new MediaRecorder(stream, options);

            if (document.getElementById("countdown").value > 0) {
                document.getElementById("start").innerHTML = document.getElementById("countdown").value;

                let counter = setInterval(function () {
                    document.getElementById("start").innerHTML--;

                    if (document.getElementById("start").innerHTML < 1) {
                        document.getElementById("start").innerHTML = "Start";
                        clearInterval(counter);
                    }
                }, 1000);
            }

            countdownTimeout = setTimeout(function () {
                mediaRecorder.start();

                document.getElementById("video").style.animationName = "recording";
                document.getElementById("video").style.animationDuration = "3s";
                document.getElementById("video").style.animationIterationCount = "infinite";

                document.getElementById("start").disabled = true;
                document.getElementById("stop").disabled = false;
            }, document.getElementById("countdown").value * 1000);
        }

        document.getElementById("stop").onclick = function () {
            mediaRecorder.stop();

            mediaRecorder.ondataavailable = function (event) {
                document.getElementById("video").style.animationName = "none";
                document.getElementById("start").innerHTML = "Start";

                let url = URL.createObjectURL(event.data);
                takeList[counter] = url;
                console.log(url);

                document.getElementById("takes").innerHTML += `<button id="${counter}" class="element" onclick="playbackTake(${counter})">#${counter}</button>`;
                counter++;

                document.getElementById("start").disabled = false;
                document.getElementById("stop").disabled = true;
            }
        }
    });
}

function playbackTake(takeNumber) {
    document.getElementById("video").srcObject = undefined;
    document.getElementById("source").src = takeList[takeNumber];
    document.getElementById("video").muted = false;
    document.getElementById("video").controls = true;
    document.getElementById("download").href = takeList[takeNumber];
    document.getElementById("delete").style.display = "flex";
    currentVideo = (takeNumber).toString();
}

function deleteVideo() {
    delete takeList.currenVideo;
    document.getElementById(currentVideo).remove();
    document.getElementById("source").src = undefined;
    document.getElementById("video").muted = true;
    document.getElementById("video").controls = false;

    if (takeList.length === 0) {
        document.getElementById("delete").style.display = "none";
    }
}
function settings() {
    if (document.getElementById("recordingPage").style.display === "grid") {
        document.getElementById("settingsPage").style.display = "flex";
        document.getElementById("recordingPage").style.display = "none";
        document.getElementById("toolbar").style.display = "none";
    } else {
        document.getElementById("settingsPage").style.display = "none";
        document.getElementById("recordingPage").style.display = "grid";
        document.getElementById("toolbar").style.display = "grid";
    }
}

function toggleOriginalSound() {
    if (localStorage.getItem("originalSound") === "true") {
        document.getElementById("originalSound").classList.add("active");
        localStorage.setItem("originalSound", "false");
    } else {
        document.getElementById("originalSound").classList.remove("active");
        localStorage.setItem("originalSound", "true");
    }
}

function toggleVolumeCorrection() {
    if (localStorage.getItem("volumeCorrection") === "true") {
        document.getElementById("volumeCorrection").classList.add("active");
        localStorage.setItem("volumeCorrection", "false");
    } else {
        document.getElementById("volumeCorrection").classList.remove("active");
        localStorage.setItem("volumeCorrection", "true");
    }
}

oninput = function (event) {
    localStorage.setItem("countdown", document.getElementById("countdown").value);
}