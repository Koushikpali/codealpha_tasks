//send otp
//requirement 
const user=require('../modeles/user')
const otpModel=require('../modeles/otp')
const otpgenerator=require('otp-generator')
const { Await } = require('react-router-dom')
const bcrypt=require('bcrypt')
const mailsender=require('../utils/mailSender')
const jwt = require('jsonwebtoken');  
require("dotenv").config()
const profile=require("../modeles/profile")

//otpfunction
exports.sendotp=async(request,res)=>{
try {
    const {email}=request.body

    //if user already pressent
    const check_user=await user.findOne({email})
    if(check_user){
        return res.status(401).json({
            success:false,
            message:'user already registered'
        })
    }

    //otp generate
    
        var otp=otpgenerator.generate(6,{
            upperCaseAlphabets:false
            ,lowerCaseAlphabets:false,
            specialChars:false

        })
      

        //check if unique
        const check=await otpModel.findOne({otp})
        
        if(check){
          var otp=otpgenerator.generate(6,{
            upperCaseAlphabets:false
            ,lowerCaseAlphabets:false,
            specialChars:false

        })

        }
         console.log("otp is generated",otp)

         const otppayload={email,otp}

         //create an entry for otp 
         const otpbody=await otpModel.create(otppayload)
         console.log(("otp is saved "),otpbody)
        
         res.status(200).json({
            success:true,
            message:'otp sent successfully',
            otp,
         })


    } catch (error) {
        console.log(error)
        res.status(200).json({
            success:false,
            message:'otp sent unsuccessfully',
            
         })
    }

}



 //signup
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastname,
      email,
      password,
      consfirmpassword,
      accountType,
      contactNumber,
      otp
    } = req.body;

    // validation
    if (!firstName || !lastname || !email || !password || !consfirmpassword || !otp) {
      return res.status(403).json({ success: false, message: "All fields are required" });
    }

    if (password !== consfirmpassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already registered' });
    }

    // get recent otp
    const most_recent_otp = await otpModel.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (!most_recent_otp.length || otp !== most_recent_otp[0].otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // optional expiry check if schema has expire field
    if (most_recent_otp[0].expire === 0) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await profile.create({
      gender: null,
      dateofbirth: null,
      about: null,
      contactNumber: contactNumber || null
    });

    const newUser = await user.create({
      firstName,
      lastName:lastname,
      email,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
     
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}${lastname}`,
     
    });

    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message
    });
  }
};


  
//login
exports.login = async (req, res) => {
  try {
    console.log("Login request received");  
    console.log("Request body:", req.body);

    // get data from req.body
    const { email, password } = req.body;
    console.log("Email:", email, "Password:", password);

    // validate data
    if (!email || !password) {
      console.log("Validation failed: email or password empty");
      return res.status(403).json({
        status: false,
        msg: 'email or password is empty'
      });
    }

    // user check exist
    console.log("Checking if user exists in database...");
    const userfound = await user.findOne({ email }).populate('additionalDetails');
    console.log("User found:", userfound);

    if (!userfound) {
      console.log("User not found in DB");
      return res.status(403).json({
        status: false,
        msg: 'user not found'
      });
    }

    // check password
    console.log("Checking password...");
    const isMatch = await bcrypt.compare(password, userfound.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password is wrong");
      return res.status(403).json({
        status: false,
        msg: 'password is wrong'
      });
    }

    // generate JWT
    console.log("Generating JWT token...");
    const payload = { id: userfound._id, email: userfound.email, accountType:userfound.accountType };
    const secretkey = process.env.JWDSECRETKEY;
    console.log("JWT Secret key:", secretkey);

    const token = jwt.sign(payload, secretkey, { expiresIn: '2h' });
    console.log("Token generated:", token);

    userfound.password = undefined;

    // create cookie
    console.log("Setting cookie...");
    const options = {
      expires: new Date(Date.now() + 3*24*60*60*1000), // fixed multiplier
      httpOnly: true,
      secure: false
    };

    res.cookie('token', token, options);
    console.log("Cookie set successfully");

    // send response
    console.log("Sending response...");
    return res.status(200).json({
      status: true,
      msg: 'login successful',
      token,
      user: userfound
    });

  } catch (error) {
    console.error("Internal server error caught:", error);
    return res.status(500).json({
      status: false,
      msg: 'internal server error'
    });
  }
}

//change password
exports.changePassword = async (req, res) => {
    try {
        // 1. Get user ID from the request object (assuming middleware populates it)
        const userId = req.user.id; 

        // 2. Get data from the request body, with correct spelling
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // 3. Basic validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are necessary'
            });
        }
        
        // 4. Fetch user details from the database
        const userDetails = await user.findById(userId);
        if (!userDetails) {
             return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // 5. Compare the old password with the hashed password in the database
        const isMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect old password'
            });
        }
        
        // 6. Check if the new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        // 7. Hash the new password before updating it
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 8. Update the user's password in the database
        await user.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
        
        // 9. Send a password change confirmation email
        
        mailsender(user.email,'Password changed successfully','Your password for your account has been changed successfully.');
        
        // 10. Send a successful response
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        // 11. Handle and log any errors
        console.error('Error in changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while changing the password'
        });
    }
};

