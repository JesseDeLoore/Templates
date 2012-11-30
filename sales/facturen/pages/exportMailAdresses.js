$(document).ready(function() {
	
	// add the export styling
	$('head').append('<style>'
				+ 'textarea#exportEmails {' 	
					+ 'overflow: auto;'
					+ 'padding: 1px;'
					+ 'background: #fff;' 
					+ 'min-width: 50%;'
					+ 'min-height: 30em;' 
					+ 'color: #555;'
					+ 'border: 1px #ddd solid;'
				+ '}'
			+ '</style>');
	
	// create a container
	var $container = $('<div class="noPrint" data-role="exportEmails" style="display: none;">');
	$('body').append($container);
	
	// add the export textarea 
	$container.append('<textarea id="exportEmails" data-role="exportEmails" wrap="off">Export genereren mislukt</textarea>');
	
	// define the export
	var $textarea=$('#exportEmails'),
			columns = [
				  {header: 'Debiteurennummer',		field: function(invoice)			{ return invoice.company.debtorNumber; } } 
				, {header: 'Naam debiteur',				field: function(invoice)			{ return invoice.company.name; } }
				, {header: 'Factuurdatum',				field: function(invoice)			{ return invoice.addresseeShort; } } 
				, {header: 'Email',								field: function(invoice)			{ return invoice.company.invoiceEmail; } } 
			];
			
	/**
	 * Generate the export
	 */
	function generateExport() {
		var header = [];
		
		$.each(columns, function() { header.push('"' + this.header + '"'); });
		$textarea.val(header.join('\t') + '\r\n\r\n');
		
		$.each(getInvoices(), function(it, invoice) {
			var row = [];
			$.each(columns, function() { row.push('"' + this.field(invoice, it) + '"'); });
			$textarea.val($textarea.val() + row.join('\t') + '\r\n');
		});
	} // generateExport();
	
	// When user focusses the textarea: select all text in it.
	$textarea.on('focus', function() { this.focus(); this.select(); });
	
	// TODO: implement file api instead of export.
	// Not done yet due to lack of support for IE9- (which is the browser of choice)
	
	// add the export button to the overview (if any)
	$('#overview_actions').append('<button data-click-switch="exportEmails" style="clear:both">TSV export email adressen tonen</button>');
	
	// Do the actual generation of the export
	generateExport();
});

