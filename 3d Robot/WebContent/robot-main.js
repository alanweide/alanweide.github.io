var gl;
var shaderProgram;
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

var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;
var cubeVertexColorBuffer;
var cylinderVertexPositionBuffer;
var cylinderVertexIndexBuffer;
var cylinderVertexColorBuffer;
var sphereVertexPositionBuffer;
var sphereVertexIndexBuffer;
var sphereVertexColorBuffer;

// ////////////// Initialize VBO ////////////////////////

function initBuffers() {

	// -------- Begin Cube --------

	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

	var vertices = [ 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5,
			-0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
			-0.5, 0.5 ];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 8;

	var indices = [ 0, 1, 2, 0, 2, 3, 0, 3, 7, 0, 7, 4, 6, 2, 3, 6, 3, 7, 5, 1,
			2, 5, 2, 6, 5, 1, 0, 5, 0, 4, 5, 6, 7, 5, 7, 4 ];
	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
			gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;

	// -------- End Cube --------
	
	// -------- Begin Cylinder --------

	cylinderVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);

	var cylinderVertices = [];
	for (var i = 0; i < circlePoints; i++) {
		var angle = i * degToRad(360 / circlePoints);
		cylinderVertices.push(Math.cos(angle) / 2);
		cylinderVertices.push(0.5);
		cylinderVertices.push(Math.sin(angle) / 2);
	}
	for (var i = 0; i < circlePoints; i++) {
		var angle = i * degToRad(360 / circlePoints);
		cylinderVertices.push(Math.cos(angle) / 2);
		cylinderVertices.push(-0.5);
		cylinderVertices.push(Math.sin(angle) / 2);
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderVertices),
			gl.STATIC_DRAW);
	cylinderVertexPositionBuffer.itemSize = 3;
	cylinderVertexPositionBuffer.numItems = 2 * circlePoints;// + 2;

	cylinderVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);

	var cylIdxs = [];
	for (var i = 1; i + 1 < circlePoints; i++) {
		cylIdxs.push(0, i, i + 1);
		cylIdxs.push(circlePoints, circlePoints + i, circlePoints + i + 1);
	}

	var cp = circlePoints;
	for (var i = 0; i < circlePoints; i++) {
		cylIdxs.push(i, (i + 1) % cp, i + cp);
		cylIdxs.push((i + 1) % cp, (i + 1) % cp + cp, i + cp);
	}

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylIdxs),
			gl.STATIC_DRAW);
	cylinderVertexIndexBuffer.itemSize = 1;
	cylinderVertexIndexBuffer.numItems = 6 * (circlePoints - 2 + circlePoints);

	// -------- End Cylinder --------
	
	// -------- Begin Sphere --------

	sphereVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);

	var sphereVertices = [];

	for (var i = 0; i <= circlePoints / 2; i++) {
		var zenith = (i - (circlePoints / 4)) * degToRad(90 / (circlePoints / 4));
		for (var j = 0; j < circlePoints; j++) {
			var angle = j * degToRad(360 / circlePoints);
			var r = Math.cos(zenith);
			sphereVertices.push(0.5 * r * Math.cos(angle));
			sphereVertices.push(0.5 * Math.sin(zenith));
			sphereVertices.push(0.5 * r * Math.sin(angle));
		}
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices),
			gl.STATIC_DRAW);
	sphereVertexPositionBuffer.itemSize = 3;
	sphereVertexPositionBuffer.numItems = ((circlePoints / 2) + 1) * circlePoints;

	sphereVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);

	var sphereIdx = [];
	for (var i = 0; i < circlePoints / 2; i++) {
		for (var j = 0; j < circlePoints; j++) {
			var lIdx = j + i * circlePoints;
			sphereIdx.push(lIdx, (i * cp) + (lIdx + 1) % cp, lIdx + cp);
			sphereIdx.push((i * cp) + (lIdx + 1) % cp, (i * cp) + (lIdx + 1) % cp + cp, lIdx + cp);
		}
	}
	
	console.log(sphereIdx);

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIdx),
			gl.STATIC_DRAW);
	sphereVertexIndexBuffer.itemSize = 1;
	sphereVertexIndexBuffer.numItems = circlePoints * circlePoints * 3;

	// -------- End Sphere --------
	
	// -------- Begin Cube Color --------

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	var colors = [ 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
			1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0,
			0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, ];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = cubeVertexPositionBuffer.numItems;

	// -------- End Cube Color --------
	// -------- Begin Cylinder Color --------

	cylinderVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
	var cylinderColors = [];
	for (var i = 0; i < circlePoints; i++) {
		// cylinderColors.push(robColor[0], robColor[1], robColor[2],
		// robColor[3]);
		var iStep = circlePoints / 3;
		cylinderColors.push(((i + iStep) % circlePoints) / circlePoints);
		cylinderColors.push(i / circlePoints);
		cylinderColors.push(((i + 2 * iStep) % circlePoints) / circlePoints);
		cylinderColors.push(1.0);
	}

	for (var i = circlePoints; i > 0; i--) {
		var iStep = circlePoints / 3;
		cylinderColors.push(i / circlePoints, ((i + 2 * iStep) % circlePoints)
				/ circlePoints, ((i + iStep) % circlePoints) / circlePoints,
				1.0);
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderColors),
			gl.STATIC_DRAW);
	cylinderVertexColorBuffer.itemSize = 4;
	cylinderVertexColorBuffer.numItems = cylinderVertexPositionBuffer.numItems;// + 2;

	// -------- End Cylinder Color --------
	
	// -------- Begin Sphere Color --------

	sphereVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
	
	var sphereColors = [];
	
	for (var i = 0; i <= circlePoints / 2; i++) {
		var layerColor = Math.min(0.8, Math.max(0.2, i / (circlePoints / 2)));
		for (var j = 0; j < circlePoints; j++) {
//			sphereColors.push(layerColor, layerColor, layerColor, 1);
			sphereColors.push(Math.random(), Math.random(), Math.random(), 1);
		}
	}
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereColors), gl.STATIC_DRAW);
	sphereVertexColorBuffer.itemSize = 4;
	sphereVertexColorBuffer.numItems = sphereVertexPositionBuffer.numItems;
	
	// -------- End Sphere Color --------
}

// /////////////////////////////////////////////////////////////

var mvMatrices = [];
var sceneMatrix = mat4.create(); // scene rotation matrix

var camLoc = [0, 0.6, 2]; // camera location
var lookLoc = [ 0, 0, 0 ]; // camera lookAt center
var upVector = [ 0, 1, 0 ]; // camera up vector

var mMatrix = mat4.create(); // model matrix
var vMatrix = mat4.create(); // view matrix
var pMatrix = mat4.create(); // projection matrix
var numObj = 7;

var Xtranslate = 0.0, Ytranslate = 0.0;

function setMatrixUniforms(matrix) {
	gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
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

function draw_cube(matrix) {
	// setMatrixUniforms(matrix);
	//
	// gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	// gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
	// cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//
	// gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	// gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
	// cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	//
	// gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
	// gl.UNSIGNED_SHORT, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// draw elementary arrays - triangle indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	setMatrixUniforms(); // pass the modelview mattrix and projection matrix
	// to the shader

	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
			gl.UNSIGNED_SHORT, 0);

}

function draw_color_cube(matrix, color) {

	setMatrixUniforms(matrix);

	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var colors = [];
	for (var i = 0; i < cubeVertexPositionBuffer.numItems; i++) {
		colors.push(color[0], color[1], color[2], color[3]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	colorBuffer.itemSize = 4;
	colorBuffer.numItems = cubeVertexPositionBuffer.numItems;

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
			gl.UNSIGNED_SHORT, 0);
}

function draw_cylinder(matrix) {

	gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			cylinderVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// draw elementary arrays - triangle indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);

	setMatrixUniforms(); // pass the modelview mattrix and projection matrix
	// to the shader

	gl.drawElements(gl.TRIANGLES, cylinderVertexIndexBuffer.numItems,
			gl.UNSIGNED_SHORT, 0);

}

function draw_sphere(matrix) {

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			sphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
	setMatrixUniforms();
	
//    gl.drawArrays(gl.LINE_LOOP, 0, sphereVertexPositionBuffer.numItems);

    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems,
			gl.UNSIGNED_SHORT, 0);
}

function draw_extras(matrix) {
	PushMatrix(matrix);
	matrix = mat4.translate(matrix, [ 0, -2, -1.2 ]);
	matrix = mat4.scale(matrix, [ 5, 0.5, 5 ]);
	// draw_color_cube(matrix, [ 0.4, 0.0, 0.0, 1.0 ]);
	draw_cube(matrix);
	return PopMatrix();
}

function draw_body(matrix) {
	matrix = mat4.scale(matrix, [ 1.0, 1.5, 0.5 ]);
	// Draw the body
	draw_cube(matrix);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 1.0, 2 / 3, 2.0 ]);
	matrix = mat4.scale(matrix, [ 0.6, 0.6, 0.6 ]);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	// Draw the head
//	draw_cylinder(matrix);
	draw_sphere(matrix);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 5 / 3, 5 / 3, 5 / 3 ]);
	matrix = mat4.scale(matrix, [ 1.0, 1.5, 1.0 ]);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 1.0, 2 / 3, 1.0 ]);
}

function draw_leg(matrix) {
	matrix = mat4.scale(matrix, [ 1/3, 1.0, 1/3 ]);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	draw_cylinder(matrix);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 3.0, 1.0, 3.0 ]);
}

function draw_arm(matrix) {
	matrix = mat4.scale(matrix, [ 1/3, 1.0, 1/3 ]);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	draw_cylinder(matrix);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 3.0, 1.0, 3.0 ]);
}

function draw_hand(matrix) {
	matrix = mat4.scale(matrix, [ 1/3, 1/3, 1/3 ]);
	matrix = mat4.translate(matrix, [ 0, 0.5, 0 ]);
	draw_sphere(matrix);
	matrix = mat4.translate(matrix, [ 0, -0.5, 0 ]);
	matrix = mat4.scale(matrix, [ 3.0, 3.0, 3.0 ]);
}

// /////////////////////////////////////////////////////////////////////

function drawScene() {

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	pMatrix = mat4.perspective(60, 1.0, 0.05, 100, pMatrix); // set up the
	// projection matrix
	
	vMatrix = mat4.lookAt(camLoc, lookLoc, upVector, vMatrix); // set
	// up
	// the
	// view
	// matrix

	var Mstack = new Array();
	mat4.identity(mMatrix);

	mMatrix = mat4.multiply(mMatrix, sceneMatrix);
	
	mMatrix = mat4.scale(mMatrix, [ 0.4, 0.4, 0.4 ]); // make the whole thing
	// smaller

	// ////////////////// the floor and ceiling

	mMatrix = draw_extras(mMatrix);

	// ////////////////// the body (incl. head)

	mMatrix = mat4.multiply(mMatrix, mvMatrices[BODY]);

	draw_body(mMatrix);

	PushMatrix(mMatrix);

	// /////////////////// the legs

	mMatrix = mat4.translate(mMatrix, [ 0, -0.75, 0 ]);
	PushMatrix(mMatrix);
	mMatrix = mat4.translate(mMatrix, [ -0.3, 0, 0 ]);
	mMatrix = mat4.multiply(mMatrix, mvMatrices[L_LEG]);
	draw_leg(mMatrix);

	mMatrix = PopMatrix();
	mMatrix = mat4.translate(mMatrix, [ 0.3, 0, 0 ]);
	mMatrix = mat4.multiply(mMatrix, mvMatrices[R_LEG]);
	draw_leg(mMatrix);

	// /////////////////// the left arm and hand
	mMatrix = PopMatrix();
	PushMatrix(mMatrix);

	mMatrix = mat4.translate(mMatrix, [ -0.5, 0.5, 0 ]);
	mMatrix = mat4.multiply(mMatrix, mvMatrices[L_ARM]);
	mMatrix = mat4.rotate(mMatrix, degToRad(135), [ 0, 0, 1 ])
	draw_arm(mMatrix);

	mMatrix = mat4.translate(mMatrix, [ 0, 1.0, 0 ]);
	mMatrix = mat4.multiply(mMatrix, mvMatrices[L_HAND]);
	draw_hand(mMatrix);

	// /////////////////// the right arm and hand
	mMatrix = PopMatrix();

	mMatrix = mat4.translate(mMatrix, [ 0.5, 0.5, 0 ]);
	mMatrix = mat4.multiply(mMatrix, mvMatrices[R_ARM]);
	mMatrix = mat4.rotate(mMatrix, degToRad(-135), [ 0, 0, 1 ])
	draw_arm(mMatrix);

	mMatrix = mat4.translate(mMatrix, [ 0, 1.0, 0 ]);
	mMatrix = mat4.multiply(mMatrix, mvMatrices[R_HAND]);
	draw_hand(mMatrix);

}

// /////////////////////////////////////////////////////////////

var lastMouseX = 0, lastMouseY = 0;
var SCENE = -1, BODY = 0, L_ARM = 1, L_HAND = 2, R_ARM = 3, R_HAND = 4, L_LEG = 5, R_LEG = 6;

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
	var absDiff = Math.sqrt(diffX*diffX + diffY*diffY);
	if (diffX < 0) {
		absDiff *= -1;
	}

	// console.log("rotate" + degToRad(diffX / 5.0));
	var LEFT_MOUSE = 1;
	var RIGHT_MOUSE = 0;
	
	var SCALE = 500.0;
	
	if (event.which == LEFT_MOUSE) {
		if (which_object != SCENE) {
			mvMatrices[which_object] = mat4.rotate(mvMatrices[which_object],
					degToRad(diffX / 5.0), [ 0, 0, 1 ]);
		} else {
			sceneMatrix = mat4.rotate(sceneMatrix, degToRad(diffX/5.0), [0, 1, 0]);
		}		
	} else {
		sceneMatrix = mat4.scale(sceneMatrix, [1 + absDiff/SCALE, 1 + absDiff/SCALE, 1 + absDiff/SCALE]);
	}
	
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

	 console.log(event.keyCode);
	switch (event.keyCode) {
	case 82:
		// console.log('enter r');
		mvMatrices[BODY] = mat4.translate(mvMatrices[BODY], [ dist, 0, 0 ]);
		break;
	case 76:
		// console.log('enter l');
		mvMatrices[BODY] = mat4.translate(mvMatrices[BODY], [ -dist, 0, 0 ]);
		break;
	case 70:
		// console.log('enter f');
		mvMatrices[BODY] = mat4.translate(mvMatrices[BODY], [ 0, 0, -dist ]);
		break;
	case 66:
		// console.log('enter b');
		mvMatrices[BODY] = mat4.translate(mvMatrices[BODY], [ 0, 0, dist ]);
		break;
	case 68:
		// console.log('enter d');
		mvMatrices[BODY] = mat4.translate(mvMatrices[BODY], [0, -dist, 0]);
		break;
	case 85:
		// console.log('enter u');
		mvMatrices[BODY] = mat4.translate(mvMatrices[BODY], [0, dist, 0]);
		break;
	case 67:
		robColor = [ Math.random(), Math.random(), Math.random(), 1.0 ];
		initBuffers();
	}
	drawScene();
}

var camDist = 0.1;
var angleFromVertical = 0.0;

function cameraUp() {
	camLoc[1] += camDist;
	drawScene();
}

function cameraLeft() {
	camLoc[0] -= camDist;
	drawScene();
}

function cameraRight() {
	camLoc[0] += camDist;
	drawScene();
}

function cameraDown() {
	camLoc[1] -= camDist;
	drawScene();
}

function lookUp() {
	lookLoc[1] += camDist;
	drawScene();
}

function lookLeft() {
	lookLoc[0] -= camDist;
	drawScene();
}

function lookRight() {
	lookLoc[0] += camDist;
	drawScene();
}

function lookDown() {
	lookLoc[1] -= camDist;
	drawScene();
}

function rollLeft() {
	angleFromVertical += camDist;
	upVector[0] = Math.cos(Math.PI / 2 + angleFromVertical);
	upVector[1] = Math.sin(Math.PI / 2 + angleFromVertical);
	drawScene();
}

function rollRight() {
	angleFromVertical -= camDist;
	upVector[0] = Math.cos(Math.PI / 2 + angleFromVertical);
	upVector[1] = Math.sin(Math.PI / 2 + angleFromVertical);
	drawScene();
}

// /////////////////////////////////////////////////////////////

function webGLStart() {
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders();

	gl.enable(gl.DEPTH_TEST);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
	shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMMatrix");
	shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uVMatrix");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");

	robColor = [ 0.75, 0.75, 0.75, 1.0 ];

	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('keydown', onKeyDown, false);

	for (var i = 0; i < numObj; i++) {
		mvMatrices[i] = mat4.create();
		mat4.identity(mvMatrices[i]);
	}
	
	mat4.identity(sceneMatrix);

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

	obj(SCENE);

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

	robColor = [ 0.75, 0.75, 0.75, 1.0 ];
	initBuffers();

	drawScene();
}

function obj(object_id) {

	which_object = object_id;
	drawScene();

}
