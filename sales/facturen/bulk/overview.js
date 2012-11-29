$(document).ready(function() {
	
	/**
	 * Append the overview and it's styling to the page
	 */
	$('head').append('<link rel="stylesheet" href="http://sales.carerix.com/templates/facturen/pages/overview.css" type="text/css"/>');
	var $overview = $('<fieldset id="overview" class="noPrint"><legend>Overzicht</legend></fieldset>');
	$('body').append($overview);
	
	/**
	 * toggler for the switch buttons, which is used to switch between the different views
	 */
	$(this).on('click', '[data-click-switch]', function(e) {
		$('[data-click-switch]').each(function() {
			var $this = $(this);
			$this.removeClass('active');
			$('[data-role=' + $this.data('click-switch') + ']').hide();
		});
		$('[data-role=' + $(this).data('click-switch') + ']').show();
		$(this).addClass('active');
		return false;
	});
	
	addPeildatum();
	addInvoicenumberUpdater();
	addInvoiceTypeGUI();
	addActionContainer(); // particularly important!!! don't remove this one!
	showSpecialProjects(getProjectsWithoutGroup(), 'Let op! De volgende projecten hebben een group<br/>waarvan de export code óf niet, óf incompleet is<br/>ingevuld');
	showSpecialProjects(getProjectsWithErrors(), 'Let op! De volgende projecten bevatten fouten,<br/> en worden NIET gefactureerd:');
	
	
	/*****************************************************************************
	 * BELOW ARE SEVERAL METHODS THAT ADD HTML AND EVENTS TO THE CONTENT
	 * THEY ARE CALLED ABOVE
	 ****************************************************************************/
	
	/**
	 * Add the peildatum option to the overview
	 */
	function addPeildatum() {
		// add the gui
		$overview.append('<label>Peildatum tekst afdrukken<input type="checkbox" data-change-toggle="peildatum" class="cb"/></label>');
		
		// add handling a change in the gui
		$(document).on('change', '[data-change-toggle]', function() {
			$('[data-role=' + $(this).data('change-toggle') + ']').toggle($(this).is(':checked') || $(this).is(':selected')); 
		});
	} // addPeildatum();
	
	/**
	 * Add gui and events for updating the initial invoice number
	 */
	function addInvoicenumberUpdater() {
		// create the gui
		$overview.append('<label>Cre&euml;er factuur vanaf nr<input type="number" id="invoice-number" value="' + (initialInvoiceNumber||0) + '"/></label>');
		
		// add the triggering of the update event to the document
		$(document).on('change', '#invoice-number', function() { // trigger the update of the invoicenumber
			initialInvoiceNumber = parseInt($(this).val());
			$(document).trigger('invoicenumber_update');
		});
		
		// handle the triggering of the update
		$(document).on('invoicenumber_update', function() {
			$('[data-role=invoicenumber]').each(function(it) {
				$(this).html(initialInvoiceNumber + it);	
			});
		});
	} // addInvoicenumberUpdater();
	
	/**
	 * Adds the invoicetypes as per the available invoices
	 */
	function addInvoiceTypeGUI() {
		// add the various holders for the number and listing of the invoices
		$.each([['month','Maand'], ['quarter','Kwartaal'], ['halfyear','Halfjaar'], ['year','Jaar']], function() {
			$overview.append(
					'<label data-click-toggle="report_' + this[0] + '_invoices" title="Toon / Verberg alle ' + this[1].toLowerCase() + 'facturen">'
						+ '' + this[1] + 'facturen'
						+ '<input class="readonly" readonly="readonly" value="0"/>'
					+ '</label>'
					+ '<ul data-role="report_' + this[0] + '_invoices" style="display:none;"></ul>'
			);	
		});
		
		// fill the reporters
		$.each(getInvoices(), function() {
			var type = 'month',
					insert = '<li>' + this.company.name; 
					
			if ( this.frequency === 3 ) type="quarter";
			if ( this.frequency === 6 ) type="halfyear";
			if ( this.frequency === 12 ) type="year";
			
			if ( this.company.name != this.firstLineOfNotes ) {
				insert += " - <i>" + this.firstLineOfNotes + "</i>";
			}
			insert += "</li>";
			$container = $("[data-role=report_" + type + "_invoices]").append(insert);

			$container.prev('label').find('input').val($container.find('li').length);
		});
		
		// toggler for the types of invoices
		$(document).on('click', '[data-click-toggle]', function() {
			$('[data-role=' + $(this).data('click-toggle') + ']').toggle();
			return false;
		});
	} // addInvoiceTypeGUI();
	
	/**
	 * Add location for the various actions to be added
	 */
	function addActionContainer() {
		// create the location for the actions
		$overview.append('<span style="margin-bottom: 1em;" id="overview_actions">Acties</span>');
		
		// add the show invoices button, since the invoices won't do that themselves
		$('#overview_actions').append('<button data-click-switch="invoices" class="active">Facturen tonen</button>');
	} // addActionContainer();
	
	/**
	 * Show the projects without groups, if any
	 */
	function showSpecialProjects(projects, warning) {
		if ( !projects.length ) {
			return;
		}

		$overview.append('<label><b style="color: red;">' + warning + '</b></label>');
		var $container = $('<ul/>');
		$overview.append($container);
		
		$.each(projects, function() {
			$container.append('<li>' + this.id + ' ' + this.company.name + '</li>');
		});
	} // showSpecialProjects();
	
});
