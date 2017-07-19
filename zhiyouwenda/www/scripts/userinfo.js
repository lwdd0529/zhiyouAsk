$('#goBack').click(function(){	
	history.go(-1);	       //点击返回按钮返回上一页
})
$('#home').click(function(){
	location.href = 'index.html';	//点击主页跳转主页
})
$('form').submit(function(e){   //上传头像
	e.preventDefault();	        //阻止表单默认提交事件
	var data = new FormData(this)	//获取表单数据
	$.post({
		url:'/user/photo',         //接口名称
		data:data,                 //表单数据
		contentType:false,         //不使用默认编码
		processData:false,         //不转换为对象
		success:function(resData){			
			$('.modal-body').text(resData.message)		//模态框输入信息
			$('#myModal').modal('show').on('hide.bs.modal',function(){
				if(resData.code == 3){
					location.href = 'index.html';	//如果提交成功返回主页			
				}			
			})			
		}
	})	
})