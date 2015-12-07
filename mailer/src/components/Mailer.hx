package src.components;

import haxe.Http;
import jp.saken.utils.Handy;
import src.utils.Data;
import src.utils.DB;
import src.utils.Message;

class Mailer {
	
	/* =======================================================================
	Public - Send
	========================================================================== */
	public static function send(testmail:String):Void {
		
		var counter:Int = 0;
		
		var formatedData:Array<Array<String>> = Data.getFormated();
		var isTest:Bool = testmail.length > 0;

		for (i in 0...formatedData.length) {
			
			counter++;
			
			var replaced:Map<String,String> = getReplaced(formatedData[i],counter);
			
			if (isTest) {
				
				if (counter % 100 == 0) {
					
					replaced['mail'] = testmail;
					request(replaced);
					
				}
				
			} else {
				
				request(replaced);

				if (counter % 333 == 0) {
					
					replaced['mail'] = 'sakata@graphic.co.jp';
					request(replaced);
					
				}
				
			}
			
		}

	}
	
	/* =======================================================================
	Get Replaced
	========================================================================== */
	private static function getReplaced(info:Array<String>,num:Int):Map<String,String> {
		
		var date     :String = info[2];
		var corporate:String = info[3];
		var name     :String = info[4];
		var mail     :String = info[5];
		
		var message:Map<String,String> = getMessage(date.length == 0);
		var body:String = message['body'];
		
		var staff        :Dynamic = DB.staffMap[info[6]];
		var staffName    :String  = staff.lastname;
		var staffFullname:String  = staffName + ' ' + staff.firstname;
		var staffAlphabet:String = staff.mailaddress;
		var staffMail    :String = staffAlphabet + '@graphic.co.jp';
		
		body = StringTools.replace(body,'##1',corporate);
		body = StringTools.replace(body,'##2',name);
		body = StringTools.replace(body,'##3',staffName);
		body = StringTools.replace(body,'##4',staffFullname);
		body = StringTools.replace(body,'##5',staffMail);
		body = StringTools.replace(body,'##6',Std.string(num));
		body = StringTools.replace(body,'##7',staffAlphabet.substr(0,2));
		
		return ['mail'=>mail,'subject'=>message['subject'],'body'=>body,'staffFullname'=>staffFullname,'staffMail'=>staffMail];
		
	}
	
	/* =======================================================================
	Get Message
	========================================================================== */
	private static function getMessage(isFirst:Bool):Map<String,String> {
		
		if (Message.first != null && isFirst) {
			return Message.first;
		}
		
		return Message.normal;
		
	}
	
	/* =======================================================================
	Request
	========================================================================== */
	private static function request(map:Map<String,String>):Void {
		
		var http:Http = new Http('files/php/sendMail.php');
		
		http.onData = function(data:String):Void { trace(data); };
		
		http.setParameter('staffFullname',map['staffFullname']);
		http.setParameter('staffMail',map['staffMail']);
		http.setParameter('to',map['mail']);
		http.setParameter('subject',map['subject']);
		http.setParameter('body',map['body']);
		
		http.request(true);
		
	}
	
}