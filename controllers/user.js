import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";
import { User } from "../models/User.js";

export const register = TryCatch(async (req, res) => {
    const { email, name, password } = req.body;

    let user = await User.findOne({ email });

    if (user)
        return res.status(400).json({
            message: "User already exists",
        });
    
    const hashPassword = await bcrypt.hash(password, 10);
    
    user= { 
        name,
        email, 
        password: hashPassword,
     };
    
    const otp = Math.floor(Math.random() * 100000);

    const activationToken = jwt.sign(
        {
            user: { name, email, password: hashPassword },
            otp,
        },
        process.env.Activation_Secret,
        {
            expiresIn: "5m",
        }
    );
    const data = {
        name,
        otp,
    };


    await sendMail(email, "E-Learning OTP Verification", data);

    res.status(200).json({
        message: "OTP sent to your email",
        activationToken,
    });
});

export const verifyUser = TryCatch(async (req, res) => {
    const { otp, activationToken } = req.body;
    
    const verify = jwt.verify(activationToken, process.env.Activation_Secret);

    if(!verify)
        return res.status(400).json({
            message: " expired otp",
        });

    if (String(verify.otp) !== String(otp)) 
        return res.status(400).json({
            message: "Incorrect OTP",
        });

    await User.create({
        name: verify.user.name,
        email: verify.user.email,
        password: verify.user.password,
        });

    res.json({
        message: "User successfully registered",
    });
        
});

export const loginUser = TryCatch(async(req,res) => {
    const {email, password} =req.body

    const user = await User.findOne({email})

    if(!user) return res.status(400).json({
        message: "NO User with this email",
    });

    const mathPassword = await bcrypt.compare(password, user.password);

    if(!mathPassword)
        return res.status(400).json({
            message: "Wrong Password",
         });
        
    const token = await jwt.sign({_id: user._id}, process.env.Jwt_Sec, {
        expiresIn: "15d",


         });

    res.json({
        message: `Welcome back ${user.name}`,
        token,
        user,
    });
});


export const myProfile = TryCatch(async(req,res)=>{
    const user = await User.findById(req.user._id)

    res.json({ user });
});

