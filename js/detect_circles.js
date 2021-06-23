// play loader until opencv.js ready
document.body.classList.add("loading")

function onOpenCvReady() {
    document.body.classList.remove("loading")
}

// get input image
let imgElement = document.getElementById("imageSrc")
let inputElement = document.getElementById("fileInput")

// create hidden image input image element
inputElement.onchange = function () {
    imgElement.src = URL.createObjectURL(event.target.files[0])
}

function onImageSelect() {
    let image = cv.imread(imgElement);
    cv.imshow('imageCanvas', image);
    image.delete();
    document.getElementById("imageCanvas").classList.remove("hidden")
}

// create canvas for js drawings
imgElement.onload = onImageSelect;
imgElement.onchange = onImageSelect;

// get first image
document.getElementById("img-back").onclick = function () {
    onImageSelect()
}

// resize image
document.getElementById("resize_img").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    let dsize = new cv.Size(2560, 1440);
    // You can try more different parameters
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
}

// gray scale
document.getElementById("gray_scale").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();

    document.getElementById("img-back").style.removeProperty("display");
    document.getElementById("downloadButton").classList.remove('disabled');
}

// median blurring image
document.getElementById("median_blur").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    // You can try more different parameters
    cv.medianBlur(src, dst, 25);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
}

// thresh binary inv (must use with gray-scale image)
document.getElementById("thresh_binary_inv").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

    cv.threshold(src, dst, 177, 255, cv.THRESH_BINARY_INV); // here
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();

    document.getElementById("img-back").style.removeProperty("display");
    document.getElementById("downloadButton").classList.remove('disabled');
}

// thresh binary
document.getElementById("thresh_binary").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    cv.threshold(src, dst, 200, 255, cv.THRESH_BINARY);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();

    document.getElementById("img-back").style.removeProperty("display");
    document.getElementById("downloadButton").classList.remove('disabled');
}

// thresh binary hard
document.getElementById("thresh_binary_hard").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    // You can try more different parameters
    cv.threshold(src, dst, 253, 255, cv.THRESH_BINARY);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();

    document.getElementById("img-back").style.removeProperty("display");
    document.getElementById("downloadButton").classList.remove('disabled');
}

// hough circles
document.getElementById("hough_circles").onclick = function () {
    let src = cv.imread('imageCanvas');
    let circles = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    // You can try more different parameters
    cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
        1, 100, 30, 50, 75, 270);

    // draw circles
    for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3];
        let y = circles.data32F[i * 3 + 1];
        let radius = circles.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);
        console.log(center, radius)
        cv.circle(src, center, radius, [255, 0, 0, 46], 4);
    }
    cv.imshow('imageCanvas', src);
    src.delete();
    circles.delete();
}

// find pupils
document.getElementById("find_pupil").onclick = function () {

}

// gaussian blur
document.getElementById("gaussian_blur").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    let ksize = new cv.Size(11, 11);
    // You can try more different parameters
    cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
}

// erode
document.getElementById("erode").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    cv.erode(src, dst, M, anchor, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
    M.delete();
}

// dilate
document.getElementById("dilate").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    cv.dilate(src, dst, M, anchor, 4, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
    M.delete();
}

// find light
document.getElementById("find_light").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let cnt = contours.get(0);
    // You can try more different parameters
    let circle = cv.minEnclosingCircle(cnt);

    // set contour circle color
    let contoursColor = new cv.Scalar(255, 255, 255);
    let circleColor = new cv.Scalar(255, 0, 0);

    // draw contours and circle
    cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
    cv.circle(dst, circle.center, circle.radius, circleColor);
    cv.imshow('imageCanvas', dst);

    // delete unnecessary items
    src.delete();
    dst.delete();
    contours.delete();
    hierarchy.delete();
    cnt.delete();
}


// download output image
document.getElementById('downloadButton').onclick = function () {
    this.href = document.getElementById('imageCanvas').toDataURL();
    this.download = 'image.png';
};
