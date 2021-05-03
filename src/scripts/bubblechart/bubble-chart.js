import * as tooltip from './tooltips.js'
import * as legend from './legend.js'
import * as helper from './helper.js'
import * as preprocess from './preprocess.js'
import * as rangeSelect from './range-select.js'
import * as viz from './viz.js'

import d3Tip from 'd3-tip'
import { extent, range } from 'd3-array'

const ANIMATION_DURATION = 400
const MAX_ZOOM = 10

let xAxis
let yAxis
let ORIGINAL_XSCALE
let ORIGINAL_YSCALE
let currentXScale
let currentYScale
let zoom
let zoomY
let gx
let gy
let dims

export function addChart() {
    d3.select("#svgBubble").remove()
    d3.select("#bubbleRangeSelect").remove()
    d3.selectAll(".d3-tip").remove()
    init()
}



function init() {

    dims = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 70,
        width: 0,
        height: 0,
        full_width: window.innerWidth - 35, //35 == scroll bar width
        full_height: window.innerHeight
    }
    if (dims.full_width > 1000) {
        dims.width = 0.75 * dims.full_width
        dims.left = dims.right = (dims.full_width - dims.width) / 2
    } else {
        dims.width = dims.full_width - dims.left - dims.right
    }
    dims.height = dims.full_height - dims.top - dims.bottom - 120
    const svg = d3
        .select("#BubbleChartSection")
        .append("svg")
        .attr("id", "svgBubble")
        .attr("width", dims.width + dims.left + dims.right)
        .attr("height", dims.height + dims.top + dims.bottom)

    svg.append("g")
        .attr("transform",
            "translate(" + dims.left + "," + 0 + ")")
        .attr("width", dims.width)
        .attr("height", dims.height + dims.bottom * 2)
        .attr("id", "bubbleArea")

    // clip path to restrict points to the chart's rect (between the axis)
    d3.select("#svgBubble")
        .append("clipPath")
        .attr("id", "products-clip")
        .append("rect")
        .attr("width", dims.width)
        .attr("height", dims.height)

    d3.select("#bubbleArea")
        .attr("clip-path", "url(#products-clip)")


    // tooltip
    const productTip = d3Tip().attr('class', 'd3-tip').html(function(d) { return tooltip.getProductCard(d) })
    productTip.direction(function(d) {
        var upper = currentYScale(d.disponibility) < (0.5 * dims.full_height)
        var left = currentXScale(d.prix) < (0.5 * dims.full_width)
        return (upper ? 's' : 'n') + (left ? 'e' : 'w') // easy way to safely show content without cropping
    })
    svg.call(productTip)

    const data = Object.values(preprocess.getProduits())

    //  scales x,y & bubble size
    ORIGINAL_YSCALE = d3.scaleLinear()
        .domain([0, 1])
        .range([dims.height, 0])
        .nice();

    ORIGINAL_XSCALE = d3.scaleLog()
        .domain([1.90, d3.max(data, (d) => d.prix) + 100])
        .range([0, dims.width])

    const maxRange = (dims.width * dims.height) / 100000 // dynamically determine proper bubble size 
    const sizeScale = d3.scaleLog().domain([1, d3.max(data.map((d) => d.total))]).range([2, maxRange]);

    const colorScale = preprocess.getColorScale1();
    addZoom(dims, dims.height)

    // labels
    helper.appendGraphLabels(svg)
    svg.select('.x.axis-text').attr('transform', 'translate(' + dims.full_width / 2 + ', ' + (dims.height + 70) + ')')
    svg.select('.y.axis-text').attr('transform', 'translate(' + (dims.left - 60) + ', ' + dims.height / 2 + ') rotate(-90)')


    legend.drawLegend(colorScale, sizeScale, build, d3.select("#svgBubble"), dims)
    viz.addBubbleUI(build, updateChart)
    rangeSelect.add("bubble-range", build, dims)
    addInfoTooltip(svg)
    addResetZoom(svg, build)
    build(preprocess.getTopProduits([50, 100]))

    function build(productsToShow) {
        if (!productsToShow) {
            productsToShow = getBubbleChartContent()
        }

        d3.select("#bubbleArea")
            .selectAll(".productCircle")
            .data(productsToShow)
            .join("circle")
            .attr("class", "productCircle")
            .attr("stroke", "black")
            .attr("stroke-width", "0.4")
            .attr("fill", (d) => colorScale(d.Cat1))
            .attr("r", (d) => sizeScale(d.total))
            .attr("cx", (d) => currentXScale(d.prix))
            .attr("cy", (d) => currentYScale(d.disponibility))
            .on('mouseover', function(d) {
                d3.select(this).attr("stroke-width", "2.5")
                productTip.show(d, this)
            })
            .on('mouseout', function() {
                d3.select(this).attr("stroke-width", "0.4")
                productTip.hide()
            })
            .on('click', function(d) {
                window.open(
                    'https://www.saq.com/fr/' + d.id,
                    '_blank' // in a new tab
                );
            })
            .style("cursor", "pointer")
        updateChart()
    }
}

function getBubbleChartContent() {
    const regionName = d3.select("#bubble-region").property('value')
    const succName = d3.select("#bubble-branch").property('value')
    const filter = d3.select("#selectFilter").property('value')
    const selectedRange = rangeSelect.getRange()
    return preprocess.getFilteredProducts(regionName, succName, filter, selectedRange[0], selectedRange[1])
}

function updateChart() {
    const newData = getBubbleChartContent()
    const dictionary = Object.assign({}, ...newData.map((x) => ({
        [x.id]: x
    })));
    d3.select("#bubbleArea")
        .selectAll(".productCircle").each(function(d) {
            d.subTotal = dictionary[d.id].subTotal
            d.SuccDispoCount = dictionary[d.id].SuccDispoCount
        })
    adjustZoomAndOpacity(newData)
}

const tx = () => d3.zoomTransform(gx.node());
const ty = () => d3.zoomTransform(gy.node());

function addZoom(dims) {
    // adapté de https://observablehq.com/@d3/x-y-zoom

    let svg = d3.select("#svgBubble")
    helper.appendAxes(svg)
    gx = svg.select('.x.axis');
    gy = svg.select('.y.axis');

    // z holds a copy of the previous transform, so we can track its changes
    let z = d3.zoomIdentity;

    xAxis = (g, scale) => g
        .attr("transform", `translate(${dims.left},${(dims.height + 30)})`)
        .call(d3.axisBottom(scale).tickSizeOuter(5).tickFormat(x => {
            if (x >= 1) {
                return `${x.toFixed(0)}`
            } else {
                return ``
            }
        }))

    yAxis = (g, scale) => g
        .attr("transform", `translate(${ORIGINAL_XSCALE.range()[0] + dims.left},5)`)
        .call(d3.axisLeft(scale).tickFormat(x => {
            // remplacer les extrêmes par des qualificatifs de la disponibilité
            if (x == 1) {
                return `Partout`
            } else if (x == 0) {
                return `Nulle part`
            } else if (x > 1 || x < 0) {
                return `` // inutile de mettre des poucentages en dehors de la plage
            } else {
                return `${(100 * x).toFixed(0)}%`
            }
        }))

    // set up the ancillary zooms and an accessor for their transforms
    const zoomX = d3.zoom().scaleExtent([0.8, MAX_ZOOM])
        .translateExtent([
            [ORIGINAL_XSCALE(1), 0],
            [ORIGINAL_XSCALE(ORIGINAL_XSCALE.domain()[1] + 1000000), 0]
        ])
    zoomY = d3.zoom().scaleExtent([0.8, MAX_ZOOM])
        .translateExtent([
            [0, ORIGINAL_YSCALE(1) - 100],
            [0, ORIGINAL_YSCALE(0) + 200]
        ])


    gx.call(zoomX).attr("pointer-events", "none");
    gy.call(zoomY).attr("pointer-events", "none");

    // active zooming
    zoom = d3.zoom().on("zoom", function() {
        const t = d3.event.transform;
        const k = t.k / z.k;
        const point = d3.mouse(this)
        const doX = point[0] > dims.left;
        const doY = point[1] < (dims.height);
        const shift = d3.event.sourceEvent && d3.event.sourceEvent.shiftKey;

        if (k === 1) {
            // pure translation?
            doX && gx.call(zoomX.translateBy, (t.x - z.x) / tx().k, 0);
            doY && gy.call(zoomY.translateBy, 0, (t.y - z.y) / ty().k);
        } else {
            // if not, we're zooming on a fixed point
            doX && gx.call(zoomX.scaleBy, shift ? 1 / k : k, point);
            doY && gy.call(zoomY.scaleBy, k, point);
        }

        z = t;

        redraw(k === 1);
    });

    svg.call(zoom)
        .call(zoom.transform, d3.zoomIdentity.scale(0.8))
}

function redraw(translation = false) {
    currentXScale = tx().rescaleX(ORIGINAL_XSCALE);
    currentYScale = ty().rescaleY(ORIGINAL_YSCALE);
    const animationTime = translation ? 0 : ANIMATION_DURATION

    gx.transition()
        .duration(animationTime)
        .call(xAxis, currentXScale);

    gy.transition()
        .duration(animationTime)
        .call(yAxis, currentYScale);

    d3.select("#bubbleArea")
        .selectAll(".productCircle")
        .transition()
        .duration(animationTime)
        .attr("cx", (d) => currentXScale(d.prix))
        .attr("cy", (d) => currentYScale(d.disponibility))
}

function addInfoTooltip(svg) {
    const infoChartTip = d3Tip().attr('class', 'd3-tip').html(function(d) { return tooltip.getInfo(d) })
    svg.call(infoChartTip)
    svg.select(".legendTitle")
        .on('mouseover', function() {
            infoChartTip.show("Les catégories peuvent être (dé)sélectionnées pour filtrer l'affichage.", this)
        })
        .on('mouseout', function() {
            infoChartTip.hide()
        })

    svg.select('.x.axis-text')
        .on('mouseover', function() {
            infoChartTip.show("Les prix sont égaux à travers le Québec (hormis les promotions). Cliquez pour l'explication officielle des prix.", this)
        })
        .on('mouseout', function() {
            infoChartTip.hide()
        })
    svg.select('.y.axis-text')
        .on('mouseover', function() {
            infoChartTip.show("La disponibilité des produits parmis les 407 succursales du Québec.", this)
        })
        .on('mouseout', function() {
            infoChartTip.hide()
        })
}

function adjustZoomAndOpacity(data) {
    const Y_EXTENT = d3.extent(data, (d) => d.disponibility)
    let k = (ORIGINAL_YSCALE(0) - ORIGINAL_YSCALE(1)) / (ORIGINAL_YSCALE(Y_EXTENT[0]) - ORIGINAL_YSCALE(Y_EXTENT[1]))
    k = Math.max(0.8, 0.8 * Math.min(k, MAX_ZOOM)); //clamp zoom

    // translate middle of the points to the middle of the viz
    const translateY = dims.height / (2 * k) - ((ORIGINAL_YSCALE(Y_EXTENT[1]) + ORIGINAL_YSCALE(Y_EXTENT[0])) / 2)

    const t = d3.zoomIdentity.scale(k).translate(0, translateY);

    gy.transition()
        .duration(ANIMATION_DURATION)
        .call(zoomY.transform, t)

    currentYScale = t.rescaleY(ORIGINAL_YSCALE);

    gy.transition()
        .duration(ANIMATION_DURATION)
        .call(yAxis, currentYScale);

    d3.select("#bubbleArea")
        .selectAll(".productCircle")
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("cx", (d) => currentXScale(d.prix))
        .attr("cy", (d) => currentYScale(d.disponibility))
        .attr("opacity", (d) => (d.subTotal > 0 ? 1 : 0.1)); //opacity update (problem if done separately)

}

function addResetZoom(svg, updateFct) {
    const offset = 60

    svg.append('rect')
        .attr('x', dims.full_width - offset)
        .attr('y', 30)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', 'rgb(305,255,255)')
        .attr('filter', 'url(#shadow-2)')
        .attr('id', 'bubble-reset-bg')

    svg.append('svg')
        .attr('x', dims.full_width - offset + 3)
        .attr('y', 33)
        .attr('width', 30)
        .attr('height', 30)
        // .attr('id', 'bubble-reset-path')
        .append('path')
        .attr('id', 'bubble-reset-icon')
        .attr('d', 'M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z')

    svg
        .append('rect')
        .attr('x', dims.full_width - offset)
        .attr('y', 25)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', 'transparent')
        // .attr('id', 'map-reset-btn')
        .on('mouseover', function() {
            d3.select(this)
                .style('cursor', 'pointer')

            d3.select('#bubble-reset-icon')
                .attr('fill', 'grey')
        })
        .on('mouseout', function() {
            d3.select('#bubble-reset-icon')
                .attr('fill', 'black')
        })
        .on('click', function() {
            preprocess.resetCategories()
            d3.selectAll(".legendOrdinal .legendCells .cell").style("opacity", 1)
            updateFct()
        })
        .append('title')
        .text('Réinitialiser les catégories')
}