var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var multer = require('multer')
var cookieParser = require('cookie-parser')
var app = express()
app.use(express.static('www'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
var storage = multer.diskStorage({
	destination:'www/uploads',         //用户头像的存储路径
	filename:function(req,res,callback){
		var petname = req.cookies.petname;
		callback('',petname+'.jpg');
	}
})
var upload = multer({storage})
//注册
app.post('user/register',function(req,res){
	fs.exists('users',function(exi){
		if(exi){
			writeFile();//如果文件存在直接写入数据
		}else{          //如果文件不存在则创建文件
			fs.mkdir('users',function(err){
				if(err){//如果创建失败返回信息
					res.status(200).json({code:0,message:'系统创建文件夹失败'});
				}else{  //如果创建成功写入数据
					writeFile();
				}
			})
		}
	})
	//封装一个将用户信息写入本地的方法
	function writeFile(){
		var filename = 'user/'+req.body.petname +'.txt';
		fs.exists(filename,function(exi){
			if(exi){         //如果filename存在,提示被注册过
				res.status(200).json({code:1,message:'用户存在,请重新注册'})
			}else{           //如果filename不存在,在req.body中加入ip和time属性
				req.body.ip = req.ip;
				req.body.time = new Date();
				//将filename写入到本地
				fs.writeFile(filename,JSON.stringify(req.body),function(err){
					if(err){    //如果写入失败,提示信息
						res.status(200).json({code:2,message:'系统写入文件失败'})
					}else{      //如果写入成功,提示信息
						res.status(200).json({code:3,message:'注册成功'})
					}
				})
			}
		})
	}
})
//登录
app.post('/user/login',function(req,res){
	var fileName = 'users/'+req.body.petname+'.txt';//根据req.body.petname 去users文件夹中匹配文件
	fs.exists(fileName,function(exi){               //查看uesrs文件夹中是否有当前用户
		if(exi){    //如果文件存在,读取fileName路径文件,进行密码比较
			fs.readFile(fileName,function(err,data){
				if(err){      //系统读取失败
					res.status(200).json({code:1,message:'系统错误，读取文件失败'})
				}else{			//系统读取成功
					var user = JSON.parse(data) //把fileName信息转化为对象
					if(req.body.password == user.password){//比较本地存储的密码跟输入的密码是否一致
						var expires = new Date();
						expires.setMonth(expires.getMonth() + 1)  //设置保存时间
						res.cookie('petname',req.body.petname,{expires})
						res.status(200).json({code:3,message:'登录成功'})
					}else{  						   			
			   			res.status(200).json({code:2,message:'密码错误，请重新输入'})//密码错误，登录失败
			   		} 
				}				
			})
		}else{			
			res.status(200).json({code:0,message:'用户不存在，请先去注册'})		//文件不存在
		}
	})
})
//提问
app.post('/question/ask',function(req,res){
	if(!req.cookies.petname){  //如果cookie中没有petname
		res.status(200).json({code:0,message:'登录异常，请重新登录'})	
		return;
	}
	fs.exists('questions',function(exi){  //判断问题文件夹是否存在
		if(exi){
			writeFile()                   //如果存在写入问题文件
		}else{                            //如果不存在,创建文件夹再写入问题文件
			fs.mkdir('questions',function(err){
				if(err){
					res.status(200).json({code:1,message:'系统创建文件失败，请稍后再试'})
				}else{
					writeFile()
				}
			})
		}
	})
	//封装一个写入问题的函数
	function writeFile(){
		var date = new Date();
		var fileName = 'questions/'+date.getTime()+'.txt';
		req.body.content = req.body.content.replace(/</g,'&lt;')  //replace替换
		req.body.content = req.body.content.replace(/>/g,'&gt;')  //防止跨网站攻击
		req.body.petname = req.cookies.petname;
		req.body.ip = req.ip;
		req.body.time = date;
		fs.writeFile(fileName,JSON.stringify(req.body),function(err){
			if(err){
				res.status(200).json({code:2,message:'系统错误，写入失败'})			
			}else{
				res.status(200).json({code:3,message:'提交问题成功'})
			}
		})		
	}
})
//回答
app.post('/question/answer',function(req,res){
	var petname = req.cookies.petname;
	if(!petname){
		res.status(200).json({code:0,message:'登录异常,请重新登录'});
		return;
	}
	var question =req.cookies.question;
	var filePath = 'questions/'+question+'.txt'  //取出要回答问题的内容
	fs.readFile(filePath,function(err,data){
		if(!err){
			var dataObj = JSON.parse(data);//判断是否有回复
			if(!data.Obj.answers){
				dataObj.answers = [];     //如果不存在回复 创建一个数组从房回复内容
			}		
			req.body.content = req.body.content.replace(/</g,'&lt;');
			req.body.content = req.body.content.replace(/>/g,'&gt;');// 防止跨网站攻击
			req.body.ip = req.ip;
			req.body.question = question;
			req.body.time = new Date();
			req.body.petname = petname;
			dataObj.ansers.push(req.body);//将回复放到数组中
			fs.writeFile(filePath,JSON.stringify(dataObj),function(err){//将回复内容写入到filePath里
				if (err){					
					res.status(200).json({code:1,message:'系统错误,写入文件失败'});
				}else{
					res.status(200).json({code:3,message:'回复成功'});
				}
			})
		}
	})
})
//上传头像
app.post('/user/photo',upload.single('photo'),function(req,res){
	res.status(200).json({code:3,message:'上传头像成功'})
})
//退出登录
app.get('/user/logout',function(req,res){
	res.clearCookie('petname');  //清除cookie
	res.status(200).json({code:3,message:'退出登录成功'})
})
//首页
app.get('/question/all',function(req,res){
	fs.readdir('questions',function(err,files){
		if(err){
			res.status(200).json({code:3,message:'退出登录成功'})
		}else{
			files = files.reverse()    //创建一个数组容器,存放所有问题对象
			var questions = [];        //异步读取文件
			var i = 0;
			function readFile(){       //封装读取问题的方法
				if(i<files.length){
					var file = files[i];
					var filePath = 'questions/'+file;  //拼接文件路径
					fs.readFile(filePath,function(err,data){
						if(!err){
							var obj = JSON.parse(data);
							questions.push(obj);
							i++;
							readFile();
						}
					})
				}else{
					res.status(200).json(questions)
				}
			}
			readFile();
		}
	})
})

app.listen(3000, function(){
	console.log('服务器开启')	
})