let counter = 1;
let parts = [];
let takeList = [];
let currentVideo;
let longPress = false;
let longPressTimeout;
let countdownTimeout;

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
    id("volumeCorrection").style.backgroundColor = "White";
    id("volumeCorrection").style.color = "Black";
} else {
    id("volumeCorrection").style.backgroundColor = "hsl(0, 0%, 12.5%)";
    id("volumeCorrection").style.color = "White";
}

if (localStorage.getItem("originalSound") === "true") {
    id("originalSound").style.backgroundColor = "White";
    id("originalSound").style.color = "Black";
} else {
    id("originalSound").style.backgroundColor = "hsl(0, 0%, 12.5%)";
    id("originalSound").style.color = "White";
}

id("countdown").value = localStorage.getItem("countdown");

console.log(JSON.parse(localStorage.getItem("volumeCorrection")));

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
        id("video").srcObject = stream;

        id("start").onclick = function () {
            id("download").href = undefined;
            id("video").srcObject = stream;
            id("source").src = undefined;
            id("video").muted = true;
            id("video").controls = false;
            id("delete").style.display = "none";
            parts = [];
            mediaRecorder = new MediaRecorder(stream);

            if (id("countdown").value > 0) {
                id("start").innerHTML = id("countdown").value;

                let counter = setInterval(function () {
                    id("start").innerHTML--;

                    if (id("start").innerHTML === 0) {
                        id("start").innerHTML = "Start";
                        clearInterval(counter);
                    }
                }, 1000);
            }

            countdownTimeout = setTimeout(function () {
                mediaRecorder.start(1);
                mediaRecorder.ondataavailable = function (event) {
                    parts.push(event.data);
                }

                id("video").style.animationName = "recording";
                id("video").style.animationDuration = "3s";
                id("video").style.animationIterationCount = "infinite";

                id("start").disabled = true;
                id("stop").disabled = false;
            }, id("countdown").value * 1000);
        }

        id("stop").onclick = function () {
            mediaRecorder.stop();
            let blob = new Blob(parts, {
                type: "video/webm"
            });

            id("video").style.animationName = "none";
            id("start").innerHTML = "Start";

            let url = URL.createObjectURL(blob);
            takeList.push(url);
            id("takes").innerHTML += `<button id="${counter}" class="element" onmouseup="cancelLongPress()" onmousedown="startLongPress()" ontouchstart="startLongPress()" ontouchend="cancelLongPress()" onclick="playbackTake(${counter})" style='width: 100%;'>#${counter}</button>`;
            counter++;

            id("start").disabled = false;
            id("stop").disabled = true;
            parts = [];
        }
    });
}

function playbackTake(take) {
    id("video").srcObject = undefined;
    id("source").src = takeList[take - 1];
    id("video").muted = false;
    id("video").controls = true;
    id("download").href = takeList[take - 1];
    id("delete").style.display = "flex";
    currentVideo = (take).toString();
}

function deleteVideo() {
    takeList.splice(currentVideo - 1, 1);
    console.log(currentVideo);
    id(`${currentVideo}`).remove();
    id("source").src = undefined;
    id("video").muted = true;
    id("video").controls = false;

    if (takeList.length === 0) {
        id("delete").style.display = "none";
    }
}

function startLongPress() {
    longPress = true;
    longPressTimeout = setTimeout(function () {
        if (longPress) {
            id("download").click();
        }
    }, 1000);
}

function cancelLongPress() {
    longPress = false;
    clearInterval(longPressTimeout);
}

function settings() {
    if (id("settingsPage").style.display === "none") {
        id("settingsPage").style.display = "flex";
        id("recordingPage").style.display = "none";
    } else {
        id("settingsPage").style.display = "none";
        id("recordingPage").style.display = "flex";
    }
}

function toggleOriginalSound() {
    if (localStorage.getItem("originalSound") === "true") {
        id("originalSound").style.backgroundColor = "hsl(0, 0%, 12.5%)";
        id("originalSound").style.color = "White";
        localStorage.setItem("originalSound", "false");
    } else {
        id("originalSound").style.backgroundColor = "White";
        id("originalSound").style.color = "Black";
        localStorage.setItem("originalSound", "true");
    }
}

function toggleVolumeCorrection() {
    if (localStorage.getItem("volumeCorrection") === "true") {
        id("volumeCorrection").style.backgroundColor = "hsl(0, 0%, 12.5%)";
        id("volumeCorrection").style.color = "White";
        localStorage.setItem("volumeCorrection", "false");
    } else {
        id("volumeCorrection").style.backgroundColor = "White";
        id("volumeCorrection").style.color = "Black";
        localStorage.setItem("volumeCorrection", "true");
    }
}

oninput = function (event) {
    localStorage.setItem("countdown", id("countdown").value);
}