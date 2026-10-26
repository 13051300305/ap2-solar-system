"use strict";

var camera = {
  azimuth: 0.6,
  elevation: 0.3,
  distance: 26,
  roaming: true,
  paused: false,
  isPerspective: true,

  update: function (dt) {
    // 漫游模式
    if (this.roaming && !this.paused) {
      this.azimuth += dt * 0.25;
      this.elevation = 0.25 + 0.2 * Math.sin(this.azimuth * 0.5);
    }
  },

  eye: function () {
    var ce = Math.cos(this.elevation);
    return [
      this.distance * ce * Math.cos(this.azimuth),
      this.distance * Math.sin(this.elevation),
      this.distance * ce * Math.sin(this.azimuth)
    ];
  },

  view: function () {
    return lookAt(this.eye(), [0, 0, 0], [0, 1, 0]);
  },

  projection: function (aspect) {
    if (this.isPerspective) {
      return perspective(45, aspect, 0.1, 100);
    } else {
      var d = 12.5;
      return ortho(-d * aspect, d * aspect, -d, d, -50, 50);
    }
  },

  // 鼠标拖拽
  drag: function (dx, dy) {
    this.roaming = false;
    this.azimuth += dx * 0.005;
    this.elevation += dy * 0.005;
    if (this.elevation > 1.4) this.elevation = 1.4;
    if (this.elevation < -1.4) this.elevation = -1.4;
  },

  zoom: function (delta) {
    this.distance += delta * 0.02;
    if (this.distance < 3) this.distance = 3;
    if (this.distance > 40) this.distance = 40;
  },

  toggleProjection: function () {
    this.isPerspective = !this.isPerspective;
    document.getElementById("proj").textContent =
      "投影模式：" + (this.isPerspective ? "透视（按 O 切换）" : "正交（按 O 切换）");
  },

  togglePause: function () {
    this.paused = !this.paused;
  }
};
