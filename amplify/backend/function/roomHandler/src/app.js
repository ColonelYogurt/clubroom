/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_ROOMS_ARN
	STORAGE_ROOMS_NAME
	STORAGE_ROOMS_STREAMARN
Amplify Params - DO NOT EDIT */

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const {uuid} = require('uuidv4');
// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

const AWS = require('aws-sdk');
const { default: userEvent } = require('@testing-library/user-event');
const docClient = new AWS.DynamoDB.DocumentClient()


/**********************
 * Example get method *
 **********************/

app.get('/rooms', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/rooms/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/rooms', async function(req, res) {
  // Add your code here
  console.log(req);
  const roomId = uuid();
  var params = {
    TableName : process.env.STORAGE_ROOMS_NAME,
    Item:{
      roomId: roomId,
      title: req.body.title,
      topic: req.body.topic,
      iconUri: req.body.iconUri,
      delete: false,
      host: req.body.host,
      createTime: Date.now(),
    }
  }
  console.log(params);
  const region = 'us-east-1';
  //add iconuri
  // if (!roomId) {
  //   return response(400, 'application/json', JSON.stringify({
  //     error: 'Required properties: meeting roomId'
  //   }));
  // }
  const request ={
    ClientRequestToken: req.body.host, //todo: handle unique user id
    MediaRegion: region,
    NotificationsConfiguration: {
      SqsQueueArn: SQS_QUEUE_AR, //add the enviro
     }, 
    ExternalMeetingId: roomId
  };

  console.info('Creating new Room');
  meetingInfo = await chime.createMeeting(request).promise();

  //new attendee
  console.info('Adding new attendee');

  const attendeeInfo = (await chime.createAttendee({
    MeetingId: meetingInfo.Meeting.MeetingId,
    ExternalUserId: `${uuid().substring(0, 8)}#${roomId}`.substring(0, 64),
  }).promise());
   const res_extra = JSON.stringify(
    {
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee,
    });
  
  docClient.put(params, function(err, data){
    if(err) res.json({err})
    else res.json({...res_extra, success: 'Room created'})
  })
});


//create room
const createMeeting = async(context) => {

  const roomId = context.arguments.roomId;
  const region = context.arguments.region || 'us-east-1';
  //add iconuri

  if (!roomId) {
    return response(400, 'application/json', JSON.stringify({
      error: 'Required properties: meeting roomId'
    }));
  }

  const request ={
    ClientRequestToken: uuid(), //todo: handle unique user id
    MediaRegion: region,
    NotificationsConfiguration: {
      SqsQueueArn: SQS_QUEUE_AR, //add the enviro
     }, 
    ExternalMeetingId: roomId
  };

  console.info('Creating new Room');
  meetingInfo = await chime.createMeeting(request).promise();

  //new attendee
  console.info('Adding new attendee');

  const attendeeInfo = (await chime.createAttendee({
    MeetingId: meetingInfo.Meeting.MeetingId,
    ExternalUserId: `${uuid().substring(0, 8)}#${roomId}`.substring(0, 64),
  }).promise());

  return response(200, 'application/json', JSON.stringify(
    {
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee,
    }, null, 2));
    
}

//TODO: implement joinRoom()

//TODO: implement endRoom()

//TODO: implement listRoom()


app.post('/rooms/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/rooms', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/rooms/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/rooms', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/rooms/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
