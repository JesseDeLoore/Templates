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
		return [];
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
				id: <cx:write value="$it"/>+0
			, it: <cx:write value="$it"/>+0

			// language of the project's invoice
			, i18n: {
				<cx:if condition="project.toCompany.toInvoiceCountryNode.value='Nederland' OR project.toCompany.toInvoiceCountryNode.value='Netherlands' OR project.toCompany.toInvoiceCountryNode.value='Holland' OR project.toCompany.toInvoiceCountryNode=nil">
					isNL: true,
					isBE: false,
					isDutch: true,
					<cx:let name="language" value="Dutch" keep=""/>
				</cx:if>
				<cx:else>
					<cx:if condition="project.toCompany.toInvoiceCountryNode.value='Belgi&euml;' OR project.toCompany.toInvoiceCountryNode.value='Belgium'">
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
				isEU: <cx:let condition="project.toCompany.toInvoiceCountryNode.notes='EU'" iftrue="true" iffalse="false" name="v"><cx:write value="$v"/></cx:let>
			}

			// Details of the company
			,	company: {
					name: "<cx:write value="$project.toCompany.name.jsEscapedString"/>"
				, invoiceAddress: "<cx:write value="$project.toCompany.invoiceAddress.htmlString.jsEscapedString"/>"
				, invoiceCity: "<cx:write value="$project.toCompany.invoiceCity.jsEscapedString"/>"
				, invoiceStreet: "<cx:write value="$project.toCompany.invoiceStreet.jsEscapedString"/>"
				, invoiceHousenumber: "<cx:write value="$project.toCompany.invoiceNumber"/> <cx:write value="$project.toCompany.invoiceNumberSuffix.jsEscapedString"/>"
				, invoicePostalCode: "<cx:write value="$project.toCompany.invoicePostalCode"/>"
				, invoiceEmail: "<cx:write value="$project.toCompany.emailAddress.jsEscapedString"/>"
				, hasReferenceDate: false
				, taxNumber: "<cx:write value="$project.toCompany.taxNumber"/>"
				, paymentCode: "<cx:write value="$project.toCompany.paymentCode"/>"
				, debtorNumber: <cx:write value="$project.toCompany.debtorNumber"/>+0
			}

			
			// Grootboek prefix (???)


<cx:let name="grootboekGroups" value="$project.invoiceLines" invoke="@filter.toServiceNode.exportCode hasPrefix: 'GROOTBOEK;'">

, grootboek: <cx:bare-string-format>
_parseGrootboekCode(
"<cx:foreach list="$grootboekGroups" item="group">
<cx:write value="$group.toServiceNode.exportCode.jsEscapedString"/>;
</cx:foreach>",
<cx:let name="isInternational" condition="$NL='0'" iftrue="true" iffalse="false"><cx:write value="$isInternational"/></cx:let>
)
</cx:bare-string-format>
, grootboekName: <cx:if condition="$grootboekGroups.count > 0">
<cx:if condition="$grootboekGroups.count > 1">
"<cx:write value="$group.toServiceNode.value.jsEscapedString"/>"
</cx:if>
<cx:else>
<cx:foreach list="$grootboekGroups" item="group">
"<cx:write value="$group.toServiceNode.value.jsEscapedString"/>".substr(6)
</cx:foreach>
</cx:else>
</cx:let></cx:if><cx:else>""</cx:else>


            	// the invoice itself
, frequency: (-1+0) || 1
, agreement: {
id: 0
, name: "Naam"
, numberOfUsers: 0 + 0
}
, includingDomain: false
, amount: <cx:write value="$project.total"/>
, discount: 0+0
, discountAmount: 0+0
, automated: 0
, paymentPeriod: -1
, addressee: "<cx:write value="$project.toContact.informalName.jsEscapedString"/>" || "<cx:write value="$project.toCompany.name.jsEscapedString"/>"
, addresseeShort: "<cx:write value="$project.toContact.informalName.jsEscapedString"/>"
, startDate:new Date()
, firstLineOfNotes: "false"
			, title: {
					main: ' '
				, sub: '<cx:let name="isInternational" condition="$language='Dutch'" iftrue="Factuur" iffalse="Invoice"><cx:write value="$isInternational"/></cx:let>'
			}
			, lines: [<cx:foreach list="$project.invoiceLines" item="invoiceLine" index="i"><cx:let name="end" value="$i" invoke="numberByAdding:" arg0="1"><cx:if condition="i!=0 AND i!=$end"><cx:write value=","/></cx:if></cx:let>
                    {
                    title: '<b><cx:write value="$invoiceLine.toServiceNode.value"/></b><br /><cx:write value="$invoiceLine.info"/>'
                    , currency: "&euro;"
                    , amount: <cx:write value="$invoiceLine.total"/>
                    }
                    </cx:foreach>]
			, bindings: {
				 'Company': 	<cx:write value="$project.toCompany.companyID"/> + 0
			}
		});
	</cx:define>

	/**
	 * Projects
	 */
	<cx:foreach list="$projects.@sortAscending.creationDate" item="project" index="it">
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
