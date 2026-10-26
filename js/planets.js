"use strict";

var SUN = {
  name: "太阳",
  radius: 1.4,
  spinSpeed: 0.5,
  texture: "textures/sun.png",
  emissive: true
};

// 地球与月球
var EARTH = {
  name: "地球",
  radius: 0.42,
  orbit: 4.5,
  orbitSpeed: 1.0,
  spinSpeed: 2.0,
  tilt: 23.5,
  texture: "textures/earth_atmos_2048.jpg"
};

var MOON = {
  name: "月球",
  radius: 0.14,
  orbit: 0.95,
  orbitSpeed: 4.0,
  spinSpeed: 1.0,
  orbitTilt: 5.1,
  texture: "textures/moon_1024.jpg"
};

// 完整太阳系
var EXTRA_PLANETS = [
  { name: "水星", radius: 0.18, orbit: 2.4, orbitSpeed: 2.6, spinSpeed: 0.4, tilt: 0.0, texture: "textures/mercury.png" },
  { name: "金星", radius: 0.30, orbit: 3.4, orbitSpeed: 1.8, spinSpeed: -0.3, tilt: 177.0, texture: "textures/venus.png" },
  { name: "火星", radius: 0.26, orbit: 6.2, orbitSpeed: 0.8, spinSpeed: 1.9, tilt: 25.0, texture: "textures/mars.png" },
  { name: "木星", radius: 0.85, orbit: 8.5, orbitSpeed: 0.4, spinSpeed: 4.0, tilt: 3.0, texture: "textures/jupiter.png" },
  { name: "土星", radius: 0.65, orbit: 11.0, orbitSpeed: 0.3, spinSpeed: 3.6, tilt: 27.0, texture: "textures/saturn.png", ring: true }
];
