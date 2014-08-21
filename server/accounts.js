Meteor.startup(function() {
    AccountsEntry.config({
        signupCode: process.env.BRINX_SIGNUP_CODE || 'brinkley'//, // only restricts username+password users, not OAuth
        //defaultProfile: someDefault: 'default'
    });
});
