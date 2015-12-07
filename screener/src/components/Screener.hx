package src.components;

import js.JQuery;
import jp.saken.utils.Handy;
import src.utils.Data;
import src.utils.ER;

class Screener {
	
	private static var _mains  :Map<String,Dynamic>;
	private static var _counter:Int;
	private static var _isBusy :Bool;
	
	private static inline var HEAD_LENGTH:Int = 9;
	
	/* =======================================================================
	Public - Ready
	========================================================================== */
	public static function ready():Void {

		_mains = new Map();
		Data.setLocalScreened(getLocalScreenedData());

	}
	
		/* =======================================================================
		Public - Start
		========================================================================== */
		public static function start():Void {
			
			startGlobal(Data.getLocalScreened());

		}
		
		/* =======================================================================
		Public - Get Busy
		========================================================================== */
		public static function getBusy():Bool {

			return _isBusy;

		}
		
		/* =======================================================================
		Public - Set Counter
		========================================================================== */
		public static function setCounter(value:Int):Void {

			_counter = value;

		}
		
		/* =======================================================================
		Public - Start Global
		========================================================================== */
		public static function startGlobal(data:Array<Dynamic>):Void {
			
			_isBusy  = true;
			_counter = data.length;

			for (i in 0...data.length) {
				
				var info:Map<String,String> = data[i];
				accessDomain(info);
				
			}

		}
	
	/* =======================================================================
	Get Local Screened Data
	========================================================================== */
	private static function getLocalScreenedData():Array<Dynamic> {
		
		_mains = new Map();
		
		var results:Array<Dynamic> = [];
		var rawData:Array<String>  = Data.getRaw();
		
		for (p in 0...rawData.length) {
			
			var string:String = rawData[p];
			var info:Map<String,String> = getInfo(string.split('\t'));
			
			if (info != null) results.push(info);
			
		}
		
		trace('Local Screened : ' + results.length);
		
		return results;
		
	}
	
	/* =======================================================================
	Get Info
	========================================================================== */
	private static function getInfo(array:Array<String>):Map<String,String> {
		
		if (array.length < HEAD_LENGTH) return null;
		
		var id       :String = array[0];
		var subID    :String = array[1];
		var date     :String = array[2];
		var corporate:String = getCorporate(array[5]);
		var name     :String = getName(array[6],array[7]);
		var mail     :String = getMailaddress(array[9]);
		
		if (corporate == null || name == null || mail == null) {
			return null;
		}
		
		var domain:String = getDomain(mail.split('@')[1]);
		if (domain == null) return null;
		
		if (isBadID(id,Std.parseInt(subID),corporate,mail,domain)) {
			return null;
		}
		
		return ['id'=>id, 'subID'=>subID, 'date'=>date, 'corporate'=>corporate, 'name'=>name, 'mail'=>mail, 'domain'=>domain];
		
	}
	
	/* =======================================================================
	Get Corporate
	========================================================================== */
	private static function getCorporate(value:String):String {
		
		if (value.length < 1) return null;
		
		value = getReplaced(value);
		if (ER.ngWords.match(value)) return null;
		
		return value;
		
	}
	
	/* =======================================================================
	Get Name
	========================================================================== */
	private static function getName(a:String,b:String):String {
		
		if (a.length < 1 && b.length < 1) return null;
		
		var fullname:String = getReplaced(a + ' ' + b);
		if (fullname.indexOf('株式会社') > -1) fullname = 'ご担当者';
		
		return fullname;
		
	}
	
	/* =======================================================================
	Get Mailaddress
	========================================================================== */
	private static function getMailaddress(value:String):String {
		
		if (value.length < 1) return null;
		if (!(~/@/.match(value))) return null;
		if (ER.stopUsers.match(value)) return null;
		
		return value;
		
	}
	
	/* =======================================================================
	Get Domain
	========================================================================== */
	private static function getDomain(value:String):String {
		
		if (value.length < 1) return null;
		if (ER.ngDomains.match(value)) return null;
		
		return value;
		
	}
	
	/* =======================================================================
	Is Bad ID
	========================================================================== */
	private static function isBadID(id:String,subID:Int,corporate:String,mail:String,domain:String):Bool {
		
		if (subID > 1) {
			
			var main:Dynamic = _mains[id];
			if (main == null) return true;
			
			var c:String        = main.c;
			var d:String        = main.d;
			var m:Array<String> = main.m;
			
			if (c == null || d == null) return true;
			
			if (corporate.indexOf(c) < 0 || mail.indexOf(d) < 0) return true;
			if (m.indexOf(mail) > -1) return true;
			
			m.push(mail);
			
		} else {
			
			_mains[id] = { c:corporate, d:domain, m:[mail] };
			
		}
		
		return false;
		
	}
	
	/* =======================================================================
	Get Replaced
	========================================================================== */
	private static function getReplaced(value:String):String {
		
		value = StringTools.replace(value,'⑰','㈲');
		value = StringTools.replace(value,'⑭','（株）');
		value = StringTools.replace(value,'&amp;','&');
		value = StringTools.replace(value,'&#039;','\'');
		value = StringTools.replace(value,'&#8226;','・');
		
		return value;
		
	}
	
	/* =======================================================================
	Access Domain
	========================================================================== */
	private static function accessDomain(info:Map<String,String>):Void {

		untyped $.ajax({
			
			type : 'GET',
			url  : 'http://' + info['domain']
			
		}).done(function(data:Dynamic):Void {
			
			analyzeKeyword(data.results[0],info);
			removeCounter();
			
		}).fail(removeCounter);

	}
	
	/* =======================================================================
	Analyze Keyword
	========================================================================== */
	private static function analyzeKeyword(value:String,info:Map<String,String>):Void {

		if (value == null) return;

		var jHead       :JQuery = new JQuery('<div>' + value.split('<body')[0] + '</div>');
		var jKeywords   :JQuery = jHead.find('meta[name*="eyword"]');
		var jDescription:JQuery = jHead.find('meta[name*="escription"]');
		
		if (jKeywords.length == 0) jKeywords = jHead.find('meta[name="KEYWORDS"]');
		if (jDescription.length == 0) jDescription = jHead.find('meta[name="DESCRIPTION"]');
		
		var keywords:String = jKeywords.prop('content') + jDescription.prop('content');
		
		trace('Keyword : ' + keywords);

		if (!ER.ngWords.match(keywords)) Data.pushWebScreened(info);
		
	}
	
	/* =======================================================================
	Remove Counter
	========================================================================== */
	private static function removeCounter():Void {
		
		_counter--;
		
		if (_counter == 0) {
			
			_isBusy = false;
			
			Handy.alert('スクリーニングが完了しました（' + Data.getWebScreened().length + '件）。');
			View.showSaveButton();
			
		}
		
		trace(_counter);
		
	}
	
}