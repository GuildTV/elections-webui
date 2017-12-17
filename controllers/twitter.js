import Twit from 'twit';
import CasparCG from "caspar-cg";
import { twitter as config } from '../config';

const twitter = new Twit({
  consumer_key:    config.consumerKey,
  consumer_secret: config.consumerSecret,

  access_token:         config.accessToken,
  access_token_secret:  config.accessTokenSecret
});

//list of loaded tweets
const tweet_list = {};
let latest_tweet = -1;

let io = null;
export function setupIo(new_io){
  io = new_io;
}

const ccg = new CasparCG(config.caspar.host, config.caspar.port);
ccg.on("connected", function () {
  console.log("Connected to CasparCG (Twitter)");

  //ensure all video layers are not visible
  config.caspar.layers.forEach(l => {
    console.log("Reset layer:", l);
    ccg.sendCommand("CLEAR 1-" + l);
  });
});
ccg.connect();

function sendTweetToCaspar(data){
  ccg.sendCommand("CG 1-"+config.caspar.layers[0]+" SWAP 1-"+config.caspar.layers[1]);
  ccg.sendCommand("CG 1-"+config.caspar.layers[0]+" STOP 1");

  if(!data)
    return;

  //componentData id=\"id\"><data id=\"text\" value=\"welfare-ross\" /></componentData>
  const xml = builder.create('templateData', undefined, undefined, { headless: true });
  xml.ele('componentData', { id: "handle" }).ele('data', { id: "text", value: data.handle });
  xml.ele('componentData', { id: "username" }).ele('data', { id: "text", value: data.username });
  xml.ele('componentData', { id: "text" }).ele('data', { id: "text", value: data.text });
  if(data.img)
    xml.ele('componentData', { id: "img" }).ele('data', { id: "text", value: data.img });

  let xmlString = xml.end();
  xmlString = xmlString.replace(/"/g, '\\"');

  console.log(xmlString);

  ccg.sendCommand("CG 1-"+config.caspar.layers[1]+" ADD 1 \""+config.caspar.filename+"\" 1 \""+xmlString+"\"");
}

function resolveOriginalTweet(tweet){
  if(tweet === undefined || tweet.id === undefined)
    return tweet;

  const orig_id = tweet.id;
  if(tweet.retweeted_status === undefined)
    return tweet;

  tweet = tweet.retweeted_status;
  tweet.raw_id = orig_id;

  const simple = {
    raw_id: orig_id,
    id: tweet.id,
    handle: tweet.user.screen_name,
    username: tweet.user.name,
    text: tweet.text
  };

  if(tweet.entities && tweet.entities.media && tweet.entities.media.length > 0)
    simple.img = tweet.entities.media[0].media_url+":large";

  return simple;
}

function updateList(){
  const params = { 
    screen_name: config.username,
    count: 100
  };
  if(latest_tweet > -1)
    params.since_id = latest_tweet;

  console.log("Scraping for tweets");
  twitter.get('statuses/user_timeline', params, function(err, data) {
    console.log("Got some tweets");
    const new_list = [];
    for(let i in data){
      if(data[i] === undefined || data[i].id === undefined)
        continue;
      if(tweet_list[data[i].id] === undefined) {
        // io.emit('tweet.debug', data[i]);

        const tw = resolveOriginalTweet(data[i]);
        tweet_list[data[i].id] = data[i];
        new_list[data[i].id] = tw;
        if(data[i].id > latest_tweet)
          latest_tweet = data[i].id;
      }
    }

    io.emit('feed.latest', new_list);
  });
}

// Setup update interval
updateList();
setTimeout(updateList, config.scrapeInterval);

export function bind(Models, socket, io){

  socket.on('feed.latest', function(){
    updateList();
  });

  socket.on('feed.all', function(){
    const list = {};
    for(let i in tweet_list){
      list[i] = resolveOriginalTweet(tweet_list[i]);
    }
    socket.emit('feed.all', list);//TODO - resolve    
  });

  socket.on('feed.refresh', function(){
    updateList();
  });

  socket.on('tweet.use', function(params){
    //send this to the tv!

    if(params.raw_id === undefined || params.id === undefined)
      return;

    if(tweet_list[params.raw_id] === undefined)
      return;

    const tweetData = resolveOriginalTweet(tweet_list[params.raw_id]);

    io.emit('tweet.use', tweetData);
    sendTweetToCaspar(tweetData);

    console.log("Twitter: Show: ", params);

    //delete
    tweet_list[params.raw_id] = undefined;
  });

  socket.on('tweet.delete', function(params){

    if(params.raw_id === undefined || params.id === undefined)
      return;

    if(tweet_list[params.raw_id] === undefined)
      return;

    //delete
    tweet_list[params.raw_id] = undefined;

    io.emit('tweet.delete', params);
    console.log("Twitter: Delete: ", params);
  });

  socket.on('tweet.stop', function(params){
    //clear screen

    io.emit('tweet.stop', params);
    sendTweetToCaspar();

    console.log("Twitter: Clearing screen ");
  });

}
