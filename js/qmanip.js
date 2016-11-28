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
  cy.add({data: {id: nodeId, bg: '#ffffff', fg: '#ffffff', prob: '0'}})
}

qmanip.addNodeWithPosition = function(posx,posy) {
  var nodeId = qmanip.nextNodeId()
  cy.add({
    data: {id: nodeId, bg: '#ffffff', fg: '#ffffff', prob: '0'},
    position: {x: posx, y: posy}
  })
}

qmanip.addEdge = function(id1,id2) {
  if (qmanip.getEdges(id1,id2).length == 0 ) {
    cy.add({data: {id: ['e',id1,'-',id2].join(''), source: id1, target: id2}})
  }
}

qmanip.setStartNode = function(node) {
  cy.nodes()[qwalk.startIndex].style('border-color', '#000000')
  node.style('border-color', qmanip.startNodeColor)
  var id = node.id()
  cy.nodes().forEach(function(node, i) {
    if (node.id() === id) {
      qwalk.startIndex = i
      return false  // stop the iteration
    }
  })
}
