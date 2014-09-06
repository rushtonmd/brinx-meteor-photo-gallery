Meteor.startup(function() {
    AccountsEntry.config({
        signupCode: Meteor.settings.brinx_signup_code || '12345'//, // only restricts username+password users, not OAuth
        //defaultProfile: someDefault: 'default'
    });
});
