const Transform = require('stream').Transform;
const util = require('util');
const assert = require('assert');
const regex = require("regex");
const _ = require('lodash');
const cheerio = require('cheerio');

function _validateRules(rules){
  let pass = true;
  if(rules != undefined && rules instanceof Array){
    rules.forEach(function(ele, index, arr) {
      ['desc', 'selector', 'thres'].forEach(function(k){
        assert(_.has(ele, k));
        assert(typeof ele[k] === 'string');
      });
      assert(/^(>|>=|==|!=|<=|<)(\d+)$/.test(ele['thres'].trim(' ')));
    });
  }
  else{
    throw new Error('Invalid format.');
  }
  return pass;
}

/* @public
 * @class
 * @param {Object} options  - an options object
 * @param {Object[]} options.rules, check out Seoscan.setRules
 */
function Seoscan(options) {

  if (!(this instanceof Seoscan)) return new Seoscan(options);

  this.options = _.defaults(options || {}, this.options);

  Transform.call(this, options);

  this.body = '';

  this.rules = [
    {
      'desc': 'There\'s at lease 1 <img> without alt attribute',
      'selector': 'img:not([alt])',
      'thres': '>0'
    },
    {
      'desc': 'There\'s at lease 1 <a> without rel attribute',
      'selector': 'a:not([rel])',
      'thres': '>0'
    },
    {
      'desc': 'This HTML has no <title> in <head>',
      'selector': 'head title',
      'thres': '==0'
    },
    {
      'desc': 'This HTML has no <meta name="descriptions" ... /> in <head>',
      'selector': 'head meta[name="descriptions"]',
      'thres': '==0'
    },
    {
      'desc': 'This HTML has no <meta name="keywords" ... /> in <head>',
      'selector': 'head meta[name="keywords"]',
      'thres': '==0'
    },
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
  ];

  if(options != undefined && _validateRules(options.rules)){
    this.rules = _.union(this.rules, options.rules);
  }

};

util.inherits(Seoscan, Transform);

Seoscan.prototype._transform = function(data, encoding, callback) {
    //buffer all data due to xml hirachy
    this.body += data;
    callback();
};

Seoscan.prototype._flush = function(callback) {

  let $ = cheerio.load(this.body);
  let resArray = [];
  this.rules.forEach(function(ele, index, arr) {
    let desc = ele['desc'];
    let selector = ele['selector'];
    let count= $(selector).length;
    let pass = eval(count + ele['thres']);
    let res = {};
    res[desc] = pass;
    res['count'] = count;
    resArray.push(res)
  });
  this.body = '';
  //Done with all the rules, flush.
  this.push(JSON.stringify(resArray)+'\n');

  callback();
};

/* @public
 * @memberof Seoscan
 * @param    {Object[]}  [rules] Array of objects defined in following format
 - desc {String} - desctiption to this rule
 - selector {String} - tag selector, follow CSS selector syntax
 - thres {String} - threshold to tag count, ex: !=0, >15
 * @example [{
    'desc': 'This HTML has no <title> in <head>',
    'selector': 'head title',
    'thres': '==0'}]
 * @returns  {undefined} no return value
*/
Seoscan.prototype.setRule = function(rules){
  if(rules != undefined && rules instanceof Array){
    //overwrite defaults
    this.rules = rules;
  }
}

module.exports = Seoscan;
