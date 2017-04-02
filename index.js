var Alexa = require('alexa-sdk');

// Twilio Credentials 
var accountSid = 'ACa4832f6b79ea1b3141734e6312cfdf3f';
var authToken = '5da725eca7d0501f8eb35c70a852732c';
var fromNumber = '12268871669';

var https = require('https');
var queryString = require('querystring');


// Lambda function:
// exports.handler = function (event, context) {

//     console.log('Running event');
    

// Sends an SMS message using the Twilio API
// to: Phone number to send to
// body: Message body
// completedCallback(status) : Callback with status message when the function completes.


function SendSMS(to, body, callback){
 var message = {
        To: to, 
        From: 12268871669,
        Body: body
    };
    
    var messageString = queryString.stringify(message);
    
    // Options and headers for the HTTP request   
    var options = {
        host: 'api.twilio.com',
        port: 443,
        path: '/2010-04-01/Accounts/' + accountSid + '/Messages.json',
        method: 'POST',
        headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(messageString),
                    'Authorization': 'Basic ' + new Buffer(accountSid + ':' + authToken).toString('base64')
                 }
    };
    
    // Setup the HTTP request
    var req = https.request(options, function (res) {

        res.setEncoding('utf-8');
              
        // Collect response data as it comes back.
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        
        // Log the responce received from Twilio.
        // Or could use JSON.parse(responseString) here to get at individual properties.
        res.on('end', function () {

            console.log('Twilio Response: ' + responseString);
            
            // var parsedResponse = JSON.parse(responseString);
            
            // var sessionAttributes = {};
            var cardTitle = "Sent";
            // var speechOutput = "Ok, Sms sent.";
            
            // var repromptText = "";
            var shouldEndSession = true;
         
            var speechText = "SMS Sent.";
            var repromptText = "";
            var speechOutput = speechText;
            var repromptOutput = "";
            callback('SMS has been sent');
           
            
        });
    });
    
    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        
        var speechText = "There was an error.";
        var repromptText = "Would you like to try again?";
        var speechOutput = speechText;
        var repromptOutput = repromptText; 
        callback('SMS has been sent');
        
    });
    
    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('Twilio API call: ' + messageString);
    req.write(messageString);
    req.end();
 
}

function bubblesort(arrayNum, arrayText){
    var swapped;

    do {
        swapped = false;
        for(var i=0; i<arrayNum.length-1;i++){
            if(arrayNum[i] < arrayNum[i+1]){
                var tempNum = arrayNum[i];
                var tempText = arrayText[i];

                arrayNum[i] = arrayNum[i+1];
                arrayText[i] = arrayText[i+1];
                arrayNum[i+1] = tempNum;
                arrayText[i+1] = tempText;

                swapped = true;
            }
        }
    }
    while (swapped);

    console.log(arrayNum);
    return arrayText;
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // creates new table for userid:session.attributes
    alexa.dynamoDBTableName = 'storeValues'; 

    alexa.registerHandlers(handlers);
    alexa.execute();
};


var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Welcome to Scheduler-Pro. ' +

            'Here are the features ,master David, has programmed me to do,' + 

            'One. Text your contacts,' + 

            'Two. Tell your tasks for today in one word and their priority from 1 to 5, and I will make you a schedule,' +

            'Three. Tell me any appointments or assignments you have scheduled and I will store them.' + 

            'Or I can tell you what you have coming up');
    },
    'firstIntent' : function(){
        console.log('testing')
        this.emit(':ask', 'Who would you like to send your message to?');
    },
    'secondIntent' : function(){
        this.emit(':ask','Say each task in one word and the priority number after that.');
    },
    'threeIntent' : function(){
        this.emit(':ask','What are your tasks and their due dates. Say it one at a time please.');
    },

    'taskDates' : function(){
        /*var taskNameArray = [];
        var taskDateArray = [];*/
        var taskName = this.event.request.intent.slots.Assignments.value;
        var taskDate = this.event.request.intent.slots.dueDates.value;

        // console.log(taskName);
        // console.log(taskDate);

        if (!this.attributes['taskNameA']) {
            this.attributes['taskNameA'] = [];  // empty array
        }
        if (!this.attributes['taskDateA']) {
            this.attributes['taskDateA'] = [];  // empty array
        }
        /*taskNameArray.push(taskName);
        taskDateArray.push(taskDateArray);
        */

        this.attributes['taskNameA'].push(taskName);
        this.attributes['taskDateA'].push(taskDate);
        this.emit(':ask', 'Done. Anymore you want me to take note of? If so, please continue.');
    },
    'userList': function(intent, session, response){
        var stringText = this.event.request.intent.slots.tasks.value;

        var arrayText = [];
            arrayText = stringText.split(" ");
        var arrayNum = [];
        arrayNum.length = arrayText.length/2;
        for(var i=0; i<arrayText.length;i++){
            if(arrayText[i] == '1'){
                arrayText[i] = 1;
            } else if (arrayText[i] == '2'){
                arrayText[i] = 2;
            } else if (arrayText[i] == '3'){
                arrayText[i] = 3;
            } else if (arrayText[i] == '4'){
                arrayText[i] = 4;
            } else if (arrayText[i] == '5'){
                arrayText[i] = 5;
            }
        }

         
        for(var i=0; i<arrayText.length; i++){
            if(typeof arrayText[i] == 'number'){
                arrayNum[i] = arrayText[i];
                for(var j =i; j<arrayText.length ; j++){
                    arrayText[j] = arrayText[j+1];
                }
            }
        }
        var arrayTextTemp = [];

        for(var i=0; i<arrayText.length; i++){

            if(arrayText[i] !== undefined){
                arrayTextTemp.push(arrayText[i]);
            }
        }
       

        arrayNum = arrayNum.filter(Number);
        // arrayText = arrayText.filter(String);
        // console.log(arrayNum);
        console.log(arrayTextTemp);
        //Sorting Algorithm bubble sort

        var sortedText = bubblesort(arrayNum, arrayTextTemp);

        /*=================================================*/
        if(!this.attributes['sortedText']){
            this.attributes['sortedText'] = sortedText;
        }
        /*=================================================*/
        //ask
        this.emit(':ask', 'Your schedule for today should be ' + sortedText
            + '. Would you like me to text it to you?');
        

        // this.emit(':tell', 'Your tasks are ' + this.event.request.intent.slots.tasks.value);

    },
    'readLines' : function(){
        var taskNameRead = this.attributes['taskNameA'].toString();
        var taskDateRead = this.attributes['taskDateA'].toString();
        var taskNum = this.attributes['taskNameA'].length;

        var taskName = []; 
        taskName = taskNameRead.split(',');
        var taskDate = []; 
        taskDate = taskDateRead.split(',');

        taskNameRead ='';
        for(var i=0; i<taskName.length;i++){
            taskNameRead += taskName[i] + ' due on ' + taskDate + '.';
        }
        this.emit(':tell', 'You have ' + taskNum + ' tasks coming up.' + taskNameRead);

    },
    'SendSMS': function(intent, session, response){

        var intent = this.event.request.intent;
        var intentName = this.event.request.intent.name;
        if("SendSMS" === intentName){
            var destination = this.event.request.intent.slots.Destination.value;
            var text = this.event.request.intent.slots.Text.value;
            var number;
            if("David" === destination){
                number = "5197217737";
            } else if ("david" === destination){
                number = "5197217737";
            } else if ("bob" === destination){
                number = "5197217737";
            }
                // SendSMS(number,text,response);
                SendSMS(number, text, myResult=>{
                    var say = myResult;
                    this.emit(':ask', "Okay SMS Sent, Anything else you want to do?");
                });

            } else {
                throw "Invalid intent";
            }

    },
    'AMAZON.YesIntent': function(){
        //create and store the sesssion attributes 
        
        var text = this.attributes['sortedText'].toString();

        var number = "5197217737";

        SendSMS(number, text, myResult=>{
                    var say = myResult;
                     this.emit(':tell', 'Awesome! Sending it to you now!');
                });

    },
    
    'AMAZON.NoIntent' : function(){
        this.emit(':tell', 'Okay, I hope you remembered. Closing now.')
    },
    
    'AMAZON.HelpIntent': function(){
        this.emit(':ask', 'Do you need help');
    },
    'AMAZON.StopIntent': function(){
        var myName = '';
        if (this.attributes['name']) {
        myName = this.attributes['name'];
        }
        this.emit(':tell', 'goodbye, ' + myName, 'try again');
    },
    'AMAZON.CancelIntent' : function(){
        this.emit(':tell', 'Start');
    },
    'Unhandled': function () {
        var HelpMessage = "I can provide help."
        this.emit(':ask', HelpMessage, HelpMessage);
    }
    
};
    
