const openFct = function() {
    console.log('open')
    d3.select('#NavOverlay').style('width', '360px')
    d3.select('#modal-bg').classed('show-modal', true)
}

const closeFct = function() {
    d3.select('#NavOverlay').style('width', '0%')
    d3.select('#modal-bg').classed('show-modal', false)
}

/**
 *
 */
export function init() {
    d3.selectAll('.burgerMenu').each(function() {
        d3.select(this).on('click', openFct)
    })

    d3.select('#NavCloseBtn').on('click', closeFct)

    d3.select('#linkIntro').on('click', function() {
        navigateToSection('#IntroSection')
    })
    d3.select('#linkSecBubble').on('click', function() {
        navigateToSection('#BubbleChartSection')
    })
    d3.select('#linkSecMap').on('click', function() {
        navigateToSection('#SectionMap')
    })
    d3.select('#linkSecSankey').on('click', function() {
        navigateToSection('#SectionSankey')
    })
    d3.select('#ImgBubble').on('click', function() {
        navigateToSection('#BubbleChartSection')
    })
    d3.select('#ImgMap').on('click', function() {
        navigateToSection('#SectionMap')
    })
    d3.select('#ImgSankey').on('click', function() {
        navigateToSection('#SectionSankey')
    })

    d3.select('#NavOverlay').selectAll('.section-link')
        .style('cursor', 'pointer')
        .on('mouseover', function() {
            d3.select(this).style('text-decoration', 'underline')
        })
        .on('mouseout', function() {
            d3.select(this).style('text-decoration', 'none')
        })

    d3.select('#modal-bg')
        .on('click', closeFct)
}

/**
 * @param id
 */
function navigateToSection(id) {
    // console.log(id)
    // console.log(d3.select(id))
    // const pos = d3.select(id).node().getBoundingClientRect();
    const sections = d3.select('#container').node()
    sections.scrollTo(0, d3.select(id).node().offsetTop)
    closeFct()
}