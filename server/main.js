import { Meteor } from 'meteor/meteor';

import {Users} from '../imports/api/users.js';

import '../imports/api/users.js'

SMS = new Mongo.Collection('sms');

var twilioClient = new Twilio({
  from: Meteor.settings.TWILIO.FROM,
  sid: Meteor.settings.TWILIO.SID,
  token: Meteor.settings.TWILIO.TOKEN
});

Meteor.methods({
  'sendSMS': function(){
    var userList = Users.find({}).fetch();
    userList.forEach(function(user){
      try {
        twilioClient.sendSMS({
          to: user.phoneNumber,
          body: "Do not forget to take the shuttle today!"
        });
      } catch (err) {
        throw new Meteor.error(err);      
      }
    });
      },
})

Meteor.startup(function() {
  // code to run on server at startup
  SyncedCron.options = {
    log: true,
    collectionName: 'reminders',
    utc: true
  }
  SyncedCron.add({
    name: 'remind_users',
    schedule: function(parser) {
      return parser.text('every 5 minutes');
    },
    job: function() {
      Meteor.call('sendSMS');
    }
  });
  SyncedCron.start();
})
