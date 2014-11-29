var Weibo = require('nodeweibo');
var setting = require('./setting.json');

// init setting for the entire app
Weibo.init(setting);

module.exports = Weibo;