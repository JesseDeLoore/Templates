$(document).ready(function() {
	
	// add the export styling
	$('head').append('<style>'
				+ 'textarea#export {' 	
					+ 'overflow: auto;'
					+ 'padding: 1px;'
					+ 'background: #fff;' 
					+ 'width: 50%;'
					+ 'height: 30em;' 
					+ 'min-width: 50%;'
					+ 'min-height: 30em;' 
					+ 'color: #555;'
					+ 'border: 1px #ddd solid;'
				+ '}'
			+ '</style>');
	
	// create a container
	var $container = $('<div class="noPrint" data-role="export" style="display: none;">');
	$('body').append($container);
	
	// add the export textarea 
	$container.append('<textarea id="export" data-role="export" wrap="off">Export genereren mislukt</textarea>');
	
	// define the export
	var $textarea=$('#export'),
			columns = [
					{header: 'Bladzijdenr.',				field: function(invoice, it)	{ return it; }}
				, {header: 'Dagboek',							field: function(invoice)			{ return invoice.journalCode; }}
				, {header: 'Omschrijving',				field: function(invoice)			{ 
						var ret = [invoice.company.name, invoice.getInvoiceType()];
						if ( invoice.agreement.id ) {
							ret.push(invoice.agreement.id);
						}
						return ret.join(', '); 
					}}
				, {header: 'Factuurdatum',				field: function() 						{ return (new Date()).get_dmY();} } 
				, {header: 'Grootboeknummer',			field: function(invoice)			{ return invoice.grootboek.code; } } 
				, {header: 'Debiteurennummer',		field: function(invoice)			{ return invoice.company.debtorNumber; } } 
				, {header: 'Naam debiteur',				field: function(invoice)			{ return invoice.company.name; } }
				, {header: 'Periode',							field: function(invoice)			{ return invoice.getPeriod(); } }
				, {header: 'BTW-code',						field: function(invoice)			{ return invoice.i18n.isDutch ? 1 : (invoice.i18n.isEU ? 'E' : ' '); } }
				, {header: 'Factuurbedrag incl.',	field: function(invoice)			{ return invoice.getParsedTotal(); } } 
				, {header: 'BTW bedrag',					field: function(invoice)			{ return invoice.getParsedVAT(); } }
				, {header: 'Factuurnummer',				field: function(invoice)			{ return invoice.getInvoiceNumber(); } }
				, {header: 'Kostenplaats',				field: function(invoice)			{ return invoice.grootboek.costlocation; } }
				, {header: 'Kostensoort',					field: function(invoice)			{ return invoice.grootboek.costtype; } }
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
	
	// When the invoicenumber changes: (re)generate the export
	$(document).on('invoicenumber_update', generateExport);
	
	// add the export button to the overview (if any)
	$('#overview_actions').append('<button data-click-switch="export" style="clear:both">TSV export tonen</button>');
	
	// Do the actual generation of the export
	generateExport();
});

