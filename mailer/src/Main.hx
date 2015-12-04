/**
* ================================================================================
*
* Mailer ver 1.00.00
*
* Author : KENTA SAKATA
* Since  : 2015/12/04
* Update : 2015/12/04
*
* Licensed under the MIT License
* Copyright (c) Kenta Sakata
* http://saken.jp/
*
* ================================================================================
*
**/
package src;

import js.JQuery;
import src.components.View;
import src.utils.DB;

class Main {
	
	public static function main():Void {
		
		new JQuery('document').ready(init);
		
    }

	private static function init(event:JqEvent):Void {
		
		DB.load(View.init);
		
	}

}