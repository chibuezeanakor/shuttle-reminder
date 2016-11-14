import {Template} from 'meteor/templating';

import {Users} from '../api/users.js';

import './body.html';

var userID;

Template.body.helpers({
    users() {
        return Users.find({});
    },
});

Template.body.events({
    'submit .new-user': function(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const firstName = target.firstName.value;
        const lastName = target.lastName.value;
        const phoneNumber = target.phoneNumber.value;

        // Insert a user into the collection
        userID = Users.insert({
            firstName,
            lastName,
            phoneNumber,
            createdAt: new Date(),
        });

        console.log(firstName);
        console.log(lastName);
        console.log(phoneNumber);

        // Clear form
        target.firstName.value = '';
        target.lastName.value = '';
        target.phoneNumber.value = '';

        
    },
    'submit .remove-user': function(event) {
        event.preventDefault();
        const target = event.target;
        const userPhone = target.userNumber.value;

        var unsubscriber =  Users.find({phoneNumber: userPhone}).fetch()[0]._id;
        Users.remove(unsubscriber);
  
        target.userNumber.value = '';
    },

    
})