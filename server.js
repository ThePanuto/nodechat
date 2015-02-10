(function () {
	"use strict";
	//let's inject some dependency: http for server and fs for file system.
	var http = require("http");
	//let's create an server:
	var server = {
				//where should we start this server?
		start: function () {
						var createServer = function (request, response) {
								//let's require the fs.
								var fs = require("fs");

								//open the index.html file, with an utf-8 encoding
				fs.readFile("pages/page.html", "utf-8", function (error, data) {
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(data);
					response.end();
				});

						};
						//create this server, using that callback over there.
			var application = http.createServer(createServer).listen(process.env.PORT || 1337);

						//let me know server just started.
			console.log("Server started at port", process.env.PORT || 1337);

						//let's require the io, and listen to the application over there
			var io = require("socket.io").listen(application, {log: false});
						io.configure(function () {
					io.set("transports", ["xhr-polling"]);
				io.set("polling duration", 10);
			});
			var users = [];
						//when we connect, get the socket.
						var connection = function (socket) {
							var user;
							console.log('Connection happened.');
											//when the socket sends an message,
											//emit that to all the other sockets connected to this server,
											//what he wrote and what's his name
							socket.on('message_to_server', function (data) {
													io.sockets.emit("message_to_client", {
									message: data.message,
									name: data.name
													});
											});
							socket.on('user_connected', function (name) {
								users.push(name);
								user = name;
								console.log('user_connected event for the name',name);
								io.sockets.emit( 'update_users', users );
							});
							socket.on('disconnect', function () {
								for (var i = 0, l = users.length; i < l; i++) {
									if (users[i] === user) {
										users.splice(i, 1);
										break;
									}
								}
								io.sockets.emit('update_users', users);
							});
						};

						//register the connection callback
			io.sockets.on('connection', connection);
		}
	};
	exports.start = server.start;
})();
