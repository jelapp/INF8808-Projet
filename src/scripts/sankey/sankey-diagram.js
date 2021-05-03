import * as preprocess from './preprocess.js'
import * as helper from './helper.js'
import * as viz from './viz.js'

/**
 * @file This file is the entry-point for the sankey diagrams
 * @author Marie-Ève Patron
 * @version v1.0.0
 */

 let sankeyParametersArray = []
 let firstCategories = new Set()
 let secondCategory = ""
 let sankey
 let secondCategoryWithChild = new Set()
 let color

export function addSankeyDiagrams(data) {
    firstCategories = preprocess.getFirstCategories(data)
    secondCategoryWithChild = preprocess.getSecondCategoryWithChild(data, firstCategories)
    firstCategories.forEach(function(d) { secondCategoryWithChild.add(d)})
   
    color = viz.setColorScale()

    generateSankey(1, data)
    generateSankey(2, data)
}

/**
 * This function generate a sankey diagram
 */
function generateSankey(vizNumber, data) {
    let g = helper.generateMapG(vizNumber)
    let sankeyParameters = { "data": data, "regionFilter": "all", "branchFilter": "all", "g": g, "vizNumber": vizNumber}
    sankeyParametersArray.push(sankeyParameters)

    const regionNames = preprocess.getRegionNames(data)
    helper.addSelectionOption('#region' + vizNumber, regionNames)
    helper.addChangeListener('#region' + vizNumber, setFilterRegion, sankeyParameters)

    const branchesNames = preprocess.getBranchesNames(data)
    helper.addSelectionOption('#branch' + vizNumber, branchesNames)
    helper.addChangeListener('#branch' + vizNumber, setFilterBranch, sankeyParameters)

    let sankeyData = filterRegion(sankeyParameters, "all")
    createGraph(sankeyData, sankeyParameters.g)

}

function setFilterRegion(sankeyParameters, regionName) {
    sankeyParameters.regionFilter = regionName
    sankeyParameters.branchFilter = "all"
    updateGraph(sankeyParameters)
}

function setFilterBranch(sankeyParameters, branchName) {
    sankeyParameters.branchFilter = branchName
    updateGraph(sankeyParameters)
}

function setSecondCategory(category) {
    secondCategory = category
    sankeyParametersArray.forEach(function(d) {
        updateGraph(d)
    })

}

/**
 * This function handles the filtering according to the region
 */
 function filterRegion(sankeyParameters, regionName) {
    sankeyParameters.regionFilter = regionName
    const branchesNames = preprocess.getBranchesByRegion(sankeyParameters.data, regionName)
    helper.addSelectionOption('#branch' + sankeyParameters.vizNumber, branchesNames)
    d3.select('#branch' + sankeyParameters.vizNumber+ "-button").select("span").text("Toutes les succursales")

    let filteredData = preprocess.filterRegion(sankeyParameters.data, regionName)
    filteredData = preprocess.filterFirstCategories(filteredData, firstCategories, secondCategory)

    return preprocess.prepareDataForGraph(filteredData)

} 

/**
 * This function handles the filtering according to the branch
 */
 function filterBranch(sankeyParameters, branchName) {
    sankeyParameters.branchFilter = branchName
    let filteredData = preprocess.filterBranch(sankeyParameters.data, branchName)
    filteredData = preprocess.filterFirstCategories(filteredData, firstCategories, secondCategory)
    return preprocess.prepareDataForGraph(filteredData)
}

/**
 * This function handles the filtering according to the first categories
 */
 function updateGraph(sankeyParameters) {
    let sankeyData = sankeyParameters.branchFilter == "all"? filterRegion(sankeyParameters, sankeyParameters.regionFilter) : filterBranch(sankeyParameters, sankeyParameters.branchFilter)
    sankey(sankeyData)

    let t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);
    
    let link = sankeyParameters.g.select(".links").selectAll("path")
        .data(sankeyData.links, function(d) { return d; });

    viz.applyLinksConfiguration(link.enter().append("path"))
    viz.applyLinksConfiguration(link.transition(t))
    link.exit().remove();

    let node = sankeyParameters.g.select(".nodes").selectAll("g")
        .data(sankeyData.nodes);

    var nodeEnter = viz.applyNodesConfiguration(node.enter()
        .append("g"),highlight, sankeyParametersArray, firstCategories, secondCategoryWithChild)
    viz.applyNodesRectsConfiguration(nodeEnter.append("rect"), color)
    viz.applyNodesRectsConfiguration(node.select("rect").transition(t), color)
    viz.applyTextRectConfiguration(nodeEnter.append("rect"))
    viz.applyTextRectConfiguration(node.select(".textRect").transition(t))
    viz.applyTextConfiguration(nodeEnter.append("text"))
    viz.applyTextConfiguration(node.select("text").transition(t))
    node.exit().remove();
}


/**
 * This function delete the old graph and build a new one.
 */
function createGraph(data, g) {
    g.selectAll(".links").remove()
    g.selectAll(".nodes").remove()

    let margin = {"right": 170}
    let svgSize = d3.selectAll("#svg-sanky1").node().getBoundingClientRect()
    let width = svgSize.width - margin.right
    let height = svgSize.height

    sankey = viz.createSankey(data, width, height)
    let link = viz.addSankeyLinksGroup(g)
    let node = viz.addSankeyNodesGroup(g)

    sankey(data)
    viz.drawSankeyLinks(link, data)
    node = viz.drawSankeyNodes(node, data, highlight, sankeyParametersArray, firstCategories, secondCategoryWithChild)
    viz.drawSankeyNodesRects(node, color, setSecondCategory)
    viz.addSankeyNodeLabels(node, sankey)
}

function highlight(node,i, removeHighlight){
    var remainingNodes=[],
        nextNodes=[];

    var stroke_opacity = removeHighlight? 0.2:0.5;
    var traverse = [{
                      linkType : "sourceLinks",
                      nodeType : "target"
                    },{
                      linkType : "targetLinks",
                      nodeType : "source"
                    }];

    traverse.forEach(function(step){
      node[step.linkType].forEach(function(link) {
        remainingNodes.push(link[step.nodeType]);
        highlight_link(link.id, stroke_opacity);
      });

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function(node) {
          node[step.linkType].forEach(function(link) {
            nextNodes.push(link[step.nodeType]);
            highlight_link(link.id, stroke_opacity);
          });
        });
        remainingNodes = nextNodes;
      }
    });
  }

  function highlight_link(id,opacity){
      d3.selectAll(".link-"+id).style("stroke-opacity", opacity);
  }
