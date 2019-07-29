"use strict";

const express = require("express");

const bodyParser = require("body-parser");
const request = require('request');
const restService = express();
var config			= require('./config/config.json');
restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);
restService.use(bodyParser.json());






restService.get('/oauth/authorize',function(req, res){
  console.log("hitting authorize"+JSON.stringify(req.query))
	let url = `${config.authorizeEndpoint}?client_id=${config.client_id}&response_type=code&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}&prompt=consent&scope=${req.query.scope}&state=${req.query.state}&audience=https://www.abc.com/xyz`;
	console.log(url);
	res.redirect(307,url);	
});

restService.post("/token",function(req, res){
  console.log("token hitting "+ JSON.stringify(req.body))
  let tokensBody;
  let tokenUrlParams =  {
    client_id:req.body.client_id,
    grant_type:req.body.grant_type,
    redirect_uri:req.body.redirect_uri,
    code:req.body.code,
    client_secret:encodeURIComponent(config.client_secret)
  };
  console.log("token parem"+JSON.stringify(tokenUrlParams))
  request.post(config.tokenEndpoint,{body:tokenUrlParams, json:true},function(error,response,body){
    console.log('parent token status code '+response.statusCode);
    if(typeof(body)=='string'){
      tokensBody = JSON.parse(body);
      console.log("token body"+tokensBody)															
    }else{
      tokensBody = JSON.stringify(body)
      console.log("token body 1"+tokensBody)
      generateToken(req,body.refresh_token)
      .then(body=>{
        console.log("body after refresh token"+JSON.stringify(body))
      })
      .catch(err=>{
        console.log("error"+err)
      })
    }
    res.status(response.statusCode);
    res.send(tokensBody).end();
  })
	// try{
	// 	logger.consoleLog.info('body in /token');
	// 	logger.consoleLog.info(req.body);
	// 	let tokenFunc;
	// 	// condition check for generate access token or refresh token
	// 	if(req.body.code){
	// 		logger.consoleLog.info('resource tokens generating');
	// 		tokenFunc = tokenOpts.createUserSession; // function for generate access token
	// 	}else{
	// 		logger.consoleLog.info('resource tokens refreshing');
	// 		tokenFunc = tokenOpts.refreshAllTokens; // function for refresh tokens
	// 	}
	// 	req.body.client_id = process.env.CLIENT_ID.replace('\r','');
	// 	req.body.client_secret = process.env.CLIENT_SECRET.replace('\r','');
	// 	tokenFunc(req.body)
	// 	.then(function(result){
	// 		logger.consoleLog.info('token response to google');
	// 		logger.consoleLog.info(result);
	// 		res.status(result.code);
	// 		res.send(result.resp).end();
	// 	})
	// 	.catch(function(err){
	// 		//console.log('token response to google',err);
	// 		res.status(err.code);
	// 		res.send(err.resp).end();
	// 	})
	// }catch(err){
	// 	//console.log(err);
	// }
});



function generateToken(req,refresh_token){
  return new Promise(function(resolve, reject){
    let tokenUrlParams =  {
      client_id:req.body.client_id,
      grant_type:"refresh_token",					
      "refresh_token":refresh_token,
      client_secret:encodeURIComponent(config.client_secret),
      audience:encodeURIComponent("https://dev-pv99xlrf.auth0.com/api/v2/"),
      scope:encodeURIComponent("piyush")				
    };
    //let tokenUrlParams =  `client_id=${process.env.CLIENT_ID.replace('\r','')}&grant_type=refresh_token&refresh_token=${refresh_token}&client_secret=${encodeURIComponent(process.env.CLIENT_SECRET.replace('\r',''))}&audience=${encodeURIComponent(config.resourceScope[scope])}`;
    console.log(tokenUrlParams);
    //console.log(config.tokenEndpoint)
    request.post(config.tokenEndpoint,{body:tokenUrlParams,json:true},function(error,response,body){
      console.log("body of token"+JSON.stringify(body));
      if(error){
        reject(error);
      }
	    resolve(body);
    })
  })
}


restService.post("/api",function(req,res){
console.log("received a post request"+ JSON.stringify(req.body));
if(!req.body) return res.sendStatus(400);
res.setHeader('Content-Type','application/json');
let responseObj= null;
if(req.body.queryResult.intent.displayName == "Default Welcome Intent"){
  let responseObj={"payload": {
    "google": {
      "expectUserResponse": true,
      "systemIntent": {
        "intent": "actions.intent.SIGN_IN",
        "data": {
          "@type": "type.googleapis.com/google.actions.v2.SignInValueSpec"
        }
      }
    }
  }
}
//   responseObj={
//   "payload": {
//     "google": {
//       "expectUserResponse": true,
//       "richResponse": {
//         "items": [
//           {
//             "simpleResponse": {
//               "textToSpeech": "Hi I am Piyush!"
//             }
//           }
//         ]
//       }
//     }
//   }
// }
	//{"payload": {
//     "google": {
//       "expectUserResponse": true,
//       "systemIntent": {
//         "intent": "actions.intent.PERMISSION",
//         "data": {
//           "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
//           "optContext": "I can send you alerts. Would you like that?",
//           "permissions": [
//             "NAME",
//             "DEVICE_PRECISE_LOCATION",
//           ]
//         }
//       }
//     }
//   }
  
// }

//return res.json(responseObj);
}else if(req.body.queryResult.intent.displayName == "logout"){
  console.log("inside log out intent")
  let abc={
  "payload": {
    "google": {
      "expectUserResponse": true,
      "richResponse": {
        "items": [
          {
            "simpleResponse": {
              "textToSpeech": "Goodbye!"
            }
          }
        ]
      }
    }
  }
}

  // "fulfillmentMessages": 
  // [
  //   {"text": {
  //       "text": [
  //          "I am sorry you feel this way, let me transfer you to a real      person!"
  //               ]
  //   }},
  //   { "platform": "TELEPHONY",
  //     "telephonySynthesizeSpeech": {
  //       "text": "I am sorry you feel this way, let me transfer you to a   real person!"}
  //   },
  //   {
  //     "platform": "TELEPHONY",
  //     "telephonyTransferCall": {
  //       "phoneNumber": "<<ADD_THE_PHONE_NUMBER_HERE>>"
  //     }
  //   },]});







  // console.log("response is "+ JSON.stringify(res))
  // console.log("response"+ JSON.stringify(res.status))
  res.statusCode="401"
 res.status(401);
  return res.json(abc);
  
} else if (req.body.queryResult.intent.displayName == "permission") {
  console.log("inside permission"+ JSON.stringify(req.body))
  responseObj = {
    "payload": {
      "google": {
        "expectUserResponse": true,
        "richResponse": {
          "items": [
            {
              "simpleResponse": {
                "textToSpeech": "Thank You! How can i help you ?"
              }
            }
          ]
        }
      }
    }
  }
  console.log("response data " + JSON.stringify(responseObj));
return res.json(responseObj);
}
else if(req.body.queryResult.intent.displayName == "map") {
  console.log("**inside map**" + JSON.stringify(req.body))
  console.log("%%url%%"+`https://maps.googleapis.com/maps/api/staticmap?center=${req.body.queryResult.parameters.address}&zoom=16&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyAWsvXenHXLG_RnVuzls5ZSWVu4InJYYn0`)
  let address = req.body.queryResult.parameters.address.split(" ").join("+")
  coordinate(address)
  .then(body=>{
    let lat= body.results[0].geometry.location.lat;
    let long= body.results[0].geometry.location.lng;
    console.log("**lat is **" + lat)
    console.log("long is "+ long)
    responseObj={
      "payload": {
        "google": {
          "expectUserResponse": true,
          "richResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": "This is a Basic Card:"
                }
              },
              {
                "basicCard": {
                  "title": `${req.body.queryResult.parameters.address}`,
                  "image": {
                    "url": `https://maps.googleapis.com/maps/api/staticmap?center=${address}&zoom=15&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyAWsvXenHXLG_RnVuzls5ZSWVu4InJYYn0`,
                    "accessibilityText": "Google Map"
                  },
                  "buttons": [
                    {
                      "title": "Map",
                      "openUrlAction": {
                        "url": "https://www.google.com/maps?q="+req.body.queryResult.parameters.address
                      }
                    }
                  ],
                  "imageDisplayOptions": "WHITE"
                }
              }
            ]
          }
        }
      }
    }
    console.log("response data " + JSON.stringify(responseObj));
return res.json(responseObj);
  })
  .catch(err=>{
    console.log("erro from catch" + JSON.stringify(err))
  })
  
}
});


function coordinate(address) {
  let options = {
    method : "GET",
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAWsvXenHXLG_RnVuzls5ZSWVu4InJYYn0`,
    headers: {
        'Content-Type': 'application/json',
        'Accept':'application/json'
    },
    json : true
};
  return new Promise((resolve, reject) =>{
    request(options, function (err, response, body) {
        console.log('API RESP ', options.url, JSON.stringify(body));
        if (err){
            //console.log("error in api service")
            reject(err);
        } else {
            resolve(body);
        }
    });
});
}

restService.listen(process.env.PORT || 4000, function() {
  console.log("Server up and listening");
});
