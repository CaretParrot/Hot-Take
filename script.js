let counter = 1;
let takeList = {};
let currentVideo;
let longPress = false;
let longPressTimeout;
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
    document.getElementById("volumeCorrection").style.backgroundColor = "White";
    document.getElementById("volumeCorrection").style.color = "Black";
} else {
    document.getElementById("volumeCorrection").style.backgroundColor = "hsl(0, 0%, 20%)";
    document.getElementById("volumeCorrection").style.color = "White";
}

if (localStorage.getItem("originalSound") === "true") {
    document.getElementById("originalSound").style.backgroundColor = "White";
    document.getElementById("originalSound").style.color = "Black";
} else {
    document.getElementById("originalSound").style.backgroundColor = "hsl(0, 0%, 20%)";
    document.getElementById("originalSound").style.color = "White";
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

                document.getElementById("takes").innerHTML += `<button id="${counter}" class="element" onmouseup="cancelLongPress()" onmousedown="startLongPress()" ontouchstart="startLongPress()" ontouchend="cancelLongPress()" onclick="playbackTake(${counter})">#${counter}</button>`;
                counter++;

                document.getElementById("start").disabled = false;
                document.getElementById("stop").disabled = true;
            }
        }
    });
}

function playbackTake(takeNumber) {
    document.getElementById("video").srcObject = undefined;
    document.getElementById("source").src = takeList.takeNumber;
    document.getElementById("video").muted = false;
    document.getElementById("video").controls = true;
    document.getElementById("download").href = takeList.takeNumber;
    document.getElementById("delete").style.display = "flex";
    currentVideo = (take).toString();
}

function deleteVideo() {
    takeList.splice(currentVideo, currentVideo);
    document.getElementById(currentVideo).remove();
    document.getElementById("source").src = undefined;
    document.getElementById("video").muted = true;
    document.getElementById("video").controls = false;

    if (takeList.length === 0) {
        document.getElementById("delete").style.display = "none";
    }
}

function startLongPress() {
    longPress = true;
    longPressTimeout = setTimeout(function () {
        if (longPress && currentVideo !== undefined) {
            document.getElementById("download").click();
        } else if (currentVideo == undefined) {
            alert("Please select a video before downloading.");
        }
    }, 1000);
}

function cancelLongPress() {
    longPress = false;
    clearInterval(longPressTimeout);
}

function settings() {
    if (document.getElementById("settingsPage").style.display === "none") {
        document.getElementById("settingsPage").style.display = "flex";
        document.getElementById("recordingPage").style.display = "none";
    } else {
        document.getElementById("settingsPage").style.display = "none";
        document.getElementById("recordingPage").style.display = "flex";
    }
}

function toggleOriginalSound() {
    if (localStorage.getItem("originalSound") === "true") {
        document.getElementById("originalSound").style.backgroundColor = "hsl(0, 0%, 20%)";
        document.getElementById("originalSound").style.color = "White";
        localStorage.setItem("originalSound", "false");
    } else {
        document.getElementById("originalSound").style.backgroundColor = "White";
        document.getElementById("originalSound").style.color = "Black";
        localStorage.setItem("originalSound", "true");
    }
}

function toggleVolumeCorrection() {
    if (localStorage.getItem("volumeCorrection") === "true") {
        document.getElementById("volumeCorrection").style.backgroundColor = "hsl(0, 0%, 20%)";
        document.getElementById("volumeCorrection").style.color = "White";
        localStorage.setItem("volumeCorrection", "false");
    } else {
        document.getElementById("volumeCorrection").style.backgroundColor = "White";
        document.getElementById("volumeCorrection").style.color = "Black";
        localStorage.setItem("volumeCorrection", "true");
    }
}

oninput = function (event) {
    localStorage.setItem("countdown", document.getElementById("countdown").value);
}