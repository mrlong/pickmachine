///////////////////////////////////////////////////////////
// 作者:龙仕云 创建时间: 2013-9-14
//  
//  公共模块方法
//
///////////////////////////////////////////////////////////

//常量
var HTML_ID_MSGTXT       = "#msgtxt";
var HTML_ID_SEARCHDATA   = "#searchrow table tbody";  //这个是存放数据源的地方
var HTML_ID_SEARCHIFRAME = "#searchweb";              //显示面页的iframe
var HTML_CLASS_PROGDIV   = ".progress" ;              //进度条div
var HTML_CLASS_PROGBAR   = ".progress-bar";           //显示的进度条

//全局变理
var http = require('http');
var nurl = require('url');
var fs   = require('fs');
var util = require('util');
var iconv= require('iconv-lite');
var request = require('request');
var crypto2 = require('crypto');      //不知为什么定crypto就出错.
var async = require('async');

var gui  = require('nw.gui');
var gcurwin = gui.Window.get(); //Get the current window

//
// 格式:
// [
//  ver:1,
//  country:cn,
//  engine:baidu,
//  search:计价 软件,
//  count:50,   //需要返回的个数
//  data:[
//    {idx=1,url:'http://wwww.xxx.com(小写)',title:'xxxxxx',content:'xxxxxxx',email:['','','','']},
//    {idx=2,url:'http://wwww.xxx.com(小写)',title:'xxxxxx',content:'xxxxxxx',email:['','','','']},
//    {idx=3,url:'http://wwww.xxx.com(小写)',title:'xxxxxx',content:'xxxxxxx',email:['','','','']}
//  ]
// ]
//
// 版本注释
//  ver=1 2013-9-18
//
var jsondata={};jsondata.ver=1;jsondata.data=[];//保存数据
 

//取出网址的host
function gethost(url){
  if(url==''){
    return '';
  };

  var str = url.substring(0,url.indexOf("/"));
    if (str.indexOf('http://')==-1){
      str = 'http://' + str;
  }
  return str;
};

//有效网址
function validurl(url){
  var jhas=false;
  var jurl=url.toLowerCase();
  $.each(jsondata.data,function(index,obj){
    if (jurl == obj.url){
      jhas = true;
      return false;
    }
  });

  return jhas?false:true;
}

//数组的扩展功能
Array.prototype.in_array = function(e) 
{ 
  for(i=0;i<this.length;i++){
    if(this[i] == e)
      return true;
  }
  return false;
};
Array.prototype.append=function(e){
  this[this.length]=e;
};


//解释html内容
//level 第多少层了.最大3层
//curl 是当前网址。
function parsehtml(txt,curl,tr,aurls,obj){
  var jhtml = $(txt);
  var jp = nurl.parse(curl);
  var jhn = jp.hostname;
  var jmails=[];  //提取出来的邮箱
  var jurls=[];
  var jurls_top = []; //这个是提前读取的页面
  var jctopurl = ['about','关于','关于我们','contacts'];
  var jtd = tr.find('td');

  //提取页面上的邮箱
  var reg=/\b[A-Za-z0-9._%+-]+\s?@\s?(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,6}\b/ig;
  var mails=reg.exec(txt);
  while(mails !=null){
    /*
      [
        'mrlong.com@gmail.com',
        index: 20,
        input: 'sssssssss mrlong.com@gmail.com'
      ]
    */
    var m  = mails[0];
    var t  = mails.input;
    var idx = mails.index;
    jmails.append(m.toLowerCase());
    mails=reg.exec(t.substring(idx+m.length,t.length))
  };
  for(var i=0;i<jmails.length;i++){
    var jhas=false;
    $.each(obj.email,function(index,value){
      if(value==jmails[i]){
        jhas=true;
        return false;
      }
    });
    if (jhas==false){
      if (obj.email.length < 10){
        obj.email.append(jmails[i]);
        var jemail=$('<a class="mailto" href="mailto:'+ jmails[i] +'">' + jmails[i] + '</a>,')
        jtd.append(jemail);  
        if (obj.email.length % 3 == 0){jtd.append('<br>')}
      }
      else{
        return true; //已是10个邮箱了，不再找了.
      }
    }
  };

  if ((jhn.indexOf('www.')==0) || (jhn.indexOf('bbs.')==0) || (jhn.indexOf('new.')==0)) {
    jhn = jhn.substring(5,jhn.length)
  };
  
  //<a>
  jhtml.find("a[href^='/'],a[href*='" + jhn + "']").each(function(index, val) {
    var jhref = $(val).attr('href');
    if (jhref.indexOf('/')==0){
      jhref = curl + jhref;  
    };
    if (jctopurl.in_array($(val).text().toLowerCase())){
      jurls_top.append(jhref);
    }
    else{
      jurls.append(jhref);
    }
  });
  //<iframe>
  jhtml.find("iframe[src^='/'],iframe[src*='"+ jhn + "']").each(function(index, val) {
    var jsrc = $(val).attr('src');
    if(jsrc.indexOf('/')==0){
      jsrc = curl + jsrc;  
    };
    jurls_top.append(jsrc);           
  });

  for(var i=0;i<jurls_top.length;i++){
    aurls.append(jurls_top[i]);
  };
  for(var i=0;i<jurls.length;i++){
    aurls.append(jurls[i]);
  };

  //downurl(level+1,jurls_top,tr);
};

//下载网站的页面内容
function downurl(level,urls,tr,obj){
  //只支持3层网页或邮箱已提取10个了。
  /*if ((level >3) || (obj.email.length>=10)){
    return false;  
  };*/
  var jurls=[];
  $.each(urls,function(index,value){
    var jp = nurl.parse(value);
    var options = {
        method: 'GET',
        url:jp.href,
        encoding:'utf8',
        timeout:5000,
        followAllRedirects:true
    };
    request(options,function(err, res, body){
      if (!err && res.statusCode == 200 && body){
        //alert(body);
        //var sha1 = crypto2.createHash('sha1');
        //var dirContents = fs.readdirSync('.');
        //var filePath='d:/temp/' + sha1.update(value).digest('hex');
        //var filePath= dirContents + sha1.update(value).digest('hex');
        //fs.writeFile(filePath, body, 'utf8', function(err){});
        parsehtml(body,value,tr,jurls,obj);
      }
      if (index == urls.length -1 && level<4 && obj.email.length<10){
        downurl(++level,jurls,tr,obj);     
          //alert(jurls.length); 
      }; 
    });

    /*http.get(options, function(res) {
      //console.log("Got response: " + res.statusCode, res.headers);
      res.setEncoding('utf8'); //gb2312
      res.on('data',function(d){
        s += d.toString();
      });
      res.on('end',function(){
        parsehtml(s,value,tr,jurls,obj);
        if (index == urls.length -1){
          downurl(level+1,jurls,tr,obj);     
          //alert(jurls.length); 
        }
      });
    })
    .on('error', function(e) {
      tr.find("pmmsg").text(e.message);
    });*/
    
  });//end $.each()
};


!function ($) {

  $(function(){
    
    //初期化
    $(HTML_ID_SEARCHIFRAME).hide(); 
    $(HTML_CLASS_PROGDIV).hide();
    
    //开始搜索事件
    function startsearchevent(){
      jsondata.country='cn';
      jsondata.engine=$("#searchname").val();
      jsondata.search=$("#searchtext").val();
      jsondata.count=50;
      jsondata.data.splice(0,jsondata.length);  //清空原来的内容

      $(HTML_ID_SEARCHIFRAME).show();
      $(HTML_CLASS_PROGDIV).show();

    }

    //结束事件
    function endsearchevent(tag){
      if (tag == -1){
        $(HTML_ID_SEARCHIFRAME).hide();
        $(HTML_CLASS_PROGDIV).hide();
        $(HTML_CLASS_PROGBAR).css('width','0%');
        
      }
      else{
        $(HTML_CLASS_PROGBAR).css('width',tag+'%');  
      }
    }

    //点搜索
    function search(){
      var jstext = $("#searchtext").val();
      var jsname = $("#searchname").val();  //不同的搜索引擎
      startsearchevent();
      dosearch(jstext);
    }

    $("#dosearch").on('click',search);
    $("#searchtext").on('keypress',function(event){
      if(event.keyCode==13){
        search(); 
      }
    })

    //完成之后解释数据
    $("#searchweb").on('load',function(){
      var jsname = $("#searchname").val();  //不同的搜索引擎
      loadsearchdata(jsondata,validurl,endsearchevent);
    });


    //提取邮箱
    function pickmail(obj,callback){
      var jval = $(obj); //<td>
      var jurl = jval.parent().attr('url');  //<tr>
      jval.show();
      jval.html('<div class="pmmsg"></div><strong>邮箱:</strong>');
      for(var i=0;i<jsondata.data.length;i++){
        if (jsondata.data[i].url==jurl){
          downurl(1,[jurl],jval.parent(),jsondata.data[i]);
          break;
        }
      }
    }

    $("#dopickmail").on('click',function(){
      //显示邮内容:
      var jitems =[];
      $(HTML_ID_SEARCHDATA).find('td[colspan="2"]').each(function(index, val) {
        jitems.append(val);
      });

      var q = async.queue(function(obj,pick,callback){
        pick(obj,callback);
      },3);

      /**
      * 监听：如果某次push操作后，任务数将达到或超过worker数量时，将调用该函数
      */
      q.saturated = function() {
        $(HTML_ID_MSGTXT).text('all workers to be used'+q.length());
      }

      /**
      * 监听：当最后一个任务交给worker时，将调用该函数
      */
      q.empty = function() {
        $(HTML_ID_MSGTXT).text('no more tasks wating');
      }

      /**
      * 监听：当所有任务都执行完以后，将调用该函数
      */
      q.drain = function() {
        $(HTML_ID_MSGTXT).text('all tasks have been processed');
      }

      $.each(jitems,function(index,value){
        q.push(value,pickmail,function(err){});  
      });

    });
    //end 提取 

  });//end $(function())

}(window.jQuery)
