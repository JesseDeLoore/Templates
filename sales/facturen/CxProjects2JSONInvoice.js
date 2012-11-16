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
	function _parseGrootboekCode(code, prefix) {
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
		
		switch ( Math.min(pieces.length, 4) ) {
			case 4 : ret.costlocation = pieces[3]; // nobreak
			case 3 : ret.costtype = pieces[2]; // nobreak
			case 2 : ret.code = prefix + pieces[1]; // nobreak
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
						<cx:let name="language" value="Dutch" keep=""/>
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
			,	grootboek:	<cx:bare-string-format>
											_parseGrootboekCode(
												"<cx:foreach list="$project.groups" item="group">
													<cx:let name="isGrootboek" value="$group.exportCode" invoke="substringWithMaxLength:" arg0="10">
														<cx:if condition="$isGrootboek='GROOTBOEK;'">
															<cx:write value="$group.exportCode.jsEscapedString"/>;
														</cx:if>
													</cx:let>
												</cx:foreach>", 
												<cx:let name="grootBoekPrefix" condition="$NL='0'" iftrue="83" iffalse="82"><cx:write value="$grootBoekPrefix"/></cx:let>
											)
										</cx:bare-string-format>
										/*
										<cx:bare-string-format>
											<cx:let name="grootBoekPrefix" condition="$NL='0'" iftrue="83" iffalse="82">
												<cx:let name="groups" value="$project.groups">
													<cx:let name="g" value="$groups.dataNodeID">
														<cx:if condition="$g=4630 OR $g=4628 OR $g=4631 OR $g=4629 OR $g=4730 OR $g=4731 OR $g=4732 OR $g=4669 OR $g=4733 OR $g=4734">
															<cx:if condition="$g=4630"><cx:write value="$grootBoekPrefix"/>01</cx:if>
															<cx:if condition="$g=4628"><cx:write value="$grootBoekPrefix"/>02</cx:if>
															<cx:if condition="$g=4631"><cx:write value="$grootBoekPrefix"/>03</cx:if>
															<cx:if condition="$g=4629"><cx:write value="$grootBoekPrefix"/>04</cx:if>
															<cx:if condition="$g=4730"><cx:write value="$grootBoekPrefix"/>05</cx:if>
															<cx:if condition="$g=4731"><cx:write value="$grootBoekPrefix"/>06</cx:if>
															<cx:if condition="$g=4732"><cx:write value="$grootBoekPrefix"/>07</cx:if>
															<cx:if condition="$g=4669"><cx:write value="$grootBoekPrefix"/>08</cx:if>
															<cx:if condition="$g=4733"><cx:write value="$grootBoekPrefix"/>09</cx:if>
															<cx:if condition="$g=4734"><cx:write value="$grootBoekPrefix"/>10</cx:if>
														</cx:if>
														<cx:else>'NOGROUP'</cx:else>
													</cx:let>
												</cx:let>
											</cx:let>
										</cx:bare-string-format>
										*/
									
			// the invoice itself
			, frequency: (<cx:write value="$project.estimatedDays"/>+0) || 1
			, agreement: {
					id: <cx:write value="$project.vacancyNo"/> + 0
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
			, startDate:_getDate('<cx:write value="$project.startDate"/>')
			, firstLineOfNotes: "<cx:write value="$project.notes.line1.jsEscapedString"/>"
		});
	</cx:define>
	
	/**
	 * Projects
	 */
	<cx:foreach list="$projects.@sortAscending.toCompany.name" item="project" index="it">
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
