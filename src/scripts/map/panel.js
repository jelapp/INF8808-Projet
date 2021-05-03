/* eslint-disable jsdoc/require-param */
/**
 * Displays the information panel when a marker is clicked.
 */
export function display (d) {
  const panel = d3.select('#map-panel').style('visibility', 'visible')

  panel.selectAll('*').remove()

  const title = panel
    .append('div')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .style('margin-bottom', '10px')

  setTitle(title, d)

  const mode = panel
    .append('div')
    .style('font-size', '16px')

  addInfo(mode, d)
}

/**
 * Displays the title of the information panel.
 */
function setTitle (g, d) {
  g.text(d.nom)
}

/**
 * Displays succursale info in the panel
 */
function addInfo (g, d) {
  const addressLink = 'https://www.google.com/maps/search/?api=1&query=SAQ+' + d.ville + '+' + d.adresse
  const phoneLink = 'tel:' + d.tel

  g.append('div')
    .text(d.type)
    .style('margin-bottom', '20px')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
  g.append('div')
    .text('🌐 ' + d.region)
    .style('margin-bottom', '20px')
  g.append('text')
    .text('📍 ')
  g.append('a')
    .attr('href', addressLink)
    .attr('target', '_blank')
    .attr('rel', 'noopener noreferrer')
    .html(d.adresse + ', ' + d.ville)
    .style('margin-bottom', '20px')
  g.append('div')
    .style('margin-top', '20px')
  g.append('text')
    .text('☎️ ')
  g.append('a')
    .attr('href', phoneLink)
    .html(d.tel)
    .style('margin-bottom', '20px')
}
