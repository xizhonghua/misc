var Weibo = require('../libs/node-weibo');

var para = {
    "source": Weibo.appKey.appKey,
    "access_token": '2.00TJcBpB5BbcAD48f37bbcf8mTCcrC'
};

console.log(para);

Weibo.Statuses.public_timeline(para, function(data){
    console.log(data);
});