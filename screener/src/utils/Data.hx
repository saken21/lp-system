package src.utils;

class Data {
	
	private static var _raw          :Array<String>;
	private static var _localScreened:Array<Dynamic>;
	private static var _webScreened  :Array<Map<String,String>>;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(array:Array<String>):Void {
		
		_raw = array;
		_localScreened = _webScreened = [];
		
	}
	
	/* =======================================================================
	Public - Get Raw
	========================================================================== */
	public static function getRaw():Array<String> {
		
		return _raw;
		
	}
	
	/* =======================================================================
	Public - Shift Raw
	========================================================================== */
	public static function shiftRaw():Void {
		
		_raw.shift();
		
	}
	
	/* =======================================================================
	Public - Set Local Screened
	========================================================================== */
	public static function setLocalScreened(data:Array<Dynamic>):Void {
		
		_localScreened = data;
		
	}
	
	/* =======================================================================
	Public - Get Local Screened
	========================================================================== */
	public static function getLocalScreened():Array<Dynamic> {
		
		return _localScreened;
		
	}
	
	/* =======================================================================
	Public - Set Web Screened
	========================================================================== */
	public static function setWebScreened(data:Array<Map<String,String>>):Void {
		
		_webScreened = data;
		
	}
	
	/* =======================================================================
	Public - Get Web Screened
	========================================================================== */
	public static function getWebScreened():Array<Map<String,String>> {
		
		return _webScreened;
		
	}
	
	/* =======================================================================
	Public - Push Web Screened
	========================================================================== */
	public static function pushWebScreened(info:Map<String,String>):Void {
		
		_webScreened.push(info);
		
	}
	
}