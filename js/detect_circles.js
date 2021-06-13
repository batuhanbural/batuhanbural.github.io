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
    document.getElementById("circlesButton").classList.remove("disabled")
}

// create canvas for js drawings
imgElement.onload = onImageSelect;
imgElement.onchange = onImageSelect;

// detecting pupil
document.getElementById('pupilButton').onclick = function () {
    this.disabled = true;
    document.body.classList.add('loading');

    let srcMat = cv.imread('imageCanvas');
    let displayMat = srcMat.clone();
    let circlesMat = new cv.Mat();

    cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2GRAY);

    cv.HoughCircles(srcMat, circlesMat, cv.HOUGH_GRADIENT, 1, 45, 75, 40, 0, 0);
    // cv.HoughCircles(srcMat, circlesMat, cv.HOUGH_GRADIENT, 1, 100, 30, 50, 19, 50);

    for (let i = 0; i < circlesMat.cols; ++i) {
        let x = circlesMat.data32F[i * 3];
        let y = circlesMat.data32F[i * 3 + 1];
        let radius = circlesMat.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);

        // draw circles
        console.log(center)
        cv.circle(displayMat, center, radius, [116, 15, 245, 96], 2);
    }

    cv.imshow('imageCanvas', displayMat);

    // delete unnecessary items
    srcMat.delete();
    displayMat.delete();
    circlesMat.delete();

    this.disabled = false;
    document.body.classList.remove('loading');
    document.getElementById("downloadButton").classList.remove('disabled');
};

// detecting light
document.getElementById('lightButton').onclick = function () {
    this.disabled = true;
    document.body.classList.add('loading');

    let src = cv.imread('imageCanvas');
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 190, 255, cv.THRESH_BINARY);
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


    this.disabled = false;
    document.body.classList.remove('loading');
    document.getElementById("downloadButton").classList.remove('disabled');
};

// convex hull canvases
document.getElementById("convexHull").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let hull = new cv.MatVector();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        // You can try more different parameters
        cv.convexHull(cnt, tmp, false, true);
        hull.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }
// draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let colorHull = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));
        cv.drawContours(dst, hull, i, colorHull, 1, 8, hierarchy, 0);
    }
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
    hierarchy.delete();
    contours.delete();
    hull.delete();

}

// approx polly canvases
document.getElementById("approxPollyDP").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let poly = new cv.MatVector();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
// approximates each contour to polygon
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        // You can try more different parameters
        cv.approxPolyDP(cnt, tmp, 3, true);
        poly.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }
// draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));
        cv.drawContours(dst, poly, i, color, 1, 8, hierarchy, 0);
    }
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();
    hierarchy.delete();
    contours.delete();
    poly.delete();
}

// threshold
document.getElementById("threshold").onclick = function () {
    let src = cv.imread('imageCanvas');
    let dst = new cv.Mat();
// You can try more different parameters
    cv.threshold(src, dst, 250, 255, cv.THRESH_BINARY);
    cv.imshow('imageCanvas', dst);
    src.delete();
    dst.delete();

}


// download output image
document.getElementById('downloadButton').onclick = function () {
    this.href = document.getElementById('imageCanvas').toDataURL();
    this.download = 'image.png';
};

