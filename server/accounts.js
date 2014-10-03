Meteor.startup(function() {
	
	var BRINX_SIGNUP_CODE = ServerSettingsValue('brinx_signup_code') || '12345';

    AccountsEntry.config({
        signupCode: BRINX_SIGNUP_CODE //, // only restricts username+password users, not OAuth
        //defaultProfile: someDefault: 'default'
    });
});
