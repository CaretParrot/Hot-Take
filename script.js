let counter = 1;
let takeList = [];
let currentVideo;
let longPress = false;
let longPressTimeout;
let countdownTimeout;

const options = {
    mimeType: "video/mp4"
}

setupTree();

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
    idTree.volumeCorrection.style.backgroundColor = "White";
    idTree.volumeCorrection.style.color = "Black";
} else {
    idTree.volumeCorrection.style.backgroundColor = "hsl(0, 0%, 20%)";
    idTree.volumeCorrection.style.color = "White";
}

if (localStorage.getItem("originalSound") === "true") {
    idTree.originalSound.style.backgroundColor = "White";
    idTree.originalSound.style.color = "Black";
} else {
    idTree.originalSound.style.backgroundColor = "hsl(0, 0%, 20%)";
    idTree.originalSound.style.color = "White";
}

id("countdown").value = localStorage.getItem("countdown");

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
        idTree.video.srcObject = stream;

        idTree.start.onclick = function () {
            currentVideo = undefined;
            idTree.download.href = undefined;
            idTree.video.srcObject = stream;
            idTree.source.src = undefined;
            idTree.video.muted = true;
            idTree.video.controls = false;
            idTree.delete.style.display = "none";

            mediaRecorder = new MediaRecorder(stream, options);

            if (idTree.countdown.value > 0) {
                idTree.start.innerHTML = idTree.countdown.value;

                let counter = setInterval(function () {
                    idTree.start.innerHTML--;

                    if (idTree.start.innerHTML < 1) {
                        idTree.start.innerHTML = "Start";
                        clearInterval(counter);
                    }
                }, 1000);
            }

            countdownTimeout = setTimeout(function () {
                mediaRecorder.start();

                idTree.video.style.animationName = "recording";
                idTree.video.style.animationDuration = "3s";
                idTree.video.style.animationIterationCount = "infinite";

                idTree.start.disabled = true;
                idTree.stop.disabled = false;
            }, idTree.countdown.value * 1000);
        }

        idTree.stop.onclick = function () {
            mediaRecorder.stop();

            mediaRecorder.ondataavailable = function (event) {
                idTree.video.style.animationName = "none";
                idTree.start.innerHTML = "Start";

                let url = URL.createObjectURL(event.data);
                takeList.push(url);

                idTree.takes.innerHTML += `<button id="${counter}" class="element" onmouseup="cancelLongPress()" onmousedown="startLongPress()" ontouchstart="startLongPress()" ontouchend="cancelLongPress()" onclick="playbackTake(${counter})">#${counter}</button>`;
                counter++;

                idTree.start.disabled = false;
                idTree.stop.disabled = true;
            }
        }
    });
}

function playbackTake(take) {
    idTree.video.srcObject = undefined;
    idTree.source.src = takeList[take - 1];
    idTree.video.muted = false;
    idTree.video.controls = true;
    idTree.download.href = takeList[take - 1];
    idTree.delete.style.display = "flex";
    currentVideo = (take).toString();
}

function deleteVideo() {
    takeList.splice(currentVideo - 1, 1);
    id(currentVideo).remove();
    idTree.source.src = undefined;
    idTree.video.muted = true;
    idTree.video.controls = false;

    if (takeList.length === 0) {
        idTree.delete.style.display = "none";
    }
}

function startLongPress() {
    longPress = true;
    longPressTimeout = setTimeout(function () {
        if (longPress && currentVideo !== undefined) {
            idTree.download.click();
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
    if (idTree.settingsPage.style.display === "none") {
        idTree.settingsPage.style.display = "flex";
        idTree.recordingPage.style.display = "none";
    } else {
        idTree.settingsPage.style.display = "none";
        idTree.recordingPage.style.display = "flex";
    }
}

function toggleOriginalSound() {
    if (localStorage.getItem("originalSound") === "true") {
        idTree.originalSound.style.backgroundColor = "hsl(0, 0%, 20%)";
        idTree.originalSound.style.color = "White";
        localStorage.setItem("originalSound", "false");
    } else {
        idTree.originalSound.style.backgroundColor = "White";
        idTree.originalSound.style.color = "Black";
        localStorage.setItem("originalSound", "true");
    }
}

function toggleVolumeCorrection() {
    if (localStorage.getItem("volumeCorrection") === "true") {
        idTree.volumeCorrection.style.backgroundColor = "hsl(0, 0%, 20%)";
        idTree.volumeCorrection.style.color = "White";
        localStorage.setItem("volumeCorrection", "false");
    } else {
        idTree.volumeCorrection.style.backgroundColor = "White";
        idTree.volumeCorrection.style.color = "Black";
        localStorage.setItem("volumeCorrection", "true");
    }
}

oninput = function (event) {
    localStorage.setItem("countdown", idTree.countdown.value);
}