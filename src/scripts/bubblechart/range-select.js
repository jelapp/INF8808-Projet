let selectedRange = [50, 100]

export function add(id, updateFct, dims, min = 0, max = 10) {
    // from https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush
    var range = [min, max]
    const ratioPercentile = 100 / max
    const beginRange = [max / 2, max]

    // set width and height of svg
    var w = dims.width * 0.20
    var h = 50
    var margin = {
        top: 0,
        bottom: 20,
        left: 10,
        right: 25
    }

    // dimensions of slider bar
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    // create x scale
    var x = d3.scaleLinear()
        .domain(range) // data space
        .range([0, width]); // display space

    // create svg and translated g
    var svg = d3.select("#" + id).append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "bubbleRangeSelect")

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

    // draw background lines
    g.append('g').selectAll('line')
        .data(d3.range(range[0], range[1] + 1))
        .enter()
        .append('line')
        .attr('x1', d => x(d)).attr('x2', d => x(d))
        .attr('y1', 0).attr('y2', height)
        .style('stroke', '#aaa')

    // labels
    var labelL = g.append('text')
        .attr('id', 'labelleft')
        .attr('x', 0)
        .attr('y', height + 5)
        .text(range[0])

    var labelR = g.append('text')
        .attr('id', 'labelright')
        .attr('x', 0)
        .attr('y', height + 5)
        .text(range[1])

    var getRange = function() {
        return d3.brushSelection(gBrush.node()).map(d => Math.round(x.invert(d)))
    }

    // define brush
    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height]
        ])
        .on('brush', function() {
            var s = d3.event.selection;
            // update and move labels
            labelL.attr('x', s[0])
                .text(ratioPercentile * Math.round(x.invert(s[0])))
            labelR.attr('x', s[1])
                .text(ratioPercentile * Math.round(x.invert(s[1])))
                // move brush handles      
            handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [s[i], -height / 4] + ")"; });
            // update view
            // if the view should only be updated after brushing is over, 
            // move these two lines into the on('end') part below
            svg.node().value = s.map(d => Math.round(x.invert(d)));
            svg.node().dispatchEvent(new CustomEvent("input"));
        })
        .on('end', function() {
            if (!d3.event.sourceEvent) return;
            var d0 = d3.event.selection.map(x.invert);
            var d1 = d0.map(Math.round)
            d3.select(this).transition().call(d3.event.target.move, d1.map(x))
            selectedRange = getRange().map((x) => x * ratioPercentile)
            updateFct()
        })

    // append brush to g
    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush)

    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function(d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
            "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
            "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    var handle = gBrush.selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("fill", '#eee')
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    // https://bl.ocks.org/mbostock/6498000
    gBrush.selectAll(".overlay")
        .each(function(d) { d.type = "selection"; })
        .on("mousedown touchstart", brushcentered)

    function brushcentered() {
        var dx = x(1) - x(0), // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
        d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }

    // select initial range
    gBrush.call(brush.move, beginRange.map(x))
}

export function getRange() {
    return selectedRange
}