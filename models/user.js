const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/new_project').
then((res)=> {
    console.log('connected to database');
    console.log(res);
}).catch(err =>{
    console.log('OHHH NO ERROR CONNECTING DATABSE')
    console.log(err);
    
})


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true,
        min:10
    }

})


User = mongoose.model('User', userSchema);
const newuser = new User({username:'vaibhav.varni',email:'vaibhav@gmail.com',password:'vaibhav123',contact:8554466556 })

newuser.save();
module.exports = User