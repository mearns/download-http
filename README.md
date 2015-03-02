# download-http 

Download HTTP(S) resources easily.

### Example
```
var downloadHTTP = require('download-http');

var url = 'http://downloads.sourceforge.net/sevenzip/7z920-x64.msi';
downloadHTTP(url, 'storage/bla.msi', function (error) {
	if (error) {
		throw error;
	}
	console.log('Success');
});
```
Supports:
- 300 redirects

## License ##
WTFPL – Do What the Fuck You Want to Public License  
See:
http://www.wtfpl.net/