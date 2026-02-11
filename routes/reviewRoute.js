const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")
const { body } = require("express-validator")
const utilities = require("../utilities")

// Get review form
router.get("/:invId/form", utilities.checkLogin, reviewController.buildReviewForm)

// Submit review
router.post(
  "/:invId",
  utilities.checkLogin,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("review_text").optional().trim().isLength({ max: 1000 }).withMessage("Review must be 1000 characters or less"),
  ],
  reviewController.submitReview
)

// Get reviews for inventory (public API)
router.get("/:invId", reviewController.getReviews)

// Delete review (owner or admin)
router.delete("/:reviewId", utilities.checkLogin, reviewController.deleteReview)

// View pending reviews (admin only)
router.get("/admin/pending", utilities.checkLogin, reviewController.viewPendingReviews)

// Approve review (admin only)
router.post("/:reviewId/approve", utilities.checkLogin, reviewController.approveReview)

module.exports = router
