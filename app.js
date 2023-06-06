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
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

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

const password_check = (req,res,next)=>{
    const {password,confirm_password} =req.body;
    if(password === confirm_password){
        next();
        
    }
    else{
        res.send("password doesn't match")
    }

}


app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/register', (req,res)=>{
    res.render('register');
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/user/userinfo/:id',authenticate,async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    const user_lis = [user]
    res.render("userinfo",{user:user_lis})
    
}) 

app.get("/login/user/changepassword/:id", authenticate,(req,res)=>{
    const {id} = req.params;
    res.render('password',{id})
})

app.get("/login/user/admin/allusers",async(req,res)=>{
    const allUsers = await User.find()
    res.render('allUsers', {allUsers})
})

app.post('/register/new_user',async(req,res)=>{
    const{username,email,contact,password} = req.body;
    const salt = await bcrypt.genSalt(10)
    const hashedpassword= await bcrypt.hash(password, salt)
    const newUser = await new User({username,email,contact,password:hashedpassword})
    await newUser.save();
    req.session.user = newUser._id
    res.redirect(`/user/userinfo/${newUser._id}`)
})

app.post('/login/user',async(req,res)=>{
    const {username,password} = req.body;
    const user = await User.find({username:username});
    if (user[0]){
    const hashedpassword = user[0].password;
    const login = await bcrypt.compare(password, hashedpassword)
    if (login){ 
        req.session.user = user[0]._id
        console.log(req.session)
        res.redirect(`/user/userinfo/${user[0].id}`)

    }
    else{res.send("Username or Password wrong")}
}
    else{
        res.send("User does not exist")
    }

})

app.get('/login/user/updateinfo/:id',authenticate,async(req,res)=>{
    const {id} =req.params;
    console.log(id)
    const user = await User.findById(id)
    res.render('update', {user})
})

app.delete("/login/user/delete_user/:id",async(req,res)=>{
    const {id}= req.params;
    const del = await User.findByIdAndDelete(id)
    console.log(del);
    res.send("USER DELETED SUCCESSFULLY")
})

app.put('/login/user/updateinfo/:id',authenticate,async(req,res)=>{
    const {id} = req.params;
    const {username,email,contact} = req.body;
    const user = await User.findById(id);
    const updated_user = await User.updateOne({_id:id},{ $set: { username,email,contact } })
    res.redirect(`/login/user/updateinfo/${id}`)
    

}
)

app.put('/login/user/changepassword/:id',password_check,async(req,res)=>{
    const {id} = req.params;
    const {password} =req.body;
    const salt = await bcrypt.genSalt(10);
    const changed_password= await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(id, {password: changed_password})

    res.send("PASSWORD CHANGED SUCCESSFULLY")
    
})



app.listen(8000, (req,res)=>{
    console.log("connected to port 2000!!")
})