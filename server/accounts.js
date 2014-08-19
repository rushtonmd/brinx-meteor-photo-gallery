Meteor.startup(function() {
    AccountsEntry.config({
        signupCode: 'brinkley'//, // only restricts username+password users, not OAuth
        //defaultProfile: someDefault: 'default'
    });
});
