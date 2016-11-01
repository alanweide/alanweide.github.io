var gl;
var shaderProgram;
var draw_type = 2;
var which_object = 1;

// ////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

// /////////////////////////////////////////////////////////////

var circlePoints = 24;
var robColor = [];

// /////////////////////////////////////////////////////////

var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var circleVertexPositionBuffer;
var circleVertexColorBuffer;
var lineVertexPositionBuffer;
var lineVertexColorBuffer;

// ////////////// Initialize VBO ////////////////////////

function initBuffers() {

	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);

	var vertices = [ 0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5,
			0.0 ];

	var l_vertices = [ 0.0, 0.0, 0.0, 0.7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7,
			0.0 ];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;

	circleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);

	var circleVertices = [];
	for (var i = 0; i <= circlePoints; i++) {
		var angle = i * degToRad(360 / circlePoints);
		circleVertices.push(Math.cos(angle) / 2);
		circleVertices.push(Math.sin(angle) / 2);
		circleVertices.push(0.0);
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices),
			gl.STATIC_DRAW);
	circleVertexPositionBuffer.itemSize = 3;
	circleVertexPositionBuffer.numItems = circlePoints;// + 2;

	lineVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
	gl
			.bufferData(gl.ARRAY_BUFFER, new Float32Array(l_vertices),
					gl.STATIC_DRAW);
	lineVertexPositionBuffer.itemSize = 3;
	lineVertexPositionBuffer.numItems = 4;

	squareVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	var colors = [];
	for (var i = 0; i < squareVertexPositionBuffer.numItems; i++) {
		colors.push(robColor[0], robColor[1], robColor[2], robColor[3]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	squareVertexColorBuffer.itemSize = 4;
	squareVertexColorBuffer.numItems = 4;

	circleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
	var circleColors = [];
	for (var i = 0; i < circlePoints; i++) {
		circleColors.push(robColor[0], robColor[1], robColor[2], robColor[3]);
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleColors),
			gl.STATIC_DRAW);
	circleVertexColorBuffer.itemSize = 4;
	circleVertexColorBuffer.numItems = circlePoints;// + 2;
}

// /////////////////////////////////////////////////////////////

var mvMatrices = [];
var numObj = 7;

var Xtranslate = 0.0, Ytranslate = 0.0;

function setMatrixUniforms(matrix) {
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, matrix);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

// /////////////////////////////////////////////////////

var mvMatrixStack = [];

function PushMatrix(matrix) {
	var copy = mat4.create();
	mat4.set(matrix, copy);
	mvMatrixStack.push(copy);
}

function PopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	var copy = mvMatrixStack.pop();
	return copy;
}

function draw_square(matrix) {
	setMatrixUniforms(matrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, squareVertexPositionBuffer.numItems);
}

function draw_color_square(matrix, color) {
	setMatrixUniforms(matrix);

	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var colors = [];
	for (var i = 0; i < squareVertexPositionBuffer.numItems; i++) {
		colors.push(color[0], color[1], color[2], color[3]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	colorBuffer.itemSize = 4;
	colorBuffer.numItems = 4;

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, squareVertexPositionBuffer.numItems);
}

function draw_circle(matrix) {
	setMatrixUniforms(matrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			circleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			circleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertexPositionBuffer.numItems);
}

function draw_extras(matrix) {
	matrix = mat4.translate(matrix, [ 0, -2.25, 0 ]);
	matrix = mat4.scale(matrix, [ 5, 1, 1 ]);
	draw_color_square(matrix, [ 0.4, 0.0, 0.0, 1.0 ]);
	matrix = mat4.scale(matrix, [ 0.2, 1, 1 ]);
	matrix = mat4.translate(matrix, [ 0, 4.5, 0 ]);
	matrix = mat4.scale(matrix, [ 5, 1, 1 ]);
	draw_color_square(matrix, [ 0.4, 0.0, 0.0, 1.0 ]);
	matrix = mat4.scale(matrix, [ 0.2, 1, 1 ]);
	matrix = mat4.translate(matrix, [ 0, -2.25, 0 ]);
	return matrix;
}

function draw_body(matrix) {
	matrix = mat4.scale(matrix, [ 1.0, 1.5, 1.0 ]);
	// Draw the body
	draw_square(matrix);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 1.0, 2 / 3, 1.0 ]);
	matrix = mat4.scale(matrix, [ 0.6, 0.6, 0.6 ]);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	// Draw the head
	draw_circle(matrix);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 5 / 3, 5 / 3, 5 / 3 ]);
	matrix = mat4.scale(matrix, [ 1.0, 1.5, 1.0 ]);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 1.0, 2 / 3, 1.0 ]);
}

function draw_leg(matrix) {
	matrix = mat4.scale(matrix, [ 0.25, 1.0, 1.0 ]);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	draw_square(matrix);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 4.0, 1.0, 1.0 ]);
}

function draw_arm(matrix) {
	matrix = mat4.scale(matrix, [ 0.25, 1.0, 1.0 ]);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	draw_square(matrix);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 4.0, 1.0, 1.0 ]);
}

function draw_hand(matrix) {
	matrix = mat4.scale(matrix, [ 0.25, 0.25, 0.25 ]);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	draw_circle(matrix);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 4.0, 4.0, 4.0 ]);
}

// /////////////////////////////////////////////////////////////////////

function drawScene() {

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var Mstack = new Array();
	var model = mat4.create();
	mat4.identity(model);
	model = mat4.scale(model, [ 0.4, 0.4, 0.4 ]); // make the whole thing
	// smaller

	// ////////////////// the floor and ceiling

	model = draw_extras(model);

	// ////////////////// the body (incl. head)

	model = mat4.multiply(model, mvMatrices[BODY]);

	draw_body(model);

	PushMatrix(model);

	// /////////////////// the legs

	model = mat4.translate(model, [ 0, -0.75, 0 ]);
	PushMatrix(model);
	model = mat4.translate(model, [ -0.3, 0, 0 ]);
	model = mat4.multiply(model, mvMatrices[L_LEG]);
	draw_leg(model);

	model = PopMatrix();
	model = mat4.translate(model, [ 0.3, 0, 0 ]);
	model = mat4.multiply(model, mvMatrices[R_LEG]);
	draw_leg(model);

	// /////////////////// the left arm and hand
	model = PopMatrix();
	PushMatrix(model);

	model = mat4.translate(model, [ -0.5, 0.5, 0 ]);
	model = mat4.multiply(model, mvMatrices[L_ARM]);
	model = mat4.rotate(model, degToRad(135), [ 0, 0, 1 ])
	draw_arm(model);

	model = mat4.translate(model, [ 0, 1.0, 0 ]);
	model = mat4.multiply(model, mvMatrices[L_HAND]);
	draw_hand(model);

	// /////////////////// the right arm and hand
	model = PopMatrix();

	model = mat4.translate(model, [ 0.5, 0.5, 0 ]);
	model = mat4.multiply(model, mvMatrices[R_ARM]);
	model = mat4.rotate(model, degToRad(-135), [ 0, 0, 1 ])
	draw_arm(model);

	model = mat4.translate(model, [ 0, 1.0, 0 ]);
	model = mat4.multiply(model, mvMatrices[R_HAND]);
	draw_hand(model);

}

// /////////////////////////////////////////////////////////////

var lastMouseX = 0, lastMouseY = 0;
var BODY = 0, L_ARM = 1, L_HAND = 2, R_ARM = 3, R_HAND = 4, L_LEG = 5, R_LEG = 6;

// /////////////////////////////////////////////////////////////

function onDocumentMouseDown(event) {
	event.preventDefault();
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener('mouseout', onDocumentMouseOut, false);
	var mouseX = event.clientX;
	var mouseY = event.clientY;

	lastMouseX = mouseX;
	lastMouseY = mouseY;

}

function onDocumentMouseMove(event) {
	var mouseX = event.clientX;
	var mouseY = event.clientY;

	var diffX = mouseX - lastMouseX;
	var diffY = mouseY - lastMouseY;

	// console.log("rotate" + degToRad(diffX / 5.0));
	mvMatrices[which_object] = mat4.rotate(mvMatrices[which_object],
			degToRad(diffX / 5.0), [ 0, 0, 1 ]);

	lastMouseX = mouseX;
	lastMouseY = mouseY;

	drawScene();
}

function onDocumentMouseUp(event) {
	document.removeEventListener('mousemove', onDocumentMouseMove, false);
	document.removeEventListener('mouseup', onDocumentMouseUp, false);
	document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut(event) {
	document.removeEventListener('mousemove', onDocumentMouseMove, false);
	document.removeEventListener('mouseup', onDocumentMouseUp, false);
	document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onKeyDown(event) {

	var dist = 0.06;
	if (event.shiftKey) {
		dist /= 3;
	}
	
//	console.log(event.keyCode);
	switch (event.keyCode) {
	case 82:
		// console.log('enter r');
		mvMatrices[0] = mat4.translate(mvMatrices[0], [ dist, 0, 0 ]);
		break;
	case 76:
		// console.log('enter l');
		mvMatrices[0] = mat4.translate(mvMatrices[0], [ -dist, 0, 0 ]);
		break;
	case 70:
		// console.log('enter f');
		mvMatrices[0] = mat4.translate(mvMatrices[0], [ 0.0, dist, 0 ]);
		break;
	case 66:
		// console.log('enter b');
		mvMatrices[0] = mat4.translate(mvMatrices[0], [ 0.0, -dist, 0 ]);
		break;
	case 67:
		robColor = [Math.random(), Math.random(), Math.random(), 1.0];
		initBuffers();
	}
	drawScene();
}
// /////////////////////////////////////////////////////////////

function webGLStart() {
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders();

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
	shaderProgram.whatever = 4;
	shaderProgram.whatever2 = 3;
	
	robColor = [0.75, 0.75, 0.75, 1.0];

	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('keydown', onKeyDown, false);

	for (var i = 0; i < numObj; i++) {
		mvMatrices[i] = mat4.create();
		mat4.identity(mvMatrices[i]);
	}

	// mvMatrix1 = mat4.create();
	// mat4.identity(mvMatrix1);
	//
	// mvMatrix2 = mat4.create();
	// mat4.identity(mvMatrix2);
	//
	// mvMatrix3 = mat4.create();
	// mat4.identity(mvMatrix3);
	//
	// mvMatrix4 = mat4.create();
	// mat4.identity(mvMatrix4);
	//
	// mvMatrix5 = mat4.create();
	// mat4.identity(mvMatrix5);

	obj(BODY);

	drawScene();
}

function BG(red, green, blue) {

	gl.clearColor(red, green, blue, 1.0);
	drawScene();

}

function redraw() {

	// mat4.identity(mvMatrix1);
	// mat4.identity(mvMatrix2);
	// mat4.identity(mvMatrix3);
	// mat4.identity(mvMatrix4);
	// mat4.identity(mvMatrix5);

	for (var i = 0; i < numObj; i++) {
		mat4.identity(mvMatrices[i]);
	}

	robColor = [0.75, 0.75, 0.75, 1.0];
	initBuffers();
	
	drawScene();
}

function obj(object_id) {

	which_object = object_id;
	drawScene();

}
