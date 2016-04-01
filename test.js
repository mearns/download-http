var rmdir = require('rimraf');
var chai = require('chai');
var expect = chai.expect;
var chaiFs = require('chai-fs');
var path = require('path');
var downloadHTTP = require('./index.js');

chai.use(chaiFs);

var normalDownloadURL = 'https://raw.githubusercontent.com/strongloop/express/master/Readme.md';
var badStatusDownloadURL = 'https://github.com/derpderpdidaderpdep';
var redirectDownloadURL = 'http://downloads.sourceforge.net/sevenzip/7z920-x64.msi';

describe('download-http', function (){

	describe('#downloadHTTP()', function (){
		this.timeout(10000);

		it('should return an error if no URL is specified', function (){
			expect(function () {
				downloadHTTP('', 'i love the internets');
			}).to.throw('URL must be specified!');
		});

		it('should return an error if no destenation is specified', function (){
			expect(function () {
				downloadHTTP(normalDownloadURL, '');
			}).to.throw('Destination must be specified!');
		});

		it('should throw an error when a URL returns a bad status code', function (done){
			downloadHTTP(badStatusDownloadURL, 'storage_test/', function (error) {
				expect(error.message).to.equal('Status code: 404');
				done();
			});
		});

		afterEach(function(done){
			rmdir('storage_test', function (error) {
				if (error) {
					throw error;
				}
				done();
			});
		});

		it('should download a file', function(done){
			downloadHTTP(normalDownloadURL, 'storage_test/', function (error) {
				expect(error).to.be.empty;
				expect(path.join('storage_test', 'Readme.md')).to.be.a.file;
				done();
			});
		});

		it('should comply with redirects', function(done){
			downloadHTTP(redirectDownloadURL, 'storage_test/wow.msi', function (error) {
				expect(error).to.be.empty;
				expect(path.join('storage_test', 'Readme.md')).to.be.a.file;
				done();
			});
		});

	});
});
