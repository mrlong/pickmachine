// 
// 作者:龙仕云 2013-9-27
//  公共方法集合
// 
// 

//取出网址的host
function gethost (url){
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
function validurl (url,data){
  var jhas=false;
  var jurl=url.toLowerCase();
  $.each(data.data,function(index,obj){
    if (jurl == obj.url){
      jhas = true;
      return false;
    }
  });

  return jhas?false:true;
};

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

/*var apputil=function(){

};
module.exports = apputil;*/