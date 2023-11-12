/**
 * Octopus JavaScript File for CS465, HW#02
 * Bilkent University
 * FALL 2023-2024
 *
 * @author  Mert Ünlü & Barış Tan Ünal
 * @version 1.1
 * @since   09-11-2023
 */


var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),

    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)

];


//components for an octopus which has a head and 8 legs which has 3 parts each: upper, middle, lower.
//the octopus have 25 components in total

var headId = 0;
var upperLeg1Id = 1;
var upperLeg2Id = 2;
var upperLeg3Id = 3;
var upperLeg4Id = 4;
var upperLeg5Id = 5;
var upperLeg6Id = 6;
var upperLeg7Id = 7;
var upperLeg8Id = 8;

var middleLeg1Id = 9;
var middleLeg2Id = 10;
var middleLeg3Id = 11;
var middleLeg4Id = 12;
var middleLeg5Id = 13;
var middleLeg6Id = 14;
var middleLeg7Id = 15;
var middleLeg8Id = 16;

var lowerLeg1Id = 17;
var lowerLeg2Id = 18;
var lowerLeg3Id = 19;
var lowerLeg4Id = 20;
var lowerLeg5Id = 21;
var lowerLeg6Id = 22;
var lowerLeg7Id = 23;
var lowerLeg8Id = 24;

var headHeight = 5.0;
var headWidth = 5.0;

var upperLegWidth = 0.5;
var upperLegHeight = 5.0;

var middleLegWidth = 0.5;
var middleLegHeight = 3.0;

var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;

var numNodes = 25;
var numAngles = 24;
var angle = 0;


//theta is the angle of rotation for each node 
var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();


    switch (Id) {

        case headId:

            m = rotate(theta[headId], 0, 1, 0);
            figure[headId] = createNode(m, head, null, upperLeg1Id);
            break;

        case upperLeg1Id:
            m = translate(2, 0, 2);
            figure[upperLeg1Id] = createNode(m, upperLeg, upperLeg2Id, middleLeg1Id);
            break;

        case upperLeg2Id:
            m = translate(2, -5, 0);
            figure[upperLeg2Id] = createNode(m, upperLeg, upperLeg3Id, middleLeg2Id);
            break;

        case upperLeg3Id:
            m = translate(2, -5, -2);
            figure[upperLeg3Id] = createNode(m, upperLeg, upperLeg4Id, middleLeg3Id);
            break;

        case upperLeg4Id:
            m = translate(0, -5, -2);
            figure[upperLeg4Id] = createNode(m, upperLeg, upperLeg5Id, middleLeg4Id);
            break;

        case upperLeg5Id:
            m = translate(-2, -5, -2);
            figure[upperLeg5Id] = createNode(m, upperLeg, upperLeg6Id, middleLeg5Id);
            break;

        case upperLeg6Id:
            m = translate(-2, -5, 0);
            figure[upperLeg6Id] = createNode(m, upperLeg, upperLeg7Id, middleLeg6Id);
            break;

        case upperLeg7Id:
            m = translate(-2, -5, 2);
            figure[upperLeg7Id] = createNode(m, upperLeg, upperLeg8Id, middleLeg7Id);
            break;

        case upperLeg8Id:
            m = translate(0, -5, 2);
            figure[upperLeg8Id] = createNode(m, upperLeg, null, middleLeg8Id);
            break;

        case middleLeg1Id:
            m = translate(2, -10, 2);
            figure[middleLeg1Id] = createNode(m, middleLeg, null, lowerLeg1Id);
            break;

        case middleLeg2Id:
            m = translate(2, -10, 0);
            figure[middleLeg2Id] = createNode(m, middleLeg, null, lowerLeg2Id);
            break;

        case middleLeg3Id:
            m = translate(2, -10, -2);
            figure[middleLeg3Id] = createNode(m, middleLeg, null, lowerLeg3Id);
            break;

        case middleLeg4Id:
            m = translate(0, -10, -2);
            figure[middleLeg4Id] = createNode(m, middleLeg, null, lowerLeg4Id);
            break;

        case middleLeg5Id:
            m = translate(-2, -10, -2);
            figure[middleLeg5Id] = createNode(m, middleLeg, null, lowerLeg5Id);
            break;

        case middleLeg6Id:
            m = translate(-2, -10, 0);
            figure[middleLeg6Id] = createNode(m, middleLeg, null, lowerLeg6Id);
            break;

        case middleLeg7Id:
            m = translate(-2, -10, 2);
            figure[middleLeg7Id] = createNode(m, middleLeg, null, lowerLeg7Id);
            break;

        case middleLeg8Id:
            m = translate(0, -10, 2);
            figure[middleLeg8Id] = createNode(m, middleLeg, null, lowerLeg8Id);
            break;

        case lowerLeg1Id:
            m = translate(2, -12, 2);
            figure[lowerLeg1Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg2Id:
            m = translate(2, -12, 0);
            figure[lowerLeg2Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg3Id:
            m = translate(2, -12, -2);
            figure[lowerLeg3Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg4Id:
            m = translate(0, -12, -2);
            figure[lowerLeg4Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg5Id:
            m = translate(-2, -12, -2);
            figure[lowerLeg5Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg6Id:
            m = translate(-2, -12, 0);
            figure[lowerLeg6Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg7Id:
            m = translate(-2, -12, 2);
            figure[lowerLeg7Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg8Id:
            m = translate(0, -12, 2);
            figure[lowerLeg8Id] = createNode(m, lowerLeg, null, null);
            break;
    }

}

function traverse(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}


function middleLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * middleLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(middleLegWidth, middleLegHeight, middleLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}


function lowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++)
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}



function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider0").onchange = function () {
        theta[headId] = event.srcElement.value;
        initNodes(headId);
    };
    document.getElementById("slider1").onchange = function () {
        theta[upperLeg1Id] = event.srcElement.value;
        initNodes(upperLeg1Id);
    };
    document.getElementById("slider2").onchange = function () {
        theta[upperLeg2Id] = event.srcElement.value;
        initNodes(upperLeg2Id);
    };
    document.getElementById("slider3").onchange = function () {
        theta[upperLeg3Id] = event.srcElement.value;
        initNodes(upperLeg3Id);
    };
    document.getElementById("slider4").onchange = function () {
        theta[upperLeg4Id] = event.srcElement.value;
        initNodes(upperLeg4Id);
    };
    document.getElementById("slider5").onchange = function () {
        theta[upperLeg5Id] = event.srcElement.value;
        initNodes(upperLeg5Id);
    };
    document.getElementById("slider6").onchange = function () {
        theta[upperLeg6Id] = event.srcElement.value;
        initNodes(upperLeg6Id);
    };
    document.getElementById("slider7").onchange = function () {
        theta[upperLeg7Id] = event.srcElement.value;
        initNodes(upperLeg7Id);
    };
    document.getElementById("slider8").onchange = function () {
        theta[upperLeg8Id] = event.srcElement.value;
        initNodes(upperLeg8Id);
    };
    document.getElementById("slider9").onchange = function () {
        theta[middleLeg1Id] = event.srcElement.value;
        initNodes(middleLeg1Id);
    };
    document.getElementById("slider10").onchange = function () {
        theta[middleLeg2Id] = event.srcElement.value;
        initNodes(middleLeg2Id);
    };
    document.getElementById("slider11").onchange = function () {
        theta[middleLeg3Id] = event.srcElement.value;
        initNodes(middleLeg3Id);
    };
    document.getElementById("slider12").onchange = function () {
        theta[middleLeg4Id] = event.srcElement.value;
        initNodes(middleLeg4Id);
    };
    document.getElementById("slider13").onchange = function () {
        theta[middleLeg5Id] = event.srcElement.value;
        initNodes(middleLeg5Id);
    };
    document.getElementById("slider14").onchange = function () {
        theta[middleLeg6Id] = event.srcElement.value;
        initNodes(middleLeg6Id);
    };
    document.getElementById("slider15").onchange = function () {
        theta[middleLeg7Id] = event.srcElement.value;
        initNodes(middleLeg7Id);
    };
    document.getElementById("slider16").onchange = function () {
        theta[middleLeg8Id] = event.srcElement.value;
        initNodes(middleLeg8Id);
    };
    document.getElementById("slider17").onchange = function () {
        theta[lowerLeg1Id] = event.srcElement.value;
        initNodes(lowerLeg1Id);
    };
    document.getElementById("slider18").onchange = function () {
        theta[lowerLeg2Id] = event.srcElement.value;
        initNodes(lowerLeg2Id);
    };
    document.getElementById("slider19").onchange = function () {
        theta[lowerLeg3Id] = event.srcElement.value;
        initNodes(lowerLeg3Id);
    };
    document.getElementById("slider20").onchange = function () {
        theta[lowerLeg4Id] = event.srcElement.value;
        initNodes(lowerLeg4Id);
    };
    document.getElementById("slider21").onchange = function () {
        theta[lowerLeg5Id] = event.srcElement.value;
        initNodes(lowerLeg5Id);
    };
    document.getElementById("slider22").onchange = function () {
        theta[lowerLeg6Id] = event.srcElement.value;
        initNodes(lowerLeg6Id);
    };
    document.getElementById("slider23").onchange = function () {
        theta[lowerLeg7Id] = event.srcElement.value;
        initNodes(lowerLeg7Id);
    };
    document.getElementById("slider24").onchange = function () {
        theta[lowerLeg8Id] = event.srcElement.value;
        initNodes(lowerLeg8Id);
    }



    for (i = 0; i < numNodes; i++) initNodes(i);

    render();
}


var render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT);
    traverse(headId);
    requestAnimFrame(render);
}

