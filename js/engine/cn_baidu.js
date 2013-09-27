var jrowindex = 0;
var cn_baidu_host = 'http://www.baidu.com';

//点搜索执行
function dosearch(searchtxt){
  $(HTML_ID_MSGTXT).text("正在加载中...");   
  $(HTML_ID_SEARCHDATA).empty();
  jrowindex = 0;   
  var jsearchiframe = $(HTML_ID_SEARCHIFRAME,parent.document.body); 
  jsearchiframe.attr("src",cn_baidu_host + "/s?wd="+searchtxt);

  //下一个url $(".fk,.fk_cur").nextSibling.baseURI

  //else if (jsname=='google'){
  //$("#searchweb",parent.document.body).attr("src","http://www.google.com.hk/#newwindow=1&q="+jstext);
};
//end dosearch

//显示加载的内容
function loadsearchdata(jsdata,validurl,callback){
  $(HTML_ID_MSGTXT).text('正解释中...');
  var jtable = $(HTML_ID_SEARCHDATA);
  $(HTML_ID_SEARCHIFRAME).contents().find('#content_left table').each( 
    function(index) {
      var jdiv = $(this).find('.c-default');
      var jurl = gethost(jdiv.find('.g').text());
      if ((jurl != '' ) && validurl(jurl,jsdata) && (jrowindex<jsdata.count)) {
        var jtitle=jdiv.find('h3 a').text();
        var jcontent=jdiv.find('.c-abstract').text();
        var jtr = $("<tr></tr>");
        jtr.append('<td rowspan="2" width="30">'+ ++jrowindex + '</td>');
        jtr.append('<td rowspan="2" width="300">'+ jtitle + '</td>');
        jtr.append('<td width="600">'+ jcontent + '</td>');
        jtr.append('<td width="200"><a href="' + jurl + '" target="_blank">' + jurl + '</a></td>');
        jtr.attr('id','r'+jrowindex);
        var obj={};
        //{url:'http://wwww.xxx.com',title:'xxxxxx',content:'xxxxxxx',email:['','','','']}
        obj.idx=index;
        obj.url=jurl.toLowerCase();
        obj.title=jtitle;
        obj.content=jcontent;
        obj.email=[];
        jsdata.data.append(obj);

        var jtrm = $('<tr></tr>');
        jtrm.append('<td colspan="2" style="display: none;"></td>')
        jtrm.attr('id','rm'+jrowindex);
        jtrm.attr('url',jurl); //将位置写到节点上. <tr url="http://www.xx.com" id="rm1"></tr> 
        jtrm.attr
        jtable.append(jtr);
        jtable.append(jtrm);

        /*for(var i=0;i<10;i++){
          jtrm.find('td').append('<a class="mailto" href="mailto:#">mrlong.com@gmail.com</a>');
          if ((i+1)%3==0){
            jtrm.find('td').append('<br>');
          };
          
        }*/
      }
  });
  $(HTML_ID_MSGTXT).text('');
  callback(parseInt(jrowindex*100/jsdata.count));
  //接着下一个页面
  if (jrowindex < jsdata.count){
    $(HTML_ID_MSGTXT).text("正在加载(" + jrowindex +"/"+ jsdata.count +")中...");
    var jbaseURI = cn_baidu_host + $(HTML_ID_SEARCHIFRAME).contents().find("#page .fk_cur").parent().next().attr('href');
    var jsearchiframe = $(HTML_ID_SEARCHIFRAME,parent.document.body); 
    jsearchiframe.attr("src",jbaseURI);
  }
  else{
    callback(-1); //=-1表示结束
  }
};
//end searchweb