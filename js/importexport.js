
/* SGF format looks like...

(num of nodes)
(start node)
(edge)
(edge)
(and so on)
.


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

function importGraphFromSGF(file)
{
  
  var reader = new FileReader();
  
  reader.onload = function(progressEvent){
    var textOfFile = this.result;
    var linesOfFile = textOfFile.split('\n');
    
    if(linesOfFile.length < 2)
    {
      var e = new Error('The file must contain at least the number of nodes and a start node');
      throw e;
    }
    else
    {
      //Get number of nodes and start node
      var numOfNodes = parseInt(linesOfFile[0].split(' ')[0].trim());
      var startNodeNumber = parseInt(linesOfFile[1].split(' ')[0].trim());
      if(numOfNodes === NaN)
        throw new Error('Line 1: Number of nodes is not a number');
      if(startNodeNumber === NaN)
        throw new Error('Line 2: Start node number is not a number');
      if(!(1 <= startNodeNumber && startNodeNumber <= numOfNodes))
        throw new Error('Line 2: Start node number isn\'t in the correct range');
      
      var edgeList = [];
      
      //Get edges
      for(var i=2;i<linesOfFile.length;++i)
      {
        var curLine = linesOfFile[i];
        var partsOfLine = curLine.split(' ');
        
        var sourceNodeNumber = parseInt(partsOfLine[0].trim());
        var targetNodeNumber = parseInt(partsOfLine[1].trim());
        
        if(sourceNodeNumber === isNaN)
          throw new Error('Line ' + (i+1) + ': Source node is not a number');
        if(targetNodeNumber === isNaN)
          throw new Error('Line ' + (i+1) + ': Target node is not a number');
        if(!(1 <= sourceNodeNumber && sourceNodeNumber <= numOfNodes))
          throw new Error('Line ' + (i+1) + ': Source node isn\'t in the correct range');
        if(!(1 <= targetNodeNumber && targetNodeNumber <= numOfNodes))
          throw new Error('Line ' + (i+1) + ': Target node isn\'t in the correct range');
        
        edgeList.push([sourceNodeNumber,targetNodeNumber]);
      }
      
      //Clear graph
      cy.elements().remove();
      
      //Add nodes
      for(var i=1;i<=numOfNodes;++i)
        qmanip.addNodeWithId('n'+i);
      
      //Set start node
      qmanip.setStartNode(qmanip.getNode('n'+startNodeNumber));
      
      //Add edges
      for(var l=0;l<edgeList.length;++l)
        qmanip.addEdge('n'+edgeList[l][0],'n'+edgeList[l][1]);
      
      //Lay them out
      cy.layout({name:'circle',radius: 100,padding: 0});
    }
  };
  
  reader.readAsText(file);
  
}