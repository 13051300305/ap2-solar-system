"use strict";

var gl;
var program;
var sphere;
var orbitVBO;
var ring;
var ringPosBuf, ringIdxBuf;
var spherePosBuf, sphereNorBuf, sphereUVBuf, sphereIdxBuf;
var textures = {};
var whiteTex;

function initGL() {
  var canvas = document.getElementById("glcanvas");
  gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) { alert("浏览器不支持 WebGL"); return; }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.02, 0.02, 0.05, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
}

function initBuffers() {
  sphere = createSphere(48, 32);

  spherePosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spherePosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);

  sphereNorBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNorBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

  sphereUVBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereUVBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.uvs, gl.STATIC_DRAW);

  sphereIdxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIdxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

  orbitVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, orbitVBO);
  gl.bufferData(gl.ARRAY_BUFFER, buildOrbitLines(), gl.STATIC_DRAW);

  // 土星环
  ring = createRing(1.4, 2.4, 64);
  ringPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ringPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, ring.positions, gl.STATIC_DRAW);
  ringIdxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringIdxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ring.indices, gl.STATIC_DRAW);
}

function loadTexture(path) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([128, 128, 128, 255]));

  // 处理纹理上下颠倒
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  var img = new Image();
  img.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  };
  img.src = path;
  return tex;
}

function initTextures() {
  textures.sun = loadTexture(SUN.texture);
  textures.earth = loadTexture(EARTH.texture);
  textures.moon = loadTexture(MOON.texture);
  EXTRA_PLANETS.forEach(function (p) {
    textures[p.name] = loadTexture(p.texture);
  });

  whiteTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, whiteTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255]));
}

function bindSphereAttribs() {
  var aPos = gl.getAttribLocation(program, "a_Position");
  var aNor = gl.getAttribLocation(program, "a_Normal");
  var aUV = gl.getAttribLocation(program, "a_UV");

  gl.bindBuffer(gl.ARRAY_BUFFER, spherePosBuf);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPos);

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNorBuf);
  gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aNor);

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereUVBuf);
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aUV);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIdxBuf);
}

function drawBody(model, tex, emissive, view, proj) {
  bindSphereAttribs();
  var modelView = mult(view, model);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_ModelView"), false, modelView);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_Projection"), false, proj);

  var nm = new Float32Array([modelView[0], modelView[1], modelView[2],
                             modelView[4], modelView[5], modelView[6],
                             modelView[8], modelView[9], modelView[10]]);
  gl.uniformMatrix3fv(gl.getUniformLocation(program, "u_NormalMatrix"), false, nm);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(gl.getUniformLocation(program, "u_Sampler"), 0);
  gl.uniform1f(gl.getUniformLocation(program, "u_Emissive"), emissive);

  gl.drawElements(gl.TRIANGLES, sphere.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawRing(model, view, proj) {
  var modelView = mult(view, model);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_ModelView"), false, modelView);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_Projection"), false, proj);

  var aPos = gl.getAttribLocation(program, "a_Position");
  var aNor = gl.getAttribLocation(program, "a_Normal");
  var aUV = gl.getAttribLocation(program, "a_UV");
  gl.bindBuffer(gl.ARRAY_BUFFER, ringPosBuf);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringIdxBuf);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, whiteTex);
  gl.uniform1i(gl.getUniformLocation(program, "u_Sampler"), 0);
  gl.uniform1f(gl.getUniformLocation(program, "u_Emissive"), 1.0);

  gl.drawElements(gl.TRIANGLES, ring.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawOrbits(view, proj) {
  if (!state.orbitsVisible) return;
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_ModelView"), false, view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_Projection"), false, proj);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, whiteTex);
  gl.uniform1i(gl.getUniformLocation(program, "u_Sampler"), 0);
  gl.uniform1f(gl.getUniformLocation(program, "u_Emissive"), 1.0);

  var aPos = gl.getAttribLocation(program, "a_Position");
  gl.bindBuffer(gl.ARRAY_BUFFER, orbitVBO);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, buildOrbitLines().length / 3);
}

var lastTime = 0;
function render(now) {
  var dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt > 0.1) dt = 0.1;

  camera.update(dt);
  state.time += dt;

  var canvas = document.getElementById("glcanvas");
  var aspect = canvas.width / canvas.height;
  var view = camera.view();
  var proj = camera.projection(aspect);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawOrbits(view, proj);

  drawBody(sunMatrix(state.time), textures.sun, 1.0, view, proj);

  var earthMat = earthMatrix(state.time);
  drawBody(earthMat, textures.earth, 0.0, view, proj);
  drawBody(moonMatrix(state.time, earthMat), textures.moon, 0.0, view, proj);

  EXTRA_PLANETS.forEach(function (p) {
    var m = planetMatrix(p, state.time);
    drawBody(m, textures[p.name], 0.0, view, proj);
    if (p.ring) drawRing(m, view, proj);
  });

  requestAnimationFrame(render);
}

window.onload = function () {
  initGL();
  initBuffers();
  initTextures();
  bindInteraction();
  requestAnimationFrame(render);
};
