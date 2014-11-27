var Weibo = require('../libs/node-weibo');
var token = require('./token.json')

var para = {
    "source": Weibo.appKey.appKey,
    "access_token": token.access_token
};

console.log(para);

Weibo.Statuses.public_timeline(para, function(data){
    console.log(data);
});