; function CxUser() {
	this.id = parseInt('<cx:write value="$activity.owner.userID"/>');
	this.appname = '<cx:write value="$utilities.userDefaults.Customer"/>';
	this.wosid = '<cx:write value="$wosid"/>';
	this.xmlPass = 's4l3sc4r3r1x';
};
var cxuser = new CxUser(); 
