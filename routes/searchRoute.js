const express = require("express")
const router = express.Router()
const searchController = require("../controllers/searchController")

// Search page
router.get("/", searchController.buildSearchPage)

// Process search
router.get("/results", searchController.processSearch)

// API search endpoint
router.get("/api/search", searchController.apiSearch)

// Advanced search page
router.get("/advanced", searchController.advancedSearch)

// Process advanced search
router.post("/advanced/results", searchController.processAdvancedSearch)

module.exports = router
