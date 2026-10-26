// initShaders.js —— 教材配套工具库（按 Angel & Shreiner 8e 原版逻辑实现）
// 作用：从 <script id="xxx-shader"> 标签里取出着色器源码，编译、链接着色器程序。
// 用法：var program = initShaders(gl, "vertex-shader", "fragment-shader");

function initShaders(gl, vertexShaderId, fragmentShaderId) {
  function getShader(id) {
    var element = document.getElementById(id);
    if (!element) {
      console.error("找不到着色器标签: " + id);
      return null;
    }
    var src = element.text.trim();
    var shader;
    if (element.type === "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (element.type === "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
      console.error("未知着色器类型: " + element.type);
      return null;
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("着色器编译错误 (" + id + "):\n" + gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  var vertSh = getShader(vertexShaderId);
  var fragSh = getShader(fragmentShaderId);
  var program = gl.createProgram();
  gl.attachShader(program, vertSh);
  gl.attachShader(program, fragSh);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("着色器程序链接错误:\n" + gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}
