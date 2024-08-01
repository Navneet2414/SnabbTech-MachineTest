const model = require("../Model/userSchema");
const notification = require("../Model/notification");
const product = require("../Model/productSchema");

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const emailService = require("../common/nodemailer");
// const twilio = require('twilio');
const sendSMS =require("../common/sendSms");
const randomnumber = require("randomstring");
const fs = require("fs");
const path = require("path")
var FCM = require("fcm-node");


const config = {
    // userEmail: "ajaat5942362@gmail.com",
    // userPassword: "tanr xdmu uwqk yvhm",
    userEmail: "navneetyadavera@gmail.com",
        userPassword: "bmym jowj rovc vqod",
    secret: "St4rk_jatt",
  };


module.exports.Register = async (req, res, next) => {
    try {
        const { email, Name, password, Address, status } = req.body;


        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await model.findOne({ email });

        if (data) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const result = await model.create({
            email,
            Name,
            password: hashedPassword,
            Address,
            status
        });

        if (result) {
            res.status(200).json({ msg: "Successfully created", result });
        } else {
            res.status(404).json({ msg: "Record not created" });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ msg: "Something went wrong", error });
    }
};

module.exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;


        const user = await model.findOne({ email });


        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }


        const payload = {
            id: user._id,
            email: user.email,
        };

        jwt.sign(payload, 'SnabbTechMachineTest', { expiresIn: '1h' }, async (err, token) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create token' });
            }

            user.token = token;
            await user.save();
            const userId = user._id;

            const message =`hii ${user.Name} You have login successfully`
            const notify = await sendPushNotification(userId,message)
            console.log("notify",notify)
            res.json({
                success: true,
                token: `Bearer ${token}`,
                notify

                
            });
        });
    } catch (error) {
        console.log('error', error);
        res.status(500).json({ msg: 'Something went wrong', error });
    }
};

module.exports.userList = async (req, res, next) => {

    try {
        const result = await model.find({})
        if (result) {
            res.status(200).json({ msg: "success", result })

        } else {
            res.status(404).json("Not found Record");

        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ msg: "Something went wrong", error })
    }
}
module.exports.userInfo = async (req, res, next) => {

    try {
        const result = await model.findOne({ email: req.body.email })
        if (result) {
            res.status(200).json({ msg: "success", result })

        } else {
            res.status(404).json("Not found Record");

        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ msg: "Something went wrong", error })
    } 
}

module.exports.updatePassword = async (req, res, next) => {
    try {
        const { email, password, newPassword,confirmPassword} = req.body;

        const result = await model.findOne({ email });

        if (result) {
            const passwordMatch = await bcrypt.compare(password, result.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Incorrect current password' });
            }
            
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }


            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            result.password = hashedNewPassword;

            await result.save();

            return res.status(200).json({ msg: 'Password Update successfully', result });
        } else {
            return res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        console.log('Error', error);
        return res.status(500).json({ msg: 'Something went wrong', error });
    }
};


module.exports.ForgetPassword = async (req, res, next) => {
    try {
        const { email,phoneNo } = req.body;
        

        if (!email) {
            return res.json("Email is Required");
        }

        
        const data = await model.findOne({
            email: { $regex: `^${email}$`, $options: "i" },
        });

        if (!data) {
            return res.status(400).json("This email doesn't exist.");
        }

        // Generate a random OTP
        const OTP = Math.floor(1000 + Math.random() * 9000);

        // Update the user with the OTP
        const updateUser = await model.findOneAndUpdate(
            { email: email },
            { otp: OTP },
            { new: true, runValidators: true, useFindAndModify: false }
        );
        console.log(updateUser, "updateUser");
        try {
          await emailService.emailService({ 
              to: email,
              subject: 'Forgot password',
              message: `Your OTP: ${OTP}`,
          });
      } catch (error) {
          console.error('Failed to send email:', error);
          return res.status(500).json("Failed to send email.");
      }

        // Send SMS with the OTP
        try {
            // await sendSMS(`Your OTP: ${OTP}`, '+916394832414');
            await sendSMS(`Your OTP: ${OTP}`, `${phoneNo}`);
            console.log('SMS sent successfully');
        } catch (error) {
            console.error('Failed to send SMS:', error);
        }

        // Respond with success message
        res.status(200).json({
            status: true,
            msg: "OTP has been sent successfully.",
            data: req.body,
        });
    } catch (error) {
        next(error);
    }
};

  
  module.exports.VerifyOTP = async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      if (!email) {
        return res.status(400).json("Email is required.");
      }
      if (!otp) {
        return res.status(400).json("OTP is required.");
      }
  
      const data = await model.findOne({ email: email });
  
      if (!data) {
        
        return res.status(400).json("Email did not match.");
      }
  
      if (otp != data.otp) {
        return  res.status(400).json("Invalid OTP");
      }
  
      res.status(200).json({
        status: true,
        msg: "OTP has been verified successfully.",
      });
    } catch (error) {
      next(error);
    }
  };
  
module.exports.ResetPassword = async (req, res, next) => {
    try {
      const { email, password, confirmPassword } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
  
      if (!email) {
        return res.status(400).json("Email is Required");
      } 
      if (!password) {
        
        return res.status(400).json("Password is required.");
      }
      if (!confirmPassword) {
        
        return res.status(400).json("Confirm Password is required.");
      }
      if (password != confirmPassword) {
        
        return res.status(400).json("Password & confirm Password doesnot match");
      }
      if (password.length < 6) {
        return res.status(400).json("Password  must be greater than 6 digit");
      }
  
      // Check if the email exists in your database
  
      const data = await model.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });
  
      if (!data) {
        return res.status(400).json("This email doesn't exist.");
      }
  
      console.log(data, "datas");
      if (!data.otp) {
        return res.status(400).json("Unexpected authentication failure")
      }
  
      const updateUser = await model.findOneAndUpdate(
        { email: email },
        {
          password: hashedPassword,
          otp: "",
        },
        { new: true, runValidators: true, useFindAndModify: false }
      );
  
      res.status(200).json({
        status: true,
        msg: "Password has been changed successfully.",
        data: updateUser,
      });
    } catch (error) {
      next(error);
    }
  };
  

  // const FCMToken = require('../models/fcmToken');

// API endpoint to save FCM token
module.exports.saveFCMToken = async (req, res) => {
  try {
    const { userId, fcm_token } = req.body;

    // Validate input
    if (!userId || !fcm_token) {
      return res.status(400).json({ error: 'User ID and FCM token are required' });
    }
    if(userId){
      const userData = await notification.findOneAndUpdate(
       { userId:userId},
       {fcm_token:fcm_token},
       {new:true,upsert:true}

      )
      return res.json({msg:"TOken Uodated successfully",userData});

    }

    // Save FCM token to the database
    const token = new notification({ userId, fcm_token });
    await token.save();

    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'An error occurred while saving FCM token' });
  }
};


  const sendPushNotification = async(userId,message) => {

    try {
  
      console.log('User Id:- '+userId);
      console.log('message:- '+message);
  
      fs.readFile(path.join(__dirname,'../FireBaseConfig.json'), "utf8", async(err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err);
          return err;
        }
        try {
  
          console.log('messagetry:- '+message);
          //firebase push notification send
          const data = JSON.parse(jsonString);
          // var serverKey = data.SERVER_KEY;
          var serverKey ="AAAAw9abXlw:APA91bGigedBsq6VvtWotQGq5mt8euxAPPxQ3UsMh0QFiAW_atXj6INotz19gubP67t0gNWYA5eXuyi_mPxweNtdKTm6v01hYB9TVLFQI7S9YXPBAff6kDvNnpt2DAvxbc7wlVBsCxue";

          var fcm = new FCM(serverKey);
          // console.log("fcm",fcm);
  
          // var push_tokens = await notification.find({ 
          //   // where:{
          //     userId:userId,
          //     // fcm_token:fcm_token
          //   // }
          // });
          var push_tokens = "c3Y2bbwJqR_2VQ3SKEsSWT:APA91bEfKdfbSkEEj0HHcz15JyAOhozJdsnjbH8HbRufEYF7nWyymf-I5AKJuvJvjnLIz8Yn-a7neVCkGybi3_7b6z5OJqAONWIXaJ43xtZxo-dGELCWY5XKlNI8cg5zqJYVjWigV9J7"
          console.log("push_tokens",push_tokens);
          
          var reg_ids = [];
          // push_tokens.forEach(token => { 
            // reg_ids.push(token.fcm_token)
            reg_ids.push(push_tokens)
          // })
  
          if(reg_ids.length > 0){
  
            var pushMessage = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
              registration_ids:reg_ids,
              content_available: true,
              mutable_content: true,
              notification: {
                  body: message,
                  icon : 'myicon',//Default Icon
                  sound : 'mySound',//Default sound
                  // badge: badgeCount, example:1 or 2 or 3 or etc....
              },
              // data: {
              //   notification_type: 5,
              //   conversation_id:inputs.user_id,
              // }
            };
          console.log("pushmessage",pushMessage);
            fcm.send(pushMessage, function(err, response){
            // fcm.sendToMultipleToken(pushMessage, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!",err);
                } else {
                    console.log("Push notification sent.", response);
                }
            });
  
          }
  
  
        } catch (err) {
          console.log("Error parsing JSON string:", err);
        }
      });
  
    } catch (error) {
      console.log(error);
      res.json({msg:"Some error",error});
    }

  
  }


  // Search api

  module.exports.searchProduct = async(req,res,next)=>{
  try{
    const {email,Name,mobile,key} = req.body;
    let filter = {};

    if (Name) {
      filter = {
        Name: Name,
      };
    }
    if (mobile) {
      filter = {
        ...filter,
        mobile: mobile,
      };
    }
    if (email) {
      filter = {
        ...filter,
        email: email,
      };
    }
    if (key) {
      filter = {
        ...filter,
        $or: [
          { name: { $regex: key, $options: "i" } },
          { email: { $regex: key, $options: "i" } },
        ],
        // $or: [{ name: { $regex:req.body.key ,$options: "i"} }, { email: { $regex: req.body.key,$options:"i" } }],
      };
    }
    // console.log("mobile", mobile);
    // //   return;
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 2;
    let result = await model.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    if (result) {
      console.log(result);
      res.status(200).send({ Success: "Successfully filtered", result });
    } else {
      res.status(500).json({ success: false });
    }
  }catch(error){
    res.json({msg:"Something went wrong",error});
    console.log("error",error);
  }
  }

  module.exports.addProduct = async(req,res,next)=>{
    try{
      const {Name,Price,Discount,productImage} =req.body;
      // const Discount = 0.3; // 30%
        const discountPrice =Price-( Price*Discount/100)
      const result = await product.create({
        productName:Name,
        Price:Price,
        Discount,
        discountPrice,
        productImage

      })
      if(result){

        res.json({msg:"Successfully Product Added",result})
      }else{
        res.json({success:false,msg:"not Product Added"})
      }


    }catch(error){
      res.json({msg:"Something erorr",error});
    }
  }

  module.exports.updateProduct = async(req,res,next)=> {
   try{
    const {productName,Discount,Price,productImage} = req.body;
    const discountPrice =Price-( Price*Discount/100)

    const result = await product.findOneAndUpdate(
      {productName:productName},
      {
        productName,
        Discount,
        Price,
        discountPrice,
        productImage
      },
      {new:true,upsert:true}
      )
      if(result){
        res.json({msg:"succesfully Updated ",result})
      }else{
        res.json({msg:"Not updated"})
      }
    }catch(error){
     res.json({msg:"Something went Wrong",error});
    }
  }

  module.exports.deleteProduct = async(req,res,next) => {
   try{
    const productId = req.body._id;
  //   if (!mongoose.isValidObjectId(productId)) {
  //     return res.status(400).json({ success: false, message: 'Invalid product ID' });
  // }
const result = await product.findOneAndDelete({
  _id:productId,
})

if(result){
  res.json({msg:"Deleted product Successfully",result});

}else{
  res.json({msg:"Record not found"});

}

   }catch(error){
    console.log("error",error);

    res.json({msg:"something wrong",error});

   }  
  }

  // ############ For Testing Git account #########################


  module.exports.getData = async(req,res,next) => {
    try{
      const data = await product.find()
      if(data){

        res.json({msg:"Data Get Successfully",data})
      }else{
        res.json({msg:"Data not found"})
      }

    }catch(error){
      res.json({msg:"Some error ",error})

    }
  }