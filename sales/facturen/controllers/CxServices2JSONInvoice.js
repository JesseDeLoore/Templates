; var getInvoices, getProjects, getProjectsWithErrors, getProjectsWithoutGroup, getToday, getMonthNames;
(function() {
	var _invoice = null,
			_invoices = [],
			_invoicesWithoutGroup = [],
			_invoicesWithErrors = [],
			_monthNames = {dutch: [], english: []},
			_regexp = {
					nonDigits: /[^\d]/g
			};
	
	/*****************************************************************************
	 * PUBLIC METHODS
	 ****************************************************************************/
	 
	/**
	 * Generic getter for the invoices
	 */
	getInvoices = getProjects = function() {
		return _invoices;
	}; // getInvoices();
	
	/**
	 * Specific getter for those invoices that have no valid grootboek code
	 */
	getProjectsWithoutGroup = function() {
		return [];
	}; // getProjectsWithoutGroup();
	
	/**
	 * Specific getter for those invoices that have errors
	 */
	getProjectsWithErrors = function() {
		return _invoicesWithErrors;
	}; // getProjectsWithoutGroup();
	
	/**
	 * Return today.
	 */	
	getToday = function() {
		return _getDate('<cx:write value="$utilities.currentDate" dateformat="%Y-%m-%d %H:%I:%S"/>');
	}; // getToday();
	
	/**
	 * Returns the monthnames
	 */
	getMonthNames = function() {
		return _monthNames;
	}; // getMonthNames();

	/*****************************************************************************
	 * PRIVATE METHODS
	 ****************************************************************************/
	
	/**
	 * Parse a string date into a Javascript date
	 */
	function _getDate(string, inputFormat) {
		inputFormat = inputFormat || 'yyyy-mm-dd hh:ii:ss'; // default format
		var parts = string.match(/(\d+)/g), i = 0, fmt = {};
	  inputFormat.replace(/(yyyy|dd|mm|hh|ii|ss)/g, function(part) { fmt[part] = i++; });
	  return new Date(parts[fmt['yyyy']], parts[fmt['mm']]-1, parts[fmt['dd']], parts[fmt['hh']], parts[fmt['ii']], parts[fmt['ss']]);
	} // _getDate();

	/**
	 * Parse a grootboek code as per the exportCode provided in the invoice's group
	 */
	function _parseGrootboekCode(code, isInternational) {
		var ret = {
						code: "<cx:write value="$activity.toInvoiceLine.toToDo.toDoID.numberValue"/>"
          , costtype: 'NOG IN TE VULLEN'
          , costlocation: 'NOG IN TE VULLEN'
          , exception: null
				},
				pieces = code.split(';'),
				it;

		if ( code === "" ) {
			ret.exception = 'NOGROUP';
			return ret;
		}
		
		switch ( Math.min(pieces.length, 5) ) {
			case 5:	ret.costtype = pieces[4]; // nobreak
			case 4:	ret.costlocation = pieces[3]; // nobreak
			case 3:	ret.code = pieces[isInternational ? 2 : 1];
							break;
			case 2:	ret.code = pieces[1]; // nobreak
		} // switch

		if ( ret.costtype === 'INCOMPLETE' ) {
			ret.exception = 'NOCOMPLETECODE';
		}
		
		return ret;
	} // _parseGrootboekCode();
	
	/*****************************************************************************
	 * GENERATION OF VALUES (CxScript)
	 ****************************************************************************/
	
	/**
 	 * Dates: names of the months in the required languages
 	 */
	<cx:let name="date" value="2012-01-01 00:00:00 +0100" invoke="dateValue">
		<cx:let name="dates" value="$date" invoke="datesUntilDate:" arg0="$date.nextYear.previousDay">
			<cx:let name="dates" value="$dates" invoke="@filter.dayOfMonth=1">
				<cx:foreach list="$dates" item="day">
					_monthNames.dutch.push('<cx:write value="$day" dateFormat="%B" language="Dutch"/>');
					_monthNames.english.push('<cx:write value="$day" dateFormat="%B" language="English"/>');
				</cx:foreach>
			</cx:let>
		</cx:let>
	</cx:let>

	<cx:define tag="invoice">
		_invoice = new Invoice({
				id: <cx:write value="$it"/>+0
			, fixedInvoiceNumber: (<cx:write value="$invoice.number"/>+0)||'CONCEPT'
			, it: <cx:write value="$it"/>+0
			, journalCode: 'OVE'

			// language of the invoice's invoice
			, i18n: {
				<cx:if condition="invoice.toCompany.toInvoiceCountryNode.value='Nederland' OR invoice.toCompany.toInvoiceCountryNode.value='Netherlands' OR invoice.toCompany.toInvoiceCountryNode.value='Holland' OR invoice.toCompany.toInvoiceCountryNode=nil">
					isNL: true,
					isBE: false,
					isDutch: true,
					<cx:let name="language" value="Dutch" keep=""/>
					<cx:let name="isInternational" value="0" keep=""/>
				</cx:if>
				<cx:else>
					<cx:if condition="invoice.toCompany.toInvoiceCountryNode.value='Belgi&euml;' OR invoice.toCompany.toInvoiceCountryNode.value='Belgium'">
						isNL: false,
						isBE: true,
						isDutch: false,
						<cx:let name="language" value="English" keep=""/>
						<cx:let name="isInternational" value="1" keep=""/>
					</cx:if>
					<cx:else>
						isNL: false,
						isBE: false,
						isDutch: false,
						<cx:let name="language" value="English" keep=""/>
						<cx:let name="isInternational" value="1" keep=""/>
					</cx:else>
				</cx:else>
				isEU: <cx:let condition="invoice.toCompany.toInvoiceCountryNode.notes='EU'" iftrue="true" iffalse="false" name="v"><cx:write value="$v"/></cx:let>
			}

			<cx:language value="$language">
			 
			// Details of the company
			,	company: {
					name: "<cx:write value="$invoice.toCompany.name.jsEscapedString"/>"
				, invoiceAddress: "<cx:write value="$invoice.toCompany.invoiceAddress.htmlString.jsEscapedString"/>"
				, invoiceCity: "<cx:write value="$invoice.toCompany.invoiceCity.jsEscapedString"/>"
				, invoiceStreet: "<cx:write value="$invoice.toCompany.invoiceStreet.jsEscapedString"/>"
				, invoiceHousenumber: "<cx:write value="$invoice.toCompany.invoiceNumber"/> <cx:write value="$invoice.toCompany.invoiceNumberSuffix.jsEscapedString"/>"
				, invoicePostalCode: "<cx:write value="$invoice.toCompany.invoicePostalCode"/>"
				, invoiceEmail: "<cx:bare-string-format>
						<cx:let name="projects" value="$invoice.toCompany.vacancies">
							<cx:let name="currProjects" value="$projects" invoke="@filter.toStatusNode.dataNodeID = 3318" keep=""/>
							<cx:if condition="$currProjects.count > 0">
								<cx:write value="$currProjects.@first.invoiceEmailAddress.jsEscapedString"/>
							</cx:if><cx:else>
								<cx:let name="currProjects" value="$projects" invoke="@filter.toStatusNode.dataNodeID = 3315" keep=""/>
								<cx:if condition="$currProjects.count > 0">
									<cx:write value="$currProjects.@first.invoiceEmailAddress.jsEscapedString"/>
								</cx:if><cx:else>
									<cx:let name="currProjects" value="$projects" invoke="@filter.toStatusNode.dataNodeID = 3319" keep=""/>
									<cx:if condition="$currProjects.count > 0">
										<cx:write value="$currProjects.@first.invoiceEmailAddress.jsEscapedString"/>
									</cx:if><cx:else>
										<cx:let name="currProjects" value="$projects" invoke="@filter.toStatusNode.dataNodeID = 3316" keep=""/>
										<cx:if condition="$currProjects.count > 0">
											<cx:write value="$currProjects.@first.invoiceEmailAddress.jsEscapedString"/>
										</cx:if><cx:else>
											<cx:let name="currProjects" value="$projects" invoke="@filter.toStatusNode.dataNodeID = 3320" keep=""/>
											<cx:if condition="$currProjects.count > 0">
												<cx:write value="$currProjects.@first.invoiceEmailAddress.jsEscapedString"/>
											</cx:if><cx:else>
											</cx:else>
										</cx:else>
									</cx:else>
								</cx:else>
							</cx:else>
						</cx:let>
					</cx:bare-string-format>"
				, hasReferenceDate: false
				, taxNumber: "<cx:write value="$invoice.toCompany.taxNumber"/>"
				, paymentCode: "<cx:write value="$invoice.toCompany.paymentCode"/>"
				, debtorNumber: <cx:write value="$invoice.toCompany.debtorNumber"/>+0
			}

			
			// Grootboek prefix (???)
			<cx:let name="grootboekGroups" value="$invoice.invoiceLines" invoke="@filter.toServiceNode.exportCode hasPrefix: 'GROOTBOEK;'">
				, grootboek: <cx:bare-string-format>_parseGrootboekCode(
						"<cx:foreach list="$grootboekGroups" item="group">
							<cx:write value="$group.toServiceNode.exportCode.jsEscapedString"/>;
						</cx:foreach>",
						<cx:let name="tmp" condition="$isInternational='1'" iftrue="true" iffalse="false"><cx:write value="$tmp"/></cx:let>
					)</cx:bare-string-format>
				
				, grootboekName: <cx:if condition="$grootboekGroups.count > 0">
						<cx:if condition="$grootboekGroups.count > 1">
							"<cx:write value="$group.toServiceNode.value.jsEscapedString"/>"
						</cx:if>
						<cx:else>
							<cx:foreach list="$grootboekGroups" item="group">
								"<cx:write value="$group.toServiceNode.value.jsEscapedString"/>".substr(6)
							</cx:foreach>
						</cx:else>
					</cx:if>
					<cx:else>""</cx:else>
			</cx:let>
			
			
			            	// the invoice itself
			, frequency: (-1+0) || 1
			, agreement: {
				id: 0
				, name: "Naam"
				, numberOfUsers: 0 + 0
			}
			, includingDomain: false
			, amount: <cx:write value="$invoice.total"/>
			, discount: 0+0
			, discountAmount: 0+0
			, automated: 0
			, paymentPeriod: -1
			, addressee: "<cx:write value="$invoice.toContact.informalName.jsEscapedString"/>" || "<cx:write value="$invoice.toCompany.name.jsEscapedString"/>"
			, addresseeShort: "<cx:write value="$invoice.toContact.informalName.jsEscapedString"/>"
			, startDate:new Date()
			, firstLineOfNotes: "false"
			, title: {
					main: '<cx:let name="translated" condition="$language='Dutch'" iftrue="Factuur" iffalse="Invoice"><cx:write value="$translated"/></cx:let>'
				, sub: ' '
			}
			, lines: [
				<cx:foreach list="$invoice.invoiceLines" item="invoiceLine" index="it">
					new InvoiceLine({
							title: '<b><cx:write value="$invoiceLine.toServiceNode.value"/></b><br /><cx:write value="$invoiceLine.info.htmlString.jsEscapedString" html="1"/>'
						, currency: "&euro;"
						, amount: parseFloat('<cx:write value="$invoiceLine.amount"/>') * parseFloat('<cx:write value="$invoiceLine.numberOfTimes"/>')
						, id: <cx:write value="$invoiceLine.invoiceLineID"/>
						, grootboek: <cx:bare-string-format>_parseGrootboekCode(
											"<cx:write value="$invoiceLine.toServiceNode.exportCode.jsEscapedString"/>"
										,	<cx:let name="tmp" condition="$isInternational='1'" iftrue="true" iffalse="false"><cx:write value="$tmp"/></cx:let>
								)</cx:bare-string-format>
						, grootboekName: "<cx:write value="$invoiceLine.toServiceNode.value.jsEscapedString"/>"
				})
					<cx:if condition="$invoiceLine.discountPercentage > 0">
				, new InvoiceLine({
						title: '<cx:let name="discount" condition="$language='Dutch'" iftrue="Korting" iffalse="Discount"><cx:write value="$discount"/></cx:let> <cx:write value="$invoiceLine.discountPercentage"/> %'
					, currency: "&euro;"
					, amount: parseFloat('<cx:write value="$invoiceLine.amount"/>') 
								* parseFloat('<cx:write value="$invoiceLine.numberOfTimes"/>') 
								* parseFloat('<cx:write value="$invoiceLine.discountPercentage"/>')
								/ -100
					, grootboek: <cx:bare-string-format>_parseGrootboekCode(
									"<cx:write value="$invoiceLine.toServiceNode.exportCode.jsEscapedString"/>"
								,	<cx:let name="tmp" condition="$isInternational='1'" iftrue="true" iffalse="false"><cx:write value="$tmp"/></cx:let>
						)</cx:bare-string-format>
					, grootboekName: "<cx:write value="$invoiceLine.toServiceNode.value.jsEscapedString"/>"
					, isDiscount: true										
				})
					</cx:if>
					<cx:if condition="$it.intSucc < $invoice.invoiceLines.count">,</cx:if>
				</cx:foreach>
			]
			, bindings: {
				 'Company': 	<cx:write value="$invoice.toCompany.companyID"/> + 0
			}
			
			</cx:language>
		});
	</cx:define>

	/**
	 * Invoices
	 */
	<cx:foreach list="$projects.@sortAscending.creationDate" item="invoice" index="it">
		<cx:invoice/>

		_invoices.push(_invoice);
		if ( _invoice.grootboek.exception !== null ) {
			_invoicesWithoutGroup.push(_invoice);
		}
	</cx:foreach>

	/**
	 * Invoices with errors
	 */
	/* <cx:foreach list="$errorInvoices.@sortAscending.toCompany.name" item="invoice" index="it">
		<cx:invoice/>
		_invoicesWithErrors.push(_invoice);
	</cx:foreach> */

})();
