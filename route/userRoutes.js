const userController = require("../controller/userController");
const express = require('express');
const app = express();
const router =express.Router()

router.post("/Register",userController.Register);
router.post("/login",userController.Login);
router.get("/userList",userController.userList);
router.get("/userInfo",userController.userInfo);
router.post("/resetPassword",userController.ResetPassword);
router.post("/forgotPassword",userController.ForgetPassword);
router.post("/verifyOtp",userController.VerifyOTP);
router.post("/updatePassword",userController.updatePassword);


module.exports= router;