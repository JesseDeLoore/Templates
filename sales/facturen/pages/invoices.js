// when ready: trigger updating the invoicenumber, such that all 
// listeners are mage aware of the current value
$(document).ready(function() {
	$container = $('<div id="invoices" data-role="invoices"/>');
	$('body').append($container);
	$container.tmpl(getInvoices());
	$container.find('[contentEditable],[contenteditable]')
								.removeAttr('contentEditable')
								.removeAttr('contenteditable');
	
	// after all is said and done, trigger an invoicenumber update to ensure all
	// listeners are listening to the same values.
	setTimeout(function() {
		$(document).trigger('invoicenumber_update');
	}, 1000);
});