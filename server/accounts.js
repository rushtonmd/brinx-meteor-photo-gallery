Meteor.startup(function() {
    AccountsEntry.config({
        signupCode: typeof Meteor.settings != 'undefined' && Meteor.settings.brinx_signup_code || '12345'//, // only restricts username+password users, not OAuth
        //defaultProfile: someDefault: 'default'
    });
});
