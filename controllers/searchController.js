const searchModel = require("../models/search-model")
const utilities = require("../utilities")

const searchCont = {}

/* ****************************
 *  Build search page
 **************************** */
searchCont.buildSearchPage = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const makes = await searchModel.getDistinctMakes()

    res.render("inventory/search", {
      title: "Search Inventory",
      nav,
      makes,
      results: null,
      searchTerm: "",
      errors: null,
    })
  } catch (error) {
    console.error("buildSearchPage error: " + error)
    next(error)
  }
}

/* ****************************
 *  Process search
 **************************** */
searchCont.processSearch = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { searchTerm } = req.query
    const makes = await searchModel.getDistinctMakes()
    let results = []
    let errors = []

    if (!searchTerm || searchTerm.trim() === "") {
      errors.push({ msg: "Please enter a search term" })
    } else {
      // Sanitize search term
      const sanitizedTerm = searchTerm.trim().replace(/[<>]/g, "")
      results = await searchModel.searchInventory(sanitizedTerm)

      if (results.length === 0) {
        errors.push({ msg: "No results found" })
      }
    }

    res.render("inventory/search", {
      title: "Search Results",
      nav,
      makes,
      results,
      searchTerm: searchTerm || "",
      errors: errors.length > 0 ? errors : null,
    })
  } catch (error) {
    console.error("processSearch error: " + error)
    next(error)
  }
}

/* ****************************
 *  API search endpoint
 **************************** */
searchCont.apiSearch = async function (req, res, next) {
  try {
    const { searchTerm } = req.query

    if (!searchTerm || searchTerm.trim() === "") {
      return res.json({
        success: false,
        message: "Search term is required",
        results: [],
      })
    }

    const sanitizedTerm = searchTerm.trim().replace(/[<>]/g, "")
    const results = await searchModel.searchInventory(sanitizedTerm)

    res.json({
      success: true,
      count: results.length,
      results,
    })
  } catch (error) {
    console.error("apiSearch error: " + error)
    res.status(500).json({
      success: false,
      message: "Error searching inventory",
      results: [],
    })
  }
}

/* ****************************
 *  Advanced search
 **************************** */
searchCont.advancedSearch = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const makes = await searchModel.getDistinctMakes()

    res.render("inventory/advanced-search", {
      title: "Advanced Search",
      nav,
      makes,
      results: null,
      errors: null,
    })
  } catch (error) {
    console.error("advancedSearch error: " + error)
    next(error)
  }
}

/* ****************************
 *  Process advanced search
 **************************** */
searchCont.processAdvancedSearch = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const makes = await searchModel.getDistinctMakes()
    const filters = {}
    let errors = []

    // Sanitize and validate inputs
    if (req.body.make && req.body.make.trim() !== "") {
      filters.make = req.body.make.trim()
    }

    if (req.body.model && req.body.model.trim() !== "") {
      filters.model = req.body.model.trim()
    }

    if (req.body.minYear && req.body.minYear.trim() !== "") {
      const year = parseInt(req.body.minYear)
      if (!isNaN(year)) {
        filters.minYear = year
      }
    }

    if (req.body.maxYear && req.body.maxYear.trim() !== "") {
      const year = parseInt(req.body.maxYear)
      if (!isNaN(year)) {
        filters.maxYear = year
      }
    }

    if (req.body.minPrice && req.body.minPrice.trim() !== "") {
      const price = parseFloat(req.body.minPrice)
      if (!isNaN(price)) {
        filters.minPrice = price
      }
    }

    if (req.body.maxPrice && req.body.maxPrice.trim() !== "") {
      const price = parseFloat(req.body.maxPrice)
      if (!isNaN(price)) {
        filters.maxPrice = price
      }
    }

    if (Object.keys(filters).length === 0) {
      errors.push({ msg: "Please enter at least one search criterion" })
    }

    let results = []
    if (errors.length === 0) {
      results = await searchModel.advancedSearch(filters)
      if (results.length === 0) {
        errors.push({ msg: "No results found matching your criteria" })
      }
    }

    res.render("inventory/advanced-search", {
      title: "Advanced Search Results",
      nav,
      makes,
      results,
      filters: req.body,
      errors: errors.length > 0 ? errors : null,
    })
  } catch (error) {
    console.error("processAdvancedSearch error: " + error)
    next(error)
  }
}

module.exports = searchCont
