import d3Legend from 'd3-svg-legend'
import * as pre from './preprocess.js'

export function drawLegend(colorScale, sizeScale, updateFunc, g, dims) {

    // color legend
    const legend = g.append("g")
        .attr("class", "legendOrdinal")

    legend.append("rect")
        .attr("id", "legend-background")
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", "3px")

    let legendOrdinal = d3Legend.legendColor()
        .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
        .shapePadding(0)
        .scale(colorScale)
        .title("Catégories 💡")

    g.select(".legendOrdinal").call(legendOrdinal)

    g.select(".legendOrdinal")
    g.selectAll("text.label").style("font-size", "12px")
    g.selectAll("text.legendTitle").style("font-size", "16px")

    g.selectAll(".legendOrdinal .legendCells .cell").data(colorScale.domain()).enter()

    g.selectAll(".legendOrdinal .legendCells .cell")
        .on("click", function(d) {
            const toRemove = pre.adjustCategories(d)
            d3.select(this).style("opacity", toRemove.has(d) ? 0.3 : 1)
            updateFunc()
        })
        .on("mouseover", function(d) {
            d3.select(this).style("font-weight", "bold")
        })
        .on("mouseout", function(d) {
            d3.select(this).style("font-weight", "normal")
        })
        .style("cursor", "pointer")

    //legend background (to avoid reading interference from the bubbles)
    let bbox;
    const bboxMargin = 30
    g.selectAll(".legendOrdinal")
        .each(function() { bbox = this.getBBox() });

    legend.attr("transform", "translate(" + (dims.full_width - bbox.width - 50) + "," + (dims.top) + ")")

    g.selectAll(".legendOrdinal")
        .each(function() { bbox = this.getBBox() });
    g.select("#legend-background")
        .attr("width", bbox.width + bboxMargin + 10)
        .attr("height", bbox.height + bboxMargin + 50)
        .attr("x", bbox.x - bboxMargin / 3)
        .attr("y", bbox.y - bboxMargin / 2)

    // add size scale to legend
    const sizeData = [1, 10, 100, 1000, 10000, 100000]

    g.selectAll(".scaleCircle")
        .data(sizeData)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => { return dims.full_width - bbox.width - 47 + 33 * i })
        .attr("cy", dims.top + bbox.y + bbox.height + 35)
        .attr("r", (d) => { return sizeScale(d) })
        // .attr("fill", "black")
        .attr("class", "scaleCircle")

    g.selectAll(".scaleText")
        .data(sizeData)
        .enter()
        .append("text")
        .attr("class", "scaleText")
        .attr("x", (d, i) => { return dims.full_width - bbox.width - 50 + 30 * i })
        .attr("y", dims.top + bbox.y + bbox.height + 55)
        .text((d) => d)
        .style("font-size", 10)

    g.append("text")
        .attr("class", "scaleDesc")
        .attr("x", dims.full_width - bbox.width - 44)
        .attr("y", dims.top + bbox.y + bbox.height + 20)
        .text("Inventaire au Québec (unités)")
        .style("font-size", 12)
        .style("font-weight", "bold")


}