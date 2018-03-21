var maxIterations = 300;
var scale = 1;

var element;
var canvas;
var width;
var height;

var xMin = -2;
var xMax = 1;
var yMin = -1.5;
var yMax = 1.5;

var currXMin = xMin;
var currXMax = xMax;
var currYMin = yMin;
var currYMax = yMax;

var currXLength = currXMax - currXMin;
var currYLength = currYMax - currYMin;

var originX = (currXMin + currXMax) / 2;
var originY = (currYMin + currYMax) / 2;

$(function () {
    element = document.getElementById("canvas");
    canvas = element.getContext("2d");
    width = element.width;
    height = element.height;

    drawCanvas();

    // Disable right click menu
    element.oncontextmenu = function() 
    {
        return false;
    };

    $(element).mousedown(function (e) {
        var rect = element.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        // left click - zoom in
        if (e.button == 0) {
            scale++;
            setOrigin(x, y);
            drawCanvas();
        }
        // right click - zoom out if possible
        else if (e.button == 2) {
            if (scale > 1) {
                scale--;
                setOrigin(x, y);
                drawCanvas();
            }
        }
    });

    updateStats();
});

function drawCanvas() {
    // create a new batch of pixels with the same dimensions as the image:
    var imageData = canvas.createImageData(width, height);

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var xValue = i * currXLength / width + currXMin;
            var yValue = j * currYLength / height + currYMin;

            var count = isInSet(xValue, yValue);
            var adjustedValue = count / 500;

            setPixel(imageData, i, j, adjustedValue, 255);
        }
    }

    // copy the image data back onto the canvas
    canvas.putImageData(imageData, 0, 0); // at coords 0,0
}

function setOrigin(x, y) {
    // Get the width and height of the scaled box
    var maxXLength = xMax - xMin;
    var scaledMaxXLength = maxXLength / Math.pow(2, (scale - 1));
    var maxYLength = yMax - yMin;
    var scaledMaxYLength = maxYLength / Math.pow(2, (scale - 1));

    // Convert clicked position from pixel value into x, y value
    var newOriginX = x * currXLength / width + currXMin;
    var newOriginY = y * currYLength / height + currYMin;

    // Use scaled length to calculate new bounding box
    var newXMin = newOriginX - scaledMaxXLength / 2;
    var newXMax = newOriginX + scaledMaxXLength / 2;
    var newYMin = newOriginY - scaledMaxYLength / 2;
    var newYMax = newOriginY + scaledMaxYLength / 2;

    // Reposition new box inside boundaries if necessary
    var offsetX = 0;
    var offsetY = 0;

    if (newXMin < xMin) {
        offsetX = xMin - newXMin;
    }
    else if (newXMax > xMax) {
        offsetX = xMax - newXMax;
    }
    if (newYMin < yMin) {
        offsetY = yMin - newYMin;
    }
    else if (newYMax > yMax) {
        offsetY = yMax - newYMax;
    }

    currXMin = newXMin + offsetX;
    currXMax = newXMax + offsetX;
    currYMin = newYMin + offsetY;
    currYMax = newYMax + offsetY;
    originX = newOriginX + offsetX;
    originY = newOriginY + offsetY;
    currXLength = currXMax - currXMin;
    currYLength = currYMax - currYMin;

    updateStats();
}

function updateStats() {
    $("#scale").html(scale);

    $("#xMin").html(xMin);
    $("#xMax").html(xMax);
    $("#yMin").html(yMin);
    $("#yMax").html(yMax);

    $("#currXMin").html(currXMin);
    $("#currXMax").html(currXMax);
    $("#currYMin").html(currYMin);
    $("#currYMax").html(currYMax);

    $("#currXLength").html(currXLength);
    $("#currYLength").html(currYLength);

    $("#originX").html(originX);
    $("#originY").html(originY);
}

function setPixel(imageData, x, y, value, a) {
    index = (x + y * imageData.width) * 4;

    var adjustedValue = value > 1 ? 1 : value;

    if (adjustedValue >= 1) {
        imageData.data[index + 0] = 0;
        imageData.data[index + 1] = 0;
        imageData.data[index + 2] = 0;
        imageData.data[index + 3] = a;
    }
    else {
        var rgbValues = HSVtoRGB(adjustedValue / 0.5 + 0.6, 1, 1);
        imageData.data[index + 0] = rgbValues.r;
        imageData.data[index + 1] = rgbValues.g;
        imageData.data[index + 2] = rgbValues.b;
        imageData.data[index + 3] = a;
    }
}

function isInSet(c1, c2) {
    var oldC1 = c1;
    var oldC2 = c2;
    var i = 0;

    for (i = 0; i <= maxIterations; i++) {
        if (getDistance(oldC1, oldC2) >= 4) {
            break;
        }

        var newC1 = oldC1 * oldC1 - oldC2 * oldC2;
        var newC2 = 2 * oldC1 * oldC2;
        oldC1 = newC1 + c1;
        oldC2 = newC2 + c2;
    }

    if (i >= maxIterations - 1) {
        i = 1000000;
    }
    return i;
}

function getDistance(c1, c2) {
    return c1 * c1 + c2 * c2;
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}