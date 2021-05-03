/**
 * Add the options to the selector.
 *
 * @param {string} selector The id of the selector to which to add the options
 * @param {set} options The options to add to the selector

 */
 export function addSelectionOption(selector, options) {
    d3.select(selector).selectAll('.addedValue').remove()
    d3.select(selector).selectAll('option')
        .data(Array.from(options).sort())
        .enter()
        .append('option')
        .text(function(d) {
            return d
        })
        .attr('value', function(d) {
            return d
        })
        .attr('class', 'addedValue')
    d3.select(selector).node().value = 'all'
  }

  /**
 * Add the options to the selector.
 *
 * @param {string} selector The id of the selector to which to add the options
 * @param {set} options The options to add to the selector

 */
 export function addChangeListener(selector, func, sankeyParameters, color) {
    d3.select(selector).on('change', function() { 
        let succRegionName = d3.select(this).property('value');
        func(sankeyParameters, succRegionName, color);
    })
  }

  /**
 * Generates the SVG element g which will contain the sanky base.
 *
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function generateMapG (vizNumber) {
     d3.select('#svg-sanky' + vizNumber)
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white")
    
    return d3.select('#svg-sanky' + vizNumber).append('g')
    .attr('id', 'g-sanky' + vizNumber)
  }

    /**
 * Generates the SVG element g which will contain the sanky base.
 *
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function generateLegendG () {
    return d3.select('#svg-legend-sanky')
      .append('g')
      .attr('id', 'legend-sanky')
}