/**
 * Displays the information panel when a marker is clicked.
 *
 * @param {object} d The data bound to the clicked marker
 * @param {*} color The color scale used to select the title's color
 */
export function display (d, sankeyParametersArray, firstCategories, y) {
  const panel = d3.select('#sankey-panel').style('visibility', 'visible').style('margin-top', Math.min((y+60), 1230)+ 'px')
  panel.selectAll('*').remove()

  const title = panel
    .append('div')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .style('margin-bottom', '10px')

  setTitle(title, d)

  const distinctProduct = panel
    .append('div')
    .style('font-size', '16px')
    .text("Nombre de produits différents: ")

    let succ1Info = findInfo(d, sankeyParametersArray[0], firstCategories)
    let succ2Info = findInfo(d, sankeyParametersArray[1], firstCategories)

    const succ1 = panel
    .append('div')
    .style('font-size', '16px')
    .text(succ1Info.succName + ": " + succ1Info.succQuantity)

    const succ2 = panel
    .append('div')
    .style('font-size', '16px')
    .text(succ2Info.succName + ": " + succ2Info.succQuantity)

}

/**
 * Displays the title of the information panel. Its color matches the color of the
 * corresponding marker on the map.
 *
 * @param {*} g The d3 selection of the SVG g element containing the title
 * @param {object} d The data to display
 * @param {*} color The color scale to select the title's color
 */
function setTitle (g, d) {
  g.text(d.name)
}

function findInfo(d, sankeyParameters, firstCategories) {
    let succName
    let succQuantity = 0
    let succData
    if (sankeyParameters.regionFilter == "all" && sankeyParameters.branchFilter == "all") {
        succName = "Toutes les régions"        
        if (firstCategories.has(d.name)) {
            succData = sankeyParameters.data.filter((e) => e.region == "all" && e.succ_name == "all" && e.source == d.name)
            succData.forEach((f) => {succQuantity += parseInt(f.value)})
        } else {
            succData = sankeyParameters.data.find((e) => e.region == "all" && e.succ_name == "all" && e.target == d.name)
            succQuantity = succData? succData.value: 0
        }
        
    }  else if(sankeyParameters.branchFilter == "all") {
        succName =  sankeyParameters.regionFilter
        if (firstCategories.has(d.name)) {
            succData = sankeyParameters.data.filter((e) => e.region == succName && e.succ_name == "all" && e.source == d.name)
            succData.forEach((f) => succQuantity += parseInt(f.value))
        } else {
            succData = sankeyParameters.data.find((e) => e.region == succName && e.succ_name == "all" && e.target == d.name)
            succQuantity = succData? succData.value: 0
        }      
    } else {
        succName =  sankeyParameters.branchFilter
        if (firstCategories.has(d.name)) {
            succData = sankeyParameters.data.filter((e) =>  e.succ_name == succName && e.source == d.name)
            succData.forEach((f) => succQuantity += parseInt(f.value))
        } else {
            succData = sankeyParameters.data.find((e) =>  e.succ_name == succName && e.target == d.name)
            succQuantity = succData? succData.value: 0
        }   
    }

    return {'succName': succName, 'succQuantity': succQuantity}
}

