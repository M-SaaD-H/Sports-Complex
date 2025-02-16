import { Router } from 'express';

const router = Router();

router.get ("/",(req,res)=>{
    res.render("index");
});

router.get("/dashbord",(req,res)=>{
    return res.render("dashbord");
});

router.get('/login', (req, res) => {
    res.render('login', { formType: 'login' });
});

router.get('/sign-up', (req, res) => {
    res.render('login', { formType: 'signup' });
});

router.get('/facilities', (req, res) => {
    res.render('facilities');
});
router.get("/pastEvent",(req,res)=>{
    return res.render("pastevents");
})


export default router;