// routes pr jo request aygi use handle krega,jse kisi ne sign up kra to
// sign up ka pura controll yha hoga
// forntend -> routes -> controller -> runs logic -> controller sned response to frontend

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";


// user rajistration controller function
export const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const exisitngUser = await userModel.findOne({ email });

    if (exisitngUser) {
      return res.json({ success: false, message: "user already exists" });
    }
    // to add new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    // create JWT Token for user
    // And stores that token in a secure cookie
    // So the user stays logged in for 7 days
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // send email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome",
      text: `Welcome to Mern Auth, your account has created with us ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    // getting user ID , but user is only giving otp input
    // then how we getting userID ?
    // getting userId from token and token is stored in cookies
    // need middleware to get the cookie, then find token, the  find userid
    // then user id will be added in req.body

    // req.body = req.body is the data sent from the frontend to the backend in an HTTP request.
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;

    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verificaiton otp",
      text: `Your otp is ${otp}. verify your account using this OTP`,
      // html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "verification otp sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "otp expired" });
    }

    user.isAccountVerified = true;

    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// check if user is Authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// send pass reset otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;

    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset otp",
      text: `Your otp for reset password is ${otp}.use this OTP to proceed with resetting your password`,
      // hmtl: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
    };
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: 'Otp sent to your email' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Reset User password
export const resetPassword = async  (req,res)=> {
   const {email,otp,newPassword} = req.body || {};

   if(!email || !otp || !newPassword){
    return res.json({ success: false, message: 'Email,OTP and new Password required' });
   }

   try {
    
      const user = await userModel.findOne({email});
      if(!user){
        return res.json({ success: false, message: 'user not found' });
      }

      if(user.resetOtp == "" || user.resetOtp !== otp){
        return res.json({ success: false, message: 'Invalid otp' });
      }

      if(user.resetOtpExpireAt < Date.now()){
        return res.json({ success: false, message: 'OTP Expired' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;

      user.resetOtp = '';
      user.resetOtp = '';
      user.resetOtpExpireAt = 0;
      await user.save();
      return res.json({ success: true, message: 'Password reset successfully' });
   } catch (error) {
    return res.json({ success: false, message: error.message });
   }
}