// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
// With extensions by Jasper Stafleu
; (function($){
  var cache = {};
  
  $.fn.tmpl = function tmpl(data, isLater){
	  	var $container = $(this),
	  			html = '',
	  			id = $container.attr('id');
	  	
	  
	  	if ( $.isArray(this) ) {
	  		return $.each(this, function() { $(this).tmpl(data); });
	  	} else if ( $.isArray(data) ) {
	  		$.each(data, function(it) {
	  			this.it = it;
	  			html+=$container.tmpl(this, true).html(); 
	  		});
	  	} else {
		  	// Figure out if we're getting a template, or if we need to
		    // load the template - and be sure to cache the result.
	  		if ( !(id in cache) ) {
		      // Generate a reusable function that will serve as a template
		      // generator (and which will be cached).
	  			str = $container.find('script').html();
	  	  	if ( typeof str === typeof undefined ) {
	  	  		str = $(document).find('#' + id + '_template').html();
	  	  	}
	  			
	  			cache[id] = new Function("obj",
	  					"var p=[],print=function(){p.push.apply(p,arguments);};" +
			        
			        // Introduce the data as local variables using with(){}
			        "with(obj){p.push('" +
			        
			        // Convert the template into pure JavaScript
			        str
			        	.replace(/<!--[\s\S]*?-->/g, '')
			          .replace(/[\r\t\n]/g, " ")
			          .split("<%").join("\t")
			          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
			          .replace(/\t=(.*?)%>/g, "',$1,'")
			          .split("\t").join("');")
			          .split("%>").join("p.push('")
			          .split("\r").join("\\'")
			      + "');}return p.join('');");
	  		}
	  		var fn = cache[$container.attr('id')];
		   
		    // Provide some basic currying to the user
  			html = fn(data);
	  	};
	  	
  		$container.html(html);
	  	
	  	return $container;
  };
  
})(jQuery);