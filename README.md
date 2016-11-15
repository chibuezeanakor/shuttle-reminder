"A simple daily reminder app that uses Meteor and Twilio." 
=======
# shuttle-reminder
In order to make this app work, you will need the following components:
* [Meteor] (https://www.meteor.com/install)
* A [Twilio] (https://www.twilio.com/) account

You can either clone this repository or enter the following commands via the command line:

```meteor create shuttle-reminder
cd shuttle-reminder
```

You will also need access to the Twilio APIs, as well as a task scheduler that will execute code when instructed. In the command line, write the following code:

```meteor add dispatch:twilio
meteor add percolate:synced-cron
```

Then, you can use a text editor to create a file named package.json and make it look like this:

```{
  "name": "shuttle-reminder",
  "private": true,
  "scripts": {
    "start": "meteor run --settings=settings.json"
  },
  "dependencies": {
    "meteor-node-stubs": "~0.2.0"
  }
}
```

Then, you will need another file called settings.json, which will look like this:

```{
  "TWILIO": {
    "FROM": "YOUR_TWILIO_NUMBER",
    "SID": "YOUR_TWILIO_ACCOUNT_SID",
    "TOKEN": "YOUR_TWILIO_AUTH_TOKEN"
  }
```

You will have to replace YOUR_TWILIO_NUMBER with your actual Twilio number (formated in "+1xxxxxxxxxx"), YOUR_TWILIO_ACCOUNT_SID with your Twilio Account SID, and YOUR_TWILIO_AUTH_TOKEN with your Twilio Auth Token. This will allow your app to access the Twilio API on your behalf.

After you have that done, you can create three folders, which are named client, server, and imports. In the imports folder, you will need to create two more folders, named api and ui. In the api folder, create a file named users.js and add this code to it:

```import {Mongo} from 'meteor/mongo';
export const Users = new Mongo.Collection('users');
```

In order for the server to have access to the Users collection, let's go to the server folder and create a file named main.js. Then, add this code to the file:

```import { Meteor } from 'meteor/meteor';
import '../imports/api/users.js'
```

The client-side of the app needs to be able to access the Users collection instead of a static array, so in the ui folder of the imports folder, create a file named body.js, and make it look like this:

```import {Template} from 'meteor/templating';

import {Users} from '../api/users.js';

Template.body.helpers({
    users() {
        return Users.find({});
    },
});
```

We will also need to create a user interface for this app, so in the ui folder, create another file named body.html, and use the following code:

```<body>
    <div class="container">
        <header>
            <h1>Shuttle Reminder</h1>
        </header>

        <form class="new-user">Subscription Form
            <input type="text" name="firstName" placeholder="First Name">
            <input type="text" name="lastName" placeholder="Last Name">
            <input type="text" name="phoneNumber" placeholder="Phone No.">
            <button type="submit">Subscribe!</button>
        </form>
        <form class="remove-user">Unsubscribe from Message List
            <br />
            <input type="text" name="userNumber" placeholder="Phone No.">
            <button type="submit">Unsubscribe</button>
        </form>
    </div>
</body>
```

Now that we've got our UI, let's put the fields (in the "name" section of each input) to good use! In the body.js file of the ui folder, type in the following code:

~~~
Template.body.events({
    'submit .new-user': function(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        
        // stores input field names from body.html into local variables
        const firstName = target.firstName.value;
        const lastName = target.lastName.value;
        const phoneNumber = target.phoneNumber.value;

        // Insert a user into the collection
        Users.insert({
            firstName,
            lastName,
            phoneNumber,
            createdAt: new Date(),
        });

        // Clear form
        target.firstName.value = '';
        target.lastName.value = '';
        target.phoneNumber.value = '';

        
    },
    'submit .remove-user': function(event) {
        event.preventDefault();
        const target = event.target;
        
        // stores user's phone number from body.html in userPhone
        const userPhone = target.userNumber.value;

        // finds user who wants to unsubscribe by phone number
        var unsubscriber =  Users.find({phoneNumber: userPhone}).fetch()[0]._id;
        Users.remove(unsubscriber);
  
        target.userNumber.value = '';
    },

    
})
~~~

You will need to go back to the main.js file of the server folder and set up the Twilio client using the values that you had defined in settings.json. You might also want to create a method that will send an SMS using the Twilio client. To do these things, append this code to main.js:

```var twilioClient = new Twilio({
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
```

Do you remember synced-cron? Good, because this is the time where we get to use it. It will execute a cron job at a time and frequency that we specify, which is very important for an application such as this one to work. This cron job will send the SMS defined in the sendSMS function above. Add this code to main.js in the server folder:

```Meteor.startup(function() {
  // code to run on server at startup
  SyncedCron.options = {
    log: true,
    collectionName: 'reminders',
    utc: true
  }
  SyncedCron.add({
    name: 'remind_users',
    schedule: function(parser) {
      return parser.text('every weekday at 7:00am');
    },
    job: function() {
      Meteor.call('sendSMS');
    }
  });
  SyncedCron.start();
})
```

We're done! Once you've saved all of your code, run this command in the command line to run your project:
`npm start`
