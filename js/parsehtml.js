/*
	
*/

//全局变理
var http = require('http');
var nurl = require('url');
var fs   = require('fs');
var util = require('util');
var iconv= require('iconv-lite');
var request = require('request');
var crypto2 = require('crypto');      //不知为什么定crypto就出错.
var async = require('async');