const{ User, Student, Teacher} = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config")
const compiler = require("compilex");
const { execMap } = require('nodemon/lib/config/defaults');
const req = require('express/lib/request');
const securePassword = async (password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
     console.log(error.message);
    }
}
//for mail send
const sendVerifyMail = async(name, email, user_id)=>{
    try {
       const transporter= nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:
            {
                user:config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from : config.emailUser,
            to: email,
            subject : 'For Verification mail',
            html: '<p> Hii '+name+', please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'"> Verify </a> your mail.</p>'

        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error)
            {
                console.log(error);
            }
            else{
                console.log("Email has been sent: - ",info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }
}

//for reset password and mail
const sendResetPasswordMail = async(name, email, token)=>{
    try {
       const transporter= nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:
            {
                user:config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from : config.emailUser,
            to: email,
            subject : 'For Reset Password',
            html: '<p> Hii '+name+', please click here to <a href="http://127.0.0.1:3000/forget-password?token='+token+'"> Reset </a> your password.</p>'

        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error)
            {
                console.log(error);
            }
            else{
                console.log("Email has been sent: - ",info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }
}










const loadRegister = async(req,res)=>{
    try {
        res.render('register');

    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{
    try {
        const spassword =await securePassword(req.body.password);
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          image: req.file.filename,
          password: spassword,
          is_admin: 0,

        });
        const userData = await user.save();
        if(userData)
        {
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('register',{message:"Your Registration has been successful, Please verify your mail."})
        }
        else{
            res.render('register',{message:"Your Registration has been failed."})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async(req,res)=>{
    try {
       const updateInfo = await User.updateOne({_id: req.query.id},{$set:{is_varified:1}});
       console.log(updateInfo);
       res.render("email-verified");

    } catch (error) {
        console.log(error.message);
    }
}

//login user method starts

const loginLoad = async(req,res)=>{
    try {
        res.render('login');

    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async(req,res)=>{
    try {
       const email= req.body.email;
       const password= req.body.password;

       const userData = await User.findOne({email:email});
       if(userData)
       {
           const passwordMatch = await bcrypt.compare(password,userData.password);
           if(passwordMatch){
               if(userData.is_varified === 0)
               {
                    res.render('login',{message: "Please verify your mail. "});
               }
               else{
                   req.session.user_id= userData._id;
                   res.redirect('/home');
               }

           }
           else{
            res.render('login',{message:"Email or password is incorrect."})
           }

       }
       else {
           res.render('login',{message:"Email or password is incorrect."})


       }


    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        const userData= await User.findById({_id:req.session.user_id});
        res.render('index',{user: userData});
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad= async(req,res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async(req,res)=>{
    try {
        const email= req.body.email;
        const userData = await User.findOne({email:email});
        if(userData)
        {

        if(userData.is_varified ===0)
        {
            res.render('forget',{message:"Please verify your mail"});
        }
        else{
            const randomString = randomstring.generate();
            const updatedData= await User.updateOne({email:email},{$set:{token:randomString}});
            sendResetPasswordMail(userData.name,userData.email,randomString);
            res.render('forget',{message: "Please check your mail to reset your password."})

        }
        }
        else{
            res.render('forget',{message:"User email is incorrect."})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
try {
    const token = req.query.token;
    const tokenData = await User.findOne({token: token});
    if(tokenData){
        res.render('forget-password',{user_id:tokenData._id});

    }
    else{
        res.render('404',{message:"Token is invalid"});
    }
} catch (error) {
    console.log(error.message);

}
}

const resetPassword = async(req,res)=>{

    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password, token :''}});
        res.redirect("/");

    } catch (error) {
        console.log(error.message);
    }
}

//for verification send mail link

const verificationLoad = async(req,res)=>{
    try {
        res.render('verification')
    } catch (error) {
        console.log(error.message);
    }
}

const sentVerificationLink = async(req,res)=>{
    try {
        const email=req.body.email;
        const userData= await User.findOne({email :email});
        if (userData) {
sendVerifyMail(userData.name, userData.email, userData._id);
            res.render('verification',{message:"Reset verification mail sent on your mail Id .Please Check"})
        } else {
            res.render('verification',{message:"This verification does not exist."})
        }

    } catch (error) {
        console.log(error.message);
    }
}


const editLoad= async(req,res)=>{
    try {
        const id = req.query.id;

        const userData = await User.findById({_id: id});

        if (userData) {
            res.render('edit',{user: userData})

        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}


const updateProfile = async(req,res)=>{
    try {
        if (req.file) {
            const userData = await User.findByIdAndUpdate({_id: req.body.user_id}, {$set:{name: req.body.name, email: req.body.email, mobile: req.body.mobile , image: req.file.filename}})
        } else {
            const userData = await User.findByIdAndUpdate({_id: req.body.user_id}, {$set:{name: req.body.name, email: req.body.email, mobile: req.body.mobile}})
        }
        res.redirect('/home')

    } catch (error) {
        console.log(error.message);
    }
}

//new
const profileLoad = async(req,res)=>{
    try {
        const userData= await User.findById({_id:req.session.user_id});
        res.render('home',{user: userData});
    } catch (error) {
        console.log(error.message);
    }
}


//hosttest
const hosttestt = async(req,res)=>{
    try
    {

        res.render('hostTest')
    } catch (error) {
        console.log(error.message);
    }
}

//hostestpost
const hostestpost = async(req,res)=>{
    try {
        console.log("test: "+req.session.user_id)
        //const userData = await User.findByIdAndUpdate( {name: req.body.name, email: req.body.email})
        var mydata = new Student({
            ide: req.session.user_id,
            time: req.body.time1,
            timelimit: req.body.timelimit,
        question: req.body.question,
        solution: req.body.solution,
        testname: req.body.testname,
        tc1: req.body.tc1,
        s1: req.body.s1,
        tc2: req.body.tc2,
        s2: req.body.s2,
        tc3: req.body.tc3,
        s3: req.body.s3,
        tc4: req.body.tc4,
        s4: req.body.s4,
        tc5: req.body.tc5,
        s5: req.body.s5,
        tc6: req.body.tc6,
        s6: req.body.s6


    });
    mydata.save()
    .then(item=>{
        res.send("Form details have been saved.");
    })
    .catch(err =>{
        res.status(400).send(err.message);
    })

    } catch (error) {
        console.log(error.message);
    }
}

const compilerGet = async(req,res)=>{
    try {
        var passedVariable = req.query.valid;
        Student.find({ide:req.session.user_id},{_id : 0,  solution :0,ide:0,__v : 0}).then((result)=>{
            res.render('compile',{
                movl: result[passedVariable].question
            })
        }).catch((err)=>{
            console.log(err);
        })



        //res.render('compile');
    } catch (error) {
        console.log(error.message);
    }
}

const compilerPost = async(req,res)=>{
    try {


        var code = req.body.code;
  var input = req.body.input;
  var inputRadio = req.body.inputRadio;
  var lang = req.body.lang;
  if(lang === "C" || lang === "C++"){
    if(inputRadio === "true"){
      var envData = {OS: "windows", cmd: "g++", options: {timeout:10000} };
      compiler.compileCPPWithInput(envData, code, input, function(data){
        if(data.error){
          res.send(data.error);
        }
        else{
          data = data.replace(/\r?\n|\r/g, " ");
         console.log(code)
        var myData = new Teacher({
            "code":req.body.code});
        myData.save(data);
        res.render("compilejs", {output: data["output"], studentCode: code});
        }
      });

    }else {
      var envData = {OS: "windows", cmd: "g++", options: {timeout:10000}};
      compiler.compileCPP(envData, code, function(data){
        console.log(code)
        var myData = new Teacher({"code":req.body.code});
        myData.save(data);
        res.render("compilejs", {output: data["output"], studentCode: code,expected: "NULL"});
      });
    }
  }
  if(lang === "Python"){
    if(inputRadio ==="true"){
      var envData = {OS: "windows"};
      Student.findOne({ide:req.session.user_id}).exec().then((result)=>{
        console.log(result.solution);
//////////////////////////////////////////
compiler.compilePythonWithInput(envData, code, input, function(data){
    console.log(code)
    console.log(input);
    var p = data.output;
    var myData = new Teacher({
        ide: req.session.user_id,
        code:req.body.code,
        out: p})
    myData.save();

    

    compiler.compilePythonWithInput(envData, result.solution, input, function(data1){
        console.log(data1);
        
        //////////
    Student.findOne({ide:req.session.user_id}).exec().then((result)=>{
        console.log(result.timelimit);
        res.render("compilejs", {output: data["output"], studentCode: code, expected: data1["output"],timelimit:result.timelimit+" min"});
    }).catch((err)=>{
        console.log(err);
    })
/////////////////

        
        })


  });

  /////////////////////////////////////////

    }).catch((err)=>{
        console.log(err);
    })

    }else{
      var envData = {OS: "windows"};
      compiler.compilePython(envData, code, function(data){
        console.log(code)
        var myData = new Teacher({
            "ide": req.session.user_id,
            "code":req.body.code});
        myData.save(data);
        res.render("compilejs", {output: data["output"], studentCode: code, expected: "NULL"});
        //res.status(204).send();

      });
    }
  }

    } catch (error) {
        console.log(error.message);
    }
}
/////////////////////////

const compilerTestcase = async(req,res)=>{
    try {


        var code = req.body.code;
  var input = req.body.input;
  var inputRadio = req.body.inputRadio;
  var lang = req.body.lang;
  if(lang === "Python"){
    if(inputRadio ==="true"){
      var envData = {OS: "windows"};
      Student.findOne({ide:req.session.user_id}).exec().then((result)=>{
        console.log(result.tc1);
//////////////////////////////////////////
compiler.compilePythonWithInput(envData, code, input, function(data){
    console.log(code)
    console.log(input);
    // var myData = new Teacher({
    //     "ide": req.session.user_id,
    //     "code":req.body.code});
    // myData.save(data);

        res.render("compilejs", {output: data["output"], studentCode: code});
  });

  /////////////////////////////////////////

    }).catch((err)=>{
        console.log(err);
    })

    }else{
      var envData = {OS: "windows"};
      compiler.compilePython(envData, code, function(data){
        console.log(code)
        var myData = new Teacher({
            "ide": req.session.user_id,
            "code":req.body.code});
        myData.save(data);
        res.render("compilejs", {output: data["output"], studentCode: code, expected: "NULL"});
        //res.status(204).send();

      });
    }
  }

    } catch (error) {
        console.log(error.message);
    }
}

/////////////////////////
const fullGet=async(req,res)=>{
    try {
        compiler.fullStat(function(data){
            res.send(data);
          });

    } catch (error) {
        console.log(error.message);
    }
}

const pracTice = async(req,res)=>{
    try {
        res.render("taglist")
    } catch (error) {
        console.log(error.message);
    }
}

const subMission = async(req,res)=>{
    try {
        Teacher.find({},{_id: 0,code: 1, ide:1,out:1}).then((result)=>{
            // res.send(result)
              // res.render("submissions", {student_Id: result[1].ide, student_Code: result[1].code});

              res.render("submissions",{result1: result})
              //console.log(result);
        }).catch((err)=>{
            console.log(err);
        })



    } catch (error) {
        console.log(error.message);
    }
}

const subPost = async(req,res)=>{
    try {
          console.log(req.body.button);
          res.redirect('/plag?valid=' + req.body.button);
        // res.redirect('/plag');
    } catch (error) {
        console.log(error.message);
    }
}

const quesTion= async(req,res)=>{
    try {
        res.render('question');

    } catch (error) {
        console.log(error.message);
    }
}

const joinTest = async(req, res)=>{
  try{

    Student.find({ide:req.session.user_id},{_id : 0,  solution :0,ide:0,__v : 0}).then((result)=>{
        res.render('joinTestQ',{
            movl: result
        })
    }).catch((err)=>{
        console.log(err);
    })
  } catch(error){
  console.log(error.message);
  }
}

const joinTestPost = async(req,res)=>{
    try {
        console.log("button: "+req.body.button);
        res.redirect('/compiler?valid=' + req.body.button);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerificationLink,
    editLoad,
    updateProfile,
    profileLoad,
    hosttestt,
    hostestpost,
    compilerGet,
    compilerPost,
    fullGet,
    pracTice,
    subMission,
    subPost,
    quesTion,
    joinTest,
    joinTestPost
}
