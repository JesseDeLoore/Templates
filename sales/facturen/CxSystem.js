; function CxUser() {
	this.id = parseInt('<cx:write value="$activity.owner.userID"/>');
	this.appname = '<cx:write value="$utilities.userDefaults.Customer"/>';
	this.wosid = '<cx:write value="$wosid"/>';
	this.xmlPass = '<cx:write value="$settings.xmlapi.xmlPassword"/>'; 
};
var cxuser = new CxUser(); 
