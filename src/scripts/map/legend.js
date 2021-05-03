/* eslint-disable jsdoc/require-param */

/**
 * Initializes the definition for the gradient to use with the
 * given colorScale.
 */
export function initGradient (colorScale) {
  const svg = d3.select('#map-viz').select('svg')

  const defs = svg.append('defs')

  const linearGradient = defs
    .append('linearGradient')
    .attr('id', 'gradient')
    .attr('x1', 0).attr('y1', 1).attr('x2', 0).attr('y2', 0)

  linearGradient.selectAll('stop')
    .data(colorScale.ticks().map((tick, i, nodes) => (
      {
        offset: `${100 * (i / nodes.length)}%`,
        color: colorScale(tick)
      })))
    .join('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color)
}

/**
 * Initializes the SVG rectangle for the legend.
 */
export function initLegendBar () {
  const svg = d3.select('#map-viz').select('svg')
  svg.append('rect').attr('class', 'legend bar')
}

/**
 *  Initializes the group for the legend's axis.
 */
export function initLegendAxis () {
  const svg = d3.select('#map-viz').select('svg')
  svg
    .append('g')
    .attr('class', 'legend axis')
}

/**
 * Draws the legend to the left of the graphic.
 */
export function draw (x, y, height, width, fill, colorScale, mode) {
  d3.select('#map-viz .legend.bar')
    .attr('x', x)
    .attr('y', y)
    .attr('height', height)
    .attr('width', width)
    .attr('fill', fill)

  const legendScale = d3.scaleLinear().domain([0, colorScale.domain()[1]]).range([height, 0])

  d3.select('#map-viz .legend.axis')
    .attr('transform', 'translate(' + 50 + ',' + 35 + ')')
    .style('font-size', '14px')
    .call(d3.axisLeft(legendScale).ticks(6).tickFormat(function (d) { return (mode === 0 ? d : Math.floor(Math.exp(d))) }))
}

/**
 * Sets the legend title
 */
export function setLegendTitle (text) {
  d3.select('#map-viz .legend-title').remove()
  d3.select('#map-viz .legend-title-bg').remove()
  d3.select('#map-viz svg')
    .append('rect')
    .attr('x', 45)
    .attr('y', 765)
    .attr('rx', 12)
    .attr('ry', 12)
    .attr('width', 255)
    .attr('height', 45)
    .attr('fill', 'rgb(255,255,255)')
    .attr('filter', 'url(#shadow-1)')
    .attr('class', 'legend-title-bg')
  d3.select('#map-viz svg')
    .append('text')
    .attr('x', 50)
    .attr('y', 793)
    .attr('class', 'legend-title')
    .style('text-anchor', 'left')
    .text(text)
}
