import * as preprocess from './preprocess.js'

export function getProductCard(d) {
    // TODO : Generate tooltip contents
    return `<img src=${preprocess.getCountryImageURL(d.pays)} style="float:left; display: block; width: 10%;">` +
        `<span style="float:right; font-size:11px; padding-top: 5px;">${getCategorieString(d)}</span><br>` +
        `<p style="text-align: center"><b>${d.nom}</b></p>` +
        `<p style="font-size:10px">${d.tauxAlcool}%` +
        `<span style="float:right; font-size:10px">${d.volume}ml</span></p>`
        // + `Origine : <span style="float:right;">${d.pays}</span>`
        +
        `<img src=${d.urlImage} style="max-width: 75%; min-height: 100px; max-height: 200px; display: block; margin: auto;">` +
        `<div style="width=100%; font-size:12px; text-align: justify; text-justify: inter-word;">Prix en succursale : ` +
        `<span style="float:right; font-weight: bold;">${d.prix.toFixed(2)}$</span><br>` +
        // `Nb d'unités : <span style="float:right;">${d.total + " "}</span><br>` +
        // `Disponibilité : <span style="float:right;">${(100 * d.disponibility).toFixed(2)}%</span>` +
        `${getDescription(d)}</div>`
        // `Sub Nb d'unités : <span style="float:right;">${d.subTotal}</span><br>` +
        // `Sub-disponibilité : <span style="float:right;">${d.SuccDispoCount}</span><br><br>`
}

function getCategorieString(d) {
    if (d.Cat1 == "Bière") {
        return d.Cat2 + d.Cat3.slice(5) // remove redundant "bière"
    } else if (d.Cat3 == "Boisson alcoolisée") {
        return d.Cat2
    } else if (d.Cat2 == "Alcool") {
        return d.Cat1
    } else {
        return d.Cat3 ? d.Cat3 : (d.Cat2 ? d.Cat2 : d.Cat1)
    }
}

function getDescription(d) {
    return getUnitDesc(d) + getRegionDesc(d)
}

function getUnitDesc(d) {
    const plural = d.subTotal > 1 ? "s" : ""
    if (d.subTotal == 0) {
        return "Non disponible"
    }
    return d.subTotal + " unité" + plural + " disponible" + plural
}

function getRegionDesc(d) {
    const regionName = d3.select("#bubble-region").property('value')
    const succID = d3.select("#bubble-branch").property('value')
    const succName = d3.select('#bubble-branch option:checked').text()

    let base = ``
    if (succID == "all" && d.SuccDispoCount != 0) {
        base = " dans " + d.SuccDispoCount + " succursale" + (d.SuccDispoCount > 1 ? "s" : '')
    }
    if (succID == "all" && regionName == "all") {
        return base + " au Québec"
    } else if (succID == "all") {
        return base + " dans " + regionName
    } else {
        return base + " à " + succName
    }
}

/*
  basic text tooltip for the 💡
*/
export function getInfo(d) {
    return `<p style="font-size:14px">${d}</p>`
}