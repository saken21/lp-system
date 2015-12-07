package src.utils;

import haxe.Http;
import js.JQuery;
import jp.saken.utils.Handy;
import jp.saken.utils.File;
import src.components.View;

class Csv {
	
	private static inline var PHP_URL  :String = 'files/php/exportCSV.php';
	private static inline var FILE_NAME:String = 'data.csv';
	
	/* =======================================================================
	Public - Export
	========================================================================== */
	public static function export(data:Array<Map<String,String>>):Void {
		
		ajax(getAdjusted(data).join('\n'));
		
	}
	
	/* =======================================================================
	Get Adjusted
	========================================================================== */
	private static function getAdjusted(data:Array<Map<String,String>>):Array<String> {
		
		var array:Array<String> = [];
		
		for (i in 0...data.length) {
			
			var info:Map<String,String> = data[i];
			
			var id       :String  = info['id'];
			var subID    :String  = info['subID'];
			var date     :String  = info['date'];
			var corporate:String  = info['corporate'];
			var name     :String  = info['name'];
			var mail     :String  = info['mail'];
			var staff    :String  = info['staff'];
			
			array.push(id + '\t' + subID + '\t' + date + '\t' + corporate + '\t' + name + '\t' + mail + '\t' + staff);
			
		}
		
		return array;
		
	}
	
	/* =======================================================================
	Ajax
	========================================================================== */
	private static function ajax(data:String):Void {
		
		var http:Http = new Http(PHP_URL);

		http.onData = onExported;
		
		http.setParameter('data',data);
		http.setParameter('filename',FILE_NAME);
		
		http.request(true);
		
	}
	
	/* =======================================================================
	On Exported
	========================================================================== */
	private static function onExported(result:String):Void {
		
		File.downloadDirect('files/php/csv/','data.csv');
		
	}
	
}