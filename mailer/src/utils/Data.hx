package src.utils;

class Data {
	
	private static var _formated:Array<Array<String>>;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(array:Array<String>):Void {
		
		var eReg:EReg = new EReg(DB.stopUsers.join('|'),'i');
		
		_formated = [];
		
		for (i in 0...array.length) {
			
			var info:Array<String> = array[i].split('\t');
			
			if (eReg.match(info[5])) {
				
				trace('Stop User : ' + info[5]);
				_formated = [];
				
				return;
				
			}
			
			_formated[i] = info;
			
		}
		
		trace('Total : ' + _formated.length);
		
	}
	
	/* =======================================================================
	Public - Get Formated
	========================================================================== */
	public static function getFormated():Array<Array<String>> {
		
		return _formated;
		
	}
	
}