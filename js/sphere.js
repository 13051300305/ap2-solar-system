"use strict";

function createSphere(segmentsLon, segmentsLat) {
  var positions = [];
  var normals = [];
  var uvs = [];
  var indices = [];

  // 纬度方向
  for (var lat = 0; lat <= segmentsLat; lat++) {
    var phi = Math.PI / 2 - lat * Math.PI / segmentsLat;
    var y = Math.sin(phi);
    var r = Math.cos(phi);
    // 经度方向
    for (var lon = 0; lon <= segmentsLon; lon++) {
      var theta = lon * 2 * Math.PI / segmentsLon;
      var x = r * Math.cos(theta);
      var z = r * Math.sin(theta);
      positions.push(x, y, z);
      normals.push(x, y, z); // 单位球法线等于顶点方向
      uvs.push(lon / segmentsLon, 1 - lat / segmentsLat);
    }
  }

  for (var la = 0; la < segmentsLat; la++) {
    for (var lo = 0; lo < segmentsLon; lo++) {
      var a = la * (segmentsLon + 1) + lo;
      var b = a + segmentsLon + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length
  };
}

// 土星环
function createRing(inner, outer, segments) {
  var positions = [];
  var normals = [];
  var uvs = [];
  var indices = [];

  for (var i = 0; i <= segments; i++) {
    var a = i * 2 * Math.PI / segments;
    var c = Math.cos(a), s = Math.sin(a);
    positions.push(inner * c, 0, inner * s);
    positions.push(outer * c, 0, outer * s);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, i / segments, 1, i / segments);
  }
  for (var i = 0; i < segments; i++) {
    var a = i * 2;
    indices.push(a, a + 1, a + 2);
    indices.push(a + 1, a + 3, a + 2);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    indexCount: indices.length
  };
}
