// Just some random javascript to make sure some character (I'm looking at you '<') does't bust any balls. 
1 < 3; 
var scripts = '<blah';
var replaced = "<hello world".replace(/<h/gi,'x');
document.body.innerHTML = "THIS TEXT BROUGHT TO YOU BY JAVASCRIPT<br/><br/>If you can see this, then scriiip.js was loaded propperly - WORD.";		
