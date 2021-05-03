/* eslint-disable jsdoc/require-returns */

/**
 * Generates the SVG element g which will contain the map base.
 */
export function generateMapG (width, height) {
  return d3.select('#map-viz')
    .select('svg')
    .append('g')
    .attr('id', 'map-g')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Generates the SVG element g which will contain the map markers.
 */
export function generateMarkerG (width, height) {
  return d3.select('#map-viz')
    .select('svg')
    .append('g')
    .attr('id', 'marker-g')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
export function setCanvasSize (width, height) {
  d3.select('#map-viz').select('svg')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Initializes the div which will contain the information panel.
 */
export function initPanelDiv () {
  d3.select('#map-panel')
    .style('width', '215px')
    .style('border', '1px solid black')
    .style('padding', '10px')
}

/**
 * Initializes the switch button
 */
export function initSwitch (viz, legend, colorScale, graphSize, margin, succTypes) {
  d3.select('#switch-map')
    .on('click', function (d) {
      // if we're in the first mode
      if (d3.select(this).html() === '<i class="fas fa-sync-alt"></i>&nbsp;...par 100 000 habitants?') {
        // update legend
        viz.setColorScaleDomain(colorScale, 1)
        legend.initGradient(colorScale)
        legend.initLegendBar()
        legend.initLegendAxis()
        legend.draw(50, margin.top + 5, graphSize.height - 10, 15, 'url(#gradient)', colorScale, 1)
        legend.setLegendTitle('Succursales par 10 000 km2')
        d3.select('.legend-title-bg')
          .attr('width', 215)

        // change map regions fill
        d3.selectAll('#map-viz path.cancel')
          .style('fill', function (d, i) {
            if (i !== 0) {
              return colorScale(Math.log(d.properties.succ_par_km2))
            }
          })

        // update switch button
        d3.select(this).html('<i class="fas fa-sync-alt"></i>&nbsp;... par 10 000 km<sup>2</sup>?')
        d3.select(this).attr('value', 'Switch 2')

        viz.updateRegionRanking(succTypes, 1, colorScale)
      } else {
        // update legend
        viz.setColorScaleDomain(colorScale, 0)
        legend.initGradient(colorScale)
        legend.initLegendBar()
        legend.initLegendAxis()
        legend.draw(50, margin.top + 5, graphSize.height - 10, 15, 'url(#gradient)', colorScale, 0)
        legend.setLegendTitle('Succursales par 100 000 habitants')
        d3.select('.legend-title-bg')
          .attr('width', 255)

        // change map regions fill
        d3.selectAll('#map-viz path.cancel')
          .style('fill', function (d, i) {
            if (i !== 0) {
              return colorScale(d.properties.succ_par_hab)
            }
          })

        // update switch button
        d3.select(this).html('<i class="fas fa-sync-alt"></i>&nbsp;...par 100 000 habitants?')
        d3.select(this).attr('value', 'Switch 1')

        viz.updateRegionRanking(succTypes, 0, colorScale)
      }
    })
}

/**
 * Initializes the simulation used to place the circles
 */
export function getSimulation (data) {
  return d3.forceSimulation(data.features)
    .alphaDecay(0)
    .velocityDecay(0.75)
    .force('collision',
      d3.forceCollide(function (d) {
        return Math.sqrt(d.properties.succ_par_hab) * 14
      })
        .strength(1)
    )
}

/**
 * Update the (x, y) position of the circles'
 * centers on each tick of the simulation.
 */
export function simulate (simulation) {
  simulation.on('tick', () => {
    d3.selectAll('.marker')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
  })
}

/**
 * Sets up the projection to be used.
 */
export function getProjection () {
  return d3.geoMercator()
    .center([-72.304095, 52.277163])
    .scale(2600)
}

/**
 * Sets up the path to be used.
 */
export function getPath (projection) {
  return d3.geoPath()
    .projection(projection)
}

/**
 * Initializes map reset button
 */
export function initMapNav (svg, zoom) {
  d3.select('#map-reset-bg').remove()
  d3.select('#map-reset-icon').remove()
  d3.select('#map-reset-btn').remove()

  d3.select('#map-viz svg')
    .append('rect')
    .attr('x', document.getElementById('svg-map').clientWidth - 50)
    .attr('y', 50)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('width', 30)
    .attr('height', 30)
    .attr('fill', 'rgb(255,255,255)')
    .attr('filter', 'url(#shadow-2)')
    .attr('id', 'map-reset-bg')

  d3.select('#map-viz svg')
    .append('svg')
    .attr('x', document.getElementById('svg-map').clientWidth - 47)
    .attr('y', 53)
    .attr('width', 30)
    .attr('height', 30)
    .attr('id', 'map-reset-path')
    .append('path')
    .attr('id', 'map-reset-icon')
    .attr('d', 'M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z')

  d3.select('#map-viz svg')
    .append('rect')
    .attr('x', document.getElementById('svg-map').clientWidth - 50)
    .attr('y', 50)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('width', 30)
    .attr('height', 30)
    .attr('fill', 'transparent')
    .attr('id', 'map-reset-btn')
    .on('mouseover', function () {
      d3.select(this)
        .style('cursor', 'pointer')

      d3.select('#map-reset-icon')
        .attr('fill', 'grey')
    })
    .on('mouseout', function () {
      d3.select('#map-reset-icon')
        .attr('fill', 'black')
    })
    .on('click', function () {
      svg
        .transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity.scale(1))
    })
    .append('title')
    .text('Recentrer la carte')
}

/**
 * Initializes the succTypes object (an object containing info about regions and its succursales)
 */
export function initSuccTypeObject (data, succTypes) {
  data.forEach(element => {
    succTypes[element.region] = element
    succTypes[element.region].shown = 0
  })
}
