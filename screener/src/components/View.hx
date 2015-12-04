package src.components;

import js.JQuery;
import jp.saken.utils.Handy;
import jp.saken.utils.Dom;
import jp.saken.ui.DragAndDrop;
import src.utils.DB;
import src.utils.Data;
import src.utils.ER;
import src.utils.Csv;
import Test;

class View {
	
	private static var _jFilename       :JQuery;
	private static var _jNgWord         :JQuery;
	private static var _jScreeningLength:JQuery;
	private static var _jButtons        :JQuery;
	private static var _jScreeningList  :JQuery;
	private static var _dragAndDrop     :DragAndDrop;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		var jAll :JQuery = new JQuery('#all').show();
		var jForm:JQuery = jAll.find('#form');
		
		_jFilename        = jAll.find('#filename');
		_jNgWord          = jForm.find('#ng-word');
		_jScreeningLength = jForm.find('#screening-length').trigger('focus');
		_jButtons         = jForm.find('button').on('click',onClick);
		_jScreeningList   = jAll.find('#screening-list');
		
		_dragAndDrop = new DragAndDrop(Dom.jWindow,onDropped);
		
	}
	
		/* =======================================================================
		Public - Set Screened
		========================================================================== */
		public static function setScreened(html:String):Void {
			
			_jScreeningList.html(html);
			
		}
		
		/* =======================================================================
		Public - Show Save Button
		========================================================================== */
		public static function showSaveButton():Void {
			
			showButton('save');
			
		}
	
	/* =======================================================================
	On Dropped
	========================================================================== */
	private static function onDropped(data:String):Void {
		
		_jFilename.text(_dragAndDrop.getFilename());
		
		var array:Array<String> = data.split('\n');
		empty(array);
		
		Test.traceHeader(array[0].split('\t'));
		trace('All : ' + array.length);
		
		ER.set(_jNgWord.prop('value'));
		Screener.ready();

		setSliced(Std.parseInt(_jScreeningLength.prop('value')));
		
	}
	
	/* =======================================================================
	On Click
	========================================================================== */
	private static function onClick(event:JqEvent):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		
		switch (jTarget.prop('class')) {
			
			case 'start' : Screener.start();
			case 'save'  : save();
			
		}
		
	}
	
	/* =======================================================================
	Save
	========================================================================== */
	private static function save():Void {
		
		var data:Array<Map<String,String>> = Data.getWebScreened();
		var length:Int = data.length;
		
		for (i in 0...length) {
			
			var info:Map<String,String> = data[i];
			info['staff'] = getStaff(info['id']);
			
		}
		
		trace('Screened List : ' + length);
		Csv.export(data);
		
	}
	
	/* =======================================================================
	Get Staff
	========================================================================== */
	private static function getStaff(clientID:String):String {
		
		var staff:Dynamic;
		var staffID:String = DB.supports[clientID];
		
		if (staffID == null) {
			
			staff = Handy.shuffleArray(DB.staffs)[0];
			staffID = staff.id;

			DB.supports[clientID] = staffID;
			DB.insertSupport(clientID,staffID);
			
		} else {
			
			staff = DB.staffMap[staffID];
			
		}
		
		return staff.lastname;
		
	}
	
	/* =======================================================================
	Set Sliced
	========================================================================== */
	private static function setSliced(length:Int):Void {
		
		if (length < 1) {
			
			showButton('start');
			return;
			
		}
		
		var data:Array<Dynamic> = Handy.getSlicedArray(Data.getLocalScreened(),length);
		var html:String = '';

		for (p in 0...data.length) {
			html += '<a class="slicedData" data-id="' + p + '">No.' + Handy.getFilledNumber(p) + ' (' + data[p].length + ')</a>';
		}
		
		_jScreeningList.html(html + '<p class="empty"></p>').find('a').on('click',function(event:JqEvent):Void {

			if (Screener.getBusy()) {

				Handy.alert('処理中です。しばらくお待ちください。');
				return;

			}
			
			var jTarget:JQuery = JQuery.cur;

			Screener.startGlobal(data[jTarget.data('id')]);
			jTarget.remove();

		});
		
	}
	
	/* =======================================================================
	Show Start Button
	========================================================================== */
	private static function showButton(key:String):Void {
		
		_jButtons.filter('.' + key).show();
		
	}
	
	/* =======================================================================
	Empty
	========================================================================== */
	private static function empty(data:Array<String>):Void {
		
		Data.init(data);
		
		_jScreeningList.find('a').unbind();
		_jButtons.hide();
		
	}
	
}