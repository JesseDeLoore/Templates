;

function InvoiceLine(fields) {
	for ( var it in fields ) {
		this[it] = fields[it];
	} // for
};

/**
 * Parse an amount to the dutch presentation
 */
InvoiceLine.prototype.parseAmount = Invoice.prototype.parseAmount;

/**
 * Calculate and return the parsed total of the invoice
 */
InvoiceLine.prototype.getParsedAmount = function(vatPercentage) {
	return this.parseAmount(this.amount + this.getVAT(vatPercentage));
}; // getParsedTotal();	

/**
 * Calculate and return the parsed subtotal of the invoice
 */
InvoiceLine.prototype.getParsedVAT = function(vatPercentage) {
	return this.parseAmount(this.getVAT(vatPercentage));
}; // getParsedVAT();

/**
 * Return the VAT (BTW) amount
 */
InvoiceLine.prototype.getVAT = function(vatPercentage) {
	return (this.amount * (vatPercentage/100));
}; // getVAT();
	
/**
 * Setter for what. Sets it to value. Couldn't be simpler.
 * 
 * @returns Invoice (self)
 */
InvoiceLine.prototype.set = function(what, value) {
	this[what] = value;
	return this;
}; // set();
