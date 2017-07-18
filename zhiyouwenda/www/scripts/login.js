$('#goBack').click(function(){			
	history.go(-1);			  //点击返回按钮返回到上一页
})		
$('#register').click(function(){
	location.href = 'register.html'	//点击注册按钮跳转到注册页面
})
$('form').submit(function(event){   //提交表单
	event.preventDefault();	        //阻止表单默认事件
	var a = hex_md5($('input[type=password]').val());    //将密码用MD5加密处理
	$('input[type=hidden]').val(a);         //将处理后的密码赋值
	var data = $(this).serialize();         //获取表单信息
	$.post('/user/login',data,function(resData){	//执行表单post请求
		$('.modal-body').text(resData.message);     //模态框输入内容
		$('#myModal').modal('show').on('hide.bs.modal',function(){			
			if(resData.code == 3){	
				location.href = 'index.html';  //如果登录成功跳转到主页
			}			
		})		
	})	
})
