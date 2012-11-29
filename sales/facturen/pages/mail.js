if ( !$.actual ) {	
	$.getScript('http://sales.carerix.com/templates/facturen/models/jquery.actual.min.js');
}

; (function($) {
	var $container = null;
	if ( !console ) console = {log: $.noop};
	

	/**
	 * When the document has been created: build the table
	 */
	$(document).ready(function() {
		// add the styling specific for the buttons
		$('head').append('<style>'
				+ 'table#invoiceMailingsTable button {'
					+ 'cursor: pointer;'
					+ 'float: right;'
					+ 'font-size: 1.1em;'
					+ 'color: #ffffff;'
					+ 'padding: .3em 1em;'
					+ 'background: #ffa442;'
					+ 'background: -moz-linear-gradient(top,	#ffa442 0%,	#665200);'
					+ 'background: -webkit-gradient(linear, left top, left bottom,	from(#ffa442), to(#665200));'
					+ 'border-radius: 10px;'
					+ 'border: 1px solid #660000;'
					+ 'box-shadow:	0px 1px 3px rgba(000,000,000,0.5), inset 0px 0px 1px rgba(255,255,255,0.5);'
					+ 'text-shadow: 0px -1px 0px rgba(000,000,000,0.7), 0px 1px 0px rgba(255,255,255,0.3);'
					+ '}'
					+ 'table#invoiceMailingsTable button.inactive {'
						+ 'color: #ccc;'
					+ '}'
					+ '@media print {'
						+ 'table#invoiceMailingsTable button {'
							+ 'border: none;'
							+ 'border-radius: none;'
							+ 'padding: auto;'
							+ 'font-size: 1em;'
							+ 'text-shadow: none;'
						+ '}'
					+ '}'
				+ '</style>'
		);
		
		// add the basic content of the mailing table
		$container = $('<div data-role="mailing" style="display: none;">'
				+ '<table id="invoiceMailingsTable" class="border">'
					+ '<thead>'
						+ '<tr>'
							+ '<th/>'
							+ '<th>Bedrijf</th>'
							+ '<th>Email adres</th>'
							+ '<th>Bedrag</th>'
							+ '<th/>'
							+ '<th/>'
						+ '</tr>'
					+ '</thead>'
					+ '<tbody/>'
				+ '</table>'
			+ '</div>');
		$('body').append($container);
		$container = $container.find('tbody');
		
		// add the various rows
		$.each(getInvoices(), _buildRow);
		
		// append the usefull actions to the overview's action container
		$('#overview_actions').append('<button data-click-switch="mailing" style="clear: both">Invoice mails voorbereiden</button>');
		$('#overview_actions').append(
				'<span data-role="mailing" style="display: none;">'
					+ '<label>Vertraging (in minuten)<input type="number" value="15" id="send_email_delay"/></label>'
					+ '<button data-role="send-all-email">Alle factuurmails versturen</button>'
				+ '</span>'
		);
		
		// generate the mail templates, so they are available when required
		$container = $('<div id="mails" style="display: none"/>');
		$('body').append($container);
		$container.tmpl(getInvoices());
		
	});
	
	/**
	 * Build an invoice report row (template method)
	 */
	function _buildRow(it) {
		var $row;
		if ( it<=1 && this.company.invoiceEmail !== '' ) { // TODO: remove it condition
			$row = $('<tr data-role="invoice-export-row">'
					+ '<th class="sub"><input type="checkbox" checked="checked"/></th>'
					+ '<td>' + this.company.name + '</td>'
					+ '<td>' + this.company.invoiceEmail + '</td>'  
					+ '<td>&#x20ac; ' + this.getParsedSubtotal() + '</td>'  
					+ '<td><button data-role="send-mailing">Versturen</button></td>'
					+ '<td><button data-role="download-invoice">Downloaden</button></td>'
				+ '</tr>'
			);
			$row.appendTo($container);
		} else {
			$row = $('<tr data-role="invoice-export-row">'
					+ '<th class="sub"><input type="checkbox" disabled="disabled"/></th>'
					+ '<td>' + this.company.name + '</td>'
					+ '<td>GEEN ADRES BESCHIKBAAR</td>'  
					+ '<td>&#x20ac; ' + this.getParsedSubtotal() + '</td>'  
					+ '<td><button class="inactive">Versturen</button></td>'
					+ '<td><button data-role="download-invoice">Downloaden</button></td>'
				+ '</tr>'
			);
			$row.prependTo($container);
		}
		$row.data('invoice', this);
	} // _buildRow();
	
	/**
	 * Send a mail by parsing the desires as stated in the invoicerow
	 * Will also be used as target for the sendAll mails
	 */
	function _sendMailFromInvoice() {
		var $this = $(this).closest('tr'),
				invoice = $this.data('invoice'),
				id = invoice.id,
				invoiceHTML,
				mailHTML;
		
		// remove contentEditables in order to not have them be "changeable" in CX
		$('[data-invoice-id=' + id + ']')
				.find('[contentEditable],[contenteditable]')
				.removeAttr('contentEditable')
				.removeAttr('contenteditable');
		
		// gather the invoice HTML
		invoiceHTML = _getInvoiceHTML(invoice);
				
		// gather the mail HTML
		mailHTML = _getMailHTML(invoice);
			
		// send a mail
		_sendMail({
					type:			'DELAY'
				, subject:	'Factuur ' + invoice.getInvoiceNumber() + ' voor het gebruik van het Carerix systeem'
				, from:			'"' + (new CxUser()).name + ' | Carerix" <finance@carerix.com>'
//					, from:			'jasper@carerix.com'
				, to:				'jasper@carerix.com'
//					, to:				'reinald@carerix.com'
				, delay: 		$('#send_email_delay').val()
				, content: 	{
						text: mailHTML
					, isHTML: true
				}
				, attachments: [
						{ 	content: invoiceHTML
							, label: 'factuur'
							, filename: 'factuur_' + invoice.getInvoiceNumber() + '.html'
						}
				]
		}).success(function(response) {
			// Finally: report the fact that this email has been sent.
			$this.trigger('set-send');	
		});
		
	} // _sendMailFromInvoice();
	
	/**
	 * Get the HTML that will be used by the Invoice attachment
	 */
	function _getInvoiceHTML(invoice) {
		var $invoice = $('[data-invoice-id=' + invoice.id + ']');
		return "<!DOCTYPE HTML>"
					+ "<html>"
						+ "<head>"
							+ "<title>Factuur</title>"
							+ "<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>" 
						+ "</head>"
						+ "<body>"
							+	"<div class='invoice-wrapper'>"
								+ $invoice.html() 
							+ "</div>"
						+ "</body>"
					+ "</html>"
			;
	} // _getInvoiceHTML();
	
	/**
	 * Get the HTML that will be used by the Invoice attachment
	 */
	function _getMailHTML(invoice) {
		var $invoice = $('[data-mail-id=' + invoice.id + ']');
			 
		return "<!DOCTYPE HTML>"
					+ "<html>"
						+ "<head>"
							+ "<title>Factuur</title>"
							+ "<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>" 
						+ "</head>"
						+ "<body>"
							+ $invoice.html() 
						+ "</body>"
					+ "</html>"
			;
	} // _getMailHTML();

	/**
	 * Send a single mail as per the args
	 * 
	 * @return	deferred
	 */
	function _sendMail(args) {
		var url = 'http://' + cxuser.appname + '.carerix.net/cgi-bin/WebObjects/' + cxuser.appname + 'Web.woa/wa/',
				xml;
		
		switch ( args.type.toUpperCase() ) {
			case 'DRAFT' :		args.type = 5;	break; 
			case 'DELAYED' :
			case 'DELAY' :		args.type = 6;	break;
			default :
				if ( parseInt(args.type) != args.type ) {
					throw 'Not a valid type!';
				}
				args.type = parseInt(args.type);
				break;
		} // switch
		
		// ToDoTypeKey for a Draft email = 5
		// ToDoTypeKey for a Delayed mail = 6, 
		xml =	'<?xml version="1.0" encoding="utf-8"?>' 
				+ '<CRToDo>'
					+ '<todoTypeKey>' + args.type + '</todoTypeKey>'
					+ '<subject>' + args.subject + '</subject>'
					+ '<fromAddress><![CDATA[' + args.from + ']]></fromAddress>'
					+ '<toAddress>' + args.to + '</toAddress>'
					+ '<notes><![CDATA[' + args.content.text + ']]></notes>'
					+ '<isHTML>' + (args.content.isHTML ? 1 : 0) + '</isHTML>'
					+ '<owner>'
						+ '<CRUser id="' + cxuser.id + '" />'
					+ '</owner>'
					

// 						+ '<toContact><CRAttachmentData id="19117"></toContact>'
//	    			+ '<toCompany><CRAttachmentData id="19117"></toCompany>'
		;
		
		if ( args.type === 5 || args.type === 6 ) {
			xml += '<toStatusNode><CRDataNode id="3214"/></toStatusNode>' // NOG TE VERZENDEN STATUS
		}

		if ( typeof args.replyTo !== typeof undefined ) { 
			xml += '<replyToAddress>' + args.replyTo + '</replyToAddress>'
		}
		
		if ( typeof args.delay !== typeof undefined ) { // but also include <delay> and <toDelayUnitNode> node
			xml += '<delay>' + args.delay + '</delay>'
					+ '<toDelayUnitNode><CRDataNode id="4238"/></toDelayUnitNode>'
			;
		}
				
		if ( $.isArray(args.attachments) ) {
			xml +='<attachments>';
			$.each(args.attachments, function() {
  	  	xml	+= '<CRAttachment>'
  	  					+ '<content>' + this.content.base64encode() + '</content>'
  	  					+ '<label>' + this.label + '</label>'
  	  					+ '<filePath>CRToDo/' + this.filename + '</filePath>'
  	  					+ '<valid>0</valid>'
  	  					+ '<owner>'
	  							+ '<CRUser id="' + cxuser.id + '" />'
	  						+ '</owner>'
  	  				+ '</CRAttachment>';
			});
			xml += '</attachments>';
		}
		
		xml += '</CRToDo>';
						
		return $.ajax({
				url: url + 'save'
			, type: 'POST'
			, processData: false
			, data: xml
			, headers: {
				'x-cx-pwd' : cxuser.xmlPass
			}
		});
	} // _sendMail();
	
	/**
	 * Download the PDF pertaining to the invoice, as the end user would get it
	 */
	function _downloadInvoicePDF() {
		var $this = $(this),
				invoice = $this.data('invoice'),
				$invoice = $('[data-invoice-id=' + invoice.id + ']'),
				invoiceHTML = _getInvoiceHTML(invoice),
				iframe = $('#tmpIFrame'),
				url = 'http://tools.carerix.com/cxconverter/run.php', // endpoint uri for the CxConverter
				$form = $('<form method="post" action="' + url + '" target="tmpIframe" style="display: none">'
							+ '<textarea name="url">' + invoiceHTML + '</textarea>'
							+ '<input name="pdf_name" value="' + invoice.getInvoiceNumber() + '"/>'
							+ '<input name="media" value="A4"/>'
							+ '<input name="cssmedia" value="print"/>'
							+ '<input name="pixels" value="' + ($invoice.find('.noborder').actual('width')+10) + 'x' + ($invoice.actual('height')+10) + '"/>'
							+ '<input name="leftmargin" value="15"/>'
							+ '<input name="rightmargin" value="15"/>'
						+ '</form>');
				
		if ( iframe.length === 0 ) {
			iframe = $('<iframe id="tmpIframe" name="tmpIframe" style="display: none"/>').appendTo('body');
		}
		
		$('body').append($form);
		setTimeout(function() { 
			$form.trigger('submit');
			setTimeout($form.remove, 1);
		}, 100);
	} // _downloadInvoicePDF();
	
	/**
	 * Set the presentation of this row to "mail sent"
	 */
	function _setSend() {
		var $this = $(this);
		$this.find(':checkbox').attr('checked', 'checked').attr('disabled', 'disabled');
		$this.find('[data-role=send-mailing]').html('Verstuurd').addClass('inactive');
	} // _setSend();
	
	/**
	 * Trigger the send single mail action
	 */
	function _triggerSendMail() {
		$(this).closest('[data-role="invoice-export-row"]').trigger('send-email');
	} // _triggerSendMail();
	
	/**
	 * Trigger the download PDF event
	 */
	function _triggerDownloadInvoicePDF() {
		$(this).closest('[data-role="invoice-export-row"]').trigger('download');
	} // _triggerDownloadInvoicePDF();
	
	/**
	 * Trigger sending all emails by iterating through the desired emails and 
	 * triggering each of their send-email events.
	 */
	function _sendAllMails() {
		$container.find(':checkbox:checked:not(:disabled)').each(function() {
			$(this).closest('[data-role="invoice-export-row"]').trigger('send-email');
		});
	} // _sendAllMails
	
	/**
	 * Bind the events
	 */
	$(document).on('send-email', '[data-role="invoice-export-row"]', _sendMailFromInvoice);
	$(document).on('download', '[data-role="invoice-export-row"]', _downloadInvoicePDF);
	$(document).on('set-send', '[data-role="invoice-export-row"]', _setSend);
	$(document).on('click', '[data-role=send-mailing]', _triggerSendMail);
	$(document).on('click', '[data-role=download-invoice]', _triggerDownloadInvoicePDF);
	$(document).on('click', '[data-role=send-all-email]', _sendAllMails); 
	
})(jQuery);