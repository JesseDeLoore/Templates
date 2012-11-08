/*!
 * CxProxy.jquery.js
 * 
 * Adds a useCxProxy option to $.ajax calls, which parses the API call to be
 * handled by the Carerix app's proxy server, thereby preventing the issue of
 * CrossDomain requests.
 * 
 * @author	J. Stafleu <jstafleu@jcgroep.nl>
 * @created	01 november 2012
 */
; (function($) {
	$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
		if ( options.useCxProxy ) {
			var uriParts = options.url.split('/'),
					scheme = uriParts[0] + '//',
					newUriparts = uriParts.slice(2, 5),
					it,
					data = []
			;
			
			for ( it = 5; it < uriParts.length; it+=2 ) {
				data.push(uriParts[it] + '=' + uriParts[it+1]);
			} // for
			if ( options.data ) {
				data.push(options.data);
			}
			options.data = data.join('&');
			
			options.url = scheme 
					+ document.URL.substr(document.URL.indexOf('://') + 3, document.URL.indexOf('.') - document.URL.indexOf('://') - 3)
					+ '.carerix.net/cgi-bin/nph-proxy.cgi/h0/'
					+	scheme.replace('://', '') + '/'
					+ options.username + ':' + options.password + '@'
					+ newUriparts.join('/')
			;
			delete options.username;
			delete options.password;
			options.traditional = true;
		}
	});
	
	$.cxXml2Json = function cxXml2Json(xmlNode) {
		if ( xmlNode.nodeType === 3 ) return xmlNode.nodeValue;

		var ret = {}, item, it;

		// parse the attributes
		if ( xmlNode.attributes && xmlNode.attributes.length ) {
			ret['@attributes'] = {};
			for ( it = 0; it < xmlNode.attributes.length; it++ ) {
				item = xmlNode.attributes.item(it);
				ret['@attributes'][item.nodeName] = item.nodeValue;
			}
		}
		
		// parse the children
		$(xmlNode).contents().each(function() {
			if ( typeof (parsed = cxXml2Json(this)) === typeof '' && $.trim(parsed) === '' ) return;
			switch ( true ) {
				case typeof this.tagName === typeof undefined :
					ret = parsed;
					return false;
				case typeof ret[this.tagName] === typeof undefined : 
					ret[this.tagName] = parsed;
					break;
				case !$.isArray(ret[this.tagName]) :
					ret[this.tagName] = [ret[this.tagName]];
					// no break!
				case $.isArray(ret[this.tagName]) :
					ret[this.tagName].push(parsed);
					break;
			} // switch
		});
		return ret;
	};
	
	$.cxXml2Json_flat = function(response) {
		var rootName = '',
				subrootName = '',
				ret = {};
		
		obj = $.cxXml2Json(response);

		// remove the root
		for ( rootName in obj ) break;
		
		ret.count = parseInt(obj[rootName]['@attributes'].count);

		for ( subrootName in obj[rootName] ) {
			if ( subrootName !== '@attributes' ) break;
		} // for
		
		ret.rows = _flatten(obj[rootName]);
		ret.success = true;
		return ret;
	}; // cxXml2Json_flat();
	
	/**
	 * Flatten an object so it looks like the output of objects.json 
	 */
	function _flatten(el) {
		var it = '', it2 = '', ret = {}, tmp;
		
		if ( typeof el['@attributes'] !== typeof undefined ) {
			if ( typeof el['@attributes']['id'] !== typeof undefined ) {
				ret.id = el['@attributes']['id'];
			}
			if ( typeof el['@attributes']['entity'] !== typeof undefined ) {
				ret.id = el['@attributes']['entity'];
			}
		}
		
		for ( it in el ) {
			if ( it === '@attributes' || typeof el[it] === typeof function() {} ) {
				continue;
			} else if ( it.indexOf('CR') === 0 ) {
				if ( el['@attributes'] && el['@attributes'].count ) {
					if ( !$.isArray(el[it]) ) {
						ret = [_flatten(el[it])];
					} else {
						ret = [];
						for ( it2 = 0; it2 < el[it].length; it2++ ) {
							tmp = _flatten(el[it][it2]);
							ret.push(tmp);
						}
					}
				} else {
					ret = _flatten(el[it]);
					ret.entity = it;
				}
			} else if ( typeof el[it] === typeof {} ) {
				ret[it] = _flatten(el[it]);
			} else {
				ret[it] = el[it];
			}
		} // for
		
		return ret;
	} // _flatten();
	
})(jQuery);