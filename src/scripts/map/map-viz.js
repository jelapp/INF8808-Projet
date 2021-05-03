'use strict'

import * as helper from './helper.js'
import * as viz from './viz.js'
import * as legend from './legend.js'
import * as panel from './panel.js'
import * as d3Chromatic from 'd3-scale-chromatic'

let svgSize
let graphSize
let currentZoom
let margin
let colorScale
let child
let mapResizeFct
let succTypes

/**
 * Adds the map viz to the page
 */
export function addMap () {
  succTypes = {}
  svgSize = {
    width: 2000,
    height: 800
  }

  currentZoom = { val: 1 }
  margin = { top: 35, right: 200, bottom: 35, left: 200 }
  colorScale = d3.scaleSequential(d3Chromatic.interpolatePuRd)

  // initialize the svg zoom
  const zoom = d3.zoom()
    .scaleExtent([1, 200])
    .extent([
      [0, 0],
      [svgSize.width, svgSize.height]
    ])
    .on('zoom', function () {
      currentZoom.val = d3.event.transform.k
      child.attr('transform', d3.event.transform)
      d3
        .selectAll('#map-viz circle')
        .attr('r', 7 / d3.event.transform.k)
        .style('stroke-width', 1 / d3.event.transform.k)
      d3
        .selectAll('#map-viz circle.selected')
        .attr('r', 15 / d3.event.transform.k)
        .style('stroke-width', 3 / d3.event.transform.k)
      d3
        .selectAll('#map-viz circle.hovered')
        .attr('r', 10 / d3.event.transform.k)
        .style('stroke-width', 2 / d3.event.transform.k)

      d3
        .selectAll('#map-viz path')
        .style('stroke-width', 1 / d3.event.transform.k)
      d3
        .selectAll('#map-viz path.hovered')
        .style('stroke-width', 3 / d3.event.transform.k)

      d3.selectAll('#map-viz .mapLabel')
        .style('font-size', 12 / d3.event.transform.k)
    })

  const svg = d3.select('#map-viz').select('svg')
    .attr('width', svgSize.width)
    .attr('height', svgSize.height)
    .append('g')
    .call(zoom)

  // element hierarchy to fix finicky zoom
  const child1 = svg.append('g').attr('clip-path', 'url(#cut-off-bottom)')
  child = child1.append('g')

  helper.generateMapG(svgSize.width, svgSize.height)
  helper.generateMarkerG(svgSize.width, svgSize.height)

  viz.filtering(currentZoom, colorScale, succTypes)
  viz.setColorScaleDomain(colorScale, 0)

  legend.initGradient(colorScale)
  legend.initLegendBar()
  legend.initLegendAxis()

  setSizing()
  build(svg)

  helper.initSwitch(viz, legend, colorScale, graphSize, margin, succTypes)
  helper.initMapNav(svg, zoom)

  mapResizeFct = function () {
    helper.initMapNav(svg, zoom)
  }
}

/**
 *
 */
export function mapResize () {
  mapResizeFct()
}

function setSizing () {
  // bounds = d3.select('.graph').node().getBoundingClientRect()

  graphSize = {
    width: svgSize.width - margin.right - margin.left,
    height: svgSize.height - margin.bottom - margin.top
  }

  helper.setCanvasSize(svgSize.width, svgSize.height)
}

/**
 * This function builds the graph.
 */
function build (svg) {
  var projection = helper.getProjection()

  var path = helper.getPath(projection)

  const DATA = {}
  const promises = [
    d3.json('./regions.geojson').then(function (data) {
      DATA.geojson = data
    }),
    d3.csv('./succ_list.csv').then(function (data) {
      DATA.csv = data
    }),
    d3.csv('./succ_types.csv').then(function (data) {
      DATA.csvTypes = data
    })
  ]
  Promise.all(promises)
    .then(function () {
      // add svg map
      viz.drawMap(child, path, DATA.geojson, colorScale, currentZoom, succTypes)

      // convert succursales coordinates
      DATA.csv.forEach(succ => {
        const cartesianCoord = projection([succ.lon, succ.lat])
        succ.x = cartesianCoord[0]
        succ.y = cartesianCoord[1]
      })

      // add succursales markers on map
      viz.addMapMarkers(child, DATA.csv, panel, currentZoom)

      // show the shown succursales count
      viz.showSuccCount(svg)

      helper.initSuccTypeObject(DATA.csvTypes, succTypes)
      viz.updateRegionRanking(succTypes, 0, colorScale)
    })

  legend.draw(50, margin.top + 5, graphSize.height - 10, 15, 'url(#gradient)', colorScale, 0)
  legend.setLegendTitle('Succursales par 100 000 habitants')
}
