var Weibo = require('../libs/node-weibo');

var jsonParas = {
    code:"96b571d1f5e0e92dbc82f0f107620ee1",
    grant_type:"authorization_code"
};

Weibo.OAuth2.access_token(jsonParas,function(data){
    console.log(data);
});

// { access_token: '2.00TJcBpB5BbcAD48f37bbcf8mTCcrC',
//   remind_in: '157679999',
//   expires_in: 157679999,
//   uid: '1670110955' }