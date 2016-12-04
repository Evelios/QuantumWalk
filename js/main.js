var cy

var gui = {}

gui.select = 0
gui.addNode = 1
gui.deleteNode = 2
gui.deleteEdge = 3
gui.selectSource = 4
gui.selectTarget = 5
gui.setStartNode = 6

gui.state = gui.select

gui.sourceNode = undefined

gui.showVisited = true

gui.closeMenu = function() {
  if (document.getElementById('editBtn').getAttribute('state') === 'open') {
    document.getElementById('topBtns').style.width = '100%'
    document.getElementById('topBtns').style.marginLeft = '0px'
    document.getElementById('cy').style.width = '100%'
    document.getElementById('cy').style.marginLeft = '0px'
    document.getElementById('editPanel').style.width = '0px'
    document.getElementById('editBtn').setAttribute('state', 'closed')
    var children = document.getElementById('stateGroup').children;
    children[0].setAttribute('class', 'btn btn-default active')
    for (var i = 1; i < children.length; i++) {
      children[i].setAttribute('class', 'btn btn-default')
    }
    gui.state = gui.select
    cy.resize()
    cy.fit()
  }
}

$(document).ready(function() {
  $(window).resize(function() {
    cy.resize()
    cy.fit()
  })

  $('#stateGroup').click(function(evt) {
    gui.state = gui[evt.target.getAttribute('state')]
  })


  $('#visitBtn').click(function(evt) {
    gui.showVisited = !gui.showVisited
  })

  $('#editBtn').click(function(evt) {
    if (document.getElementById('editBtn').getAttribute('state') === 'closed') {
      document.getElementById('topBtns').style.width = 'calc(100% - 119px)'
      document.getElementById('topBtns').style.marginLeft = '119px'
      document.getElementById('cy').style.width = 'calc(100% - 119px)'
      document.getElementById('cy').style.marginLeft = '119px'
      document.getElementById('editPanel').style.width = '119px'
      document.getElementById('editBtn').setAttribute('state', 'open')
      cy.resize()
      cy.fit()
    } else {
      gui.closeMenu()
    }
  })

  $('#playBtn').click(function(evt) {
    var playBtn = document.getElementById('playBtn')
    if (playBtn.textContent === 'Play') {
      gui.closeMenu()
      $('#editBtn').prop('disabled', true)
      playBtn.setAttribute('class', 'btn btn-danger')
      playBtn.textContent = 'Stop'
      qwalk.start()
    } else {
      $('#editBtn').prop('disabled', false)
      playBtn.setAttribute('class', 'btn btn-success')
      playBtn.textContent = 'Play'
      qwalk.stop()
    }
  })

  cy = cytoscape({
    container: document.getElementById('cy'),
    style: [{
      selector: 'node',
      style: {
        shape: 'ellipse',
        width: 20,
        height: 20,
        'label': 'data(prob)',
        'background-color': 'data(fg)',
        'border-color': '#000000',
        'border-width': 3
      }
    }]
  }).on('tap', 'node', function(evt) {
    if (gui.state === gui.selectSource) {
      gui.sourceNode = evt.cyTarget.id()
      gui.state = gui.selectTarget
    } else if (gui.state === gui.selectTarget) {
      qmanip.addEdge(gui.sourceNode, evt.cyTarget.id())
      gui.state = gui.selectSource
    } else if (gui.state === gui.deleteNode) {
      cy.remove(evt.cyTarget)
    } else if (gui.state === gui.setStartNode) {
      qmanip.setStartNode(evt.cyTarget)
    }
  }).on('tap', 'edge', function(evt) {
    if (gui.state === gui.deleteEdge) {
      cy.remove(evt.cyTarget)
    }
  }).on('tap', function(evt) {
    if (evt.cyTarget !== cy || gui.state === gui.select) {
      return
    } else if (gui.state === gui.addNode) {
      qmanip.addNodeWithPosition(evt.cyPosition.x, evt.cyPosition.y)
    }
  })

  // Generate initial graph
  for (var i = 0; i < 3; i++) {
    qmanip.addNode()
  }
  qmanip.addEdge('n1', 'n2')
  qmanip.addEdge('n2', 'n3')
  qmanip.setStartNode(cy.nodes()[0])

  // compute placements
  $(window).resize()
  cy.layout({name: 'circle', radius: 100, padding: 0})

  // Run tests on backend code
  qtools.testAll(true)
})
