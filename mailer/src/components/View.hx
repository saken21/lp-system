package src.components;

import js.JQuery;
import jp.saken.utils.Handy;
import jp.saken.utils.Dom;
import jp.saken.ui.DragAndDrop;
import src.utils.DB;
import src.utils.Data;

class View {
	
	private static var _jFilename  :JQuery;
	private static var _jForm      :JQuery;
	private static var _jButtons   :JQuery;
	private static var _dragAndDrop:DragAndDrop;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		var jAll:JQuery = new JQuery('#all').show();
		
		_jFilename = jAll.find('#filename');
		_jForm     = jAll.find('#form');
		
		_jForm.find('.sendMail').on('click',sendMail);
		
		_dragAndDrop = new DragAndDrop(Dom.jWindow,onDropped);
		
	}
	
	/* =======================================================================
	On Dropped
	========================================================================== */
	private static function onDropped(data:String):Void {
		
		_jFilename.text(_dragAndDrop.getFilename());
		_jForm.show();
		
		Data.init(data.split('\n'));
		
	}
	
	/* =======================================================================
	Send Mail
	========================================================================== */
	private static function sendMail(event:JqEvent):Void {
		
		if (Data.getFormated().length == 0) {
			
			Handy.alert('リストに誤りがあります。メール送信できません。');
			return;
			
		}
		
		var messageNames:Array<String> = getMessageNames();
		
		if (messageNames == null) {
			
			Handy.alert('メッセージ名を入力してください。');
			return;
			
		}
		
		var testmail:String = _jForm.find('#test-mailaddress').prop('value');
		
		if (Dom.window.confirm('メールを送信します。\nよろしいですか？')) {
			
			if (testmail.length > 0) {
				
				execute(messageNames,testmail);
				
			} else {
				
				if (Dom.window.confirm('本番配信を行います。')) {
					execute(messageNames,testmail);
				}
				
			}
			
		}
		
	}
	
	/* =======================================================================
	Execute
	========================================================================== */
	private static function execute(messageNames:Array<String>,testmail:String):Void {
		
		DB.loadMessage(messageNames,function():Void {
			Mailer.send(testmail);
		});
		
	}
	
	/* =======================================================================
	Get Message Names
	========================================================================== */
	private static function getMessageNames():Array<String> {
		
		var messageName:String = _jForm.find('#message-name').prop('value');
		if (messageName.length == 0) return null;
		
		var array:Array<String> = [messageName];
		var isNeedFirst:Bool = _jForm.find('#is-need-first').is(':checked');
		
		if (isNeedFirst) array.push(messageName + '_f');
		
		return array;
		
	}
	
}