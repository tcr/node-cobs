# Consistent Overhead Byte Stuffing

```npm install cobs```

See <http://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing>

## API

```
cobs.encode(buffer) => buffer
cobs.decode(buffer) => buffer
cobs.encodeStream()
cobs.decodeStream()
cobs.maxLength(buffer or number) => number // upper bound
```

Results:

```
cobs.encode(new Buffer([0x00])) => 0x01 0x01
cobs.encode(new Buffer([0x11 0x22 0x00 0x33])) => 0x03 0x11 0x22 0x02 0x33
cobs.encode(new Buffer([0x11 0x00 0x00 0x00])) => 0x02 0x11 0x01 0x01 0x01
cobs.encode(new Buffer([0x01 0x02 ... 0xFF])) => 0xFF 0x01 0x02 ... 0xFE 0x02 0xFF
```