var mqtt = require('mqtt');
var fs = require('fs');
var path = require('path');
var axios = require('axios');

var CONFIG = require('./config.json');
var CERT_CA = fs.readFileSync(path.join(__dirname, '/enteryourcertificatefile.pem'));
var url = CONFIG.url;
var uname = CONFIG.username;
var pass = CONFIG.password;
var clientID = 'Client-' + parseInt(Math.random() * 100);
var topic = CONFIG.topic;
let date_ob = new Date();
var logURL = CONFIG.logURL;

var client  = mqtt.connect(url,{
  clientId: clientID,
  username: uname,
  password: pass,
  keepalive: 30,
  rejectUnauthorized : true,
  ca: CERT_CA,
  reconnectPeriod: 180000,
  debug: true,
  protocol: 'mqtts'
});

client.on('error', function (error) {
  console.log('failed to connect');
  console.log(error);
  date_ob = new Date();
  let msg = 'MQTT broker connection error: ' + error + ' at: ' + date_ob;
  APIcall(logURL,'', msg);
});

client.on('message',function(topic, message, packet){
	console.log("Received a new message");
	var rqstPayload = message.toString('utf-8');	
	var certURL = CONFIG.certURL;
	if(rqstPayload.includes("msg"))
	{
	}else{APIcall(certURL,rqstPayload,'');}
});

client.on('connect', function (err) {
  console.log('Connected');
  client.subscribe(topic, { qos: 1 },function (err, granted){
	if(err === null)
	{
		console.log('Subscribed');
		date_ob = new Date();
		let msg = 'Client MQTT Client Subscribed to ' + topic + ' at: ' + date_ob + 'with client id-' + clientID;
		APIcall(logURL,'', msg);
	}else{
		console.log('Failed to Subscribe');
		date_ob = new Date();
		let msg = 'Failed to Subscribe ' + topic + ' at: ' + date_ob + 'with client id-' + clientID;
		APIcall(logURL,'', msg);
    }
  });
});

client.on('reconnect', function(){
	console.log('reconnecting');
	date_ob = new Date();
 	let msg = date_ob + ' :Something went wrong Reconnecting...:' +clientID;
 	APIcall(logURL,'', msg);
});

client.on('close', function(){
	date_ob = new Date();
	let msg = 'MQTT Client-'+ clientID+' got disconnected at: ' + date_ob + '.';
	console.log(msg);
 	APIcall(logURL,'', msg);
});

client.on('offline', function(){
	date_ob = new Date();
	let msg = 'MQTT client-'+ clientID+' went offline at: ' + date_ob + '.';
	console.log(msg);
 	APIcall(logURL,'', msg);
});

client.on('end', function(){
	date_ob = new Date();
	let msg = 'MQTT client-'+ clientID+' closed the connection at: ' + date_ob + '. Please restart application';
	console.log(msg);
 	APIcall(logURL,'', msg);
});

client.on('packetreceive', function(packet){
	date_ob = new Date();
	let msg = 'client received MQTT packet for clientID-'+ clientID;
	console.log(msg);
});

function APIcall(rqsturl, rqst, header) {
	var config = {
		method: 'post',
		url: rqsturl,
		headers: { 
				'Ocp-Apim-Trace': 'true',
				'Ocp-Apim-Subscription-Key': CONFIG.SubscriptionKey,
				'Content-Type': 'application/json',
				'message': header
		},
	data : rqst
	};
axios(config).then(function (response) {
})
.catch(function (error) {
console.log(error);
});
}
