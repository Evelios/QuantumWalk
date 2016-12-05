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

gui.leftMargin = '142px'
gui.bodyWidth = 'calc(100% - ' + gui.leftMargin + ')'

gui.closeMenu = function() {
  if (document.getElementById('editBtn').getAttribute('state') === 'open') {
    $('#topBtns').css({'width': '100%', 'margin-left': '0px'})
    $('#cy').css({'width': '100%', 'margin-left': '0px'})
    $('#editPanel').css('width', '0px')
    document.getElementById('editBtn').setAttribute('state', 'closed')
    var children = $('#stateGroup').children()
    $(children[0]).addClass('active')
    for (var i = 1; i < children.length; i++) {
      $(children[i]).removeClass('active')
    }
    gui.state = gui.select
    cy.resize()
    cy.fit()
  }
}

gui.getShowVisited = function() {
  return $('#visitBtn').hasClass('active')
}

gui.getShowProb = function() {
  return $('#probBtn').hasClass('active')
}

$(document).ready(function() {
  $(window).resize(function() {
    cy.resize()
    cy.fit()
  })

  $('#stateGroup').click(function(evt) {
    gui.state = gui[evt.target.getAttribute('state')]
  })

  $('#probBtn').click(function(evt) {
    if ($('#probBtn').hasClass('active')) {
      cy.nodes().data('prob', '')
    } else {
      cy.nodes().data('prob', '0')
    }
  })

  $('#editBtn').click(function(evt) {
    if (document.getElementById('editBtn').getAttribute('state') === 'closed') {
      $('#topBtns').css({'width': gui.bodyWidth, 'margin-left': gui.leftMargin})
      $('#cy').css({'width': gui.bodyWidth, 'margin-left': gui.leftMargin})
      $('#editPanel').css('width', gui.leftMargin)
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
      $('#importBtn').prop('disabled',true)
      qwalk.start()
    } else {
      $('#editBtn').prop('disabled', false)
      playBtn.setAttribute('class', 'btn btn-success')
      playBtn.textContent = 'Play'
      $('#importBtn').prop('disabled',false)
      qwalk.stop()
    }
  })

  $('#importBtn').click(function(evt) {
    $('#importBtnPicker').click()
  })

  $('#importBtnPicker').change(function(evt) {
    /* SGF format looks like...

    (num of nodes)
    (start node)
    (edge)
    (edge)
    (and so on)

    Example:

    4
    1
    1 2
    2 3
    3 4

    Note that any extra information at the end of the line is ignored
    So you can do...

    4 Num of nodes
    1 Start Node
    1 2 Edge 1
    2 3 Edge 2
    3 4 Edge that looks like waffles

    */
    var reader = new FileReader()

    reader.onload = function(progressEvent) {
      var textOfFile = this.result
      var linesOfFile = textOfFile.split('\n')

      // Get rid of newlines before
      try {
        while (linesOfFile[0].trim() === '')
          linesOfFile = linesOfFile.slice(1);

        while (linesOfFile[1].trim() === '')
          linesOfFile.splice(1,1);
      } catch(e) {
        // This happens if the number of lines, after killing whitespace,
        // is less than 2
        throw new Error('The file must contain number of nodes and start node')
      }

      //Get rid of newlines after the number of nodes
      if (linesOfFile.length < 2) {
        throw new Error('The file must contain number of nodes and start node')
      } else {
        //Get number of nodes and start node
        var numOfNodes = parseInt(linesOfFile[0].split(' ')[0].trim())
        var startNodeNumber = parseInt(linesOfFile[1].split(' ')[0].trim())
        if(numOfNodes === NaN)
          throw new Error('Line 1: Number of nodes is not a number')
        if(startNodeNumber === NaN)
          throw new Error('Line 2: Start node number is not a number')
        if(!(1 <= startNodeNumber && startNodeNumber <= numOfNodes))
          throw new Error('Line 2: Start node number is out of bounds')

        var edgeList = []

        //Get edges
        for(var i = 2; i < linesOfFile.length; ++i) {
          var curLine = linesOfFile[i]

          //Ignore if just whitespace
          if(curLine.trim() === '')
            continue

          var partsOfLine = curLine.split(' ')

          if(partsOfLine.length < 2) {
            var msg = 'Line ' + (i+1) + ': Edge doesn\'t have enough arguments'
            throw new Error(msg)
          }

          var sourceNodeNumber = parseInt(partsOfLine[0].trim())
          var targetNodeNumber = parseInt(partsOfLine[1].trim())

          if(sourceNodeNumber === isNaN)
            throw new Error('Line ' + (i+1) + ': Source node is not a number')
          if(targetNodeNumber === isNaN)
            throw new Error('Line ' + (i+1) + ': Target node is not a number')
          if(!(1 <= sourceNodeNumber && sourceNodeNumber <= numOfNodes))
            throw new Error('Line ' + (i+1) + ': Source node is out of bounds')
          if(!(1 <= targetNodeNumber && targetNodeNumber <= numOfNodes))
            throw new Error('Line ' + (i+1) + ': Target node is out of bounds')

          edgeList.push([sourceNodeNumber,targetNodeNumber]);
        }

        // Clear graph
        cy.elements().remove();
        // Add nodes
        for(var i = 1; i <= numOfNodes; ++i) {
          qmanip.addNodeWithId('n'+i)
        }
        // Set start node
        qmanip.setStartNode(qmanip.getNode('n'+startNodeNumber))
        // Add edges
        for(var l = 0; l < edgeList.length; ++l) {
          qmanip.addEdge('n'+edgeList[l][0],'n'+edgeList[l][1])
        }
        // Organize nodes
        cy.layout({name:'circle',radius: 100,padding: 0})
      }
    }

    reader.readAsText(evt.target.files[0])
  })

  $('#exportBtn').click(function(evt) {
    // Give each node a number id
    cy.nodes().forEach(function(node, i) {node.data('nodeNumber', i+1)})
    var startNodeNumber = cy.nodes()[qwalk.startIndex].data('nodeNumber')
    // First two lines are number of nodes and start node number
    var filetext = [cy.nodes().length, startNodeNumber]

    // Put edges to file
    filetext = filetext.concat(cy.edges().map(function(edge) {
      var source = edge.source().data('nodeNumber')
      var target = edge.target().data('nodeNumber')
      return [source, target].join(' ')
    })).join('\n')

    // Bring up download for file
    // I got this code from StackOverflow:
    // http://stackoverflow.com/questions/3665115
    var href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(filetext)
    var downloadElement = document.createElement('a')
    downloadElement.setAttribute('href', href)
    downloadElement.setAttribute('download', 'yourgraph.sgf')

    downloadElement.style.display = 'none'
    document.body.appendChild(downloadElement)

    downloadElement.click()

    document.body.removeChild(downloadElement)
  })

  $('#visitedSlider').slider({
    min: 0,
    max: 100,
    value: 80
  }).on('slide', function(evt) {
    qwalk.threshold = evt.value / 100
  })
  $('#visitedSlider').css('width', '100%')

  $('#speedSlider').slider({
    min: 1,
    max: 10,
    value: 1
  }).on('slide', function(evt) {
    qwalk.deltaTime = evt.value / 100
  })
  $('#speedSlider').css('width', '100%')

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
      if (evt.cyTarget.id() == cy.nodes()[qwalk.startIndex].id()) {
        cy.remove(evt.cyTarget)
        qwalk.startIndex = 0
        qmanip.setStartNode(cy.nodes()[0])
      } else {
        cy.remove(evt.cyTarget)
      }
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
  //qtools.testAll(true)
})
