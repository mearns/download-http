var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var urllib = require('url');
var mkdirp = require('mkdirp');
var isString = require('is-string');
var isObject = require('is-object');
var Promise = require('bluebird');

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

	var errorHandler;
	var successHandler;
	if (callback) {
		errorHandler = function (error) {
			callback(error);
		};
		successHandler = function () {
			callback(false, savePath);
		}
	}
	else {
		errorHandler = function (error) {
			throw error;
		};
		successHandler = function () {};
	}

	request.get(url, function responseHandler(response) {
		var status = response.statusCode;

		if (status === 200) {
			var writerPromise = writeStream(response, savePath, callback);
			response.on("end", function finished(){
				writerPromise
					.then(function (ostream){
						ostream.on("finish", successHandler);
						ostream.on("error", errorHandler);
					})
					.catch(errorHandler);
			});
		} else if(status > 300 && status < 400 && response.headers.location) {
			var redirectURL = response.headers.location;
			request.get(redirectURL, responseHandler).on('error', errorHandler);
		} else {
			callback(new Error("Status code: " + status));
		}
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
	var resourceName = path.basename(pathName);

	if (isObject(destination)) {
		var dir = destination.dir;
		if (!dir) {
			throw new Error("Missing require field 'dir' in destination.");
		}
		var fileName = destination.fileName || resourceName;
		return path.resolve(dir, fileName);
	}
	else if (!isString(destination)) {
		throw new Error("Invalid destination; must be a string or object.");
	}

	// Check if we got an absolute path or we need to construct it
	if (path.extname(destination).length > 0) {
		return destination;
	}

	return path.join(destination, resourceName);
}

function writeStream(response, savePath) {
	var dirPath = path.dirname(savePath);
	return new Promise(function (resolve, reject) {
		mkdirp(dirPath, function(error) {
			if (error) {
				reject(error);
				return;
			}
			var resource = fs.createWriteStream(savePath)
			response.pipe(resource);
			resolve(resource);
		});
	});
}

// ... some sh***y dude didn't put his project on github
