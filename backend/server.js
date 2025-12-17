import cookieParser from 'cookie-parser';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import DBconnect from './config/database.js';
import authRouter from './routes/auth.router.js';
import eventRouter from './routes/event.router.js'
import rsvpRouter from './routes/rsvp.router.js';

const app = express();
await DBconnect();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:"https://event-management-app-48ad.onrender.com",
    credentials:true,
}));

app.use("/api/auth",authRouter);
app.use("/api/events",eventRouter);
app.use("/api/rsvp",rsvpRouter);

app.get('/',(req,res)=>{
    res.send("Api is working...");
})

app.listen(PORT,()=>{
    console.log("server is running on http://localhost:3000");
})