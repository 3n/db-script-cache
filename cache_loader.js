window.script_data = {}

function ScriptCache(){
	var thiz = this
	thiz.db = window.openDatabase ? openDatabase('scriptCache', '1.0', 'Javascript cache', 1000000) : null;
	
	var nullDataHandler = function(transaction, error){ console.log(error); return true; }
	var errorHandler    = function(transaction, error){ console.log(error.message); return true; }
	
	if (thiz.db) thiz.db.transaction(function(transaction){
		transaction.executeSql('CREATE TABLE scripts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, version TEXT NOT NULL, code TEXT NOT NULL);', [], nullDataHandler, errorHandler);
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
	
	var store_in_cache = function(script_name, version, code){
		if (thiz.db) thiz.db.transaction(function(transaction){
			transaction.executeSql('insert into scripts (name, version, code) VALUES (?,?,?);', [script_name, version, code], nullDataHandler, errorHandler)
		})
	}
	
	// var sanatize_angle_brackets = function(string){
	// 	return string.replace(/'([^'\n;]*)(<)([^'\n;]*)'/g,     "'$1\\u003c$3'")
	// 							 .replace(/'([^'\n;]*)(>)([^'\n;]*)'/g,     "'$1\\u003e$3'")
	// 							 .replace(/"([^"\n;]*)(<)([^"\n;]*)"/g,   "\"$1\\u003c$3\"")
	//   						 .replace(/"([^"\n;]*)(>)([^"\n;]*)"/g,   "\"$1\\u003e$3\"")
	// 							 .replace(/\/([^\/\n;]*)(<)([^\/\n;]*)\//g, "/$1\\u003c$3/")
	// 							 .replace(/\/([^\/\n;]*)(>)([^\/\n;]*)\//g, "/$1\\u003e$3/")
	// }
	
	var execute_code = function(code){
		eval.call(window, code)
		// var tmp = sanatize_angle_brackets(sanatize_angle_brackets(sanatize_angle_brackets(sanatize_angle_brackets(code))))
		// create_script_elem().innerHTML = tmp
	}
	
	var get_and_store = function(script_name, version, callback){		
		var the_codes = get_code(script_name)
		if (the_codes){
			if (callback) callback(the_codes)
			store_in_cache(script_name, version, the_codes)
		} else
			setTimeout(function(){ get_and_store(script_name, version, callback) }, 100)
	}
	
	var clear_versions = function(script_name){
		if (thiz.db) thiz.db.transaction(function(transaction){
			transaction.executeSql('delete from scripts where name=?;', [script_name], nullDataHandler, errorHandler)
		})
	}
	
	thiz.the_codes = []
	
	var include_script = function(script_name, version, index, is_last){
		if (!thiz.db){
			create_script_elem(script_name)
			get_and_store(script_name, version, function(c){
				thiz.the_codes[index] = c
				if (is_last) execute_code(thiz.the_codes.join(''))
			})
		}else{
			thiz.db.transaction(function(transaction){
				transaction.executeSql('select code from scripts where name=? and version=?;', [script_name, version], function(transaction, data){
					if (data.rows.length > 0){
						thiz.the_codes[index] = data.rows.item(0).code
						if (is_last) execute_code(thiz.the_codes.join(''))
					} else {
						clear_versions(script_name)
						create_script_elem(script_name)
						get_and_store(script_name, version, function(c){
							thiz.the_codes[index] = c
							if (is_last) execute_code(thiz.the_codes.join(''))
						})
					}												
				}, errorHandler)
			});
		}
		return thiz;
	}
	
	return {
		includes: function(scripts){
			for (var i=0; i<scripts.length; i++)
				include_script(scripts[i][0], scripts[i][1], i, i == scripts.length-1)
		},
		include: function(script_name, version){
			include_script(script_name, version, 0, true)
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
eval.call(window, scripts[scripts.length - 1].innerHTML);
