const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const roleModel = require("../models/role-model")
const utilities = require("../utilities")
const { validationResult } = require("express-validator")

const reviewCont = {}

/* ****************************
 *  Build review form
 **************************** */
reviewCont.buildReviewForm = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const invId = req.params.invId
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please log in to leave a review" }],
      })
    }

    const inventory = await invModel.getInventoryById(invId)
    if (!inventory) {
      return res.status(404).render("errors/404", {
        title: "Not Found",
        nav,
      })
    }

    const existingReview = await reviewModel.getReviewByAccountAndInventory(invId, accountId)

    res.render("inventory/review-form", {
      title: "Write a Review",
      nav,
      inventory,
      review: existingReview,
      errors: null,
    })
  } catch (error) {
    console.error("buildReviewForm error: " + error)
    next(error)
  }
}

/* ****************************
 *  Process review submission
 **************************** */
reviewCont.submitReview = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id
    const invId = req.params.invId
    const { rating, review_text } = req.body

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to submit a review",
      })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      })
    }

    const inventory = await invModel.getInventoryById(invId)
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      })
    }

    // Sanitize inputs
    const sanitizedText = review_text ? review_text.trim() : ""
    const sanitizedRating = Math.min(Math.max(parseInt(rating), 1), 5)

    const existingReview = await reviewModel.getReviewByAccountAndInventory(invId, accountId)

    let review
    if (existingReview) {
      review = await reviewModel.updateReview(
        existingReview.review_id,
        sanitizedRating,
        sanitizedText
      )
    } else {
      review = await reviewModel.addReview(invId, accountId, sanitizedRating, sanitizedText)
    }

    res.json({
      success: true,
      message: "Review submitted successfully! An admin will review it shortly.",
      review,
    })
  } catch (error) {
    console.error("submitReview error: " + error)
    res.status(500).json({
      success: false,
      message: "Error submitting review",
    })
  }
}

/* ****************************
 *  Get reviews for inventory
 **************************** */
reviewCont.getReviews = async function (req, res, next) {
  try {
    const invId = req.params.invId

    const reviews = await reviewModel.getReviewsByInventoryId(invId, true)
    const avgRating = await reviewModel.getAverageRating(invId)

    res.json({
      success: true,
      reviews,
      averageRating: avgRating?.average_rating || 0,
      totalReviews: avgRating?.total_reviews || 0,
    })
  } catch (error) {
    console.error("getReviews error: " + error)
    res.status(500).json({
      success: false,
      message: "Error retrieving reviews",
    })
  }
}

/* ****************************
 *  Delete review (owner or admin)
 **************************** */
reviewCont.deleteReview = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id
    const reviewId = req.params.reviewId

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      })
    }

    // Check if user is admin or owns the review
    const review = await reviewModel.getReviewById(reviewId)
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    const isAdmin = await roleModel.isAdmin(accountId)
    if (review.account_id !== accountId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this review",
      })
    }

    await reviewModel.deleteReview(reviewId)

    res.json({
      success: true,
      message: "Review deleted",
    })
  } catch (error) {
    console.error("deleteReview error: " + error)
    res.status(500).json({
      success: false,
      message: "Error deleting review",
    })
  }
}

/* ****************************
 *  View pending reviews (admin)
 **************************** */
reviewCont.viewPendingReviews = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please log in" }],
      })
    }

    const isAdmin = await roleModel.isAdmin(accountId)
    if (!isAdmin) {
      return res.status(403).render("errors/error", {
        title: "Access Denied",
        nav,
        message: "You do not have permission to view this page.",
      })
    }

    const reviews = await reviewModel.getPendingReviews()

    res.render("admin/pending-reviews", {
      title: "Pending Reviews",
      nav,
      reviews,
      errors: null,
    })
  } catch (error) {
    console.error("viewPendingReviews error: " + error)
    next(error)
  }
}

/* ****************************
 *  Approve review (admin)
 **************************** */
reviewCont.approveReview = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id
    const reviewId = req.params.reviewId

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      })
    }

    const isAdmin = await roleModel.isAdmin(accountId)
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    await reviewModel.approveReview(reviewId)

    res.json({
      success: true,
      message: "Review approved",
    })
  } catch (error) {
    console.error("approveReview error: " + error)
    res.status(500).json({
      success: false,
      message: "Error approving review",
    })
  }
}

module.exports = reviewCont
