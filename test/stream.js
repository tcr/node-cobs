var fs = require('fs');	
var cobs = require('..');

var buf = '';
fs.createReadStream(__dirname + '/../index.js').pipe(cobs.encodeStream()).pipe(cobs.decodeStream()).on('data', function (data) {
	// console.error(String(data));
	buf += String(data);
}).on('end', function () {
	console.log('Success:', fs.readFileSync(__dirname + '/../index.js', 'utf-8') == buf);
})