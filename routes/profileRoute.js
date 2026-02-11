const express = require("express")
const router = express.Router()
const profileController = require("../controllers/profileController")
const { body } = require("express-validator")
const utilities = require("../utilities")

// Get profile
router.get("/", utilities.checkLogin, profileController.buildProfileView)

// Get edit profile page
router.get("/edit", utilities.checkLogin, profileController.buildEditProfileView)

// Update profile
router.post(
  "/update",
  utilities.checkLogin,
  [
    body("phone_number").optional().trim().isLength({ max: 20 }).withMessage("Phone must be 20 characters or less"),
    body("zip_code").optional().trim().isLength({ max: 10 }).withMessage("Zip code must be 10 characters or less"),
    body("state").optional().trim().isLength({ max: 2 }).withMessage("State must be 2 characters or less"),
  ],
  profileController.updateProfile
)

// Delete profile
router.post("/delete", utilities.checkLogin, profileController.deleteProfile)

module.exports = router
