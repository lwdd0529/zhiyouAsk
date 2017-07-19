var petname = $.cookie('petname');   //获取首页的数据 从本地缓存 cookie 中取出 petname 的值
$('#ask').click(function(){
	petname ? location.href = 'ask.html' : location.href = 'login.html';
});

if(petname){    // 如果用户登录了 则可以将用户名显示出来	
	$('#user').find('span').last().text(petname);
}else{
	$('#user').find('span').last().text('登录').end().end().removeAttr('data-toggle').click(function(){
		location.href = 'login.html';
	});
}
$.get('/question/all',function(resData){// 获取首页的数据
	var htmlStr = '';
	for(var i = 0;i < resData.length; i++){
		var question = resData[i];
		htmlStr += '<div class="media" data-question="' + new Date(question.time).getTime() + '">'
		htmlStr += '<div class="media-left"><a>'
		htmlStr += '<img class="media-object" src="../uploads/' + question.petname + '.jpg" onerror="defaultHeaderImage(this)">'
		htmlStr += '</a></div>'
		htmlStr += '<div class="media-body">'
		htmlStr += '<h4 class="media-heading">' + question.petname + '</h4>'
		htmlStr += question.content
		htmlStr += '<div class="media-footing">' + formatDate(new Date(question.time)) + '&#x3000;' + formatIp(question.ip) + '</div>';
		htmlStr += '</div></div>'
		if(question.answers){// 有人回答过,显示回答			
			for(var j = 0; j < question.answers.length; j++){
				var answer = question.answers[j];
				htmlStr += '<div class="media media-child">'
				htmlStr += '<div class="media-body">'
				htmlStr += '<h4 class="media-heading">' + answer.petname + '</h4>'
				htmlStr += answer.content
				htmlStr += '<div class="media-footing">' + formatDate(new Date(answer.time)) + '&#x3000;' + formatIp(answer.ip) +'</div>';
				htmlStr += '</div>'
				htmlStr += '<div class="media-right"><a>'
				htmlStr += '<img class="media-object" src="../uploads/' + answer.petname + '.jpg" onerror="defaultHeaderImage(this)">'
				htmlStr += '</a></div></div>'
			}	
		}
		htmlStr += '<hr>'
	}
		$('.questions').html(htmlStr);
});
// 封装一个方法,解析 date用的
function formatDate(time){
	var y = time.getFullYear();
	var M = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var m = time.getMinutes();
	M = M < 10 ? '0' + M : M;
	d = d < 10 ? '0' + d : d;
	h = h < 10 ? '0' + h : h;
	m = m < 10 ? '0' + m : m;
	return y + '-' + M + '-' + d + ' ' + h + ':' + m;
}
// 封装一个方法,解析 ip 用的
function formatIp(ip){
	console.log(ip);
	if(ip.startsWith('::1')){
		return 'localhost';
	}
	else{
		return ip.substr(7);
	}
}
// 如果没有上传头像,那么加载默认图片
function defaultHeaderImage(th){
	th.src = '../images/user.png'
}
// 退出登录
$('#logout').click(function(){
	$.get('/user/logout',function(resData){
		location.reload();
	});
});
// 给每个问题添加点击事件
$('.questions').on('click','.media[data-question]',function(){
	console.log(petname)
	if(petname){
		// 用户已登录
		var cook = $(this).data('question');
		$.cookie('question',cook);
		location.href = 'answer.html';
	}
	else{
		// 用户未登录，请先进行登录
		location.href = 'login.html';
	}
});

	
	