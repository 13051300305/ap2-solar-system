// scene.js —— 层级场景模型矩阵（太阳-地球-月球三级嵌套）
// 说明：矩阵乘法 mult(a,b) 表示 a*b，顶点 v 依次从右向左被应用。

"use strict";

// 累积动画状态
var state = {
  time: 0,
  orbitSpeed: 1.0,
  spinSpeed: 1.0,
  tilt: 23.5,
  orbitsVisible: true
};

// ---------- 太阳 ----------
function sunMatrix(t) {
  var spin = t * SUN.spinSpeed * state.spinSpeed;
  return mult(rotate(spin, [0, 1, 0]), scale(SUN.radius, SUN.radius, SUN.radius));
}

// ---------- 地球 ----------
// 顺序：先缩放 -> 自转 -> 轴倾角 23.5° -> 平移到公转轨道 -> 绕太阳公转
function earthMatrix(t) {
  var orbitAngle = t * EARTH.orbitSpeed * state.orbitSpeed * 30;
  var spinAngle = t * EARTH.spinSpeed * state.spinSpeed * 60;
  var tiltAngle = state.tilt;

  var m = scale(EARTH.radius, EARTH.radius, EARTH.radius);
  m = mult(rotate(spinAngle, [0, 1, 0]), m);
  m = mult(rotate(tiltAngle, [0, 0, 1]), m);
  m = mult(translate(EARTH.orbit, 0, 0), m);
  m = mult(rotate(orbitAngle, [0, 1, 0]), m);
  return m;
}

// ---------- 月球（手动矩阵：不使用工具库封装的复合函数，手工构造） ----------
// 月球轨道面相对地球公转面倾斜 orbitTilt（黄白交角 5.1°）。
// 手工构造链：先缩放 -> 自转 -> 平移到轨道半径 -> 月球绕地公转 -> 轨道面倾角
// 再整体左乘地球矩阵，使月球跟随地球绕太阳公转。
function moonMatrix(t, earthMat) {
  var orbitAngle = t * MOON.orbitSpeed * state.orbitSpeed * 30;
  var spinAngle = t * MOON.spinSpeed * state.spinSpeed * 60;

  var m = scale(MOON.radius, MOON.radius, MOON.radius);
  m = mult(rotate(spinAngle, [0, 1, 0]), m);
  m = mult(translate(MOON.orbit, 0, 0), m);
  m = mult(rotate(orbitAngle, [0, 1, 0]), m);
  m = mult(rotate(MOON.orbitTilt, [0, 0, 1]), m);

  return mult(earthMat, m);
}

// ---------- E1 行星（水星/金星/火星/木星/土星，绕太阳公转） ----------
function planetMatrix(p, t) {
  var orbitAngle = t * p.orbitSpeed * state.orbitSpeed * 30;
  var spinAngle = t * p.spinSpeed * state.spinSpeed * 60;

  var m = scale(p.radius, p.radius, p.radius);
  m = mult(rotate(spinAngle, [0, 1, 0]), m);
  m = mult(rotate(p.tilt, [0, 0, 1]), m);
  m = mult(translate(p.orbit, 0, 0), m);
  m = mult(rotate(orbitAngle, [0, 1, 0]), m);
  return m;
}

// ---------- 轨道线（预生成圆环顶点） ----------
function buildOrbitLines() {
  var orbits = [EARTH.orbit];
  EXTRA_PLANETS.forEach(function (p) { orbits.push(p.orbit); });

  var verts = [];
  var segs = 128;
  orbits.forEach(function (r) {
    for (var i = 0; i < segs; i++) {
      var a0 = i * 2 * Math.PI / segs;
      var a1 = (i + 1) * 2 * Math.PI / segs;
      verts.push(r * Math.cos(a0), 0, r * Math.sin(a0));
      verts.push(r * Math.cos(a1), 0, r * Math.sin(a1));
    }
  });
  return new Float32Array(verts);
}
