;

function Invoice(fields) {
	for ( var it in fields ) {
		this[it] = fields[it];
	} // for
};

/**
 * Returns the VAT percentage for an invoice
 * @returns {Number}
 */
Invoice.prototype.getVATPercentage = function() {
	return 21;
}; // getVATPercentage();


/**
 * Parse an amount to the dutch presentation
 */
Invoice.prototype.parseAmount = function(amount) {
	amount = (parseInt(amount * 100)/100);
	if ( parseInt(amount) !== amount ) {
		return parseInt(amount) + ',' + parseInt(amount*100)%100; 
	} else {
		return amount + ',00';
	} 
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
	var amount = this.amount;
	if ( this.discount > 0 ) {
		amount -= Math.ceil(this.discountAmount);			
	}
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
} // getInvoiceNumber();
