import cors from "cors";
import dotenv from "dotenv";
import express from 'express';
import Razorpay from "razorpay";
import { connectDb } from "./database/db.js";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});


const app = express();

app.use(express.json());
app.use(cors());


const port = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/course.js";
import userRoutes from './routes/user.js';

// Using routes - order matters
app.use('/api', userRoutes);    // User routes first
app.use('/api', adminRoutes);   // Admin routes second
app.use('/api', courseRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectDb()

});