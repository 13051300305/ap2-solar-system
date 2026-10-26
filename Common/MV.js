
"use strict";

// ---------- 向量 ----------
function vec2(x, y) { return [x, y]; }
function vec3(x, y, z) { return [x, y, z]; }
function vec4(x, y, z, w) { return [x, y, z, w]; }

function mix(u, a, b) {
  return [a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1]), a[2] + u * (b[2] - a[2])];
}

function flatten(v) {
  if (v.length > 0 && typeof v[0] === "number") {
    return new Float32Array(v);
  }
  var n = v.length * v[0].length;
  var out = new Float32Array(n);
  for (var i = 0; i < v.length; i++) {
    for (var j = 0; j < v[0].length; j++) {
      out[i * v[0].length + j] = v[i][j];
    }
  }
  return out;
}

function length(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normalize(v) {
  var l = length(v);
  if (l === 0) return [0, 0, 0];
  return [v[0] / l, v[1] / l, v[2] / l];
}

function subtract(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

// ---------- 矩阵 ----------
function mat4() {
  var m = new Float32Array(16);
  m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
  return m;
}

function mat4identity() { return mat4(); }

// 平移矩阵
function translate(x, y, z) {
  var m = mat4();
  m[12] = x; m[13] = y; m[14] = z;
  return m;
}

// 缩放矩阵
function scale(x, y, z) {
  var m = mat4();
  m[0] = x; m[5] = y; m[10] = z;
  return m;
}

// 旋转矩阵：angle 为角度，axis 为单位向量（x,y,z）
function rotate(angle, axis) {
  var c = Math.cos(angle * Math.PI / 180.0);
  var s = Math.sin(angle * Math.PI / 180.0);
  var n = normalize(axis);
  var x = n[0], y = n[1], z = n[2];
  var m = mat4();
  m[0] = x * x * (1 - c) + c;
  m[1] = x * y * (1 - c) + z * s;
  m[2] = x * z * (1 - c) - y * s;
  m[4] = x * y * (1 - c) - z * s;
  m[5] = y * y * (1 - c) + c;
  m[6] = y * z * (1 - c) + x * s;
  m[8] = x * z * (1 - c) + y * s;
  m[9] = y * z * (1 - c) - x * s;
  m[10] = z * z * (1 - c) + c;
  return m;
}

// 矩阵乘法 a * b
function mult(a, b) {
  var out = mat4();
  for (var col = 0; col < 4; col++) {
    for (var row = 0; row < 4; row++) {
      var sum = 0;
      for (var k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

// 正交投影矩阵
function ortho(left, right, bottom, top, near, far) {
  var m = mat4();
  m[0] = 2.0 / (right - left);
  m[5] = 2.0 / (top - bottom);
  m[10] = -2.0 / (far - near);
  m[12] = -(right + left) / (right - left);
  m[13] = -(top + bottom) / (top - bottom);
  m[14] = -(far + near) / (far - near);
  return m;
}

// 透视投影矩阵：fovy 为视角
function perspective(fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy * Math.PI / 360.0);
  var m = mat4();
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1.0;
  m[14] = (2.0 * far * near) / (near - far);
  m[15] = 0.0;
  return m;
}

// 视图矩阵：相机 eye 看向 at，up 为上方向
function lookAt(eye, at, up) {
  var z = normalize(subtract(eye, at));
  var x = normalize(cross(up, z));
  var y = cross(z, x);
  var m = mat4();
  m[0] = x[0]; m[4] = x[1]; m[8] = x[2];
  m[1] = y[0]; m[5] = y[1]; m[9] = y[2];
  m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
  m[12] = -dot(x, eye);
  m[13] = -dot(y, eye);
  m[14] = -dot(z, eye);
  return m;
}
