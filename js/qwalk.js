qwalk = {}

qwalk.mat = undefined
qwalk.eigenvalues = undefined
qwalk.eigenprojectors = undefined
qwalk.deltaTime = 0.01
qwalk.threshold = 0.95
qwalk.startIndex = 0
qwalk.timer = undefined
qwalk.isStopped = false;
qwalk.visited = qmanip.startNodeColor

qwalk.overlay = function(topColor, bottomColor, alpha) {
  var topRGB = qwalk.hexToRgb(topColor.slice(1))
  var botRGB = qwalk.hexToRgb(bottomColor.slice(1))
  var r = Math.floor(topRGB[0] * alpha + botRGB[0] * (1 - alpha))
  var g = Math.floor(topRGB[1] * alpha + botRGB[1] * (1 - alpha))
  var b = Math.floor(topRGB[2] * alpha + botRGB[2] * (1 - alpha))
  return qwalk.rgbToHex(r, g, b)
}

qwalk.hexToRgb = function(hex) {
  var bigint = parseInt(hex, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

qwalk.unsetStopFlag = function()
{
	qwalk.isStopped = false;
}

qwalk.setStopFlag = function()
{
	qwalk.isStopped = true;
}

qwalk.rgbToHex = function (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}


qwalk.start = function() {
  
  cy.nodes().forEach(function(node,i){
	  node.data('overThresholdColor','#ffffff');
  });
  
  // We need a startNode
  //TODO: when the start node is deleted, a new one should be automatically
  // selected (if possible) and labeled appropriately. This does not happen yet.

  // Build adjacency matrix
  var N = cy.nodes().length
  qwalk.mat = numeric.rep([N, N], 0)
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      /* if (i == j) {
        continue
      } */
      var edges = qmanip.getEdges(cy.nodes()[i].id(), cy.nodes()[j].id())
      qwalk.mat[i][j] = edges.length > 0 ? 1 : 0
    }
  }

  // Set time
  qwalk.curTime = 0
  //Set start flag
  qwalk.unsetStopFlag();
  
  // Compute and cache the spectral decomposition
  var B = qtools.specdecomp(qwalk.mat)
  qwalk.eigenvalues = B[0].map(function(x) {return numeric.t([x], [0])})
  qwalk.eigenprojectors = B[1].map(function(x) {
    return numeric.t(x, numeric.rep([N, N], 0))
  })
  // Verify that spectral decomposition was computed correctly
  qtools.testSpectralDecomposition(qwalk.mat, B, false)
  // Run qwalk
  qwalk.timer = setInterval(qwalk.loop, 30)
}

qwalk.loop = function() {
  var N = cy.nodes().length, t = qwalk.curTime
  var U = qtools.qwalk(qwalk.eigenvalues, qwalk.eigenprojectors, N, t)
  cy.nodes().forEach(function(node, i) {
    // The amplitude is given by the nth column of U,
    // where n = qwalk.startIndex
    var ampl = U.getBlock([i, qwalk.startIndex], [i, qwalk.startIndex])
    var prob = ampl.mul(ampl.conj()).x[0][0]
    node.data('fg', qwalk.overlay('#ff0000', node.data('overThresholdColor'), prob))
    node.data('prob', Math.round(prob*100).toString())

    if (prob > qwalk.threshold && gui.showVisited) {
      node.data('overThresholdColor', qwalk.visited)
    }
  })
  qwalk.curTime += qwalk.deltaTime
}

qwalk.stop = function() {
  
  clearInterval(qwalk.timer);
  
  qwalk.setStopFlag();
  
  qwalk.curTime = 0;

  cy.nodes().forEach(function (node, i){
    node.data('fg','#ffffff');
	node.data('overThresholdColor','#ffffff');
	node.data('prob',0);
  });
  
}
