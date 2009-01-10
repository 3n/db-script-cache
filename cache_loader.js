window.script_cache = {}

function create_script_elem(src){
	var script_elem = document.createElement('script')
	if (src) script_elem.src = src
	script_elem.type = 'text/javascript'
	document.getElementsByTagName('head')[0].appendChild(script_elem);	
	return script_elem
}

create_script_elem('scriiip.js')

setTimeout(function(){
	var the_codes = window.script_cache['scriiip'].toString().replace(/function\s\(\)\s\{/,'').slice(1,-1)	
	create_script_elem(null).innerHTML = the_codes
}, 200)