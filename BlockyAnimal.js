var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main(){
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main(){
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
    //Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    //Get the rendering context for WebGL
    gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }    

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Get the storage location of a_Position variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the  storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //Get the storage location of u_Size
    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if(!u_Size){
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    }
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_size=5;
let g_selectedType=POINT;
let g_globalAngle=45;
let g_mainAngle=0;
let g_tailAngle=15;
let g_headAngle=0;
let g_bodyAngle=0;
let g_backAngle=0;
let g_tailAnimation=false;
let g_headAnimation=false;
let g_bodyAnimation=false;
//let g_segment=10;

//Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

    //Button Events (Shape Type)
    document.getElementById('animationTailOffButton').onclick = function() {g_tailAnimation=false;};
    document.getElementById('animationTailOnButton').onclick = function() {g_tailAnimation=true;};
    document.getElementById('animationHeadOffButton').onclick = function() {g_headAnimation=false;};
    document.getElementById('animationHeadOnButton').onclick = function() {g_headAnimation=true;};
    document.getElementById('animationBodyOffButton').onclick = function() {g_bodyAnimation=false;};
    document.getElementById('animationBodyOnButton').onclick = function() {g_bodyAnimation=true;};
    //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0];};
    //document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0];};
    //document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};

    //document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
    //document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
    //document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

    //Slider Events
    //document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById('headSlide').addEventListener('mousemove', function() {g_headAngle = this.value; renderScene();});
    document.getElementById('tailSlide').addEventListener('mousemove', function() {g_tailAngle = this.value; renderScene();});
    document.getElementById('mainSlide').addEventListener('mousemove', function() {g_mainAngle = this.value; renderScene();});
    document.getElementById('backSlide').addEventListener('mousemove', function() {g_backAngle = this.value; renderScene();});

    //Size Slider Events
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();});
    //document.getElementById('segSlide').addEventListener('mouseup', function() { g_segment = this.value;});


    //document.getElementById('pictureButton').onclick = function() {drawPicture();};
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1){click(ev);}};

    //Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    renderScene();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){

    g_seconds=performance.now()/1000.0-g_startTime;
    console.log(g_seconds);

    updateAnimationAngles();
    renderScene();

    requestAnimationFrame(tick);
}

function updateAnimationAngles(){
    if(g_tailAnimation){
        g_tailAngle = (35*Math.sin(g_seconds));
    }
    if(g_headAnimation){
        g_headAngle = (25*Math.sin(3*g_seconds));
    }
    if(g_bodyAnimation){
        g_bodyAngle = 50*g_seconds;
    }
}

function renderScene(){
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //test triangle
    //drawTriangle3D([-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

    //body cube
    var frontBody = new Cube();
    frontBody.color = [0.5,0.5,0.5,0.75];
    frontBody.matrix.translate(-.25, -.3, 0.0);
    frontBody.matrix.rotate(-g_mainAngle,1,0,0);
    frontBody.matrix.rotate(-g_bodyAngle,0,1,0);
    var mainBodyMatrix = new Matrix4(frontBody.matrix);
    frontBody.matrix.scale(0.3, .3, .2);
    frontBody.render();

    //back body
    var backBody = new Cube();
    backBody.color = [0.5,0.5,0.5,0.75];
    backBody.matrix = new Matrix4(mainBodyMatrix);
    backBody.matrix.translate(.02,.02,.14);
    backBody.matrix.rotate(-g_backAngle,1,0,0);
    backBody.matrix.scale(0.26, .26, .45);
    backBody.render();
    var backMatrix = backBody.matrix;

    //tail
    var tail = new Cube();
    tail.color = [0.5,0.5,0.5,0.75];
    tail.matrix = new Matrix4(backMatrix);
    tail.matrix.translate(.34,.7,0.8);
    tail.matrix.rotate(-g_tailAngle,1,0,0);
    tail.matrix.scale(.3,.3,.9);
    // box.matrix.translate(-.5,0,-.001);
    tail.render();

    //head
    var head = new Cube();
    head.color = [0.5, 0.5, 0.5, 0.75];
    head.matrix = new Matrix4(mainBodyMatrix);   
    head.matrix.translate(0.025,.03,-0.17);
    head.matrix.scale(0.25,0.25,0.17);
    head.matrix.rotate(-g_headAngle,0,0,1);
    head.render();
    var headMatrix = head.matrix;

    //mouth
    var mouth = new Cube();
    mouth.color = [0,0,0,1];
    mouth.matrix = new Matrix4(headMatrix);
    mouth.matrix.translate(0.2,0,-.7);
    mouth.matrix.scale(.6,.2,.7);
    mouth.render();

    //snout
    var snout = new Cube();
    snout.color = [0.5,0.5,0.5,.75];
    snout.matrix = new Matrix4(headMatrix);
    snout.matrix.translate(0.2,0.2,-.7);
    snout.matrix.scale(.6,.3,.7);
    snout.render();

    //nose
    var nose = new Cube();
    nose.color = [0,0,0,1];
    nose.matrix = new Matrix4(headMatrix);
    nose.matrix.translate(0.4,.301,-.71);
    nose.matrix.scale(.2,.2,.2);
    nose.render();

    //eyes
    var eye1 = new Cube();
    eye1.color =[0,0,0,1];
    eye1.matrix = new Matrix4(headMatrix);
    eye1.matrix.translate(0.1,0.5,-.01);
    eye1.matrix.scale(0.2,0.2,0.2);
    eye1.render();

    var eye2 = new Cube();
    eye2.color = eye1.color;
    eye2.matrix = eye1.matrix;
    eye2.matrix.translate(3,0,0);
    eye2.render();

    //ears
    var ear1 = new Cube();
    ear1.color = [.5,.5,.5,.8];
    ear1.matrix = new Matrix4(headMatrix);
    ear1.matrix.translate(0,1,.7);
    ear1.matrix.scale(.35,.35,.25);
    ear1.render();

    var ear2 = new Cube();
    ear2.color = ear1.color;
    ear2.matrix = ear1.matrix;
    ear2.matrix.translate(1.9,0,0);
    ear2.render();

    //legs
    var leg1 = new Cube();
    leg1.color = [.5,.5,.5,.75];
    leg1.matrix = new Matrix4(mainBodyMatrix);
    leg1.matrix.translate(.03,-.25,0);
    leg1.matrix.scale(.1,.27,.1);
    leg1.render();

    var leg2 = new Cube();
    leg2.color = leg1.color;
    leg2.matrix = leg1.matrix;
    leg2.matrix.translate(1.4,0,0);
    leg2.render();

    var leg3 = new Cube();
    leg3.color = leg1.color;
    leg3.matrix = backMatrix;
    leg3.matrix.translate(.6,-1.05,.4);
    leg3.matrix.scale(.34,1.5,.22);
    leg3.render();

    var leg4 = new Cube();
    leg4.color = leg1.color;
    leg4.matrix = leg3.matrix;
    leg4.matrix.translate(-1.4,0,0);
    leg4.render();

    // var K=200.0;
    // for(var i=1; i<K; i++){
    //     var c = new Cube();
    //     c.matrix.translate(-.8,1.9*i/K-1.0,0);
    //     c.matrix.rotate(g_seconds*100,1,1,1);
    //     c.matrix.scale(.1,0.5/K,1.0/K);
    //     c.render();
    // }

    var duration = performance.now() - startTime;
    sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}