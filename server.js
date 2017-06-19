//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;

//var spawn = require('child_process').spawn;
//var ls  = spawn('/opt/rh/rh-nodejs4/root/bin/npm install @slack/client --save');
//ls.stdout.on('data', function (data) {
//   console.log(data);
//});

var sys = require('sys');
var exec = require('child_process').exec;
var child;

// executes `pwd`
child = exec("/opt/rh/rh-nodejs4/root/bin/npm install @slack/client --save", function (error, stdout, stderr) {
  sys.print('stdout: ' + stdout);
  sys.print('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
setTimeout(function() {
    
/*var HerrKonyo = require('@slack/client').IncomingWebhook;
var url = process.env.SLACK_WEBHOOK_URL || '';
var wh = new HerrKonyo("https://hooks.slack.com/services/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");

wh.send('Hello World');
	*/


var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var bot_token = process.env.SLACK_BOT_TOKEN || '';

var myToken = "xoxb-199582684724-IaDH6NGHElTcugYh72bkvWmc";

var rtm = new RtmClient("xoxb-199582684724-IaDH6NGHElTcugYh72bkvWmc");

var commandArray;

let channel;

var temp = [];

var key = function(obj){
  // some unique object-dependent key
  return obj.channel; // just an example
};


// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartdata) => {
  for (const c of rtmStartdata.channels) {
	  c//onsole.log(c.name);
	  if (c.is_member && c.name ==='simulhackaton0617') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartdata.self.name} of team ${rtmStartdata.team.name}, but not yet connected to a channel`);
});

//chat.postMessage(myToken,channel,"bla");

function reverseStack(stack, stackSize) {
	temp = [];
	var i = 0;
	
//	console.log("Reversing!");
	console.log(stack);
	
	for (i = 0; i < stackSize; i++)
	{
		temp.push(stack.pop());
	}
	
	//while (stack.keys.length > 0)
	stack = temp;
}

//Parsing the array data into variables (for easy access)

function Menu(data, stack, stackSize) { 
    inCommand = data[0];
    resource_name = data[1];
    user_name = data[2];
    
    //first menu option
    if (inCommand == "add_user")
    {
		// Already registered
		if (stack.indexOf(user_name) >= 0)
		{
			return -1;
		}
		else
		{
			stack.push(user_name);
			reverseStack(stack, stackSize);
			stackSize = stackSize + 1;
		//	console.log(stack);
			console.log("You successfully was added to the queue!");
			
			return stack.length;
		}
    }    
    //second menu option
    if (inCommand == "place_in_queue")
    {
	//	console.log(stack.indexOf(user_name));
		return stack.indexOf(user_name);         
    }
    //third menu option
    if (inCommand == "leave")
    {
		if (stack.indexOf(user_name) >= 0)
		{
	//		console.log(stack, stack.length);
			reverseStack(stack, stackSize);
			stack.pop(0);
			reverseStack(stack, stackSize);
			stackSize = stackSize - 1;
	//		console.log(stack);
			console.log("Good bye!");
			if(stack[0] != null)
			{
				return stack[0];
			}
			else
			{
				console.log("The lab is free, there is no one in queue..");
				return -1;
			}
		}
		else
		{
			return 0;
		}
    }
    //four menu option
    if (inCommand == "now_in_lab")
    {
		//console.log(stackSize, stack.length);
        if(stack.length > 0)
        {
			console.log("the user is " + stack[0]);
            return stack[0];
        }
        else
        {
            console.log("There is no one in the lab right now..");
			return 0;
        }
    }
    //five menu option
    if (inCommand == "unreg")
    {
        if(stack.indexOf(user_name) < 0)
        {
            console.log("You were not in the queue at any time..");
            return 0;
        }
        else
        {
            stack.splice(stack.indexOf(user_name),1);
			stackSize = stackSize - 1;
            console.log("You were got out off the queue..");
            return 1;
        }
    }
}

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
 // rtm.sendMessage("Hello! What would you like to do? \n1. Register to the lab \n2. Get your place in queue \n3. Leave the lab \n4. Find out who's in lab now", channel);
});

//var RTM_EVENTS = require('./node-slack-client-master/lib/clients/events/rtm').EVENTS;
var RTM_EVENTS = require('./node-slack-client-master/lib/clients/events/rtm').EVENTS;	

// message.channel = channel for private message
// channel = channel for public messages
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
	
	
//initialize variables
	if (this.dict == null)
	{
		this.dict = [];
	}
	
	if (this.stack == null)
	{
		this.stack = [];
	}

	if (this.stackSize == null)
	{
		console.log("now size is null");
		this.stackSize = 0;
	}
	
	console.log(this.stackSize);
	
	if (this.dict[key(message.user)] == null)
	{
		this.dict[key(message.user)] = message.channel;
		
		rtm.sendMessage("Welcome, " + rtm.dataStore.getUserById(message.user).name + "!");
	}
	else
	{
		rtm.sendMessage("Hi, " + rtm.dataStore.getUserById(message.user).name);
	}
	
//	console.log("User's channel is " + message.channel + " and the user's id is " + message.user);
//	console.log("From dictionary " + this.dict[key(message.user)]);
	
	var commandArray = [0,1,2,3];
	commandArray[1] = 1;
	commandArray[2] = message.user;
	
	if (message.text == "1")
	{
		commandArray[0] = "add_user";
		var queueNum = Menu(commandArray, this.stack, this.stackSize);
		if (queueNum > 1)
		{
			rtm.sendMessage("Registered successfuly, " + rtm.dataStore.getUserById(message.user).name + "! You are number " + queueNum, message.channel);
		}
		else if (queueNum == 1)
		{
			rtm.sendMessage("The lab is all yours, " + rtm.dataStore.getUserById(message.user).name + "! Don't forget to perform leave action when you finish.", message.channel);
		}
		else if (queueNum == -1)
		{
			rtm.sendMessage("You're already registered, " + rtm.dataStore.getUserById(message.user).name + "!", message.channel);
		}
	}
	else if (message.text == "2")
	{
		commandArray[0] = "place_in_queue";
		
		var placeInQueue = Menu(commandArray, this.stack, this.stackSize);
		if (placeInQueue == -1)
		{
			rtm.sendMessage("There's no one in queue!", message.channel);
		}
		else
		{
			// rtm.dataStore.getUserById(userId).name
			rtm.sendMessage("Your place in queue " + (placeInQueue + 1), message.channel);
		}
	}
	else if (message.text == "3")
	{
		commandArray[0] = "leave";
		
		var userId = Menu(commandArray, this.stack, this.stackSize);
		if (userId == -1)
		{
			rtm.sendMessage("Bye bye!", message.channel);
			rtm.sendMessage("The lab is now free!", channel);
		}
		else if (userId == 0)
		{
			rtm.sendMessage("You were not in the queue!", message.channel);
		}
		else
		{
			var nextUserChannel = this.dict[key(userId)];
			console.log("the next channel is " + nextUserChannel);
			rtm.sendMessage("The lab is yours!", nextUserChannel);
		}
	}
	else if (message.text == "4")
	{
		commandArray[0] = "now_in_lab";
		console.log(this.stackSize);
		var userId = Menu(commandArray, this.stack, this.stackSize);
		if (userId == 0)
		{
			rtm.sendMessage("Lab is empty!", message.channel);
		}
		else
		{
			rtm.sendMessage(rtm.dataStore.getUserById(userId).name + " is in the lab now", message.channel);
		}
	}
	else if (message.text == "5")
	{
		commandArray[0] = "unreg";
		var status = Menu(commandArray, this.stack, this.stackSize);
		if (status == 0)
		{
			rtm.sendMessage("You were not in the lab, tambal", message.channel);
		}
		else if (status == 1)
		{
			rtm.sendMessage("You've successfully unregistered", message.channel);
		}
	}
	else
	{
		rtm.sendMessage("Hello! What would you like to do? \n1. Register to the lab \n2. Get your place in queue \n3. Leave the lab \n4. Find out who's in lab now \n5. Unregister from queue", message.channel);
	}
});

rtm.start();
    
}, (30 * 1000));
//Wait before install finishes
//await sleep(20000);




