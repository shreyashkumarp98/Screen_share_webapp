'use strict';

const preferredDisplaySurface = document.getElementById('displaySurface');
const startButton = document.getElementById('startButton');
const cropButton  = document.getElementById('cropButton');
const fullButton = document.getElementById('fullButton');


const maxwidth = 1280;
const maxheight = 720;
document.getElementById("width").value = document.getElementById("gum-local").offsetWidth;
document.getElementById("height").value = document.getElementById("gum-local").offsetHeight;


const canvas = document.querySelector('canvas');
const video = document.querySelector('video');
const fps = 60;
const width = 1280;
const height = 720;
var canvasInterval = null;
var cropflag = 0;

var x = null;
var y = null;
var new_width = null;
var new_height = null;

function drawImage() {
    canvas.getContext('2d', { alpha: false }).drawImage(video,0, 0, width, height);
}

function redraw() {
    canvas.getContext('2d', { alpha: false }).drawImage(video, x,y,new_width, new_height,0, 0, 1280, 720);
}

canvasInterval = window.setInterval(() => {
    drawImage(video);
}, 1000 / fps);

video.onpause = function() {
    clearInterval(canvasInterval);
};

video.onended = function() {
    clearInterval(canvasInterval);
};
//,80,0,480,500,0,0,500,520
video.onplay = function() {
    clearInterval(canvasInterval);
    if (cropflag == 0){
        canvasInterval = window.setInterval(() => {
            drawImage(video);
        }, 1000 / fps);
    }
    if (cropflag == 1) {
        canvasInterval = window.setInterval(() => {
            redraw(video);
        }, 1000 / fps);
    }

};




if (adapter.browserDetails.browser === 'chrome' &&
    adapter.browserDetails.version >= 107) {
    // See https://developer.chrome.com/docs/web-platform/screen-sharing-controls/
    document.getElementById('options').style.display = 'block';
} else if (adapter.browserDetails.browser === 'firefox') {
    // Polyfill in Firefox.
    // See https://blog.mozilla.org/webrtc/getdisplaymedia-now-available-in-adapter-js/
    adapter.browserShim.shimGetDisplayMedia(window, 'screen');
}



function handleSuccess(stream) {
    startButton.disabled = true;
    cropButton.disabled = false;
    fullButton.disabled = false;
    preferredDisplaySurface.disabled = true;
    const video = document.querySelector('video');
    video.srcObject = stream;
    video.play()
    clearInterval(canvasInterval);
    canvasInterval = window.setInterval(() => {
        drawImage(video);
    }, 1000 / fps);
    //canvas.getContext('2d').drawImage(video,0,0,1280,720,0,0,700,520);

    // demonstrates how to detect that the user has stopped
    // sharing the screen via the browser UI.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
        errorMsg('The user has ended sharing the screen');
        cropflag =0;
        startButton.disabled = false;
        cropButton.disabled = true;
        preferredDisplaySurface.disabled = false;
    });
}

function handleError(error) {
    errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}


startButton.addEventListener('click', () => {
    const options = {audio: true, video: true};
    const displaySurface = preferredDisplaySurface.options[preferredDisplaySurface.selectedIndex].value;
    if (displaySurface !== 'default') {
        options.video = {displaySurface};
    }
    navigator.mediaDevices.getDisplayMedia(options)
        .then(handleSuccess, handleError);
});

cropButton.addEventListener('click', () => {

    var f1 =  document.getElementById("x").value;
    var f2 = document.getElementById("y").value;
    var f3 = document.getElementById("width").value;
    var f4 = document.getElementById("height").value;

    x = f1 === ''? 0 : parseInt(f1);
    y = f2 === ''? 0 : parseInt(f2);
    var right = f3 === ''? 0 : parseInt(f3);
    var bott = f4 === ''? 0 : parseInt(f4);

    new_width = 1280 -x-right;
    new_height = 720 -y-bott;

    console.log(new_width);
    console.log(new_height);

    if(new_width<= maxwidth+500 && new_height <= maxheight+500)
    {
        //resetButton.disabled = false;
        console.log("cropping-");
        video.pause();
        cropflag =1;
        canvas.getContext('2d', { alpha: false }).fillStyle = "black";
        canvas.getContext('2d', { alpha: false }).fillRect(0, 0, canvas.width, canvas.height);
        video.play();

    }
    else {
        const message = "you can't exceed width = " + maxwidth + " and height = " + maxheight;
        errorMsg(message)
    }
});

fullButton.addEventListener('click', () => {
    canvas.requestFullscreen().catch((err) => {
        alert(
            `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        );
    });
});

// resetButton.addEventListener('click', () => {
//     resetButton.disabled = false;
//     x=0;
//     y=0;
//     new_width=1280;
//     new_height=720;
//     canvas.getContext('2d', { alpha: false }).fillStyle = "black";
//     canvas.getContext('2d', { alpha: false }).fillRect(0, 0, canvas.width, canvas.height);
//     video.play();
// });

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    startButton.disabled = false;
} else {
    errorMsg('getDisplayMedia is not supported');
}


