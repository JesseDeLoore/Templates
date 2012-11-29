	/**
	 * Set the date to the previous month.
	 */
	Date.prototype.prevMonth = function() {
		var thisMonth = this.getMonth();
		this.setMonth(thisMonth-1);
		if( this.getMonth() != thisMonth-1 && (this.getMonth() != 11 || (thisMonth == 11 && this.getDate() == 1)))
			this.setDate(0);
		return this;
	}; // prevMonth();
	
	/**
	 * Set the date to the next month.
	 */
	Date.prototype.nextMonth = function() {
		var thisMonth = this.getMonth();
		this.setMonth(thisMonth+1);
		if(this.getMonth() != thisMonth+1 && this.getMonth() != 0)
		this.setDate(0);
		return this;
	}; // nextMonth();
	
	/**
	 * Return the translated month name of the current date as translated into 
	 * language (only dutch or english supported)
	 */
	Date.prototype.getTranslatedMonthName = function(isDutch) {
		var names;
		if ( typeof getMonthNames === typeof function() {} ) {
			names = getMonthNames();
		} else {
			names = {
					dutch : ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"],
					english : ["January","February","March","April","May","June","July","August","September","October","November","December"]
			};
		}
		return names[isDutch?'dutch':'english'][this.getMonth()];
	}; // getMonthNames();
	
	/**
	 * Return the '%B %Y' format of the date
	 */
	Date.prototype.get_BY = function(isDutch) {
		return this.getTranslatedMonthName(isDutch) + ' ' + this.getFullYear();
	}; // get_BY();
	
	/**
	 * Return the '%e %B %Y' format of the date
	 */
	Date.prototype.get_eBY = function(isDutch) {
		return this.getDate() + ' ' + this.get_BY(isDutch);
	}; // get_eBY();
	
	/**
	 * Return the '%d-%m-%Y' format of the date
	 */
	Date.prototype.get_dmY = function(isDutch) {
		return this.getDate() + '-' + (this.getMonth() + 1) + '-' + this.getFullYear();
	}; // get_eBY();
	
	/**
	 *
	 *  Base64 encode / decode
	 *  http://www.webtoolkit.info/
	 *
	 **/
	var Base64 = {

		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = Base64._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

			return output;
		},

		// public method for decoding
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}

			}

			output = Base64._utf8_decode(output);

			return output;

		},

		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while ( i < utftext.length ) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		}
	}; // end class Base64
	
	/**
	 * Add base64encode to the string prototype
	 */
	String.prototype.base64encode = function() {
		return Base64.encode(this);
	}; // base64encode
	
	/**
	 * Add base64decode to the string prototype
	 */
	String.prototype.base64decode = function() {
		return Base64.decode(this);
	}; // base64decode
