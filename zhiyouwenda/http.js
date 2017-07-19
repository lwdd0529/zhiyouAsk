

//自己研究MD5加密

//加载模块
var express = require('express')
//处理post请求
var bodyParser = require('body-parser')
//处理文件
var fs = require('fs')
//处理文件上传
var multer = require('multer')
//处理cookie
var cookieParser = require('cookie-parser')
//创建服务器对象

var app = express()
//配置静态文件
app.use(express.static('www'))

//解析cookie
app.use(cookieParser())
//解析post请求参数

app.use(bodyParser.urlencoded({extended:true}))

//配置储存上传文件的storage
var storage = multer.diskStorage({
	
	destination:'www/uploads',
	
	filename:function(req,res,callback){
		var petname = req.cookies.petname
		callback('',petname + '.jpg');
		
		
	}
	
})

var upload = multer({storage})
/*-----------------------------------------注册的接口------------------------------------*/

app.post('/user/register',function(req,res){
	//判断有没有装用户的文件
	fs.exists('users',function(exi){
		if(exi){
			//文件存在 我们直接写入数据
			writeFile()			
		}
		else{			
			//文件不存在，我们先创建文件，然后再写入数据  
			fs.mkdir('users',function(err){
				if(err){
					//创建文件失败
					res.status(200).json({code:0,message:'系统创建文件夹失败'})					
				}else{
					//创建成功，写入数据
				writeFile()
				}				
			})
		}	
	})
	//封装一个将用户信息写入本地的方法
	function writeFile(){
		//判断用户是否已经注册过
		var filename = 'users/'+req.body.petname + '.txt';
		
		fs.exists(filename,function(exi){
			
			if(exi){
				//用户存在，被注册
				res.status(200).json({code:1,message:'用户存在，请重新注册'})
				
			}else{
				//用户不存在,进行注
//				在req.body中加入ip和time属性
                req.body.ip =req.ip;
                req.body.time = new Date();
              
                //将未注册，把用户信息写入到本地
                fs.writeFile(filename,JSON.stringify(req.body),function(err){
                	if(err){
                		//写入失败
                		res.status(200).json({code:2,message:'系统写入文件失败'})
                		
                	}else{
                		//保存成功
                		res.status(200).json({code:3,message:'注册成功'})
                		
                	}
                	
                	
                })
			}
			
		})
		
		
	}
	
})

/*--------------------------------------------登录接口----------------------------*/

app.post('/user/login',function(req,res){
	//根据req.body.petname 去users文件夹中匹配文件
	var fileName = 'users/'+req.body.petname+'.txt'
	//查看uesrs文件夹中是否有当前用户
	fs.exists(fileName,function(exi){
	if(exi){
//		文件存在
//      读取fileName 路径文件 ,进行密码比较
   fs.readFile(fileName,function(err,data){
   	if(err){
   		//系统读取失败
   		res.status(200).json({code:1,message:'系统错误，读取文件失败'})
   		
   	}else{
   		
   		//读取成功，进行密码比较
   		var user = JSON.parse(data)
   		if(req.body.password == user.password){
   			//登录成功
   			//设置应用发起的http请求时提交的cookie值
   			//调用此接口所有的请求都生效
   			//把petname设置到cookie里
// 			1.有利于下次登录
// 			2.保存用户信息
   			
   			var expires = new Date();   			
   			expires.setMonth(expires.getMonth() + 1)
   			//设置保存时间
   			
   			//第一个参数 保存的名字
   			//第二个参数 保存的值
// 			     第三个参数   过期时间
   			res.cookie('petname',req.body.petname,{expires}) 			
   			res.status(200).json({code:3,message:'登录成功'})
   		}else{  			
   			//密码错误，登录失败
   			res.status(200).json({code:2,message:'密码错误，请重新输入'})
   		}  		
   	}   	
   })
	}else{
		//文件不存在
		res.status(200).json({code:0,message:'用户不存在，请先去注册'})		
	}		
	})	
})

/*---------------------------提问的接口------------------------*/

app.post('/question/ask',function(req,res){
	
	//判断有没有在cookie中把petname传递过来
	if(!req.cookies.petname){
		//比如：确实登录，但是某些清除来记得软件会把存储的cookie清除
//	         更或者你自己把cookie清除了，cookie的时间戳到了
    res.status(200).json({code:0,message:'登录异常，请重新登录'})	
    return;		
	}
	//判断储存提问信息的文件夹是否存在
	fs.exists('questions',function(exi){
	if(exi){
		//文件存在，写入文件
		writeFile()
	}else{
		//不存在，创建文件夹，写入文件
		fs.mkdir('questions',function(err){
		if(err){
			//文件创建失败
			res.status(200).json({code:1,message:'系统创建文件失败，请稍后再试'})			
		}else{
			//文件创建成功，写入文件
			writeFile()
		}			
		})		
	}		
	})
	//封装一个写入问题的函数
	function writeFile(){
	// 生成提问问题的文件名
	var date = new Date();
//	var name = req.body.content
//	name = name.replace(/</g,'&lt;')
//	name = name.replace(/>/g,'&gt;')
	var fileName = 'questions/'+date.getTime()+'.txt';
	
	req.body.content = req.body.content.replace(/</g,'&lt;')
	req.body.content = req.body.content.replace(/>/g,'&gt;')
	
	//生成储存的信息
	req.body.petname = req.cookies.petname;
	req.body.ip = req.ip;
	req.body.time = date;
//	req.body.content = name;
	//写入文件	
	fs.writeFile(fileName,JSON.stringify(req.body),function(err){
		if(err){
			//写入失败
			res.status(200).json({code:2,message:'系统错误，写入失败'})			
		}else{
			//写入成功
			res.status(200).json({code:3,message:'提交问题成功'})
		}		
	})		
	}	
})
/*------------------------首页数据----------------*/
app.get('/question/all',function(req,res){
	//返回所有的问题
	fs.readdir('questions',function(err,files){
		if(err){
			//读取文件失败
			res.status(200).json({code:0,message:'读取文件失败'})						
		}else{
			//读取文件成功
			//创建一个数组容器，存放所有问题的对象			
			files = files.reverse()			
			var questions = [];			
			//这是方法1：用for循环遍历文件，用同步的方式读取文件
//			for(var i =0;i<files.length;i++){
//				var file = files[i];
//			//拼接文件的路径
//			var filePath = 'questions/'+file;
//			//读取文件的内容	
////			readFile:是一个异步读取文件的方法，可能导致的结果是，还没有读取完就res了，没有数据返回
////          	var data = fs.readFile(filePath);
//			var data = fs.readFileSync(filePath);	
//				
//			var obj = JSON.parse(data);
//			
//			questions.push(obj)
//			
//			
//			}
//			res.status(200).json({questions})
		//方法二：  异步读取文件	
			var i = 0;
			function readFile(){
			if(i < files.length){
			  var file = files[i];
			  //拼接文件的路径
			  var filePath = 'questions/'+file;
			  fs.readFile(filePath,function(err,data){
			  	if(!err){
			  		//文件读取成功
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
			readFile()
		}		
	})	
})
//退出登录

app.get('/user/logout',function(req,res){
	//因为我们是通过cookie来判断是否登录的
//	所有要想退出登录,清除cookie就好
	res.clearCookie('petname');
	res.status(200).json({code:3,message:'退出登录成功'})
})



//上传头像
app.post('/user/photo',upload.single('photo'),function(req,res){
	
	res.status(200).json({code:3,message:'上传头像成功'})
	
})

//回答问题的接口
app.post('/question/answer',function(req,res){
	// 判断登录的状态
	var petname = req.cookies.petname;
	if(!petname){
		res.status(200).json({code:0,message:'登录异常,请重新登录'});
		return;
	}
	
	// 先取出要回答问题的内容
	// 找到要回答问题的文件
	var question = req.cookies.question;
	var filePath = 'questions/' + question + '.txt';
	
	fs.readFile(filePath,function(err,data){
		if(!err){
			var dataObj = JSON.parse(data);
			// 判断当前文件是否有回复
			if(!dataObj.answers){
				// 此数组存放回复内容用的
				dataObj.answers = [];
			}
			
			// 防止跨网站攻击
			req.body.content = req.body.content.replace(/</g,'&lt;');
			req.body.content = req.body.content.replace(/>/g,'&gt;');
			req.body.ip = req.ip;
			req.body.question = question;
			req.body.time = new Date();
			req.body.petname = petname;
			// 将回复 放到数组中
			dataObj.answers.push(req.body);
			fs.writeFile(filePath,JSON.stringify(dataObj),function(err){
				if (err){
					// 写入失败
					res.status(200).json({code:1,message:'系统错误,写入文件失败'});
				}else{
					// 写入成功
					res.status(200).json({code:3,message:'回复成功'});
				}
			});	
		}
	});
	
});

app.listen(3000, function(){
	console.log('服务器开启')	
})
