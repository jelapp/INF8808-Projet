'use strict'

import * as pre from './scripts/bubblechart/preprocess.js'

import * as menu from './scripts/menu.js'
import * as helper from './scripts/bubblechart/helper.js'
import * as mapHelper from './scripts/map/helper.js'
import * as BubbleChart from './scripts/bubblechart/bubble-chart.js'
import * as SankeyDiagram from './scripts/sankey/sankey-diagram.js'
import * as MapViz from './scripts/map/map-viz.js'

(function(d3) {
    const names = ['produits', 'inventaire', 'succursales', 'types', 'code-pays', 'sankey_data']
    const typings = [pre.type_produits, pre.type_inventaire, pre.type_succursales, pre.type_types, pre.type_code_pays, d3.autotype]
    var DATA = {}

    var all = []
    names.forEach(function(n, i) {
        var p = d3.csv(n + '.csv', typings[i])
            .then(helper.csvLoad)
            .then(function(data) {
                DATA[n] = data
            })
        all.push(p)
    })

    Promise.all(all)
        .then(function() {
            pre.preprocess(DATA)
            menu.init()
            BubbleChart.addChart()
            SankeyDiagram.addSankeyDiagrams(DATA.sankey_data)
            MapViz.addMap()

            window.onresize = function() {
                MapViz.mapResize()
            }
        })
})(d3)