/**
 * Generates the SVG element g which will contain the data visualisation.
 *
 * @param {object} margin The desired margins around the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function generateG(margin) {
    return d3.select('.graph')
        .select('svg')
        // .append('g')
        // .attr('id', 'graph-g')
        // .attr('transform',
        //   'translate(' + margin.left + ',' + margin.top + ')')
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
export function setCanvasSize(width, height) {
    d3.select('#swarm-plot')
        .attr('width', width)
        .attr('height', height)
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendAxes(g) {
    g.append('g')
        .attr('class', 'x axis')

    g.append('g')
        .attr('class', 'y axis')
}
/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendGraphLabels(g) {
    g.append('text')
        .text('Disponibilité au Québec (%) 💡')
        .attr('class', 'y axis-text')
        .attr('transform', 'rotate(-90)')
        .attr('font-size', 15)
        .style("text-shadow", "none")

    g.append('text')
        .text('Prix (CAD) 💡')
        .attr('class', 'x axis-text')
        .attr('font-size', 15)
        .style("text-shadow", "none")
        .style("cursor", "pointer")
        .on('click', function() {
            window.open(
                'https://www.saq.com/fr/prix-des-produits',
                '_blank' // in a new tab
            );
        })
}

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graphic
 */
export function drawXAxis(xScale, height) {
    d3.select('.x.axis')
        .attr('transform', 'translate( 0, ' + (height + 30) + ')')
        .call(d3.axisBottom(xScale).tickSizeOuter(5).tickArguments([8, '~s']))
}

/**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
export function drawYAxis(yScale) {
    d3.select('.y.axis')
        .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']).tickFormat(d3.format(".0%")))
}

/**
 * Places the graph's title.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function placeTitle(g) {
    g.append('text')
        .attr('class', 'title')
        .attr('x', 0)
        .attr('y', -20)
        .attr('font-size', 14)
}

/**
 * Draws the button to toggle the display year.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} year The year to display
 * @param {number} width The width of the graph, used to place the button
 */
export function drawButton(g, year, width) {
    const button = g.append('g')
        .attr('class', 'button')
        .attr('transform', 'translate(' + width + ', 140)')
        .attr('width', 130)
        .attr('height', 25)

    button.append('rect')
        .attr('width', 130)
        .attr('height', 30)
        .attr('fill', '#f4f6f4')
        .on('mouseenter', function() {
            d3.select(this).attr('stroke', '#362023')
        })
        .on('mouseleave', function() {
            d3.select(this).attr('stroke', '#f4f6f4')
        })

    button.append('text')
        .attr('x', 65)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'button-text')
        .text('See ' + year + ' dataset')
        .attr('font-size', '10px')
        .attr('fill', '#362023')
}

export function compareNom(a, b) {
    if (a.nom < b.nom) {
        return -1;
    }
    if (a.nom > b.nom) {
        return 1;
    }
    return 0;
}

export function getNSelection(g, search) {
    const selection = g.selectAll(search)
    if (selection._groups) {
        return selection._groups[0].length
    } else {
        return 0
    }
}

export function csvLoad(data) {
    if ("id" in data[0]) { //got an "id" => dict for lookup
        let dict = {}
        for (var i = 0; i < data.length; i++) {
            dict[data[i].id] = data[i]
        }
        return dict
    } else {
        let array = []
        for (var i = 0; i < data.length; i++) {
            array.push(data[i])
        }
        return array
    }
}