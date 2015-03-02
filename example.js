var downloadHTTP = require('./index.js');

//var url = 'https://raw.githubusercontent.com/strongloop/express/master/Readme.md';
var url = 'http://downloads.sourceforge.net/sevenzip/7z920-x64.msi';
downloadHTTP(url, 'storage/bla.msi', function(error) {
	if (error) {
		throw error;
	}
	console.log('Success');
});