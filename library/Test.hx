package;

class Test {
	
	/* =======================================================================
	Public - Trace Header
	========================================================================== */
	public static function traceHeader(array:Array<String>):Void {
		
		var strings:Array<String> = [];
		
		for (p in 0...array.length) {
			strings.push(p + ':' + array[p]);
		}
		
		trace(strings.join(','));
		
	}
	
}