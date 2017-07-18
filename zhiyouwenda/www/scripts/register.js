$('#goBack').click(function(){		
	history.go(-1);		//点击返回按钮返回到上一页
})	
$('#home').click(function(){		
	location.href = 'index.html';		//点击主页按钮跳转到主页
})
$('form').submit(function(event){
	event.preventDefault();      //阻止表单默认提交事件
	var password =$('input[type=password]').map(function(){ //遍历密码核对两次输入的值
		return $(this).val();	
	})	
	if(password[0] != password[1]){		//如果密码输入不一致
		$('.modal-body').text('两次输入密码不一样');		//模态框提示信息		
		$('#myModal').modal('show');            //跳出模态框
		return;		
	}	
	var a = hex_md5($('input[type=password]').val());    	//否则将密码进行加密
	$('input[type=hidden]').val(a); 	 //将加密后的密码进行赋值
	var data =$(this).serialize();	     //获取表单信息
	$.post('/user/register',data,function(resData){   //表单执行post请求
		$('.modal-body').text(resData.message);	      //模态框输入内容
		$('#myModal').modal('show').on('hide.bs.modal',function(){		
			if(resData.code == 3){
				location.href= 'login.html';     //如果注册成功跳转到登录页面
			}
		})	
	})	
})
