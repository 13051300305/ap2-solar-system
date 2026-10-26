"use strict";

function bindInteraction(gl) {
  var canvas = document.getElementById("glcanvas");
  var dragging = false;
  var lastX = 0, lastY = 0;

  canvas.addEventListener("mousedown", function (e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    camera.drag(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", function () { dragging = false; });

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    camera.zoom(e.deltaY);
  }, { passive: false });

  window.addEventListener("keydown", function (e) {
    if (e.key === "o" || e.key === "O") camera.toggleProjection();
    if (e.key === " ") {
      e.preventDefault();
      camera.togglePause();
    }
  });

  var sOrbit = document.getElementById("s-orbit");
  var sSpin = document.getElementById("s-spin");
  var sTilt = document.getElementById("s-tilt");
  var cOrbits = document.getElementById("c-orbits");

  sOrbit.addEventListener("input", function () {
    state.orbitSpeed = parseFloat(sOrbit.value);
    document.getElementById("v-orbit").textContent = state.orbitSpeed.toFixed(1);
  });
  sSpin.addEventListener("input", function () {
    state.spinSpeed = parseFloat(sSpin.value);
    document.getElementById("v-spin").textContent = state.spinSpeed.toFixed(1);
  });
  sTilt.addEventListener("input", function () {
    state.tilt = parseFloat(sTilt.value);
    document.getElementById("v-tilt").textContent = state.tilt.toFixed(1) + "°";
  });
  cOrbits.addEventListener("change", function () {
    state.orbitsVisible = cOrbits.checked;
  });
}
