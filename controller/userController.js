const model = require("../Model/userSchema")
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const randomnumber = require("randomstring");

const config = {
    userEmail: "ajaat5942362@gmail.com",
    userPassword: "tanr xdmu uwqk yvhm",
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
            res.json({
                success: true,
                token: `Bearer ${token}`,
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
      const { email } = req.body;
  
      if (!email) {
        return res.json("Email is Required");
      }
  
      // Check if the email exists in your database
      const data = await model.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });
  
      if (!data) {
        return res.status(400).json("This email doesn't exist.");
      }
  
      // Generate a random OTP
      const OTP = randomnumber.generate({
        length: 4,
        charset: "numeric",
      });
  
      // Send OTP via email
      const mailOptions = {
        from: config.userEmail,
        to: email,
        subject: "Forgot password",
        text: `Your OTP  : ${OTP}`,
      };
  
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Change this to your email service provider
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: config.userEmail, // Change this to your email
          pass: config.userPassword, // Change this to your email password
        },
      });
  
      const updateUser = await model.findOneAndUpdate(
        { email: email },
        {
          otp: OTP,
        },
        { new: true, runValidators: true, useFindAndModify: false }
      );
      console.log(updateUser, "updateUser");
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error, "errro");
          return res.status(500).json("Failed to send email.");
        }
        console.log("Email sent: " + info.response);
  
        res.status(200).json({
          status: true,
          msg: "OTP has been sent successfully.",
          data: req.body,
        });
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
  
