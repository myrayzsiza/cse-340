const profileModel = require("../models/profile-model")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")

const profileCont = {}

/* ****************************
 *  Build profile view
 **************************** */
profileCont.buildProfileView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please log in to view your profile" }],
      })
    }

    const profile = await profileModel.getProfileByAccountId(accountId)
    const account = await accountModel.getAccountById(accountId)

    res.render("account/profile", {
      title: "My Profile",
      nav,
      profile,
      account,
      errors: null,
    })
  } catch (error) {
    console.error("buildProfileView error: " + error)
    next(error)
  }
}

/* ****************************
 *  Build edit profile view
 **************************** */
profileCont.buildEditProfileView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please log in to edit your profile" }],
      })
    }

    let profile = await profileModel.getProfileByAccountId(accountId)

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await profileModel.createProfile(accountId)
    }

    const account = await accountModel.getAccountById(accountId)

    res.render("account/edit-profile", {
      title: "Edit Profile",
      nav,
      profile,
      account,
      errors: null,
    })
  } catch (error) {
    console.error("buildEditProfileView error: " + error)
    next(error)
  }
}

/* ****************************
 *  Process update profile
 **************************** */
profileCont.updateProfile = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to update your profile",
      })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav()
      const profile = await profileModel.getProfileByAccountId(accountId)
      const account = await accountModel.getAccountById(accountId)

      return res.render("account/edit-profile", {
        title: "Edit Profile",
        nav,
        profile,
        account,
        errors: errors.array(),
      })
    }

    const profileData = {
      bio: req.body.bio || null,
      phone_number: req.body.phone_number || null,
      address: req.body.address || null,
      city: req.body.city || null,
      state: req.body.state || null,
      zip_code: req.body.zip_code || null,
      profile_picture: req.body.profile_picture || null,
    }

    // Sanitize inputs
    Object.keys(profileData).forEach((key) => {
      if (profileData[key]) {
        profileData[key] = profileData[key].trim()
      }
    })

    const updatedProfile = await profileModel.updateProfile(accountId, profileData)

    req.flash("notice", "Profile updated successfully!")
    res.redirect("/profile")
  } catch (error) {
    console.error("updateProfile error: " + error)
    next(error)
  }
}

/* ****************************
 *  Delete profile
 **************************** */
profileCont.deleteProfile = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      })
    }

    await profileModel.deleteProfile(accountId)

    req.flash("notice", "Profile deleted.")
    res.redirect("/")
  } catch (error) {
    console.error("deleteProfile error: " + error)
    next(error)
  }
}

module.exports = profileCont
