import * as panel from './panel.js'
 
 /**
 * Generates the Sankey object and add nodes and links.
 */
export function createSankey (data, width, height) {
    return d3.sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .nodeAlign(d3.sankeyLeft)
    .linkSort((d1, d2) => d1.source.name - d2.source.name)
    .extent([[1, 1], [width - 1, height - 6]])
    .iterations(32);
}

  /**
 * Draw the links of the sankey on the canvas
 */
   export function addSankeyLinksGroup (g) {
   return g.append("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2)
    .selectAll("path");
}

  /**
 * Draw the nodes of the sankey on the canvas
 */
   export function addSankeyNodesGroup(g) {
    return g.append("g")
        .attr("class", "nodes")
        .attr("font-family", "sans-serif")
        .attr("font-size", 11)
        .selectAll("g");
}

export function drawSankeyLinks(link, data) {
    let updatedLinks = link
        .data(data.links)
        .enter().append("path")
    applyLinksConfiguration(updatedLinks)
}

export function applyLinksConfiguration(link) {
    link.attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function(d) { return Math.max(1, d.width); })
        .attr("class", function(d,i){
        let id = d.source.name+d.target.name
        while (id.includes(" ") || id.includes("\'") ) {
            id = id.replace(" ", "");
            id = id.replace("\'", "")
            id = id.replace("(", "")
            id = id.replace(")", "")
        }
        d.id = id
        return "link-"+d.id + " link";
        })
}

export function drawSankeyNodes(node, data, highlight, sankeyParametersArray, firstCategories, secondCategoryWithChild) {
    return applyNodesConfiguration(node
        .data(data.nodes)
        .enter().append("g"), highlight, sankeyParametersArray, firstCategories, secondCategoryWithChild)

}

export function applyNodesConfiguration(node, highlight, sankeyParametersArray, firstCategories, secondCategoryWithChild) {
    return node.on("mouseover",function(d,i) {
            highlight(d,i, false)
            panel.display(d, sankeyParametersArray, firstCategories, d3.mouse(this)[1])
            if(secondCategoryWithChild.has(d.name) && !firstCategories.has(d.name)) {
                d3.select(this).style("cursor", "pointer")
            }
        })
        .on("mouseout", function(d,i) {
            highlight(d,i, true)
            d3.select(this).style("cursor", "default")
        })
}

  /**
 * Generates the colored rectangles for the nodes
 */
export function drawSankeyNodesRects(node, color, func) {
    applyNodesRectsConfiguration(node.append("rect").on('click', function(d) { func(d.name) }), color, func)
}

export function applyNodesRectsConfiguration(node, color) {
    node.attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    .attr("height", function(d) { return (d.y1 - d.y0) > 4 ? (d.y1 - d.y0): 4; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("fill", function(d) { return  color(d.firstCat); })
}

  /**
 * Add a label for the note
 */
   export function addSankeyNodeLabels(node) {
    applyTextRectConfiguration(node.append("rect"))
    applyTextConfiguration(node.append("text"))
}

export function applyTextRectConfiguration(node) {
    node.attr("class", "textRect")
        .attr("x", function(d) { return d.x1 + 3; })
        .attr("y", function(d) { return (d.y1 + d.y0) / 2 - 8; })
        .style("fill", d3.color("white") )
        .style("fill-opacity", "6 0%")
        .style("filter", "url(#f1)")
        .attr("width", function(d) {
            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            context.font = "11px sans-serif";
            let width = context.measureText(d.name).width;
            return width + 4})
        .attr("height", "13")
}

export function applyTextConfiguration(node) {
    node.attr("x", function(d) { return d.x0 - 6; })
        .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(function(d) { return d.name; })
        .attr("x", function(d) { return d.x1 + 5; })
        .attr("text-anchor", "start");
}

export function setColorScale() {
    const types_colors = {
        "Vin": "#a61111",
        "Spiritueux": "#850006",
        "Champagne et mousseux": "#FEF5B4",
        "Porto et vin fortifié": "#7F006E",
        "Bière": "#C57335",
        "Cidre": "#B3672B",
        "Vin de dessert": "#AC923E",
        "Cooler et cocktail prémixé": "#aa00b0",
        "Apéritif": "#BA2A1B",
        "Saké": "#E7D1D4",
        "Article non alcoolisé": "#7A6E6C",
        "Hydromel": "#F8D943",
        "Poiré": "#FFE6AE"
    }
    return d3.scaleOrdinal().domain(Object.keys(types_colors)).range(Object.values(types_colors))
}