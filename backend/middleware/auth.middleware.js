import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectRoute =async (req, res, next) => {
   try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "You need to login" });
    }
 try {
    const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // Decode the token
    const user= await User.findById(decode.userId).select("-password");//get user from db
    if(!user){
      return res.status(404).json({message:"User not found"});    
    }
      req.user=user;
      next();
 
 } catch (error) {
    if(error.name==="TokenExpiredError"){
      return res.status(401).json({message:"Token expired"});
    }
    throw error;
 }
   } catch (error) {
    console.log("error in protectRoute middleware",error);
    res.status(500).json({message:"unauthorized invalid token",error:error.message}); 
    
   }
    };


    export const adminRoute = (req, res, next) => {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            res.status(401).json({ message: "Not authorized as an admin" });
        }
    }
