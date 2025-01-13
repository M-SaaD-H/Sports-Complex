import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import path from "path"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({
    extended: true,
    limit: '16kb'
}));

app.use(cookieParser());

// To implement ejs
app.set("view engine","ejs");

const __filename = new URL('', import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.set(path.join(__dirname,'views'))
app.get ("/",(req,res)=>{
    res.render("index")
})

// API Routes

import userRouter from "./routes/user.routes.js"

app.use('/api/user', userRouter)


export { app };