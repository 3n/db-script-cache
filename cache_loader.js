window.script_data = {}

function ScriptCache(){
	var thiz = this
	thiz.db = window.openDatabase ? openDatabase('scriptCacheDB', '1.0', 'Javascript cache', 1000000) : null;
	
	var nullDataHandler = function(transaction, error){ console.log(error); return true; }
	var errorHandler    = function(transaction, error){ console.log(error.message); return true; }
	
	if (thiz.db) thiz.db.transaction(function(transaction){
		transaction.executeSql('CREATE TABLE scripts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL);', [], nullDataHandler, errorHandler);
	});
	
	var create_script_elem = function(src){
		var script_elem = document.createElement('script');
		if (src) script_elem.src = src;
		script_elem.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script_elem);	
		return script_elem;
	}
	
	var get_code = function(script_name){
		if (window.script_data[script_name])
			return window.script_data[script_name].toString().replace(/^function\s*\(\)\s*\{/,'').slice(1,-1)
	}
	
	var store_in_cache = function(script_name, code){
		if (thiz.db) thiz.db.transaction(function(transaction){
			transaction.executeSql('insert into scripts (name, code) VALUES (?,?);', [script_name, code], nullDataHandler, errorHandler)
		})
	}
	
	var get_and_store = function(script_name){		
		var the_codes = get_code(script_name)
		if (the_codes){
			eval.call(window, the_codes)
			store_in_cache(script_name, the_codes)
		} else
			setTimeout(function(){ get_and_store(script_name) }, 100)
	}
	
	return {
		include: function(script_name){
			if (!thiz.db){
				create_script_elem(script_name)
				get_and_store(script_name)
				return
			}
			thiz.db.transaction(function(transaction){
				transaction.executeSql('select code from scripts where name=?;', [script_name], function(transaction, data){
					if (data.rows.length > 0)
						eval.call(window, data.rows.item(0).code)
					else {
						create_script_elem(script_name)
						get_and_store(script_name)
					}												
				}, errorHandler)
			});
			return thiz;
		},
		clear_from_cache: function(script_name){
			thiz.db.transaction(function(transaction){
				transaction.executeSql('DELETE FROM scripts WHERE name=?;', [script_name], nullDataHandler, errorHandler)
			});
			return thiz;
		}
	}	
}

var scripts = document.getElementsByTagName("script");
eval(scripts[scripts.length - 1].innerHTML);
