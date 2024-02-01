const userController = require("../controller/userController");
const express = require('express');
const app = express();
const router =express.Router();
const Auth = require("../common/authentication");

router.post("/Register",userController.Register);
router.post("/login",userController.Login);
router.get("/userList",userController.userList);
router.get("/userInfo",userController.userInfo);
router.post("/resetPassword",userController.ResetPassword);
router.post("/forgotPassword",userController.ForgetPassword);
router.post("/verifyOtp",userController.VerifyOTP);
router.post("/updatePassword",userController.updatePassword);
// router.post("/userCreate",userController.userCreate);


module.exports= router;