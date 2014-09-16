var express  = require('express');
var app      = express();
var multer   = require('multer');
var port     = process.env.PORT || 8000;
var exec     = require("child_process").exec;
var ncstatus = false;
var nc;

log = function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
  }
}

runNanocube = function (file, opts) {
	var cmd = "python csv2Nanocube.py " + opts + " " + file + " | ../src/ncserve --rf=100000 --threads=100";
	console.log("Spawning nanocube: " + cmd);
	var nc=exec(cmd, {
		encoding: 'utf8',
		cwd: process.cwd(),
   		env: process.env
 	}, log);

	// Monitor for exit
	ncstatus = true;
 	nc.on('exit', function (code, signal) {
 		console.log("\nNanocube exited.\n")
 		ncstatus = false;
 	});
 	return(nc);
}

app.use(multer());
app.use(express.static('../web'));

app.post('/', function(req, res) {
	console.log(req.body);
	console.log(req.files);

	if (!(req.body.hasOwnProperty("opts") & req.files.hasOwnProperty("data"))) {
		res.send('Example: curl -D - -F opts=\'<nanocube options>\' -F data=@data.csv http://localhost:9000\n').status(400).end();
	} else {
		// Kill old Nanocube?
		if (ncstatus) {
			console.log("\nKilling nanocube.\n")
			nc.kill();
		}

		// Run Nanocube
		nc=runNanocube(req.files.data.path, req.body.opts);

		// Redirect to Nanocube
		res.location('/index.html').status(201).end();
	}

})

app.listen(port);
console.log('Magic happens on port ' + port);