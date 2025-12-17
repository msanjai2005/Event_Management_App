import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const VerifyToken = async(req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({success:false,message:"UnAutherized user - no token available"});
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({success:false,message:"UnAutherized user - Invalid token"});
        }
        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            return res.status(404).json({success:false,message:"User Not Found - token"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in Verify Token");
        console.log(error.message);
         return res.status(500).json({
            success: false,
            message: "server error"
        });
    }
}