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
					{header: 'Bladzijdenr.',				field: function(obj)	{ return obj.it; }}
				, {header: 'Dagboek',							field: function(obj)	{ return obj.invoice.journalCode; }}
				, {header: 'Omschrijving',				field: function(obj)	{ 
						var ret = [obj.invoice.company.name, obj.invoice.getInvoiceType()];
						if ( obj.invoice.agreement.id ) {
							ret.push(obj.invoice.agreement.id);
						}
						return ret.join(','); 
					}}
				, {header: 'Factuurdatum',				field: function() 		{ return (new Date()).get_dmY();} } 
				, {header: 'Grootboeknummer',			field: function(obj)	{ return obj.line.grootboek.code; } } 
				, {header: 'Debiteurennummer',		field: function(obj)	{ return obj.invoice.company.debtorNumber; } } 
				, {header: 'Naam debiteur',				field: function(obj)	{ return obj.invoice.company.name; } }
				, {header: 'Periode',							field: function(obj)	{ return obj.invoice.getPeriod(); } }
				, {header: 'BTW-code',						field: function(obj)	{ return obj.invoice.i18n.isDutch ? 1 : (obj.invoice.i18n.isEU ? 'E' : ' '); } }
				
				, {header: 'Factuurbedrag incl.',	field: function(obj)	{ return obj.line.getParsedAmount(obj.invoice.getVATPercentage()); } } 
				, {header: 'BTW bedrag',					field: function(obj)	{ return obj.line.getParsedVAT(obj.invoice.getVATPercentage()); } }
				
				, {header: 'Factuurnummer',				field: function(obj)	{ return obj.invoice.getInvoiceNumber(); } }
				, {header: 'Kostensoort',					field: function(obj)	{ return obj.line.grootboek.costtype; } }
				, {header: 'Kostenplaats',				field: function(obj)	{ return obj.line.grootboek.costlocation; } }
			];
			
	/**
	 * Generate the export
	 */
	function generateExport() {
		var header = [];
		
		$.each(columns, function() { header.push('"' + this.header + '"'); });
		$textarea.val(header.join('\t') + '\r\n\r\n');
		
		var pageNum = 0;
		$.each(getInvoices(), function() {
			var invoice = this;
			$.each(this.lines, function(it) {
				var row = [], line = this;
				if ( line.isDiscount ) return;
				if ( typeof invoice.lines[it+1] === typeof (new InvoiceLine) && invoice.lines[it+1].isDiscount ) {
					line = new InvoiceLine(line);
					line.amount += invoice.lines[it+1].amount;
				}
				
				$.each(columns, function() {
					row.push('"' + this.field({invoice: invoice, line: line, it: pageNum}) + '"'); 
				});
				$textarea.val($textarea.val() + row.join('\t') + '\r\n');
				
				++pageNum;
			});
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

