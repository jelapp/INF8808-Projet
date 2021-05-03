/**
 * Gets the names of the regions.
 *
 * @param {object[]} data The data to analyze
 * @returns {string[]} The names of the regions in the data set
 */
 export function getRegionNames (data) {
    const regionSet = new Set()
    data.forEach(function(d) {regionSet.add(d.region)})
    regionSet.delete("all")
    return regionSet
}

/**
 * Gets the names of the branches.
 *
 * @param {object[]} data The data to analyze
 * @returns {string[]} The names of the branches in the data set
 */
 export function getBranchesNames (data) {
    const branchSet = new Set()
    data.forEach(function(d) {branchSet.add(d.succ_name)})
    branchSet.delete("all")
    return branchSet
}

/**
 * Gets the names of the first layer categories.
 *
 * @param {object[]} data The data to analyze
 * @returns {string[]} The names of the categories in the data set
 */
 export function getFirstCategories(data) {
    const categoriesSet = new Set()
    data.forEach(function(d) {categoriesSet.add(d.firstCat)})
    return categoriesSet
}

/**
 * Gets the names of the first layer categories.
 *
 * @param {object[]} data The data to analyze
 * @returns {string[]} The names of the categories in the data set
 */
 export function getSecondCategoryWithChild(data, firstCategories) {
    const categoriesSet = new Set()
    data.forEach(function(d) { !firstCategories.has(d.source)? categoriesSet.add(d.source): null})
    return categoriesSet
}

/**
 * Filter the data depending on the region.
 *
 * @param {object[]} data The data to analyze
 * @returns {object[]} The data filtered
 */
 export function filterRegion (data, regionName) {
    return data.filter(entry => entry.region == regionName && entry.succ_name == "all")
}

/**
 * Filter the data depending on the branch.
 *
 * @param {object[]} data The data to analyze
 * @returns {object[]} The data filtered
 */
 export function filterBranch (data, branchName) {
   return data.filter(entry => entry.succ_name == branchName)
}

/**
 * Filter the branch names based on the region.
 *
 * @param {object[]} data The data to analyze
 * @param {string} regionName The region for the branches
 * @returns {string[]} The branch names
 */
 export function getBranchesByRegion (data, regionName) {
    const filteredData = regionName == "all" ? data : data.filter(entry => entry.region == regionName)
    const branchSet = new Set()
    filteredData.forEach(function(d) {branchSet.add(d.succ_name)})
    branchSet.delete("all")
    return branchSet
 }

 /**
 * Filter the data based on the first category.
 *
 * @param {object[]} data The data to analyze
 * @param {string} firstCategory The first categories
 * @returns {object[]} The elements that contain first categories.
 */
  export function filterFirstCategories (data, firstCategory, secondCategory) {
    return data.filter(entry => firstCategory.has(entry.source) || entry.source == secondCategory)
 }

/**
 * Prepare the data for the sanky diagram.
 *
 * @param {object[]} data The data to analyze
 * @returns {object[]} The data prepared
 */
 export function prepareDataForGraph (data) {
    let sourceTargetDict = {}
    let categorySet = new Set()
    let dataFiltered = data.filter(function(d) { return d.source != "" && d.target != ""})
    let firstCat = {}
    dataFiltered.forEach(function(d) {
        firstCat[d.source] = d.firstCat
        firstCat[d.target] = d.firstCat
        categorySet.add(d.source)
        categorySet.add(d.target)
        if (d.source != d.target)
            sourceTargetDict[d.source + d.target] = {"source": d.source, "target": d.target, "value": d.value}
    })
    let nodes = Array.from(categorySet)
    let graph = {"nodes": nodes, "links": Object.values(sourceTargetDict)}
     // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d, "firstCat": firstCat[d] };
      });

    graph.links.sort((link1, link2) => link1.source.name - link2.source.name)
    return graph
 }
