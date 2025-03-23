import Product from "../models/product.model.js";


export const addToCart = async (req, res) => {
    try {
        const {productId}=req.body;
        const user = req.user;
        const existingItem=user.cartItems.find((item)=>item.id===productId);//check if item already exists in cart
        if(existingItem){
            existingItem.quantity+=1;
        }else{
            user.cartItems.push(productId);//add item to cart if new
        }
        await user.save();
        res.json(user.cartItems);
        
    } catch (error) {
        console.log("error in addToCart controller",error);
        res.status(500).json({message:"server error",error:error.message});
        
    }
}
export const removeAllFromCart = async (req, res) => {
    try {
        const {productId}=req.body;
        const user = req.user;
        if(!productId){
            user.cartItems=[];
        }else{
            user.cartItems=user.cartItems.filter((item)=> item.id !== productId);//remove item from cart
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
       res.status(500).json({message:"server error",error:error.message}); 
    }
}
export const updateQuantity = async (req, res) => {
    try {
        const {id:productId}=req.params;
        const {quantity}=req.body;
        const user = req.user;
        const existingItem=user.cartItems.find((item)=>item.id===productId);
        if(existingItem){
      if(quantity === 0){
          user.cartItems=user.cartItems.filter((item)=>item.id !== productId);//remove item from cart if quantity is 0  
          await user.save();
            return res.json(user.cartItems);
        }
        existingItem.quantity=quantity;
        await user.save();
        res.json(user.cartItems);
    }else{
        res.status(404).json({message:"Item not found in cart"});
    }
    } catch (error) {
       console.log("error in updateQuantity controller",error);
        
    }
}

export const getCartProducts = async (req, res) => {
    try {
        // Fetch products based on cart item IDs
        const products = await Product.find({ _id: { $in: req.user.cartItems.map(item => item.id) } });

        // Add quantity to each product
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.id.toString() === product._id.toString());

            return {
                ...product.toObject(), // ✅ Convert Mongoose document to a plain object
                quantity: item.quantity
            };
        });

        res.json(cartItems);
    } catch (error) {
        console.error("Error in getCartProducts controller", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
