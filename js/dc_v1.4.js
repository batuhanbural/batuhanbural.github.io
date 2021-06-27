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

// coordinates of pupil
let p_center;
let p_radius;
let p_x;
let p_y;

// coords of light
let l_center;
let l_radius;
let l_x;
let l_y;


document.getElementById("find_pupil").onclick = function () {
    let src = cv.imread("imageCanvas");
    let output = new cv.Mat();
    let imgr = new cv.Mat();
    // let dsize = new cv.Size(Math.ceil(src.cols * 3.7), Math.floor(src.rows * 3.7));
    let dsize = new cv.Size(2560, 1440);

    cv.resize(src, imgr, dsize, 0, 0, cv.INTER_AREA);
    cv.cvtColor(imgr, output, cv.COLOR_RGBA2GRAY);
    cv.medianBlur(output, output, 25);

    let circles = new cv.Mat();
    cv.HoughCircles(output, circles, cv.HOUGH_GRADIENT,
        1, 120, 30, 50, 90, 270);

    // draw circles
    for (let i = 0; i < circles.cols; ++i) {
        p_x = circles.data32F[i * 3];
        p_y = circles.data32F[i * 3 + 1];
        p_radius = circles.data32F[i * 3 + 2];
        p_center = new cv.Point(p_x, p_y);
        console.log(p_center, p_radius);
        cv.circle(imgr, p_center, p_radius, [255, 192, 13, 255], 8, cv.FILLED);
    }
    cv.imshow('editCanvas', imgr);
    src.delete();
    output.delete();
    circles.delete();
}

document.getElementById("find_light").onclick = function () {
    let src = cv.imread("imageCanvas");
    let output = new cv.Mat();
    let imgr = new cv.Mat();
    // let dsize = new cv.Size(Math.ceil(src.cols * 3.657), Math.floor(src.rows * 3.657));
    let dsize = new cv.Size(2560, 1440);

    cv.resize(src, imgr, dsize, 0, 0, cv.INTER_AREA);
    cv.cvtColor(imgr, output, cv.COLOR_RGBA2GRAY);
    cv.threshold(output, output, 253, 255, cv.THRESH_BINARY);

    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    cv.dilate(output, output, M, anchor, 4, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    // detect light and draw contours
    let dst = cv.Mat.zeros(output.rows, output.cols, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(output, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);


    //

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);

        let circle = cv.minEnclosingCircle(cnt);

        // set contour circle color
        let contoursColor = new cv.Scalar(255, 255, 255, 175);
        let circleColor = new cv.Scalar(221, 212, 226, 89);



        // draw contours and circle
        cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
        cv.circle(imgr, circle.center, circle.radius, circleColor, 4, cv.FILLED);
    }

    cv.imshow('editCanvas', imgr);
}

// download output image
document.getElementById('downloadButton').onclick = function () {
    this.href = document.getElementById('editCanvas').toDataURL();
    this.download = 'image.png';
};
