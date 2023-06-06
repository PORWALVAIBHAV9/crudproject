const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended : true}))
app.use(methodOverride('_method'))
const session = require('express-session')

const authenticate = function(req,res,next){
    if (req.session.user){
        next();
    }
    else{
        res.send('You are not loggedin')
    }
}

mongoose.connect('mongodb://127.0.0.1:27017/new_project').
then((res)=> {
    console.log('connected to database'); 
    // console.log(res);
}).catch(err =>{
    console.log('error connecting to database')
    console.log(err);})

    const sessionConfig = {
        secret:"secretsession",
        resave:false,
        saveUninitialised:true,
}

app.use(session(sessionConfig))



app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/register', (req,res)=>{
    res.render('register');
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/userinfo/:id',authenticate,async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    const user_lis = [user]
    res.render("userinfo",{user:user_lis})
    
}) 

app.post('/newuser',async(req,res)=>{
    const{username,email,contact,password} = req.body;
    const salt = await bcrypt.genSalt(10)
    const hashedpassword= await bcrypt.hash(password, salt)
    const newUser = await new User({username,email,contact,password:hashedpassword})
    await newUser.save();
    req.session.user = newUser._id
    res.redirect(`/userinfo/${newUser._id}`)
})

app.post('/login',async(req,res)=>{
    const {username,password} = req.body;
    const user = await User.find({username:username});
    if (user[0]){
    const hashedpassword = user[0].password;
    const login = await bcrypt.compare(password, hashedpassword)
    if (login){ 
        req.session.user = user[0]._id
        console.log(req.session)
        res.render("userinfo",{user})

    }
    else{res.send("Username or Password wrong")}
}
    else{
        res.send("User does not exist")
    }

})

app.get('/updateinfo/:id',authenticate,async(req,res)=>{
    const {id} =req.params;
    console.log(id)
    const user = await User.findById(id)
    res.render('update', {user})
})

app.put('/updateinfo/:id',authenticate,async(req,res)=>{
    const {id} = req.params;
    const {username,email,contact} = req.body;
    const user = await User.findById(id);
    const updated_user = await User.updateOne({_id:id},{ $set: { username,email,contact } })
    res.redirect(`/userinfo/${id}`)
    

}
)










app.listen(8000, (req,res)=>{
    console.log("connected to port 2000!!")
})