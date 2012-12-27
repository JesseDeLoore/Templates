; var getInvoices, getProjects, getProjectsWithErrors, getProjectsWithoutGroup, getToday, getMonthNames;
(function() {
	var _project = null,
			_projects = [],
			_projectsWithoutGroup = [],
			_projectsWithErrors = [],
			_monthNames = {dutch: [], english: []},
			_regexp = {
					nonDigits: /[^\d]/g
			};
	
	/*****************************************************************************
	 * PUBLIC METHODS
	 ****************************************************************************/
	 
	/**
	 * Generic getter for the projects
	 */
	getInvoices = getProjects = function() { 
		return _projects; 
	}; // getProjects();
	
	/**
	 * Specific getter for those projects that have no valid grootboek code
	 */
	getProjectsWithoutGroup = function() {
		return _projectsWithoutGroup;
	}; // getProjectsWithoutGroup();
	
	/**
	 * Specific getter for those projects that have errors
	 */
	getProjectsWithErrors = function() {
		return _projectsWithErrors;
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
	 * Parse a grootboek code as per the exportCode provided in the project's group
	 */
	function _parseGrootboekCode(code, isInternational) {
		var ret = {
						code: 'INCOMPLETE',
						costtype: 'INCOMPLETE',
						costlocation: 'INCOMPLETE',
						exception: null
				},
				pieces = code.split(';'),
				it;

		if ( code === "" ) {
			ret.exception = 'NOGROUP';
			return ret;
		}
		
		switch ( Math.min(pieces.length, 5) ) {
			case 5:	ret.costlocation = pieces[4]; // nobreak
			case 4:	ret.costtype = pieces[3]; // nobreak
			case 3:	ret.code = pieces[isInternational ? 2 : 1];
							break;
			case 2:	ret.code = pieces[1]; // nobreak
		} // switch
		
		if ( ret.costlocation === 'INCOMPLETE' ) {
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
	
	<cx:define tag="project">
		_project = new Invoice({
				id: <cx:write value="$project.vacancyID"/>+0
			, it: <cx:write value="$it"/>+0
			, journalCode: 'VRK'
				
			// language of the project's invoice
			, i18n: {
				<cx:if condition="project.toInvoiceCountryNode.value='Nederland' OR project.toInvoiceCountryNode.value='Netherlands' OR project.toInvoiceCountryNode.value='Holland' OR project.toInvoiceCountryNode=nil">
					isNL: true,
					isBE: false,
					isDutch: true,
					<cx:let name="language" value="Dutch" keep=""/>
				</cx:if>
				<cx:else>
					<cx:if condition="project.toInvoiceCountryNode.value='Belgi&euml;' OR project.toInvoiceCountryNode.value='Belgium'">
						isNL: false,
						isBE: true,
						isDutch: false,
						<cx:let name="language" value="English" keep=""/>
					</cx:if>
					<cx:else>
						isNL: false,
						isBE: false,
						isDutch: false,
						<cx:let name="language" value="English" keep=""/>
					</cx:else>
				</cx:else>
				isEU: <cx:let condition="project.toInvoiceCountryNode.notes='EU'" iftrue="true" iffalse="false" name="v"><cx:write value="$v"/></cx:let>
			}
			
			// Details of the company
			,	company: {
					name: "<cx:write value="$project.toCompany.name.jsEscapedString"/>"
				, invoiceAddress: "<cx:write value="$project.invoiceAddress.htmlString.jsEscapedString"/>"
				, invoiceCity: "<cx:write value="$project.toCompany.invoiceCity.jsEscapedString"/>"
				, invoiceStreet: "<cx:write value="$project.toCompany.invoiceStreet.jsEscapedString"/>"
				, invoiceHousenumber: "<cx:write value="$project.toCompany.invoiceNumber"/> <cx:write value="$project.toCompany.invoiceNumberSuffix.jsEscapedString"/>" 
				, invoicePostalCode: "<cx:write value="$project.toCompany.invoicePostalCode"/>"
				, invoiceEmail: "<cx:write value="$project.invoiceEmailAddress.jsEscapedString"/>"
				, hasReferenceDate: <cx:let name="v" condition="$project.toCompany.groups.dataNodeID = 4304" iftrue="true" iffalse="false"><cx:write value="$v"/></cx:let>
				, taxNumber: "<cx:write value="$project.toCompany.taxNumber"/>"
				, paymentCode: "<cx:write value="$project.toCompany.paymentCode"/>"
				, debtorNumber: <cx:write value="$project.toCompany.debtorNumber"/>+0
			}
			
			
			// Grootboek prefix (???)
			 
			<cx:let name="grootboekGroups" value="$project.groups" invoke="@filter.exportCode hasPrefix: 'GROOTBOEK;'">
			
			,	grootboek:	<cx:bare-string-format>
											_parseGrootboekCode(
												"<cx:foreach list="$grootboekGroups" item="group">
													<cx:write value="$group.exportCode.jsEscapedString"/>;
												</cx:foreach>", 
												<cx:let name="isInternational" condition="$NL='0'" iftrue="true" iffalse="false"><cx:write value="$isInternational"/></cx:let>
											)
										</cx:bare-string-format>
			, grootboekName: <cx:if condition="$grootboekGroups.count > 1">
													"<cx:write value="$project.jobTitle.jsEscapedString"/>"
												</cx:if>
												<cx:else>
													<cx:foreach list="$grootboekGroups" item="group">
														"<cx:write value="$group.value.jsEscapedString"/>".substr(6)
													</cx:foreach> 
												</cx:else>
			</cx:let>
									
			// the invoice itself
			, frequency: (<cx:write value="$project.estimatedDays"/>+0) || 1
			, agreement: {
					id: '<cx:write value="$project.vacancyNo"/>'
				, name: "<cx:write value="$project.jobTitle.jsEscapedString"/>"
				, numberOfUsers: <cx:write value="$project.numberOfVacancies"/> + 0
			}
			, includingDomain: <cx:let condition="project.groups.dataNodeID=4669" iftrue="true" iffalse="false" name="v"><cx:write value="$v"/></cx:let>
			, amount: <cx:write value="$project.estimatedAmount"/>
			, discount: <cx:write value="$project.successRatePercentage"/>+0
			, discountAmount: <cx:write value="$project.meanExpectedAmount"/>+0
			, automated: <cx:let condition="$project.toCompany.toPaymentPeriodNode.value='Automatische Incasso'" iftrue="true" iffalse="false" name="v"><cx:write value="$v"/></cx:let>
			, paymentPeriod: parseInt("<cx:write value="$project.toCompany.toPaymentPeriodNode.value"/>".replace(_regexp.nonDigits, '')) 
			, addressee: "<cx:write value="$project.invoiceAttention.jsEscapedString"/>" || "<cx:write value="$project.toSignAuthority.informalName.jsEscapedString"/>"
			, addresseeShort: "<cx:write value="$project.toSignAuthority.lessFormalName.jsEscapedString"/>"
			, startDate:_getDate('<cx:write value="$project.startDate"/>')
			, firstLineOfNotes: "<cx:write value="$project.notes.line1.jsEscapedString"/>"
			, title: {
					main: ''
				, sub: ''
			}
			, lines: []
			, bindings: {
					'Vacancy': 	<cx:write value="$project.vacancyID"/> + 0
				, 'Company': 	<cx:write value="$project.toCompany.companyID"/> + 0
			}
		});
	</cx:define>
	
	/**
	 * Projects
	 */
	<cx:foreach list="$projects.@sortAscending.vacancyID" item="project" index="it">
		<cx:project/>

		_projects.push(_project);
		if ( _project.grootboek.exception !== null ) {
			_projectsWithoutGroup.push(_project);
		}
	</cx:foreach>
	
	/**
	 * Projects with errors
	 */
	/* <cx:foreach list="$errorInvoices.@sortAscending.toCompany.name" item="project" index="it">
		<cx:project/>
		_projectsWithErrors.push(_project);
	</cx:foreach> */

})();
