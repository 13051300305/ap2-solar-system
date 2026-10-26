// webgl-utils.js —— 教材配套工具库（获取 WebGL2 上下文的小帮手）
function WebGLUtils() {}
WebGLUtils.setupWebGL = function (canvas, optAttribs) {
  var names = ["webgl2", "webgl", "experimental-webgl"];
  var gl = null;
  for (var i = 0; i < names.length; i++) {
    try { gl = canvas.getContext(names[i], optAttribs); } catch (e) {}
    if (gl) break;
  }
  if (!gl) alert("无法初始化 WebGL，请更换现代浏览器（Chrome/Firefox/Edge）。");
  return gl;
};
