/*
Copyright (c) 2017 David Zhang. All Rights Reserved.
*/
'use strict';

var accountSid = 'ACa4832f6b79ea1b3141734e6312cfdf3f';
var authToken = '5da725eca7d0501f8eb35c70a852732c';
var fromNumber = '12268871669';

var https = require('https');
var queryString = require('querystring');

//This is for the lambda function:

exports.handler = function(event, context){
	console.log('Event is current running');

	//Sends an SMS message to the number provided by the "event's" data
	// Ends the lambda function when the send function completes
	SendSMS(event.to, 'Hello there!',
		function(status){
			context.done(null,status);
		});
};

//This function sends an SMS message using Twilio's API
//to = phone # to send to 
//body = text message
//callback = status message when the function is completed

function SendSMS(to, body, callback){

	// The SMS message to send
	var message = {
		To: to,
		From: 12268871669,
		Body: body
	};
	//changes the message to a string
	var messageString = queryString.stringify(message);

	//taken from external sources and learned how to use it
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

    //HTTP request setup

    var req = https.request(options, function(res){

    	res.setEncoding('utf-8');

    	//Collect the response data as it comes back.
    	var responseString = '';
    	res.on('data', function(data){
    		responseString +=data;
    	});

    	//Log the repsonse received from Twilio. 
    	//Side note: Use JSON.parse(responseString) to get individual properties

    	res.on('end', function(){
    		console.log('Twilio Response: ' + responseString);

    		var parsedResponse = JSON.parse(responseString);

    		var sessionAttributes = {};
    		var cardTitle = "Sent";
    		var speechOutput = "Ok, Sms sent.";
    		var repromptText = "";
    		var shouldEndSession = true;

    		if ("queued" === parsedResponse.status){

    		}else {
    			speechOutput = parsedResponse.message;
    		}

    		callback(sessionAttributes,
    			buildSpeechletResponse(
    				cardTitle, 
    				speechOutput,
    				repromptText,
    				shouldEndSession
    			));
			});

    	});

    	req.on('error', function(e){
    		console.error('HTTP error:' + e.message);

    		var sessionAttributes = {};
    		var cardTitle = "Sent";
    		var speechOutput = "Rip, error! error!";

    		var repromptText = "";
    		var shouldEndSession = true;

            callback(sessionAttributes,
                     buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        
    });
    
    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('Twilio API call: ' + messageString);
    req.write(messageString);
    req.end();

}



function storeValuesName(IntentRequest, session, numTasks, callback){
    var 

}


// Route the incoming request based on type (LaunchRequest, IntentRequest)
// JSON body of the request is provided in the even parameter.

exports.handler = function (event, context) {
	try {
		console.log("event.session.application.applicationId:" + event.session.application.applicationId);

		if(event.session.new){
			onSessionStarted({
				requestId: event.request.requestId
			}, event.session);
		}

		if (event.request.type === "LaunchRequest"){
			onLaunch(event.request,
					 event.session,
					 function callback(sessionAttributes, speechletResponse) {
					 	context.succeed(buildResponse(sessionAttributes, speechletResponse));
					 });
		} else if (event.request.type === "IntentRequest") {
			onIntent(event.request,
					 event.session,
					 function callback(sessionAttributes, speechletResponse){
					 	context.succeed(buildResponse(sessionAttributes, speechletResponse));
					 });
		} else if (event.request.type === "SessionEndedRequest") {
			onSessionEnded(event.request, event.session);
			context.succeed();
		}
	} catch(e) {
		context.fail("Exception: " + e);
	}
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
            ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
            ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

//Called when the user specifies an intent for this skill

function onIntent(IntentRequest, session, callback) {
	console.log("onIntent requestId=" + intentRequest.requestId +
            ", sessionId=" + session.sessionId);

	var intent = IntentRequest.intent,
		intentName = intentRequest.intent.name;

    var numTasks;
    var nameTasks;

    // for (int i=0; i<numTasks, i++{


    // }


	if("SendSMS" === intentName){
		var destination = intentRequest.intent.slots.Destination.value;
		var text = intentRequest.intent.slots.Text.value;
		var number;
		if("Dave" === destination){
			number = "5197217737";
		} else if ("other people" === destination){
			number = "5197217737";
		} 
		SendSMS(number, text, callback);
	} else {
		throw "Invalid Intent";
	}
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
            ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

function getWelcomeResponse(callback){
	//Initialize the session with some attributes
	var sessionAttributes = {};
	var cardTitle = "Welcome";
	var speechOutput = "Welcome to Scheduler-Pro. Please say how many tasks you have for today";

	//if user does not reply or alexa does not understand
	var repromptText = "May you please repeat that?";
	var shouldEndSession = false;
	callback(sessionAttributes,
		buildSpeechletResponse(cardTitle,speechOutput,repromptText,shouldEndSession));

}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}