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

// Frontend Routes
const __filename = new URL('', import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use("/views", express.static("views"));

app.get ("/",(req,res)=>{
    res.render("index")
})

app.get("/dashbord",(req,res)=>{
    return res.render("dashbord");
})

app.get('/login', (req, res) => {
    res.render('login', { formType: 'login' });
})

app.get('/sign-up', (req, res) => {
    res.render('login', { formType: 'signup' });
})

// API Routes

import userRouter from "./routes/user.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import facilityRouter from "./routes/facility.routes.js"
import adminRouter from "./routes/admin.routes.js"

app.use('/api/user', userRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/facilities', facilityRouter);
app.use('/api/admin', adminRouter);


// To handle ApiErrors
import { errorHandler } from "./middlewares/error.middleware.js";

app.use(errorHandler);


export { app };