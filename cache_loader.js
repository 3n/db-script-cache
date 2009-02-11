window.script_data = {}

function ScriptCache(){
	var thiz = this
	thiz.db = window.openDatabase ? openDatabase('scriptCache', '1.0', 'Javascript cache', 1000000) : null;
	
	var nullDataHandler = function(transaction, error){ console.log(error); return true; }
	var errorHandler    = function(transaction, error){ console.log(error.message); return true; }
	
	if (thiz.db) thiz.db.transaction(function(transaction){
		transaction.executeSql('CREATE TABLE scripts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, version TEXT NOT NULL, code TEXT NOT NULL);', [], nullDataHandler, errorHandler);
	});
	
	var store_in_cache = function(script_name, version, code){
		if (thiz.db) thiz.db.transaction(function(transaction){
			transaction.executeSql('insert into scripts (name, version, code) VALUES (?,?,?);', [script_name, version, code], nullDataHandler, errorHandler);
		})
	}

	var execute_code = function(code){
		eval.call(window, code);
	}
	
	var get_and_store = function(script_name, version, callback){				
		var req = new XMLHttpRequest();  
		req.open('GET', script_name, false);   
		req.send(null);  
		if(req.status == 200)
			var the_codes = req.responseText;
		
		if (the_codes){
			if (callback) callback(the_codes);
			store_in_cache(script_name, version, the_codes);
		} else
			setTimeout(function(){ get_and_store(script_name, version, callback) }, 100);
	}
	
	var clear_versions = function(script_name){
		if (thiz.db) thiz.db.transaction(function(transaction){
			transaction.executeSql('delete from scripts where name=?;', [script_name], nullDataHandler, errorHandler)
		})
	}
	
	thiz.the_codes = [];
	thiz.completed = 0;
	
	var include_script = function(script_name, version, index, total){		
		if (!thiz.db){
			// get_and_store(script_name, version, function(c){
			// 	thiz.the_codes[index] = c;
			// 	thiz.completed += 1;
			// 	if (thiz.completed === total) execute_code(thiz.the_codes.join(''));
			// });
			
		}else{
			thiz.db.transaction(function(transaction){
				transaction.executeSql('select code from scripts where name=? and version=?;', [script_name, version], function(transaction, data){
					if (data.rows.length > 0){
						thiz.the_codes[index] = data.rows.item(0).code;
						thiz.completed += 1;
						if (thiz.completed === total) execute_code(thiz.the_codes.join(''));
					} else {
						clear_versions(script_name);
						get_and_store(script_name, version, function(c){
							thiz.the_codes[index] = c;
							thiz.completed += 1;
							if (thiz.completed === total) execute_code(thiz.the_codes.join(''));
						})
					}												
				}, errorHandler);
			});
		}
		return thiz;
	}
	
	return {
		includes: function(scripts){
			for (var i=0; i<scripts.length; i++)
				include_script(scripts[i][0], scripts[i][1], i, scripts.length);
		},
		include: function(script_name, version){
			include_script(script_name, version, 0, 1);
		},
		clear_from_cache: function(script_name){
			thiz.db.transaction(function(transaction){
				transaction.executeSql('DELETE FROM scripts WHERE name=?;', [script_name], nullDataHandler, errorHandler);
			});
			return thiz;
		}
	}	
}

// run the code, if any inside of the script tag that included this script. 
var scripts = document.getElementsByTagName("script");
eval.call(window, scripts[scripts.length - 1].innerHTML);
