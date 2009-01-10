window.script_cache = {}

var script_name = 'scriiip'

function create_script_elem(src){
	var script_elem = document.createElement('script')
	if (src) script_elem.src = src
	script_elem.type = 'text/javascript'
	document.getElementsByTagName('head')[0].appendChild(script_elem);	
	return script_elem
}

create_script_elem(script_name + '.js')

setTimeout(function(){
	var the_codes = window.script_cache[script_name].toString().replace(/function\s\(\)\s\{/,'').slice(1,-1)	
	create_script_elem().innerHTML = the_codes
}, 200)