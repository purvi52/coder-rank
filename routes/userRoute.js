const express = require("express");
const user_route = express();
const session = require("express-session");

const config= require("../config/config");

user_route.use(session({secret:config.sessionSecret}))

const auth= require("../middleware/auth");

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const multer = require("multer");
const path= require("path");
const{ User, Student, Teacher} = require('../models/userModel');


user_route.use(express.static('public'))

const storage= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, path.join(__dirname,'../public/userimages'));

    },
    filename:function(req,file,cb)
    {
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);

    }
})

const upload = multer({storage:storage});
const search = require("../utils/search");

const userController = require("../controllers/userController");

//////////////////////////////////////
var passedVariable="";
user_route.get("/plag", (req, res) => {
  passedVariable = req.query.valid;
  console.log(passedVariable);
  Teacher.find({},{_id: 0,code: 1, ide:1}).then((result1)=>{
    console.log("Result1234: "+result1);
    const q = result1[passedVariable].code;

  res.render('plag',{plagCount: q});
}).catch((err)=>{
  console.log(err);
})

  });

  user_route.post("/result", async function (req, res) {
      // const q = req.body.query;
     // var passedVariable = req.query.valid;
    Teacher.find({},{_id: 0,code: 1, ide:1}).then((result1)=>{
      console.log("Result1234: "+result1);
      const q = result1[passedVariable].code;


    if (!q) return res.status(400).json({ error: "empty query sent" });

    // replace all 3 types of line breaks with a dot
    // Replace all multiple white spaces with single space
    // Replace all multiple dots with single dot
    // separate all sentences of the paragraph
    // split into array of all sentences of paragraph
    const tosearch = q
      .replace(/(\r\n|\n|\r)/gm, ".")
      .replace(/\s+/g, " ")
      .replace(/\.+/g, ".")
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
      .split("|");
    console.log("\n\n", tosearch);

    var length = tosearch.length;
    if (length > 100) {
      return res.status(400).json({ error: "Max sentences limit crossed!" });
    }
    // contains all results
    var result = [];
    // count of total number of sentences, and of plagiarsed ones
    var count = {
      total: length,
      plagiarised: 0,
    };

    // iterate over every sentence, find its source, and push to results array
    for (let i = 0; i < length; i++) {
      const currQuery = tosearch[i];
      const a =  search(currQuery);
      if (a.length > 0) {
        result.push({ text: currQuery, url: a[0].url });
        count.plagiarised += 1;
      } else result.push({ text: currQuery, url: null });
    }
    // render result page with found results and counts
    res.render("result", { result: result, count: count });
  }).catch((err)=>{
    console.log(err);
  })
  });

//////////////////////////////////////////
user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);
user_route.get('/verify',userController.verifyMail)
user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',userController.forgetVerify);
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);
user_route.get('/verification',userController.verificationLoad)
user_route.post('/verification',userController.sentVerificationLink)
user_route.get('/edit',auth.isLogin,userController.editLoad);
user_route.post('/edit', upload.single('image'), userController.updateProfile);
//new
user_route.get('/profile',auth.isLogin,userController.profileLoad);
user_route.get('/form',auth.isLogin,userController.hosttestt);
user_route.post('/formpost',userController.hostestpost);
user_route.get('/compiler',auth.isLogin,userController.compilerGet);
user_route.post('/compiler',userController.compilerPost);
user_route.get('/fullStat',auth.isLogin,userController.fullGet);
user_route.get('/prac',auth.isLogin,userController.pracTice)
user_route.get('/submissions',auth.isLogin,userController.subMission);
user_route.post('/subPost',auth.isLogin,userController.subPost);
user_route.get('/question',auth.isLogin,userController.quesTion);
user_route.get('/joinTest',auth.isLogin,userController.joinTest);
user_route.post('/joinTestQ',auth.isLogin,userController.joinTestPost);

module.exports= user_route;
