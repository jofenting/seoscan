# seoscan
Library to scan html file against a set of rules.

var Seoscan = require('seoscan');
var request = require('request');
var fs = require('fs');

//read from http request
request('http://www.sd-wz.com/products_detail_46.htm').pipe(new Seoscan()).pipe(process.stdout);

//file as input, file as output
fs.createReadStream('./lunchbox.htm').pipe(new Seoscan()).pipe(fs.createWriteStream('scan_result.txt'));


//chain new defined rule
fs.createReadStream('./lunchbox.htm').pipe(new Seoscan({
  rules:[
    {
      'desc': 'This HTML has <meta name="robots" />',
      'selector': 'meta[name="robots"]',
      'thres': '==0'
    }
  ]})).pipe(process.stdout);

//overwrite default rules
var scan = new Seoscan();
scan.setRule([
      {
        'desc': 'This HTML has more than 1 <h1>',
        'selector': 'h1',
        'thres': '>1'
      },
      {
        'desc': 'This HTML hs more than 15 <strong>',
        'selector': 'strong',
        'thres': '>15'
      }
  ]);
fs.createReadStream('./lunchbox.htm').pipe(scan).pipe(process.stdout);
