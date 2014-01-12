var stream = require('stream');
var splitStream = require('split');

function encode (buf, zeroFrame) {
  var dest = [0];
  var code_ptr = 0;
  var code = 0x01;

  if (zeroFrame) {
    dest.push(0x00);
    code_ptr++;
  }

  function finish (incllast) {
    dest[code_ptr] = code;
    code_ptr = dest.length;
    incllast !== false && dest.push(0x00);
    code = 0x01;
  }

  for (var i = 0; i < buf.length; i++) {
    if (buf[i] == 0) {
      finish();
    } else {
      dest.push(buf[i]);
      code += 1;
      if (code == 0xFF) {
        finish();
      }
    }
  }
  finish(false);

  if (zeroFrame) {
    dest.push(0x00);
  }

  return new Buffer(dest);
}


function decode (buf)
{
  var dest = [];
  for (var i = 0; i < buf.length; ) {
    var code = buf[i++];
    for (var j = 1; j < code; j++) {
      dest.push(buf[i++]);
    }
    if (code < 0xFF && i < buf.length) {
      dest.push(0);
    }
  }
  return new Buffer(dest)
}

function encodeStream () {
	var cobs = new stream.Duplex();
	cobs.on('pipe', function (stream) {
		stream.on('end', this.emit.bind(this, 'end'));
	})
	cobs._read = function (size) {
	};
	cobs._write = function (chunk, encoding, callback) {
		chunk = encode(chunk, true)
		this.push(chunk);
		callback(null);
	};
	return cobs;
}

function decodeStream () {
  var splitter = splitStream(/\0+/);

	var cobs = new stream.Duplex();
	cobs.on('pipe', function (stream) {
		stream.on('end', this.emit.bind(this, 'end'));
	})
	cobs._read = function (size) {
	};
  splitter.on('data', function (chunk) {
    var newchunk = decode(Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk))
    cobs.push(newchunk);
  })
	cobs._write = function (chunk, encoding, callback) {
    splitter.write(chunk, encoding);
    callback(null);
	};
	return cobs;
}

module.exports = {
	encode: encode,
	decode: decode,
	encodeStream: encodeStream,
	decodeStream: decodeStream
}

// tests
// function test (buf) {
// 	console.log(buf);
// 	console.log(stuff(buf))
// 	console.log(unstuff(stuff(buf)))
// 	console.log('')
// }
// test(new Buffer([0x00]))
// test(new Buffer([0x11, 0x22, 0x00, 0x33]))
// test(new Buffer([0x11, 0x00, 0x00, 0x00]))
// test(new Buffer(Array.range(1, 255)))

// var fs = require('fs');	
// var buf = '';
// fs.createReadStream('./index.js').pipe(encodeStream()).pipe(decodeStream()).on('data', function (data) {
// 	// console.error(String(data));
// 	buf += String(data);
// }).on('end', function () {
// 	console.log('Success:', fs.readFileSync('./index.js', 'utf-8') == buf);
// })