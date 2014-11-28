var Weibo = require('../libs/node-weibo');
var setting = require('./setting.json');
var token = require('./token.json');

// init app keys
Weibo.init(setting);


var para = {
    "source": Weibo.appKey.appKey,
    "access_token": token.access_token
};

console.log(para);

Weibo.Statuses.public_timeline(para, function(data){
    console.log(data);
});