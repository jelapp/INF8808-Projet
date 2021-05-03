import * as helper from './helper.js'

const SUCC_REMOVE = new Set([23043, 23454, 23452]) //  vin en vrac (!= SAQ) ou fermé
const CLOUD = 0 // id signifiant magasin en ligne
const MIN_UNIT_TO_KEEP = 1 // 0 bottles == out of stock in Quebec, so ignore

let FULL_PRODUCTS
let currentProducts
let succursales
let inventaire
let types
let codes
let color_scale
let compareCriteria = "total";


export function preprocess(data) {
    setLocalCopies(data)
    removeUselessBranches()
    removeMisc()
    calculateTotalPerProduct(FULL_PRODUCTS)
    FULL_PRODUCTS = removeBelowMin(FULL_PRODUCTS, MIN_UNIT_TO_KEEP)
    calculateDisponibilityPerProduct(FULL_PRODUCTS)
    calculateTotalPerProduct(FULL_PRODUCTS, undefined, "subTotal")
    calculateDisponibilityPerProduct(FULL_PRODUCTS, undefined, "SuccDispoCount")
    addProductsCategories()
    removeNonLiquids()
    setTypeColorScale()
    currentProducts = getFullProductsCopy()
}

let removedCategories = new Set()
export function adjustCategories(catName) {
    if (removedCategories.has(catName)) {
        removedCategories.delete(catName)
    } else {
        removedCategories.add(catName)
    }
    return removedCategories
}

export function resetCategories() {
    removedCategories = new Set()
}

export function getProduits() {
    return Object.values(currentProducts)
}

function getFullProductsCopy() {
    return JSON.parse(JSON.stringify(FULL_PRODUCTS));
}

export function getNProduits() {
    return getProduits().length
}

let pastRange;
export function getTopProduits(percentileRange) {
    let range
    if (!percentileRange) {
        if (pastRange) {
            range = pastRange
        } else {
            range = [0, 100000]
        }
    } else {
        range = convertPercentileRange(percentileRange)
    }
    pastRange = range
    return Object.values(currentProducts).sort((a, b) => b[compareCriteria] - a[compareCriteria]).slice(Math.max(range[0] - 1, 0), Math.min(range[1], Object.values(currentProducts).length))
}

function convertPercentileRange(percentileRange) {
    const N = Object.keys(FULL_PRODUCTS).length
    const range = [Math.round(N - (percentileRange[1] / 100.0) * N), Math.round(N - ((percentileRange[0] - 1) / 100.0) * N)]
    return range
}


export function getSuccursales() {
    return Object.values(succursales)
}

export function getTypes() {
    return types
}

export function getColorScale1() {
    return color_scale
}

export function getFilters() {
    return [
        { nom: "Nombre d'unités", attr: "total" },
        { nom: "Taux d'alcool", attr: "tauxAlcool" },
        { nom: "Prix", attr: "prix" },
        { nom: "Disponibilité", attr: "disponibility" },
    ]
}

export function changeCriteria(attr) {
    compareCriteria = attr;
}

export function getFilteredProducts(regionName, succID, filter, lowerRange, upperRange) {
    const succIDs = getSelectionIDs(regionName, succID)
    currentProducts = getSelectionInventory(succIDs)
    changeCriteria(filter)
    return getTopProduits([lowerRange, upperRange]).filter((prod) => !removedCategories.has(prod.Cat1))
}

/*
    get inventory of any group of branches
*/
function getSelectionInventory(succIDs) {
    let newProducts = getFullProductsCopy()
    calculateTotalPerProduct(newProducts, succIDs, "subTotal")
    calculateDisponibilityPerProduct(newProducts, succIDs, "SuccDispoCount")
    return newProducts
}

/*
    return a set of ids for a branch/region/all of Québec
*/
function getSelectionIDs(regionName, succID) {
    if (succID != "all") {
        return new Set([+succID])
    } else if (regionName != "all") {
        return new Set(getRegionsBranches(regionName).map((d) => { return d.id }))
    } else {
        let ids = new Set(getSuccursales().map((d) => { return d.id }))
        ids.add(CLOUD) // cloud store has no entry, but should be accounted for
        return ids
    }
}

export function getRegions() {
    return Array.from(new Set(Object.values(succursales).map((d) => { return d.region }))).sort()
}

export function getRegionsBranches(regionName) {
    if (regionName == undefined || regionName == "all") {
        return Array.from(Object.values(succursales)).sort(helper.compareNom)
    }
    return Array.from(Object.values(succursales).filter((d) => { return d.region == regionName })).sort(helper.compareNom)
}

function setLocalCopies(data_dict) {
    FULL_PRODUCTS = data_dict["produits"]
    succursales = data_dict["succursales"]
    inventaire = data_dict["inventaire"]
    types = data_dict["types"]
    codes = data_dict["code-pays"]
}

function setTypeColorScale() {
    // types_colors = new Set(Object.values(types).map((d) => d.Cat1)) // better to explain
    const types_colors = {
        "Vin": "#a61111",
        "Spiritueux": "#850006",
        "Champagne et mousseux": "#FEF5B4",
        "Porto et vin fortifié": "#7F006E",
        "Bière": "#C57335",
        "Cidre": "#B3672B",
        "Vin de dessert": "#AC923E",
        "Cooler et cocktail prémixé": "#aa00b0",
        "Apéritif": "#BA2A1B",
        "Saké": "#E7D1D4",
        // "Article non alcoolisé": "#7A6E6C",
        "Hydromel": "#F8D943",
        "Poiré": "#FFE6AE"
    }
    color_scale = d3.scaleOrdinal().domain(Object.keys(types_colors)).range(Object.values(types_colors))
}

function removeMisc() {
    // id 14153964 because no price listed
    let products2Remove = [14153964]
    inventaire = inventaire.filter((entry) => !products2Remove.includes(entry.idProduit))
    const newProduits = {}
    for (const k of Object.keys(FULL_PRODUCTS)) {
        if (!products2Remove.includes(k)) {
            newProduits[k] = FULL_PRODUCTS[k]
        }
    }
    FULL_PRODUCTS = newProduits
}

/*
    add official SAQ types to our products
*/
function addProductsCategories() {
    for (const k of Object.keys(FULL_PRODUCTS)) {
        FULL_PRODUCTS[k]["Cat1"] = types[k].Cat1
        FULL_PRODUCTS[k]["Cat2"] = types[k].Cat2
        FULL_PRODUCTS[k]["Cat3"] = types[k].Cat3
    }
}

/**
 * Remove the vin en vrac and the closed branch
 */
function removeUselessBranches() {
    inventaire = inventaire.filter(entry => !SUCC_REMOVE.has(entry.idSucc))
    succursales = Object.fromEntries(Object.entries(succursales).filter(([k, v]) => !SUCC_REMOVE.has(v.id)));
}

/*
  add product total property
  also used to calculate total in region/branch
*/
function calculateTotalPerProduct(products, succsToCount, key = "total") {
    for (const produit of Object.values(products)) {
        produit[key] = 0
    }

    for (const entry of inventaire) {
        if (!succsToCount || succsToCount.has(entry.idSucc)) {
            if (products[entry.idProduit]) {
                products[entry.idProduit][key] += entry.nb
            }
        }
    }
}

export function getCountryImageURL(name) {
    return "https://www.countryflags.io/" + codes[name].code + "/flat/16.png"
}

/**
 * Remove product without  any bottles
 */
function removeBelowMin(products, min_value) {
    const newProduits = {}
    for (const k of Object.keys(products)) {
        if (products[k].total >= min_value) {
            newProduits[k] = products[k]
        }
    }
    // console.log("removed " + (Object.keys(products).length - Object.keys(newProduits).length) + " products below " + min_value + " units.")
    return newProduits
}

/*
  add product disponibility property
*/
function calculateDisponibilityPerProduct(products, succIDs, key = "disponibility") {
    for (const produit of Object.values(products)) {
        produit[key] = 0
    }

    for (const entry of inventaire.filter((entry) => (!succIDs || succIDs.has(entry.idSucc)))) {
        if (products[entry.idProduit]) {
            products[entry.idProduit][key] += 1
        }
    }
    let n_succ
    if (succIDs) {
        n_succ = succIDs.size
    } else {
        n_succ = Object.values(succursales).length
    }
    for (const produit of Object.values(products)) {
        if (key == "disponibility") {
            produit[key] /= n_succ
        }
    }

}

/**
 * Get succursale full inventory data by id ("total" updated for succ inventory)
 * @returns {[Object]} Arrat of product objects
 */
export function getSuccInventory(id) {
    const succItems = inventaire.filter(entry => id == entry.idSucc)
    const succInventory = []
    for (const item of succItems) {
        const copy = {
            ...currentProducts[item.idProduit]
        }
        copy.total = item.nb
        succInventory.push(copy)
    }
    return succInventory
}


function removeNonLiquids() {
    inventaire = inventaire.filter((entry) => types[entry.idProduit].Cat1 != "Article non alcoolisé")
    const newProduits = {}
    for (const k of Object.keys(FULL_PRODUCTS)) {
        if (FULL_PRODUCTS[k].Cat1 != "Article non alcoolisé") {
            newProduits[k] = FULL_PRODUCTS[k]
        }
    }
    FULL_PRODUCTS = newProduits
}


export function type_inventaire(d) {
    return {
        idProduit: +d.idProduit,
        idSucc: +d.idSucc,
        nb: +d.nb
    }
}

export function type_types(d) {
    return {
        id: +d.id,
        Cat1: d.Cat1,
        Cat2: d.Cat2,
        Cat3: d.Cat3,
    }
}

export function type_succursales(d) {
    return {
        adresse: d.adresse,
        // codePostal: d.codePostal, // don't care
        id: +d.id,
        lat: +d.lat,
        lon: +d.lon,
        nom: d.nom,
        // tel: d.tel, // don't care
        type: d.type,
        ville: d.ville,
        region: d.region
    }
}

export function type_produits(d) {
    return {
        // agentPromo: d.agentPromo, // don't care
        // code: +d.code, // don't care
        // cup: d.cup, //don't care
        id: +d.id,
        nom: d.nom,
        pays: d.pays,
        prix: +d.prix,
        // producteur: d.producteur, // don't care
        tauxAlcool: +d.tauxAlcool,
        type: d.type,
        urlImage: d.urlImage,
        volume: +d.volume
    }
}

export function type_code_pays(d) {
    return {
        id: d.id,
        code: d.code,
    }
}