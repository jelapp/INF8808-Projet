/* eslint-disable jsdoc/require-returns */
/* eslint-disable no-undef */
/* eslint-disable jsdoc/require-param */

/**
 * Sets the color scale domain
 */
export function setColorScaleDomain (colorScale, mode) {
  const max = (mode === 0 ? 15 : 7.44)
  const min = (mode === 0 ? 0 : -1)
  colorScale.domain([min, max])
}

/**
 * Shows the current number of shown succursales
 */
export function showSuccCount (svg) {
  let count = 0
  d3.selectAll('#map-viz circle').each(function (d) {
    if (d3.select(this).style('visibility') !== 'hidden') {
      count++
    }
  })
  d3.select('#count')
    .html((count === 0 || count === 1) ? '<b>' + count + ' succursale affichée</b>' : '<b>' + count + ' succursales affichées</b>')
}

/**
 * Unselects the currently-selected succursale
 */
export function unselectSucc (currentZoom) {
  d3.select('#map-viz .selected')
    .transition()
    .duration('125')
    .attr('r', 7 / currentZoom.val)
    .style('stroke-width', 1 / currentZoom.val)
  d3.select('#map-viz .selected')
    .style('fill', function (d) {
      switch (d.type) {
        case 'SAQ':
          return 'red'
        case 'SAQ Sélection':
          return 'blue'
        case 'SAQ Express':
          return 'orange'
        case 'SAQ Dépôt':
          return 'purple'
        case 'SAQ Restauration':
          return 'yellow'
      }
    })
    .classed('selected', false)

  d3.selectAll('#map-viz .cancel')
    .classed('cancelled', false)

  d3.select('#map-panel')
    .style('visibility', 'hidden')
}

/**
 * Draws the SVG map
 */
export function drawMap (child, path, data, colorScale, currentZoom, succTypes) {
  child.append('g')
    .selectAll('#map-viz path')
    .data(data.features)
    .enter()
    .append('g')
    .append('path')
    .attr('d', path)
    .style('fill', function (d, i) {
      if (i !== 0) {
        return colorScale(d.properties.succ_par_hab)
      }
    })
    .style('stroke', 'white')
    .style('stroke-width', 1 / currentZoom.val)
    .attr('class', 'cancel')
    .on('mouseover', function (d) {
      // Show SVG region info panel
      showRegionInfoPanel(succTypes, d)

      // Increase stroke size
      d3.select(this)
        .style('stroke-width', 3 / currentZoom.val)
        .classed('hovered', true)

      // Highlight matching list entry
      d3.selectAll('#map-viz .rank li').each(function (d2) {
        if (d3.select(this).select('span').property('innerHTML') === d.properties.res_nm_reg) {
          d3.select(this).style('font-weight', 'bold')
        }
      })
    })
    .on('mouseout', function (d) {
      // do all reverse operations
      d3.selectAll('#map-viz .region-info').remove()
      d3.select('#map-viz .region-info-bg').remove()

      d3.select(this)
        .classed('hovered', false)
        .style('stroke-width', 1 / currentZoom.val)

      d3.selectAll('#map-viz .rank li').each(function (d2) {
        if (d3.select(this).select('span').property('innerHTML') === d.properties.res_nm_reg) {
          d3.select(this).style('font-weight', 'normal')
        }
      })
    })
    .on('click', function (d) {
      unselectSucc(currentZoom)
    })
}

/**
 * Show SVG info panel for the hovered region
 */
function showRegionInfoPanel (succTypes, d) {
  d3.select('#map-viz svg')
    .append('rect')
    .attr('x', document.getElementById('svg-map').clientWidth - 314)
    .attr('y', document.getElementById('svg-map').clientHeight - 145)
    .attr('rx', 12)
    .attr('ry', 12)
    .attr('width', 300)
    .attr('height', 110)
    .attr('fill', 'rgb(255,255,255)')
    .attr('filter', 'url(#shadow-1)')
    .attr('class', 'region-info-bg')

  d3.select('#map-viz svg')
    .append('text')
    .attr('x', document.getElementById('svg-map').clientWidth - 304)
    .attr('y', document.getElementById('svg-map').clientHeight - 115)
    .attr('class', 'region-info')
    .style('text-anchor', 'left')
    .style('font-size', 20)
    .text(d.properties.res_nm_reg)

  d3.select('#map-viz svg')
    .append('text')
    .attr('x', document.getElementById('svg-map').clientWidth - 304)
    .attr('y', document.getElementById('svg-map').clientHeight - 85)
    .attr('class', 'region-info')
    .style('text-anchor', 'left')
    .style('font-size', 15)
    .text('- ' + succTypes[d.properties.res_nm_reg].shown + ' succursales affichées')

  // select secondary info depending on the mode (by population or area)
  if (d3.select('#switch-map').property('value') === 'Switch 1') {
    d3.select('#map-viz svg')
      .append('text')
      .attr('x', document.getElementById('svg-map').clientWidth - 304)
      .attr('y', document.getElementById('svg-map').clientHeight - 55)
      .attr('class', 'region-info')
      .style('text-anchor', 'left')
      .style('font-size', 15)
      .text('- ' + getPopRatio(succTypes[d.properties.res_nm_reg]) + ' succursales/100 000 hab.')
  } else {
    d3.select('#map-viz svg')
      .append('text')
      .attr('x', document.getElementById('svg-map').clientWidth - 304)
      .attr('y', document.getElementById('svg-map').clientHeight - 55)
      .attr('class', 'region-info')
      .style('text-anchor', 'left')
      .style('font-size', 15)
      .text('- ' + getAreaRatio(succTypes[d.properties.res_nm_reg]) + ' succursales/10 000 km2')
  }
}

/**
 * Right-side succursale type selectors logic
 */
export function filtering (currentZoom, colorScale, succTypes) {
  d3.selectAll('#map-viz .ui-checkbox')
    .on('click', function (d) {
      const label = d3.select(this).select('label')
      const checkbox = d3.select(this).select('input')

      const type = checkbox.property('value')

      if (label.classed('ui-checkbox-on') === true) {
        // The "Tout" selector is clicked
        if (checkbox.property('value') === 'tout') {
          d3.selectAll('#map-viz .marker')
            .style('visibility', 'hidden')

          unselectSucc(currentZoom)

          d3.selectAll('#map-viz .ui-checkbox label').classed('ui-checkbox-off', true)
          d3.selectAll('#map-viz .ui-checkbox label').classed('ui-checkbox-on', false)
          // d3.selectAll('#map-viz .ui-checkbox input').attr('data-cacheval', function (d, i) { if (i !== 0) return true })
          d3.selectAll('#map-viz .ui-checkbox input').attr('checked', false)
          label.classed('ui-checkbox-off', false)
          label.classed('ui-checkbox-on', true)
        } else {
          d3.selectAll('#map-viz .marker')
            .style('visibility', function (d) {
              if (d.type === type) {
                if (d3.select(this).classed('selected')) {
                  unselectSucc(currentZoom)
                }
                return 'hidden'
              } else {
                return d3.select(this).style('visibility')
              }
            })
        }
      }
      if (label.classed('ui-checkbox-off') === true) {
        if (checkbox.property('value') === 'tout') {
          d3.selectAll('#map-viz .marker')
            .style('visibility', 'visible')

          d3.selectAll('#map-viz .ui-checkbox label').classed('ui-checkbox-off', false)
          d3.selectAll('#map-viz .ui-checkbox label').classed('ui-checkbox-on', true)
          // d3.selectAll('#map-viz .ui-checkbox input').attr('data-cacheval', function (d, i) { if (i !== 0) return false })
          d3.selectAll('#map-viz .ui-checkbox input').attr('checked', false)
          label.classed('ui-checkbox-off', true)
          label.classed('ui-checkbox-on', false)
        } else {
          d3.selectAll('#map-viz .marker')
            .style('visibility', function (d) {
              if (d.type === type) {
                return 'visible'
              } else {
                return d3.select(this).style('visibility')
              }
            })
        }
      }

      updateRegionRanking(succTypes, (d3.select('#switch-map').html() === '<i class="fas fa-sync-alt"></i>&nbsp;...par 100 000 habitants?' ? 0 : 1), colorScale)
      showSuccCount(d3.select('#map-viz svg'))
    })
}

/**
 * Add succursale markers to map
 */
export function addMapMarkers (child, data, panel, currentZoom) {
  child.append('g')
    .selectAll('#map-viz circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function (d) {
      return d.x
    })
    .attr('cy', function (d) {
      return d.y
    })
    .attr('r', 7)
    .attr('class', 'marker')
    .style('fill', function (d) {
      switch (d.type) {
        case 'SAQ':
          return 'red'
        case 'SAQ Sélection':
          return 'blue'
        case 'SAQ Express':
          return 'orange'
        case 'SAQ Dépôt':
          return 'purple'
        case 'SAQ Restauration':
          return 'yellow'
      }
    })
    .style('visibility', 'visible')
    .style('stroke', 'white')
    .style('stroke-width', 1)
    .on('click', function (d) {
      unselectSucc(currentZoom)
      panel.display(d)

      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 15 / currentZoom.val)
        .style('stroke-width', 3 / currentZoom.val)

      d3.select(this)
        .classed('selected', true)

      d3.selectAll('#map-viz .cancel')
        .classed('cancelled', true)
    })
    .on('mouseover', function (d) {
      if (d3.select(this).classed('selected') === false) {
        d3.select(this)
          .classed('hovered', true)
        d3.select(this)
          .transition()
          .duration(200)
          .style('stroke-width', 2 / currentZoom.val)
          .attr('r', 10 / currentZoom.val)
      }
    })
    .on('mouseout', function (d) {
      if (d3.select(this).classed('selected') !== true) {
        d3.select(this)
          .transition()
          .duration(125)
          .style('stroke-width', 1 / currentZoom.val)
          .attr('r', 7 / currentZoom.val)
      }
      d3.select(this)
        .classed('hovered', false)
    })
}

/**
 * Updates the list ranking of regions depending on selected types of succursales
 */
export function updateRegionRanking (succTypes, mode, colorScale) {
  d3.selectAll('#map-viz .para li').remove()
  d3.selectAll('#map-viz .para .trend').remove()

  // reset number of shown succursales
  Object.values(succTypes).forEach(element => {
    element.shown = 0
  })

  // update number of shown succursales
  d3.selectAll('#map-viz circle').each(function (d) {
    if (d3.select(this).style('visibility') !== 'hidden') {
      succTypes[d.region].shown = succTypes[d.region].shown + 1
    }
  })

  // sort regions by number of shown succursales
  const sortArray = []
  for (var region in succTypes) {
    sortArray.push([region, succTypes[region].shown / (mode === 1 ? succTypes[region].superficie : succTypes[region].population) * (mode === 1 ? 10000 : 100000)])
  }
  sortArray.sort(function (a, b) {
    return b[1] - a[1]
  })

  // add element to left-side list for every region
  sortArray.forEach(function (d, i) {
    d3.select('#map-viz .rank')
      .append('li')
      .html('<span>' + d[0] + '</span><span style="float: right">' + (Math.round(d[1] * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 1 }) + '</span>')
      .on('mouseover', function (d) {
        d3.select(this).style('font-weight', 'bold')

        const name = d3.select(this).select('span').property('innerHTML')

        // send mousover event to corresponding map element
        $('#map-viz path.cancel').each(function (i, d) {
          if (i !== 0 && $(this).prop('__data__').properties.res_nm_reg === name) {
            $(this).triggerSVGEvent('mouseover')
          }
        })
      })
      .on('mouseout', function (d) {
        d3.select(this).style('font-weight', 'normal')

        const name = d3.select(this).select('span').property('innerHTML')

        // send mouseout event to corresponding map element
        $('#map-viz path.cancel').each(function (i, d) {
          if (i !== 0 && $(this).prop('__data__').properties.res_nm_reg === name) {
            $(this).triggerSVGEvent('mouseout')
          }
        })
      })
  })

  // update map regions fill
  d3.selectAll('#map-viz path.cancel')
    .style('fill', function (d, i) {
      if (i !== 0) {
        if (mode === 0) {
          return colorScale(getPopRatio(succTypes[d.properties.res_nm_reg]))
        } else {
          return colorScale(Math.log(Math.round((succTypes[d.properties.res_nm_reg].shown / succTypes[d.properties.res_nm_reg].superficie * 10000) * 10) / 10))
        }
      }
    })
}

/**
 * Sends an event to an element
 * Source: https://blog.greatrexpectations.com/2015/06/12/faking-mouse-events-in-d3
 */
$.fn.triggerSVGEvent = function (eventName) {
  var event = document.createEvent('SVGEvents')
  event.initEvent(eventName, true, true)
  this[0].dispatchEvent(event)
  return $(this)
}

/**
 * Gets the string-formatted ratio between the number of succursales of a region and its population
 */
function getPopRatio (regionSuccs) {
  return (Math.round((regionSuccs.shown / regionSuccs.population * 100000) * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 1 })
}

/**
 * Gets the string-formatted ratio between the number of succursales of a region and its area
 */
function getAreaRatio (regionSuccs) {
  return (Math.round((regionSuccs.shown / regionSuccs.superficie * 10000) * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 1 })
}
