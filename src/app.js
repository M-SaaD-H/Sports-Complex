import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser";

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

import path from "path"
// Routes
const __filename = new URL('', import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine","ejs")


// app.set(path.join(__dirname,'views'))
app.get ("/",(req,res)=>{
    res.render("index")
})


export { app }