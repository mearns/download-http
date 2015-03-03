var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var urllib = require('url');
var mkdirp = require('mkdirp');

module.exports = download;

function download(url, destination, callback) {
	var url, request, savePath;

	if (!url) {
		throw new Error("URL must be specified!");
	}

	if (!destination) {
		throw new Error("Destination must be specified!");
	}

	url = urllib.parse(url);
	request = getRequestInstance(url);
	savePath = getSavePath(url, destination);

	request.get(url, function responseHandler(response) {
		var status = response.statusCode;

		if (status === 200) {
			writeStream(response, savePath, callback);
		} else if(status > 300 && status < 400 && response.headers.location) {
			var redirectURL = response.headers.location;
			request.get(redirectURL, responseHandler).on('error', errorHandler);
		} else {
			callback(new Error("Status code: " + status));
			return;
		}

		response.on("end", function finished(){
			if (callback) {
				callback(false, savePath);
			}
		});
	}).on('error', errorHandler);
}

function getRequestInstance(url) {
	if (url.protocol === 'http:') {
		return http;
	} else if (url.protocol === 'https:') {
		return https;
	}
	return http;
}

function getSavePath(url, destination) {
	var pathName = url.pathname;
	var fileName = path.basename(pathName);

	// Check if we got an absolute path or we need to construct it
	if (path.extname(destination).length > 0) {
		return destination;
	}

	return path.join(destination, fileName);
}

function writeStream(response, savePath, callback) {
	var dirPath = path.dirname(savePath);

	mkdirp(dirPath, function(error) { 
		if (error) {
			callback(error);
			return;
		}
		var resource = fs.createWriteStream(savePath)
		response.pipe(resource);
	});
}

function errorHandler(error) {
	if (callback) { 
		callback(error); 
	}
}

// ... some sh***y dude didn't put his project on github