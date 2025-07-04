const express = require("express");
const passport = require("passport");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  githubCallback,
  googleCallback,
} = require("../controllers/authController");

const router = express.Router();

console.log("--- Initializing authRoutes ---");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  githubCallback
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback
);

router.post("/forgotpassword", forgotPassword);

router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
