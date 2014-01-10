var fs = require('fs');	
var cobs = require('..');

Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}

function test (buf) {
	console.log(buf);
	console.log(cobs.encode(buf))
	console.log(cobs.decode(cobs.encode(buf)))
	console.log('')
}
test(new Buffer([0x00]))
test(new Buffer([0x11, 0x22, 0x00, 0x33]))
test(new Buffer([0x11, 0x00, 0x00, 0x00]))
test(new Buffer(Array.range(1, 255)))