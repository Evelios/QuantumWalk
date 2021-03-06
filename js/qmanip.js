qmanip = {}

qmanip.nodeCounter = 0
qmanip.startNodeColor = '#009acd'

//Accepts an id and returns the node
qmanip.getNode = function(id) {
  return cy.getElementById(id);
}

//Accepts two node ids and returns the collection of edges between them
qmanip.getEdges = function(id1,id2) {
  return cy.getElementById(id1).edgesWith(cy.getElementById(id2))
}

qmanip.nextNodeId = function() {
  qmanip.nodeCounter++
  return "n"+qmanip.nodeCounter
}

qmanip.addNode = function() {
  var nodeId = qmanip.nextNodeId()
  var prob = gui.getShowProb() ? '0' : ''
  cy.add({data: {id: nodeId, bg: '#ffffff', fg: '#ffffff', prob: prob}})
}

qmanip.addNodeWithId = function(id) {
  var prob = gui.getShowProb() ? '0' : ''
  cy.add({data: {id: id, bg: '#ffffff',fg: '#ffffff', prob: prob}})
}

qmanip.addNodeWithPosition = function(posx,posy) {
  var nodeId = qmanip.nextNodeId()
  var prob = gui.getShowProb() ? '0' : ''
  cy.add({
    data: {id: nodeId, bg: '#ffffff', fg: '#ffffff', prob: prob},
    position: {x: posx, y: posy}
  })
}

qmanip.addEdge = function(id1,id2) {
  if (qmanip.getEdges(id1,id2).length == 0 ) {
    cy.add({data: {id: ['e',id1,'-',id2].join(''), source: id1, target: id2}})
  }
}

qmanip.setStartNode = function(startNode) {
  cy.nodes().forEach(function(node, i) {
    if (node.id() === startNode.id()) {
      qwalk.startIndex = i
      node.style('border-color', qmanip.startNodeColor)
    } else {
      node.style('border-color', '#000000');
    }
  })
}
