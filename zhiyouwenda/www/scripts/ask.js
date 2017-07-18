$('#goBack').click(function(){	
	history.go(-1);	          //点击返回按钮返回到上一页
})
$('#home').click(function(){
	location.href = 'index.html'; //点击主页按钮跳转到主页	
})
$('form').submit(function(event){//提交问题	
	event.preventDefault();       //阻止默认提交事件
	var data = $(this).serialize();  //获取表单信息
	$.post('/question/ask',data,function(resData){ //表单执行post请求		
		$('.modal-body').text(resData.message);   //模态框输入内容
		$('#myModal').modal('show').on('hide.bs.modal',function(){			
			if(resData.code == 3){				
				location.href = 'index.html';   //如果提交成功跳转到主页
			}			
		})		
	})	
})
