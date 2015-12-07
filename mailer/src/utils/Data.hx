package src.utils;

class Data {
	
	private static var _formated:Array<Array<String>>;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(array:Array<String>):Void {
		
		_formated = [];
		
		for (i in 0...array.length) {
			_formated[i] = array[i].split('\t');
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