var stream = require('stream');

function encode(buf, zeroFrame) {
  const dest = [0];
  let code_ptr = 0;
  let code = 0x01;


  function finish(incllast) {
    dest[code_ptr] = code;
    code_ptr = dest.length;
    incllast !== false && dest.push(0x00);
    code = 0x01;
  }

  for (let i = 0; i < buf.length; i++) {
    if (code === 0xFF) {
      i--;
      finish();
    } else if (buf[i] === 0x00) {
      finish();
    } else {
      dest.push(buf[i]);
      code++;
    }
  }
  dest[code_ptr] = code;

  if (zeroFrame) {
    dest.push(0x00);
  }

  return Buffer.from(dest);
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

function clonebuffer (buf) {
  return Buffer.concat([buf, new Buffer([])])
}

function splitter (next) {
  var bufs = [];
  return function (buf, encoding) {
    buf = Buffer.isBuffer(buf) ? buf : new Buffer(buf, encoding);
    for (var i = 0; i < buf.length; i++) {
      if (buf[i] == 0) {
        if (bufs.length) {
          next(clonebuffer(Buffer.concat(bufs)));
          bufs = [];
        }
      } else {
        for (var j = i; j < buf.length; j++) {
          if (buf[j] == 0) {
            break;
          }
        }
        bufs.push(clonebuffer(buf.slice(i, j)))
        i = j - 1;
      }
    }
  };
}

function decodeStream () {
  var cobs = new stream.Duplex();
  cobs.on('pipe', function (stream) {
    stream.on('end', this.emit.bind(this, 'end'));
  })
  cobs._read = function (size) {
  };
  var pushsplit = splitter(function (chunk) {
    var newchunk = decode(chunk)
    cobs.push(newchunk);
  })
  cobs._write = function (chunk, encoding, callback) {
    pushsplit(chunk, encoding);
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
//  console.log(buf);
//  console.log(stuff(buf))
//  console.log(unstuff(stuff(buf)))
//  console.log('')
// }
// test(new Buffer([0x00]))
// test(new Buffer([0x11, 0x22, 0x00, 0x33]))
// test(new Buffer([0x11, 0x00, 0x00, 0x00]))
// test(new Buffer(Array.range(1, 255)))

// var fs = require('fs');  
// var buf = '';
// fs.createReadStream('./index.js').pipe(encodeStream()).pipe(decodeStream()).on('data', function (data) {
//  // console.error(String(data));
//  buf += String(data);
// }).on('end', function () {
//  console.log('Success:', fs.readFileSync('./index.js', 'utf-8') == buf);
// })