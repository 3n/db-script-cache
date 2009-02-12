*DBScriptCache*  
*by Ian Collins (3n)*

BREIF OVERVIEW
==============
  DBScriptCache (db\_script\_cache.js) automatically caches script files in the
  browser's HTML5 client-side database. Rather than including your scripts
  using script tags, you include them using this script. The first time a 
  user views the page the scripts will be pulled into the db and stored. 
  On subsequent visits the scripts will be loaded from the db cache and 
  not from your server. The script will continue to come from the cache until
  you supply a new version number or change the name of the script. 

  Why oh why would you want to do something like this? Why not just rely on 
  the browser's built in cache and expires headers? iPhone. No files larger
  than 25K are cached on the current version of MobileSafari on iPhone. On 
  top of this, hard resets, relatively small durations of time and storage caps
  clear the cache entirely. And we all know how slow Edge can be, especially 
  when pulling down 80K of some Javascript library (on top of your own). 

  But you shouldn't be using Javascript libraries on sites meant for iPhone!
  Too bad, I like using Mootools. MobileSafari is a champ and can handle lots
  of awesome Javascript - just check out www.powerset.com on your iPhone.
  
  What if the user's browser doesn't have openDatabase? It will just inject
  the script tags manually and you'll get the standard behavior. 
  
  I'm aware that this is a pretty ridiculous thing to do, and trust me I'm
  still not sure why I made this. But, it works great and reduces load times
  on iPhone from almost a minute to about 2 seconds for my site www.iancollins.me. 
  
USAGE
-----
  If possible, only use DBScriptCache on the iPhone version of your site. 
  However, it should work just fine if you included in all versions. 

  When you would normally have this code to include your scripts in your HEAD:
  
    <script type="text/javascript" src="mootools-1.2.1-core.js"></script>
    <script type="text/javascript" src="scriiip.js"></script>    
  
  You instead have this:
  
    <script type="text/javascript" src="cache_loader.js">
      window.script_cache = window.script_cache || new ScriptCache();
      window.script_cache.includes([ 
        ['mootools-1.2.1-core.js','1.0'], 
        ['scriiip.js'            ,'1.0'] 
      ]);
    </script>
    
  Update the version numbers whenever the script changes. Yes, I see that the 
  version number is a string - just change it to whatever and you'll get a new 
  version. You could have "lol" as your version number and it'd be fine.
  
  Check it out in "production" at http://www.iancollins.me.  

CAVEATS
-------
  1. Since DBScriptCache currently uses eval() to run the cached scripts there 
     is a slight issue with scope: if you define a bunch of local variables and 
     assume they will be tied to the window object outside of the eval execution
     you may run into problems. The only time this has been an issue for me is
     using JsonP, which calls a global function you specify when some data is done
     loading. To fix this I just made sure my callback function was manually
     attached to window by doing "window.JsonP = ...". 
  2. If you do a lot of initialization in a domready function (I know I do) you 
     may run into a problem where your domready callback is never fired. This is 
     because the dom will sometimes be ready before the eval() is called. To fix
     this just fire the domready function manually if it hasn't been run (at the
     bottom of your script). Example using Mootools:

        if (!$3n.dom_is_ready) window.fireEvent('domready');