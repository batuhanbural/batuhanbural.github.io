// play loader until opencv.js ready
document.body.classList.add("loading");

function onOpenCvReady() {
    document.body.classList.remove("loading");
}

// get input image
let imgElement = document.getElementById("imageSrc");
let inputElement = document.getElementById("fileInput");

// create hidden image input image element
inputElement.onchange = function () {
    imgElement.src = URL.createObjectURL(event.target.files[0]);
}

function onImageSelect() {
    let image = cv.imread(imgElement);
    cv.imshow('imageCanvas', image);
    cv.imshow('editCanvas', image);
    image.delete();

    document.getElementById("result_strabismus").classList.add("hidden");
    document.getElementById("result_healthy").classList.add("hidden");
}

// create canvas for js drawings
imgElement.onload = onImageSelect;
imgElement.onchange = onImageSelect;

// coordinates of pupil
let p_center, p_radius, p_x, p_y;

let l_center, l_radius, l_circleColor, l_contourColor, l_contours, l_hierarchy;

let img_resized;

function findPupil() {
    let src = cv.imread("imageCanvas");
    let output = new cv.Mat();
    let imgr = new cv.Mat();
    let circles = new cv.Mat();

    // let dsize = new cv.Size(Math.round(src.cols * 3.7), Math.round(src.rows * 3.7));
    let dsize = new cv.Size(2560, 1440);

    cv.resize(src, imgr, dsize, 0, 0, cv.INTER_AREA);
    cv.cvtColor(imgr, output, cv.COLOR_RGBA2GRAY);
    cv.medianBlur(output, output, 25);

    cv.HoughCircles(output, circles, cv.HOUGH_GRADIENT,
        1, 140, 30, 50, 150, 270);

    // draw circles
    for (let i = 0; i < circles.cols; ++i) {
        p_x = circles.data32F[i * 3];
        p_y = circles.data32F[i * 3 + 1];
        p_radius = circles.data32F[i * 3 + 2];
        p_center = new cv.Point(p_x, p_y);
        cv.circle(imgr, p_center, p_radius, [255, 192, 13, 255], 8, cv.FILLED);
    }
    img_resized = imgr;
    src.delete();
    output.delete();
    circles.delete();
}

function findLight() {
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
    cv.dilate(output, output, M, anchor, 4, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // cv.dilate(output, output, M, anchor, 4, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue()); // if needed add this line to detect more accurate lights

    // detect light and draw contours
    let dst = cv.Mat.zeros(output.rows, output.cols, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(output, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let circle = cv.minEnclosingCircle(cnt);

        // set contour circle color
        l_circleColor = new cv.Scalar(240, 86, 50, 225);
        l_contourColor = new cv.Scalar(255, 255, 255, 175);

        l_contours = contours;
        l_hierarchy = hierarchy;

        if (((p_x - p_radius < circle.center.x) && (circle.center.x < p_x + p_radius)) && ((p_y - p_radius < circle.center.y) && circle.center.y < p_y + p_radius)) {
            l_center = circle.center;
            l_radius = circle.radius;
        }
    }
}

document.getElementById("find_st").onclick = function () {
    findPupil();
    findLight();

    cv.drawContours(img_resized, l_contours, 0, l_contourColor, 1, 8, l_hierarchy, 100);
    cv.circle(img_resized, l_center, l_radius, l_circleColor, 4, cv.FILLED);
    cv.imshow("editCanvas", img_resized);

    let distance = Math.round((((l_center.x - p_x) ** 2) + ((l_center.y - p_y) ** 2)) ** (1 / 2));
    if (distance > 26) {
        document.getElementById("result_strabismus").classList.remove("hidden");
    } else {
        document.getElementById("result_healthy").classList.remove("hidden");
    }

}

// download output image
document.getElementById('downloadButton').onclick = function () {
    this.href = document.getElementById('editCanvas').toDataURL();
    this.download = 'st_detected.png';
};
