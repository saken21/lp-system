package src.components;

import js.JQuery;
import jp.saken.utils.Handy;
import jp.saken.utils.Dom;
import jp.saken.ui.DragAndDrop;
import src.utils.DB;
import Test;

class View {
	
	private static var _jFilename  :JQuery;
	private static var _jListName  :JQuery;
	private static var _jSteps     :JQuery;
	private static var _jButtons   :JQuery;
	private static var _jList      :JQuery;
	private static var _dragAndDrop:DragAndDrop;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		var jAll :JQuery = new JQuery('#all').show();
		var jForm:JQuery = jAll.find('#form');
		
		_jFilename = jAll.find('#filename');
		_jSteps    = jForm.find('.step');
		_jListName = jForm.find('#list-name');
		_jButtons  = jForm.find('button').on('click',onClick);
		_jList     = jAll.find('#list');
		
		_dragAndDrop = new DragAndDrop(Dom.jWindow,onDropped);
		
	}
	
	/* =======================================================================
	On Dropped
	========================================================================== */
	private static function onDropped(data:String):Void {
		
		_jFilename.text(_dragAndDrop.getFilename());
		
		var array:Array<String> = data.split('\n');
		
		Test.traceHeader(array[0].split('\t'));
		trace('All : ' + array.length);
		
		showParts('getlist');
		
	}
	
	/* =======================================================================
	On Click
	========================================================================== */
	private static function onClick(event:JqEvent):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		
		switch (jTarget.prop('class')) {
			
			case 'getlist'  : setScreenedList();
			case 'sendmail' : sendMail();
			
		}
		
	}
	
	/* =======================================================================
	Set Screened List
	========================================================================== */
	private static function setScreenedList():Void {
		
		var name:String = _jListName.prop('value');
		
		if (name.length < 1) {
			
			Handy.alert('対象リスト名を入力してください。');
			return;
			
		}
		
		DB.loadScreenedList(name,function():Void {
			
			
		});
		
	}
	
	/* =======================================================================
	Send Mail
	========================================================================== */
	private static function sendMail():Void {
		
		
		
	}
	
	/* =======================================================================
	Show Parts
	========================================================================== */
	private static function showParts(key:String):Void {
		
		_jSteps.filter('.' + key).show();
		
	}
	
}