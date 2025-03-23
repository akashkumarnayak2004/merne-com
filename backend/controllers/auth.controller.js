import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


const generateTokens=(userId)=>{
  const accessToken=jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
  const refreshToken=jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});
  return {accessToken,refreshToken};  

}
const storeRefreshToken=async(userId,refreshToken)=>{
  await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*60*60*24);//7days
}

const setCookies=(res,accessToken,refreshToken)=>{  
  res.cookie("accessToken",accessToken,{
    httpOnly:true,//httponly used to prevent xss attacks
    secure:process.env.NODE_ENV==="production", //secure used to prevent
    sameSite:"strict",//sameSite used to prevent csrf attacks
    maxAge:15*60*1000,//15 minutes
  });
  res.cookie("refreshToken",refreshToken,{
    httpOnly:true,//httponly used to prevent xss attacks
    secure:process.env.NODE_ENV==="production", //secure used to prevent
    sameSite:"strict",//sameSite used to prevent csrf attacks
    maxAge:7*24*60*60*1000,//7 days
  });
 
}
// export const signup = async (req, res) => {
//   const { name, email, password } = req.body;
//   console.log(refreshToken);
  
//  try {
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(403).json({ error: "User Already Exist!" });
//     }
//     const user= await User.create({name,email,password});

//     //authenticate
//     const {accessToken,refreshToken}=generateTokens(user._id);
//     await storeRefreshToken(user._id,refreshToken);

//     setCookies(res,accessToken,refreshToken);//set cookies

//     res.status(201).json({
//       _id:user._id,
//       name:user.name,
//       email:user.email,
//       role:user.role,
//     });
//  } catch (error) {
//   console.log("error in signup controller",error);
  
//     res.status(500).json({message:error.message});
//  }
// };
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(403).json({ error: "User Already Exist!" });
    }

    const user = await User.create({ name, email, password });

    // Authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);

    // 🔍 Debugging: Check if tokens are generated
    // console.log("Access Token:", accessToken);
    // console.log("Refresh Token:", refreshToken);

    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: error.message });
  }
};



export const login = async (req, res) => {
 try {
  const { email, password } = req.body
  const user = await User.findOne({ email });
  if(user && (await user.comparePassword(password))){
    //authenticate
    const {accessToken,refreshToken}=generateTokens(user._id);
    await storeRefreshToken(user._id,refreshToken);

    setCookies(res,accessToken,refreshToken);//set cookies

    res.status(200).json({
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
    })
 }}
  catch (error) {
    console.log("error in login controller",error);
    
  res.status(500).json({message:error.message});
 }
}

export const logout = async (req, res) => {
 try {
  const refreshToken=req.cookies.refreshToken;
  if(refreshToken){
    const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    await redis.del(`refresh_token:${decoded.userId}`);

  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({message:"Logged out successfully"});
 } catch (error) {
  console.log("error in logout controller",error);
  
  res.status(500).json({message:error.message});
 }
};
// this will refresh the acces token
export const refreshToken= async(req,res)=>{
  try {
    const refreshToken=req.cookies.refreshToken;
    if(!refreshToken) return res.status(401).json({message:"No refresh token provided"});
    const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    const storedToken=await redis.get(`refresh_token:${decoded.userId}`);

    if(storedToken!==refreshToken){
      return res.status(401).json({message:"Invalid refresh token"});
    }
    const accessToken=jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
    res.cookie("accessToken",accessToken,{
      httpOnly:true,//httponly used to prevent xss attacks
      secure:process.env.NODE_ENV==="production", //secure used to prevent
      sameSite:"strict",//sameSite used to prevent csrf attacks
      maxAge:15*60*1000,//15 minutes
    });
    res.status(200).json({message:"Access token refreshed successfully"});
  } catch (error) {
    res.status(500).json({message:error.message});
  }
};
export const getProfile = async (req, res) => {
  try {
    res.json(req.user); // ✅ Corrected this line
  } catch (error) {
    res.status(500).json({ message: "getProfile error" });
  }
};


//8Fpib0eKWwE9i43v 
