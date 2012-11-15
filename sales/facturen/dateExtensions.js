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