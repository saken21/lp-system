(function () { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
};
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
};
var IMap = function() { };
IMap.__name__ = true;
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe.Http.__name__ = true;
haxe.Http.prototype = {
	setParameter: function(param,value) {
		this.params = Lambda.filter(this.params,function(p) {
			return p.param != param;
		});
		this.params.push({ param : param, value : value});
		return this;
	}
	,request: function(post) {
		var me = this;
		me.responseData = null;
		var r = this.req = js.Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s;
			try {
				s = r.status;
			} catch( e ) {
				s = null;
			}
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) {
				me.req = null;
				me.onData(me.responseData = r.responseText);
			} else if(s == null) {
				me.req = null;
				me.onError("Failed to connect or resolve host");
			} else switch(s) {
			case 12029:
				me.req = null;
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.req = null;
				me.onError("Unknown host");
				break;
			default:
				me.req = null;
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.iterator();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p.param) + "=" + encodeURIComponent(p.value);
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e1 ) {
			me.req = null;
			this.onError(e1.toString());
			return;
		}
		if(!Lambda.exists(this.headers,function(h) {
			return h.header == "Content-Type";
		}) && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.iterator();
		while( $it1.hasNext() ) {
			var h1 = $it1.next();
			r.setRequestHeader(h1.header,h1.value);
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
};
haxe.ds = {};
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
};
var jp = {};
jp.saken = {};
jp.saken.ui = {};
jp.saken.ui.DragAndDrop = function(jTarget,onSuccess,type) {
	if(type == null) type = "text";
	this._jTarget = jTarget;
	this._onSuccess = onSuccess;
	this._type = type;
	jTarget.on({ drop : $bind(this,this.onDrop), dragenter : $bind(this,this.onEnter), dragover : $bind(this,this.onOver), dragleave : $bind(this,this.onLeave)});
};
jp.saken.ui.DragAndDrop.__name__ = true;
jp.saken.ui.DragAndDrop.prototype = {
	getFilename: function() {
		return this._filename;
	}
	,onDrop: function(event) {
		var file = event.originalEvent.dataTransfer.files[0];
		var fileReader = new FileReader();
		this._filename = file.name;
		fileReader.onload = $bind(this,this.onLoaded);
		if(this._type == "text") fileReader.readAsText(file); else if(this._type == "image") fileReader.readAsDataURL(file);
		this.cancel(event);
		this._jTarget.removeClass("dragging").trigger("onDrop");
		return false;
	}
	,onLoaded: function(event) {
		this._onSuccess(event.target.result);
	}
	,onEnter: function(event) {
		this.cancel(event);
		this._jTarget.trigger("onEnter");
		return false;
	}
	,onOver: function(event) {
		this.cancel(event);
		this._jTarget.addClass("dragging").trigger("onOver");
		return false;
	}
	,onLeave: function(event) {
		this.cancel(event);
		this._jTarget.removeClass("dragging").trigger("onOver");
		return false;
	}
	,cancel: function(event) {
		event.preventDefault();
		event.stopPropagation();
	}
};
jp.saken.utils = {};
jp.saken.utils.Ajax = function() { };
jp.saken.utils.Ajax.__name__ = true;
jp.saken.utils.Ajax.getDatetime = function(onLoaded) {
	var http = new haxe.Http("files/php/" + "getDatetime.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.request(true);
};
jp.saken.utils.Ajax.uploadImage = function(filename,base64,onLoaded) {
	var http = new haxe.Http("files/php/" + "uploadImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.setParameter("base64",base64);
	http.request(true);
};
jp.saken.utils.Ajax.deleteImage = function(filename,onLoaded) {
	var http = new haxe.Http("files/php/" + "deleteImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.request(true);
};
jp.saken.utils.Ajax.getData = function(table,columns,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT " + columns.join(",") + " FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getMaxData = function(table,column,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		var reg = new EReg("([0-9]+)","");
		var isMatch = reg.match(data);
		onLoaded(isMatch?Std.parseInt(reg.matched(0)):0);
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT MAX(" + column + ") FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getIsEmpty = function(table,onLoaded,where) {
	jp.saken.utils.Ajax.getData(table,["id"],function(data) {
		onLoaded(data.length < 1);
	},where);
};
jp.saken.utils.Ajax.insertData = function(table,columns,values,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded(Std.parseInt(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var _g1 = 0;
	var _g = values.length;
	while(_g1 < _g) {
		var i = _g1++;
		values[i] = "'" + values[i] + "'";
	}
	var query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (" + values.join(",") + ")";
	jp.saken.utils.Ajax.requestConnectDB(query,true);
};
jp.saken.utils.Ajax.updateData = function(table,columns,values,where,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	var array = [];
	var _g1 = 0;
	var _g = columns.length;
	while(_g1 < _g) {
		var p = _g1++;
		array[p] = columns[p] + "= '" + values[p] + "'";
	}
	var query = "UPDATE " + table + " SET " + array.join(",") + " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.setConnectDB = function() {
	jp.saken.utils.Ajax._connectDB = new haxe.Http("files/php/" + "connectDB.php");
};
jp.saken.utils.Ajax.requestConnectDB = function(query,isInsert) {
	if(isInsert == null) isInsert = false;
	jp.saken.utils.Ajax.setBusy();
	jp.saken.utils.Ajax._connectDB.setParameter("query",query);
	if(isInsert) jp.saken.utils.Ajax._connectDB.setParameter("insert","true");
	jp.saken.utils.Ajax._connectDB.request(true);
};
jp.saken.utils.Ajax.setBusy = function() {
	jp.saken.utils.Dom.jWindow.on("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.unsetBusy = function() {
	jp.saken.utils.Dom.jWindow.unbind("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.onBeforeunload = function(event) {
	return "データベース登録中です。";
};
var js = {};
jp.saken.utils.Dom = function() { };
jp.saken.utils.Dom.__name__ = true;
jp.saken.utils.Handy = function() { };
jp.saken.utils.Handy.__name__ = true;
jp.saken.utils.Handy.alert = function(value) {
	jp.saken.utils.Dom.window.alert(value);
};
jp.saken.utils.Handy.confirm = function(text,ok,cancel) {
	if(jp.saken.utils.Dom.window.confirm(text)) ok(); else if(cancel != null) cancel();
};
jp.saken.utils.Handy.getPastDate = function(date,num) {
	if(num == null) num = 30;
	var second = HxOverrides.strDate(date).getTime() - num * 86400000;
	var date1;
	var d = new Date();
	d.setTime(second);
	date1 = d;
	var m = jp.saken.utils.Handy.getFilledNumber(date1.getMonth() + 1,2);
	var d1 = jp.saken.utils.Handy.getFilledNumber(date1.getDate(),2);
	return date1.getFullYear() + "-" + m + "-" + d1;
};
jp.saken.utils.Handy.getFilledNumber = function(num,digits) {
	if(digits == null) digits = 3;
	var result = num + "";
	var blankLength = digits - jp.saken.utils.Handy.getDigits(num);
	var _g = 0;
	while(_g < blankLength) {
		var i = _g++;
		result = "0" + result;
	}
	return result;
};
jp.saken.utils.Handy.getDigits = function(val) {
	return (val + "").length;
};
jp.saken.utils.Handy.getLinkedHTML = function(text,target) {
	if(target == null) target = "_blank";
	if(new EReg("http","").match(text)) text = new EReg("((http|https)://[0-9a-z-/._?=&%\\[\\]~^:]+)","gi").replace(text,"<a href=\"$1\" target=\"" + target + "\">$1</a>");
	return text;
};
jp.saken.utils.Handy.getBreakedHTML = function(text) {
	if(new EReg("\n","").match(text)) text = new EReg("\r?\n","g").replace(text,"<br>");
	return text;
};
jp.saken.utils.Handy.getAdjustedHTML = function(text) {
	return jp.saken.utils.Handy.getLinkedHTML(jp.saken.utils.Handy.getBreakedHTML(text));
};
jp.saken.utils.Handy.getLines = function(text) {
	return jp.saken.utils.Handy.getNumberOfCharacter(text,"\n") + 1;
};
jp.saken.utils.Handy.getNumberOfCharacter = function(text,character) {
	return text.split(character).length - 1;
};
jp.saken.utils.Handy.getLimitText = function(text,count) {
	if(count == null) count = 10;
	if(text.length > count) text = HxOverrides.substr(text,0,count) + "...";
	return text;
};
jp.saken.utils.Handy.getReplacedSC = function(text) {
	text = StringTools.replace(text,"'","&#039;");
	text = StringTools.replace(text,"\\","&#47;");
	return text;
};
jp.saken.utils.Handy.getSlicedArray = function(array,num) {
	if(num == null) num = 1000;
	var results = [];
	var _g1 = 0;
	var _g = Math.ceil(array.length / num);
	while(_g1 < _g) {
		var i = _g1++;
		var j = i * num;
		results.push(array.slice(j,j + num));
	}
	return results;
};
jp.saken.utils.Handy.shuffleArray = function(array) {
	var copy = array.slice();
	var results = [];
	var length = copy.length;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var index = Math.floor(Math.random() * length);
		results.push(copy[index]);
		copy.splice(index,1);
	}
	return results;
};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Browser = function() { };
js.Browser.__name__ = true;
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
};
var src = {};
src.Main = function() { };
src.Main.__name__ = true;
src.Main.main = function() {
	new js.JQuery("document").ready(src.Main.init);
};
src.Main.init = function(event) {
	src.utils.DB.load(src.components.View.init);
};
src.components = {};
src.components.Mailer = function() { };
src.components.Mailer.__name__ = true;
src.components.Mailer.send = function(testmail) {
	var counter = 0;
	var formatedData = src.utils.Data.getFormated();
	var isTest = testmail.length > 0;
	var _g1 = 0;
	var _g = formatedData.length;
	while(_g1 < _g) {
		var i = _g1++;
		counter++;
		var replaced = src.components.Mailer.getReplaced(formatedData[i],counter);
		if(isTest) {
			if(counter % 100 == 0) {
				replaced.set("mail",testmail);
				testmail;
				src.components.Mailer.request(replaced);
			}
		} else {
			src.components.Mailer.request(replaced);
			if(counter % 333 == 0) {
				replaced.set("mail","sakata@graphic.co.jp");
				"sakata@graphic.co.jp";
				src.components.Mailer.request(replaced);
			}
		}
	}
};
src.components.Mailer.getReplaced = function(info,num) {
	var date = info[2];
	var corporate = info[3];
	var name = info[4];
	var mail = info[5];
	var message = src.components.Mailer.getMessage(date.length == 0);
	var body = message.get("body");
	var staff = src.utils.DB.staffMap.get(info[6]);
	var staffName = staff.lastname;
	var staffFullname = staffName + " " + Std.string(staff.firstname);
	var staffAlphabet = staff.mailaddress;
	var staffMail = staffAlphabet + "@graphic.co.jp";
	body = StringTools.replace(body,"##1",corporate);
	body = StringTools.replace(body,"##2",name);
	body = StringTools.replace(body,"##3",staffName);
	body = StringTools.replace(body,"##4",staffFullname);
	body = StringTools.replace(body,"##5",staffMail);
	body = StringTools.replace(body,"##6",num == null?"null":"" + num);
	body = StringTools.replace(body,"##7",HxOverrides.substr(staffAlphabet,0,2));
	var _g = new haxe.ds.StringMap();
	_g.set("mail",mail);
	_g.set("subject",message.get("subject"));
	_g.set("body",body);
	_g.set("staffFullname",staffFullname);
	_g.set("staffMail",staffMail);
	return _g;
};
src.components.Mailer.getMessage = function(isFirst) {
	if(src.utils.Message.first != null && isFirst) return src.utils.Message.first;
	return src.utils.Message.normal;
};
src.components.Mailer.request = function(map) {
	var http = new haxe.Http("files/php/sendMail.php");
	http.onData = function(data) {
		console.log(data);
	};
	http.setParameter("staffFullname",map.get("staffFullname"));
	http.setParameter("staffMail",map.get("staffMail"));
	http.setParameter("to",map.get("mail"));
	http.setParameter("subject",map.get("subject"));
	http.setParameter("body",map.get("body"));
	http.request(true);
};
src.components.View = function() { };
src.components.View.__name__ = true;
src.components.View.init = function() {
	var jAll = new js.JQuery("#all").show();
	src.components.View._jFilename = jAll.find("#filename");
	src.components.View._jForm = jAll.find("#form");
	src.components.View._jForm.find(".sendMail").on("click",src.components.View.sendMail);
	src.components.View._dragAndDrop = new jp.saken.ui.DragAndDrop(jp.saken.utils.Dom.jWindow,src.components.View.onDropped);
};
src.components.View.onDropped = function(data) {
	src.components.View._jFilename.text(src.components.View._dragAndDrop.getFilename());
	src.components.View._jForm.show();
	src.utils.Data.init(data.split("\n"));
};
src.components.View.sendMail = function(event) {
	if(src.utils.Data.getFormated().length == 0) {
		jp.saken.utils.Handy.alert("リストに誤りがあります。メール送信できません。");
		return;
	}
	var messageNames = src.components.View.getMessageNames();
	if(messageNames == null) {
		jp.saken.utils.Handy.alert("メッセージ名を入力してください。");
		return;
	}
	var testmail = src.components.View._jForm.find("#test-mailaddress").prop("value");
	if(jp.saken.utils.Dom.window.confirm("メールを送信します。\nよろしいですか？")) {
		if(testmail.length > 0) src.components.View.execute(messageNames,testmail); else if(jp.saken.utils.Dom.window.confirm("本番配信を行います。")) src.components.View.execute(messageNames,testmail);
	}
};
src.components.View.execute = function(messageNames,testmail) {
	src.utils.DB.loadMessage(messageNames,function() {
		src.components.Mailer.send(testmail);
	});
};
src.components.View.getMessageNames = function() {
	var messageName = src.components.View._jForm.find("#message-name").prop("value");
	if(messageName.length == 0) return null;
	var array = [messageName];
	var isNeedFirst = src.components.View._jForm.find("#is-need-first")["is"](":checked");
	if(isNeedFirst) array.push(messageName + "_f");
	return array;
};
src.utils = {};
src.utils.DB = function() { };
src.utils.DB.__name__ = true;
src.utils.DB.load = function(func) {
	src.utils.DB._func = func;
	src.utils.DB._map = new haxe.ds.StringMap();
	src.utils.DB._counter = 0;
	jp.saken.utils.Dom.jWindow.on("loadDB",src.utils.DB.onLoaded);
	src.utils.DB.ajax("staffs",["id","lastname","firstname","mailaddress"]);
	src.utils.DB.ajax("pages",["id","url"]);
	src.utils.DB.ajax("stopUsers",["mailaddress"]);
};
src.utils.DB.loadMessage = function(names,func) {
	var columns = ["name","subject","header","body","footer"];
	jp.saken.utils.Ajax.getData("messages",columns,function(data) {
		src.utils.Message.set(names,data);
		func();
	},src.utils.DB.getWhere(names));
};
src.utils.DB.getWhere = function(array) {
	var wheres = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		wheres.push("name = \"" + array[i] + "\"");
	}
	return wheres.join(" OR ");
};
src.utils.DB.ajax = function(table,columns,where) {
	if(where == null) where = "";
	src.utils.DB._counter++;
	jp.saken.utils.Ajax.getData(table,columns,function(data) {
		if(columns.length > 1) {
			src.utils.DB._map.set(table,data);
			data;
		} else {
			var v = src.utils.DB.getSimpleArray(data,columns[0]);
			src.utils.DB._map.set(table,v);
			v;
		}
		jp.saken.utils.Dom.jWindow.trigger("loadDB");
	},where);
};
src.utils.DB.getSimpleArray = function(data,key) {
	var array = [];
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		array.push(data[i][key]);
	}
	return array;
};
src.utils.DB.onLoaded = function(event) {
	src.utils.DB._counter--;
	if(src.utils.DB._counter > 0) return;
	src.utils.DB.staffs = src.utils.DB._map.get("staffs");
	src.utils.DB.staffMap = src.utils.DB.getMap(src.utils.DB.staffs,"lastname");
	src.utils.DB.pages = src.utils.DB._map.get("pages");
	src.utils.DB.stopUsers = src.utils.DB._map.get("stopUsers");
	src.utils.DB._func();
};
src.utils.DB.getMap = function(data,key,value) {
	var map = new haxe.ds.StringMap();
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = data[i];
		var v;
		if(value == null) v = info; else v = info[value];
		map.set(info[key],v);
		v;
	}
	return map;
};
src.utils.Data = function() { };
src.utils.Data.__name__ = true;
src.utils.Data.init = function(array) {
	var eReg = new EReg(src.utils.DB.stopUsers.join("|"),"i");
	src.utils.Data._formated = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = array[i].split("\t");
		if(eReg.match(info[5])) {
			console.log("Stop User : " + info[5]);
			src.utils.Data._formated = [];
			return;
		}
		src.utils.Data._formated[i] = info;
	}
	console.log("Total : " + src.utils.Data._formated.length);
};
src.utils.Data.getFormated = function() {
	return src.utils.Data._formated;
};
src.utils.Message = function() { };
src.utils.Message.__name__ = true;
src.utils.Message.set = function(names,data) {
	src.utils.Message._counter = 0;
	var map = new haxe.ds.StringMap();
	var ampm;
	if(new Date().getHours() > 12) ampm = "pm"; else ampm = "am";
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = data[i];
		var name = info.name;
		var body = Std.string(info.header) + "\n\n" + Std.string(info.body) + "\n\n" + Std.string(info.footer);
		var v;
		var _g2 = new haxe.ds.StringMap();
		_g2.set("subject",info.subject);
		_g2.set("body",src.utils.Message.getURLReplaced(body,name,ampm));
		v = _g2;
		map.set(name,v);
		v;
	}
	src.utils.Message.normal = map.get(names[0]);
	src.utils.Message.first = map.get(names[1]);
};
src.utils.Message.getURLReplaced = function(body,name,ampm) {
	var _g1 = 0;
	var _g = src.utils.DB.pages.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = src.utils.DB.pages[i];
		var id = info.id;
		var param1 = "?utm_source=" + name + "&utm_content=" + id;
		var param2 = "&utm_medium=mail_" + ampm + "&utm_campaign=lp";
		var eReg = new EReg("##" + id,"");
		var counter = 1;
		while(eReg.match(body)) body = eReg.replace(body,Std.string(info.url) + param1 + counter++ + "_##6_##7" + param2);
	}
	return body;
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
var q = window.jQuery;
js.JQuery = q;
jp.saken.utils.Ajax.PATH = "files/php/";
jp.saken.utils.Dom.document = window.document;
jp.saken.utils.Dom.window = window;
jp.saken.utils.Dom.jWindow = new js.JQuery(jp.saken.utils.Dom.window);
jp.saken.utils.Dom.body = jp.saken.utils.Dom.document.body;
jp.saken.utils.Dom.jBody = new js.JQuery(jp.saken.utils.Dom.body);
jp.saken.utils.Dom.userAgent = jp.saken.utils.Dom.window.navigator.userAgent;
src.Main.main();
})();
