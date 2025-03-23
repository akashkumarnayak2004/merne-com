import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
export const getAllProducts=async(req,res)=>{
    try {
        const products=await Product.find({});//find all products
        res.status(200).json({products});//send products as response
    } catch (error) {
        console.log("error in getAllProducts controller",error);
        res.status(500).json({message:"server error",error:error.message});
    }
};
export const getFeaturedProducts=async(req,res)=>{
    try {
        let featuredProducts= await redis.get("featured_products");//get featured products from cache
        if(featuredProducts){
          return res.json(JSON.parse(featuredProducts));//send featured products as response
        }
        //if no featured products in cache fetch from mongo db
        featuredProducts=await Product.find({isFeatured:true}).lean();//find all featured products
        //  lean return js object instead if mongo db object which makes it easier to modify
        if(!featuredProducts){
            return res.status(404).json({message:"No featured products found"});
        }
        //store in redis for future quick access
        await redis.set("featured_products",JSON.stringify(featuredProducts));
        res.status(200).json({featuredProducts});//send featured products as response
    } catch (error) {
        console.log("error in getFeaturedProducts controller",error);
        res.status(500).json({message:"server error ",error:error.message});
        
    }
}
export const createProduct=async(req,res)=>{
    try {
        const {name,description,price,category,image}=req.body;
        let cloudinaryResponse= null;
        if(image){
          cloudinaryResponse=  await cloudinary.uploader.upload(image,{folder:"products"})
            
        }
        const product=await Product.create({name,description,price,category,image:cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : ""});
        res.status(201).json(product);
    } catch (error) {
        console.log("error in createProduct controller",error);
        res.status(500).json({message:"server error",error:error.message});
        
    }
}
export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Delete the product image from Cloudinary
		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0]; // Extract public ID
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("Image deleted from Cloudinary");
			} catch (error) {
				console.log("Error deleting image from Cloudinary:", error);
			}
		}

		// Correctly delete the product from MongoDB
		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


export const getRecommendedProducts=async(req,res)=>{
    try {
        const products= await Product.aggregate([
            {
                $sample:{size:3}//get 3 random products
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    price:1,
                    image:1,
                    description:1
                }
            }
        ])
        res.json(products);
    } catch (error) {
        console.log("error in getRecommendedProducts controller",error);
        res.status(500).json({message:"server error",error:error.message});
        
    }
}
export const getProductsByCategory=async(req,res)=>{
    const {category}=req.params;
    try {
        const products=await Product.find({category});//find all products in a category
        res.json({products});
    } catch (error) {
        console.log("error in getProductsByCategory controller",error);
        res.status(500).json({message:"server error",error:error.message});
        
    }
}
export const toggleFeaturedProduct=async(req,res)=>{
    try {
        const product=await Product.findById(req.params.id);//find product by id 
        if(product){
            product.isFeatured=!product.isFeatured;//toggle isFeatured if true make false and vice versa
          const updatedProduct=await product.save();//save updated product
          await updateFeaturedProductsCache();//update featured products cache
          res.json(updatedProduct);
        }else{
            res.status(404).json({message:"Product not found"});
        }
    } catch (error) {
       console.log("error in toggleFeaturedProduct controller",error);
         res.status(500).json({message:"server error",error:error.message});
        
    }
}
async function updateFeaturedProductsCache(){
    try {
        const featuredProducts=await Product.find({isFeatured:true}).lean();//find all featured products
        await redis.set("featured_products",JSON.stringify(featuredProducts));//update featured products
        
    } catch (error) {
       console.log("error in updateFeaturedProductsCache controller",error);
        
    }
}