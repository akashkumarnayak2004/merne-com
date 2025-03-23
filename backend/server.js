import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
 // Check if the value is logged
//  import cors from 'cors';

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import path from 'path';
const path = require('path');
import cookieParser from 'cookie-parser';

import { connectDB } from './lib/db.js';
const app = express();
// const corsOptions = {
//     origin: "http://localhost:5175", // The URL of your frontend (React app)
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//     credentials: true, // Allow cookies to be sent
// };

// app.use(cors()); // Add CORS middleware to your app


const PORT=process.env.PORT || 6001;
const __dirname = path.resolve();   

app.use(express.json({limit: '50mb'}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/coupons",couponRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/analytics",analyticsRoutes);



if (process.env.NODE_ENV === 'production') {
    // Serve static files from the 'frontend/dist' directory
    app.use(express.static(path.join(__dirname, 'frontend/dist')));

    // Handle all other requests by serving the 'index.html' file
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {    
    console.log("Server is running on http://localhost:"+PORT);
    connectDB();
}   ); 