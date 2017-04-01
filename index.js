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
function SendSMS(to, body, response) {
    
    // The SMS message to send
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
            
            // if("queued" === parsedResponse.status){  // we're good, variables already set..
            // } else {
            //     speechOutput = parsedResponse.message;
            // }
            
            var speechText = "SMS Sent.";
            var repromptText = "";
            var speechOutput = speechText;/*{
                speech: speechText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            }*/;
            var repromptOutput = ""; /*{
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };*/
            // response.ask(speechOutput, repromptOutput);
            this.emit(':tell', speechOutput, repromptOutput);
            // buildSpeechletResponse(cardTitle,speechOutput,repromptText,shouldEndSession);
            // callback(sessionAttributes,
            //          buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
            
        });
    });
    
    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        
        var speechText = "There was an error.";
        var repromptText = "Would you like to try again?";
        var speechOutput = speechText;/*{
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };*/
        var repromptOutput = repromptText; /*{
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };*/
        // response.ask(speechOutput, repromptOutput);
        this.emit(':tell', speechOutput,repromptOutput);
        // var sessionAttributes = {};
        //     var cardTitle = "Sent";
        //     var speechOutput = "Unfortunately, sms request has finished with errors.";
            
        //     var repromptText = "";
        //     var shouldEndSession = true;
        // buildSpeechletResponse(cardTitle,speechOutput,repromptText,shouldEndSession);
        //     callback(sessionAttributes,
        //              buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        
    });
    
    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('Twilio API call: ' + messageString);
    req.write(messageString);
    req.end();

}


function textEmit(params, callback){
    callback('SMS has been sent');
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for userid:session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':tell', 'Welcome to Scheduler-Pro. Please state your tasks today and their priority from 1 to 10');
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
                SendSMS(number,text,response);

                textEmit(params, myResult=>{
                    var say = myResult;
                    this.emit(':tell', "Okay SMS Sent");
                });

            } else {
                throw "Invalid intent";
            }

    },



    // 'userList': function(intent, session, response){
    //     var intent = this.event.request.intent,
    //     intentName = this.event.request.intent.name;

    //     this.emit(':tell', 'Your tasks are ' + this.event.request.intent.slots.tasks.value);

    // },


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
    
// function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
//     return {
//         outputSpeech: {
//             type: "PlainText",
//             text: output
//         },
//         card: {
//             type: "Simple",
//             title: "SessionSpeechlet - " + title,
//             content: "SessionSpeechlet - " + output
//         },
//         reprompt: {
//             outputSpeech: {
//                 type: "PlainText",
//                 text: repromptText
//             }
//         },
//         shouldEndSession: shouldEndSession
//     };
// }