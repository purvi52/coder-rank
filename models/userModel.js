const mongoose= require("mongoose");

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    mobile:{
        type: String,
        required: true
    },
    image :{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    is_admin:{
        type: Number,
        required: true
    },
    is_varified:{
        type: Number,
        default:0
    },
    token:{
        type: String,
        default:''
    }



})

const hostSchema= new mongoose.Schema({
    ide:{
        type:String
    },
    time:{
        type: String
    },
    timelimit:{
        type: String,
        required: true
    },
    question:{
        type: String,
        required: true
    },
    solution:{
        type: String,
        required: true
    },
    testname:{
        type: String,
        required: true
    },
    tc1 : {
        type: String,
        required: true
    },
    s1:{
        type: String,
        required: true
    },
    tc2: {
        type: String
    },
    s2:{
        type: String
    },
    tc3: {
        type: String
    },
    s3:{
        type: String
    },
    tc4: {
        type: String
    },
    s4:{
        type: String
    },
    tc5: {
        type: String
    },
    s5:{
        type: String
    },
    tc6: {
        type: String
    },
    s6:{
        type: String
    }


})

var teacherSchema = new mongoose.Schema({
    ide:{
        type:String
    },
    code:{
         type:String
        },
    out:{
        type: String
    }
    });


const User = mongoose.model('user',userSchema);
const Student= mongoose.model('Student',hostSchema);
const Teacher = mongoose.model('teacher',teacherSchema);
module.exports= {
    User,Student, Teacher
}