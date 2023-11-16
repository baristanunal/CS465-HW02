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

// shader variables

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

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

var headHeight = 8.0;
var headWidth = 5.0;

var upperLegWidth = 0.65;
var upperLegHeight = 5.0;

var middleLegWidth = 0.55;
var middleLegHeight = 3.0;

var lowerLegWidth = 0.40;
var lowerLegHeight = 2.0;

var numNodes = 25;
var numAngles = 24;
var angle = 0;

var animationDuration = 1; // in seconds


var headPosition = [0, 0, 0]

//theta is the angle of rotation for each node 
var theta = [0, 180, 180, 180, 180, 180, 180, 180, 180, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

var savedThetas = [];

var animationState = {
    frameCounter: 0,
    framesPerSecond: 60,
    frameDuration: 1000 / 60,
    keyFrameAmount: 0,
    framesPerKeyFrame: 0,
    angleDifferences: [],
};

var savedAnimations = [];
var framesPerSecondFromHTML = 60;

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

            m = translate(headPosition[0], headPosition[1], headPosition[2]);
            m = mult(m, rotate(theta[headId], 0, 1, 0));
            figure[headId] = createNode(m, head, null, upperLeg1Id);
            break;

        case upperLeg1Id:
            m = translate(2 * headWidth / 5, upperLegHeight * 0.1, 2);
            m = mult(m, rotate(theta[upperLeg1Id], 1, 0, 0));
            figure[upperLeg1Id] = createNode(m, upperLeg, upperLeg2Id, middleLeg1Id);
            break;

        case upperLeg2Id:
            m = translate(2 * headWidth / 5, upperLegHeight * 0.1, 0);
            m = mult(m, rotate(theta[upperLeg2Id], 1, 0, 0));
            figure[upperLeg2Id] = createNode(m, upperLeg, upperLeg3Id, middleLeg2Id);
            break;

        case upperLeg3Id:
            m = translate(2 * headWidth / 5, upperLegHeight * 0.1, -2);
            m = mult(m, rotate(theta[upperLeg3Id], 1, 0, 0));
            figure[upperLeg3Id] = createNode(m, upperLeg, upperLeg4Id, middleLeg3Id);
            break;

        case upperLeg4Id:
            m = translate(0, upperLegHeight * 0.1, -2);
            m = mult(m, rotate(theta[upperLeg4Id], 1, 0, 0));
            figure[upperLeg4Id] = createNode(m, upperLeg, upperLeg5Id, middleLeg4Id);
            break;

        case upperLeg5Id:
            m = translate(-2 * headWidth / 5, upperLegHeight * 0.1, -2);
            m = mult(m, rotate(theta[upperLeg5Id], 1, 0, 0));
            figure[upperLeg5Id] = createNode(m, upperLeg, upperLeg6Id, middleLeg5Id);
            break;

        case upperLeg6Id:
            m = translate(-2 * headWidth / 5, upperLegHeight * 0.1, 0);
            m = mult(m, rotate(theta[upperLeg6Id], 1, 0, 0));
            figure[upperLeg6Id] = createNode(m, upperLeg, upperLeg7Id, middleLeg6Id);
            break;

        case upperLeg7Id:
            m = translate(-2 * headWidth / 5, upperLegHeight * 0.1, 2);
            m = mult(m, rotate(theta[upperLeg7Id], 1, 0, 0));
            figure[upperLeg7Id] = createNode(m, upperLeg, upperLeg8Id, middleLeg7Id);
            break;

        case upperLeg8Id:
            m = translate(0, upperLegHeight * 0.1, 2);
            m = mult(m, rotate(theta[upperLeg8Id], 1, 0, 0));
            figure[upperLeg8Id] = createNode(m, upperLeg, null, middleLeg8Id);
            break;

        case middleLeg1Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg1Id], 1, 0, 0));
            figure[middleLeg1Id] = createNode(m, middleLeg, null, lowerLeg1Id);
            break;

        case middleLeg2Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg2Id], 1, 0, 0));
            figure[middleLeg2Id] = createNode(m, middleLeg, null, lowerLeg2Id);
            break;

        case middleLeg3Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg3Id], 1, 0, 0));
            figure[middleLeg3Id] = createNode(m, middleLeg, null, lowerLeg3Id);
            break;

        case middleLeg4Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg4Id], 1, 0, 0));
            figure[middleLeg4Id] = createNode(m, middleLeg, null, lowerLeg4Id);
            break;

        case middleLeg5Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg5Id], 1, 0, 0));
            figure[middleLeg5Id] = createNode(m, middleLeg, null, lowerLeg5Id);
            break;

        case middleLeg6Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg6Id], 1, 0, 0));
            figure[middleLeg6Id] = createNode(m, middleLeg, null, lowerLeg6Id);
            break;

        case middleLeg7Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg7Id], 1, 0, 0));
            figure[middleLeg7Id] = createNode(m, middleLeg, null, lowerLeg7Id);
            break;

        case middleLeg8Id:
            m = translate(0, upperLegHeight, 0);
            m = mult(m, rotate(theta[middleLeg8Id], 1, 0, 0));
            figure[middleLeg8Id] = createNode(m, middleLeg, null, lowerLeg8Id);
            break;


        case lowerLeg1Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg1Id], 1, 0, 0));
            figure[lowerLeg1Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg2Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg2Id], 1, 0, 0));
            figure[lowerLeg2Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg3Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg3Id], 1, 0, 0));
            figure[lowerLeg3Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg4Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg4Id], 1, 0, 0));
            figure[lowerLeg4Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg5Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg5Id], 1, 0, 0));
            figure[lowerLeg5Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg6Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg6Id], 1, 0, 0));
            figure[lowerLeg6Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg7Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg7Id], 1, 0, 0));
            figure[lowerLeg7Id] = createNode(m, lowerLeg, null, null);
            break;

        case lowerLeg8Id:
            m = translate(0, middleLegHeight, 0);
            m = mult(m, rotate(theta[lowerLeg8Id], 1, 0, 0));
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

function saveTheta() { // saves the theta array to savedThetas array
    savedThetas.push(theta.slice());
    console.log("savedThetas", savedThetas);
}

function loadTheta() { // loads the last saved theta array from savedThetas array
    if (savedThetas.length > 0) {
        theta = savedThetas.pop();
        console.log("theta", theta);
        console.log("savedThetas after pop: ", savedThetas);

        // Update the figure with the loaded angles
        for (var i = 0; i < numNodes; i++) {
            initNodes(i);
        }
    }
}

var isPaused = false;

//this function will use the savedthetas array to animate the octopus while also using the animation duration
function startAnimation() {
    isPaused = false;

    console.log("startAnimation triggered in octopus.js");

    // deep copy savedThetas array for later use
    var savedThetasCopy = JSON.parse(JSON.stringify(savedThetas));
    console.log("savedThetasCopy", savedThetasCopy);

    //animation will have 60 frames per second
    var frameCounter = 0;
    var framesPerSecond = framesPerSecondFromHTML;
    var frameDuration = 1000 / framesPerSecond; // in milliseconds
    var keyFrameAmount = savedThetas.length;
    var framesPerKeyFrame = animationDuration * framesPerSecond / (keyFrameAmount - 1);


    //set the state of the animation    
    animationState.framesPerSecond = framesPerSecond;
    animationState.frameDuration = frameDuration;
    animationState.keyFrameAmount = keyFrameAmount;
    animationState.framesPerKeyFrame = framesPerKeyFrame;


    //compute the angle differences between each keyframe
    var angleDifferences = [];
    for (var i = 0; i < keyFrameAmount - 1; i++) {
        angleDifferences.push([]);
        for (var j = 0; j < numNodes; j++) {
            angleDifferences[i].push(savedThetas[i + 1][j] - savedThetas[i][j]);
        }
    }

    console.log("angleDifferences", angleDifferences);
    console.log("theta here: ", theta);
    animationState.angleDifferences = angleDifferences.slice();

    //set theta to the first keyframe
    theta = JSON.parse(JSON.stringify(savedThetas[0]));
    console.log("theta here2: ", theta);

    //call requestAnimationFrame() to animate the octopus every frameDuration milliseconds
    var animation = setInterval(function () {

        if (isPaused) {
            savedThetas = JSON.parse(JSON.stringify(savedThetasCopy));
            return;
        }

        console.log("frameCounter", frameCounter);

        //stop the animation if savedThetas array is empty
        if (savedThetas.length == 0) {
            clearInterval(animation);
            alert("No saved keyframes!");

            // clear the variables            
            theta = [];
            angleDifferences = [];
            frameCounter = 0;

            //set savedTheta to the copy of the original savedThetas array
            savedThetas = JSON.parse(JSON.stringify(savedThetasCopy));

            return;
        }

        var index = Math.floor(frameCounter / framesPerKeyFrame);    //determine the current theta array

        //shallow copy the inside of the array
        theta = savedThetas[index];

        // update the theta array with the new angles
        for (var j = 0; j < numAngles; j++) {
            theta[j] += angleDifferences[index][j] / ((animationDuration / (keyFrameAmount - 1)) * framesPerSecond);
        }

        frameCounter++;

        // update the figure with the new angles
        for (var j = 0; j < numNodes; j++) {
            initNodes(j);
        }

        // stop the animation when the last keyframe is reached
        if (frameCounter >= (keyFrameAmount - 1) * framesPerKeyFrame) {

            // clear the variables            
            theta = [];
            angleDifferences = [];
            frameCounter = 0;

            //set savedTheta to the copy of the original savedThetas array
            savedThetas = JSON.parse(JSON.stringify(savedThetasCopy));

            clearInterval(animation);
        }


    }, frameDuration);

    //set savedTheta to the copy of the original savedThetas array
    savedThetas = JSON.parse(JSON.stringify(savedThetasCopy));

    // Function to pause the animation
    function pauseAnimation() {
        //frameCounter = 0;
        isPaused = true;
        clearInterval(animation);
    }

    // Function to resume the animation
    function resumeAnimation() {
        isPaused = false;
        // Restart the animation interval
        animation = setInterval(/* your animation logic */);
    }

    // Function to toggle between pause and resume
    function togglePauseResume() {
        if (isPaused) {
            resumeAnimation();
        } else {
            pauseAnimation();
        }
    }

}


function saveThetasToFile() {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(savedThetas)], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = 'savedThetas.txt';
    a.click();
}

//this function opens the file selector and loads the savedThetas array from the selected file
function loadThetasFromFile() {

    var fileSelector = document.createElement('input');
    fileSelector.type = 'file';
    fileSelector.accept = 'text/plain';
    fileSelector.click();

    fileSelector.onchange = function () {
        var file = fileSelector.files[0];
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (evt) {
            var fileContents = evt.target.result;
            savedThetas = JSON.parse(fileContents);
            console.log("savedThetas", savedThetas);
        }
    }

}

function updateRate(value) {
    framesPerSecond = value;
    console.log(framesPerSecond + " frames per second");
}

function addAnimation() {
    // Ask for animation name
    var animationName = prompt("Please enter the name of the animation", "Animation Name");

    // Construct the animation object
    var animation = {
        name: animationName,
        thetas: savedThetas.slice()
    };

    // Add the animation to the savedAnimations array
    savedAnimations.push(animation);

    console.log("savedAnimations", savedAnimations);

    // Trigger the event to notify of the array change
    triggerArrayChange();
}

function triggerArrayChange() {
    console.log("triggerArrayChange triggered in octopus.js");
    var event = new Event('savedAnimationsChanged');
    document.dispatchEvent(event);
}


function getSavedAnimations() {
    return savedAnimations;
}

function updateSelectedSavedAnimation(id) {
    // Update the theta array with the selected animation
    console.log("updateSelectedSavedAnimation triggered in octopus.js");
    //iterate Through savedAnimations array and find the selected animation, assign it to savedThetas
    for (var i = 0; i < savedAnimations.length; i++) {
        if (savedAnimations[i].name == id) {
            savedThetas = savedAnimations[i].thetas;
        }
    }
}

function generateRandomAnimation() {

    //generate random savedThetas, between 2-10 arrays. Every theta value between -180 to 180
    savedThetas = [];
    var keyFrameAmount = Math.floor(Math.random() * 9) + 2;
    for (var i = 0; i < keyFrameAmount; i++) {
        savedThetas.push([]);
        for (var j = 0; j < numNodes; j++) {
            savedThetas[i].push(Math.floor(Math.random() * 361) - 180);
        }
    }
    console.log("savedThetas", savedThetas);
}



// Function to pause the animation
function pauseAnimation() {
    isPaused = true;
}

// Function to resume the animation
function resumeAnimation() {
    isPaused = true;
}




window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    viewerPos = vec3(0.0, 0.0, -20.0 );

    instanceMatrix = mat4();

    projectionMatrix = ortho(-15.0, 15.0, -15.0, 15.0, -15.0, 15.0);
    modelViewMatrix = mat4();

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);

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

    { // sliders & buttons

        document.getElementById("hz-selector").onclick = function () {
            framesPerSecondFromHTML = parseInt(event.srcElement.value);
            console.log("framesPerSecondFromHTML", framesPerSecondFromHTML);
        };

        document.getElementById("animation-duration").onchange = function () {
            animationDuration = parseInt(event.srcElement.value);
        };


        document.getElementById("add-keyframe-button").onclick = function () {
            alert("Added Keyframe!");
            saveTheta();
        };

        document.getElementById("delete-keyframe-button").onclick = function () {
            alert("Deleted Keyframe!");
            savedThetas.pop();
            console.log("savedThetas after pop: ", savedThetas);
        };

        document.getElementById("start-animation-button").onclick = function () {
            alert("Started Animation!");
            startAnimation();
        };

        document.getElementById("pause-animation-button").onclick = function () {
            pauseAnimation();
        };

        document.getElementById("save-animation-button").onclick = function () {
            saveThetasToFile();
        };

        document.getElementById("load-animation-button").onclick = function () {
            loadThetasFromFile();
        };

        document.getElementById("save-button").onclick = function () {
            alert("Saved Theta Array to program!");
            addAnimation();
        };

        document.getElementById("random-animation-button").onclick = function () {
            generateRandomAnimation();
        };



        document.getElementById("reset-button").onclick = function () {
            savedThetas = [];
        }

        document.getElementById("slider0").onchange = function () {
            theta[headId] = parseInt(event.srcElement.value);
            initNodes(headId);
        };
        document.getElementById("slider1").onchange = function () {
            theta[upperLeg1Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg1Id);
        };
        document.getElementById("slider2").onchange = function () {
            theta[upperLeg2Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg2Id);
        };
        document.getElementById("slider3").onchange = function () {
            theta[upperLeg3Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg3Id);
        };
        document.getElementById("slider4").onchange = function () {
            theta[upperLeg4Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg4Id);
        };
        document.getElementById("slider5").onchange = function () {
            theta[upperLeg5Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg5Id);
        };
        document.getElementById("slider6").onchange = function () {
            theta[upperLeg6Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg6Id);
        };
        document.getElementById("slider7").onchange = function () {
            theta[upperLeg7Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg7Id);
        };
        document.getElementById("slider8").onchange = function () {
            theta[upperLeg8Id] = parseInt(event.srcElement.value);
            initNodes(upperLeg8Id);
        };
        document.getElementById("slider9").onchange = function () {
            theta[middleLeg1Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg1Id);
        };
        document.getElementById("slider10").onchange = function () {
            theta[middleLeg2Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg2Id);
        };
        document.getElementById("slider11").onchange = function () {
            theta[middleLeg3Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg3Id);
        };
        document.getElementById("slider12").onchange = function () {
            theta[middleLeg4Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg4Id);
        };
        document.getElementById("slider13").onchange = function () {
            theta[middleLeg5Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg5Id);
        };
        document.getElementById("slider14").onchange = function () {
            theta[middleLeg6Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg6Id);
        };
        document.getElementById("slider15").onchange = function () {
            theta[middleLeg7Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg7Id);
        };
        document.getElementById("slider16").onchange = function () {
            theta[middleLeg8Id] = parseInt(event.srcElement.value);
            initNodes(middleLeg8Id);
        };
        document.getElementById("slider17").onchange = function () {
            theta[lowerLeg1Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg1Id);
        };
        document.getElementById("slider18").onchange = function () {
            theta[lowerLeg2Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg2Id);
        };
        document.getElementById("slider19").onchange = function () {
            theta[lowerLeg3Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg3Id);
        };
        document.getElementById("slider20").onchange = function () {
            theta[lowerLeg4Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg4Id);
        };
        document.getElementById("slider21").onchange = function () {
            theta[lowerLeg5Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg5Id);
        };
        document.getElementById("slider22").onchange = function () {
            theta[lowerLeg6Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg6Id);
        };
        document.getElementById("slider23").onchange = function () {
            theta[lowerLeg7Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg7Id);
        };
        document.getElementById("slider24").onchange = function () {
            theta[lowerLeg8Id] = parseInt(event.srcElement.value);
            initNodes(lowerLeg8Id);
        }
        document.getElementById("slider25").onchange = function () {
            headPosition[0] = parseInt(event.srcElement.value);
            initNodes(headId);
        }
        document.getElementById("slider26").onchange = function () {   
            headPosition[1] = parseInt(event.srcElement.value);
            initNodes(headId);
        }
    }

    for (i = 0; i < numNodes; i++) {
        initNodes(i);
    }
    
    render();
}


var render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT);
    traverse(headId);
    requestAnimFrame(render);
}

