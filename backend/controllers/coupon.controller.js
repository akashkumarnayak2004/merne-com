import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({userId:req.user._id,isActive:true});
        res.status(200).json(coupon ||null);
    } catch (error) {
        console.log("error in getCoupon controller",error);
        res.status(500).json({message:"server error",error:error.message});
        
    }
}
export const validateCoupon = async (req, res) => {
    try {
        const {code}=req.body;
        const coupon = await Coupon.findOne({code:code,userId:req.user._id,isActive:true});
        if(!coupon){
            return res.status(404).json({message:"Invalid coupon code"});
        }
        if(coupon.expirationDate < new Date()){
            coupon.isActive=false;
            await coupon.save();
            return res.status(404).json({message:"Coupon expired"});
        }
        res.status(200).json({
            code:coupon.code,

            discountPercentage:coupon.discountPercentage
        })
    } catch (error) {
        console.log("error in validateCoupon controller",error);
        res.status(500).json({message:"server error",error:error.message});
        
    }
}