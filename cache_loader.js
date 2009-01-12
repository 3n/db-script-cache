window.script_data = {}

///////////////////////////////////////////////////////////////////////////////
// Initialize the DB
window.script_db = openDatabase('scriptCacheDB', '1.0', 'Javascript cache', 100000);

function nullDataHandler(transaction, error){ console.log(error); return true; }
function errorHandler(transaction, error){ console.log(error.message); return true; }

function createTables(db){
	db.transaction(function(transaction){
		transaction.executeSql('CREATE TABLE scripts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL);', [], nullDataHandler, errorHandler);
	});
	// db.transaction(function(transaction){
	// 	transaction.executeSql('DELETE FROM scripts WHERE name="' + script_name + '";', [], nullDataHandler, errorHandler)
	// });			
}
createTables(window.script_db)

///////////////////////////////////////////////////////////////////////////////
// Load some sciips
var script_name = 'scriiip'

function create_script_elem(src){
	var script_elem = document.createElement('script')
	if (src) script_elem.src = src
	script_elem.type = 'text/javascript'
	document.getElementsByTagName('head')[0].appendChild(script_elem);	
	return script_elem
}

window.script_db.transaction(function(transaction){
	transaction.executeSql('select code from scripts where name=?;', [script_name], function(transaction, data){
		if (data.rows.length > 0)
			create_script_elem().innerHTML = data.rows.item(0).code
		else {
			console.log('PULLING LIVE DAWG')
			create_script_elem(script_name + '.js')
			setTimeout(function(){
				var the_codes = window.script_data[script_name].toString().replace(/^function\s*\(\)\s*\{/,'').slice(1,-1)	
				create_script_elem().innerHTML = the_codes
				
				window.script_db.transaction(function(transaction){
					transaction.executeSql('insert into scripts (name, code) VALUES (?,?);', [script_name, the_codes], nullDataHandler, errorHandler)
				})
			}, 200)
		}
	}, errorHandler)
})
