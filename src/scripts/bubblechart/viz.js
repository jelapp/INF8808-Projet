import * as preprocess from './preprocess.js'

export function addBubbleUI(buildFct, updateFct) {

    d3.select("#bubble-region").selectAll('option')
        .data(preprocess.getRegions())
        .enter()
        .append('option')
        .text(function(d) {
            return d
        })
        .attr('value', function(d) {
            return d
        })

    d3.select("#bubble-region").on('change', function() {
        const regionName = d3.select(this).property('value')
        d3.select("#bubble-branch").selectAll('.addedValue').remove()
        d3.select("#bubble-branch").selectAll('option')
            .data(preprocess.getRegionsBranches(regionName))
            .enter()
            .append('option')
            .text(function(d) {
                return d.nom
            })
            .attr('value', function(d) {
                return d.id
            })
            .attr('class', 'addedValue')
        d3.select("#bubble-branch-button").select("span").text("Toutes les succursales")
        updateFct()
    })

    d3.select("#bubble-branch").selectAll('option')
        .data(preprocess.getRegionsBranches())
        .enter()
        .append('option')
        .text(function(d) {
            return d.nom
        })
        .attr('value', function(d) {
            return d.id
        })
        .attr('class', 'addedValue')

    d3.select("#bubble-branch").on('change', updateFct)

    d3.select("#selectFilter")
        .selectAll('option')
        .data(preprocess.getFilters())
        .enter()
        .append('option')
        .text(function(d) { return d.nom })
        .attr("value", function(d) { return d.attr })

    // When the button is changed, run the build function
    d3.select("#selectFilter").on("change", function(d) {
        var selectedAttr = d3.select(this).property("value")
        preprocess.changeCriteria(selectedAttr)
        buildFct()
    })
}