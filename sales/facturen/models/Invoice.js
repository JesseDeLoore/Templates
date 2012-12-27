;

function Invoice(fields) {
	this.vatPercentage = 21;
	for ( var it in fields ) {
		this[it] = fields[it];
	} // for
	
	this.setDefaults();
};

/**
 * Set the defaults for this invoice (called from the constructor AFTER most 
 * fields have been entered.
 */
Invoice.prototype.setDefaults = function() {
	if ( this.title.main === '' ) {
		this.setDefaultTitle();	
	}
	if ( this.lines.length === 0 ) {
		this.setDefaultInvoiceLines();
	}
	return this;
}; // setDefaults();

/**
 * Returns an array containin all invoiceline ids, where set.
 * @returns {Array}
 */
Invoice.prototype.getLineIds = function() {
	var ret = [],
			it;
	
	for ( it = 0; it < this.lines.length; it++ ) {
		if ( typeof this.lines[it].id !== typeof undefined && this.lines[it].id ) {
			ret.push(this.lines[it].id);
		}
	} // for
	
	return ret;
}; // getParsedLineIds();

/**
 * Returns a string containing all invoice line IDs, separated by a comma (,), 
 * with the last ID shown with a localized AND string. If addPluralLetter is 
 * added, and the number of invoicelineIDs is larger than 1, a localized letter
 * will be added to the start of the string, such that the word before the 
 * string becomes its plural (eg: if true, 'order' + this.getParsedLineIds(true)
 * becomes 'orders 12, 15 and 19')
 * 
 * @param boolean [addPluralLetter]
 * @returns {String}
 */
Invoice.prototype.getParsedLineIds = function(addPluralLetter) {
	var ids = this.getLineIds(),
			ret = '',
			tmp = '';
	
	if ( ids.length > 1 ) {
		if ( addPluralLetter ) {
			ret += this.i18n.isDutch ? 'en' : 's';
		}
		tmp = (this.i18n.isDutch ? ' en ' : ' and ') + ids.pop();
	} 
	
	if ( addPluralLetter ) {
		ret += ' ';
	}
	
	return ret + ids.join(', ') + tmp;
}; // getParsedLineIds(); 

/**
 * Sets the title of the object to the default value (as per the frequency
 * @returns {Invoice}
 */
Invoice.prototype.setDefaultTitle = function() {
	var start = (new Date()).nextMonth(),
			start_BY = start.get_BY(this.i18n.isDutch),
			tm = this.i18n.isDutch ? ' t/m ' : ' until ';
	 
	switch ( this.frequency ) {
		case 0:
		case 1:
			this.setTitle((this.i18n.isDutch ? 'Factuur ' : 'Invoice ') + start_BY);
			break;
		case 3:
			this.setTitle((this.i18n.isDutch ? 'Kwartaalfactuur ' : 'Trimester invoice ')
							+ start_BY + tm + start.nextMonth().nextMonth().get_BY(this.i18n.isDutch));
			break;
		case 6:
			this.setTitle((this.i18n.isDutch ? 'Half jaarfactuur ' : 'Biannual invoice ') + 
					start_BY + tm 
					+ start.nextMonth().nextMonth().nextMonth().nextMonth().nextMonth().get_BY(this.i18n.isDutch)
			);
			break;
		case 12:
			var end = start.prevMonth();
			end.setFullYear(start.getFullYear()+1);
			this.setTitle((this.i18n.isDutch ? 'Jaarfactuur ' : 'Annual invoice ')
						+ start_BY + tm 
						+ end.get_BY(this.i18n.isDutch)
			);
			break;
		default:
			this.setTitle("<font color=red><i>" + 'Periode ' + frequency + ' is niet gedefinieerd' + "</i></font>");
			break;
	} // switch
	
	return this;
}; // setDefaultTitle();

/**
 * Set the default value of the invoicelines
 */
Invoice.prototype.setDefaultInvoiceLines = function() {
	if ( this.includingDomain ) {
		this.lines.push({
				title: (this.i18n.isDutch 
						? 'Registratie inclusief domein naam, email & website hosting voor '
								: 'Registration including domain name, e-mail & website hosting for '
					) + this.grootboekName
			, currency: '€'
			, amount: this.amount
		});
	} else {
		this.lines.push({
				title: this.grootboekName +
						( this.agreement.numberOfUsers  
							? ' (' + (this.i18n.isDutch?'inclusief':'including') + ' ' + this.agreement.numberOfUsers + ' users)'
							: ''
						)
			, currency: '€'
			, amount: this.amount
		});
	}
	
	if ( this.discount > 0 ) {
		this.lines.push({
				title: ((this.i18n.isDutch?'Korting&nbsp;&nbsp;':'Discount&nbsp;&nbsp;')+this.discount + ' %')
			, currency: '€'
			, amount: this.discountAmount > 0 ? -Math.ceil(this.discountAmount) : 0
		});
	} else {
		this.lines.push({
				title: ''
			, currency: ''
			, amount: 0
		});
	}
	
	return this;
}; // setDefaultInvoiceLines();

/**
 * Set the title value of this invoice
 * 
 * @param main
 * @param sub
 */
Invoice.prototype.setTitle = function(main, sub) {
	this.title.main = main;
	this.title.sub = sub || '';
}; // setTitle(); 

/**
 * Returns the VAT percentage for an invoice
 * @returns {Number}
 */
Invoice.prototype.setVATPercentage = function(percentage) {
	return this.vatPercentage = percentage;
}; // getVATPercentage();

/**
 * Returns the VAT percentage for an invoice
 * @returns {Number}
 */
Invoice.prototype.getVATPercentage = function() {
	return this.vatPercentage;
}; // getVATPercentage();


/**
 * Parse an amount to the dutch presentation
 */
Invoice.prototype.parseAmount = function(amount) {
	return (parseInt(parseFloat(amount) * 100) + '').replace(/(..)$/, ',$1'); 
}; // parseAmount();

/**
 * Calculate and return the parsed total of the invoice
 */
Invoice.prototype.getParsedTotal = function() {
	return this.parseAmount(this.getSubtotal() + this.getVAT());
}; // getParsedTotal();	

/**
 * Calculate and return the parsed subtotal of the invoice
 */
Invoice.prototype.getParsedSubtotal = function() {
	return this.parseAmount(this.getSubtotal());
}; // getParsedSubtotal();	

/**
 * Calculate and return the parsed subtotal of the invoice
 */
Invoice.prototype.getParsedVAT = function() {
	return this.parseAmount(this.getVAT());
}; // getParsedVAT();

/**
 * Return the subtotal
 */
Invoice.prototype.getSubtotal = function() {
	var amount = 0;
	$.each(this.lines, function() {
		amount += parseFloat(this.amount||0);
	});
	return amount;
}; // getSubtotal();
	
/**
 * Return the VAT (BTW) amount
 */
Invoice.prototype.getVAT = function() {
	return this.i18n.isNL ? (this.getSubtotal() * (this.getVATPercentage()/100)) : 0;
}; // getVAT();
	
/**
 * Return the month of the invoice
 */
Invoice.prototype.getPeriod = function() {
	var date = new Date();
	if ( this.frequency ) {
		date.nextMonth();
	}
	return date.getMonth() + 1;
}; // getPeriod();
	
/**
 * Return the type of the invoice as per the frequency
 */
Invoice.prototype.getInvoiceType = function() {
	switch ( this.frequency ) {
		case -1:	return 'Eenmalig';
		case 12:	return 'Jaar'; 
		case 6:		return 'Half jaar'; 
		case 3:		return 'Kwartaal';
		case 0:
		case 1:
		default:	return 'Maand'; 
	} 
}; // getInvoiceType();

/**
 * Return the calculated invoicenumber of this invoice
 * 
 * @returns integer
 */
Invoice.prototype.getInvoiceNumber = function() {
	return this.it + (initialInvoiceNumber || 0);
}; // getInvoiceNumber();

/**
 * Setter for what. Sets it to value. Couldn't be simpler.
 * 
 * @returns Invoice (self)
 */
Invoice.prototype.set = function(what, value) {
	this[what] = value;
	return this;
}; // getInvoiceNumber();
