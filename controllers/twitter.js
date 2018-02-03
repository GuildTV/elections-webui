import Twit from 'twit';
import { CasparCG } from "casparcg-connection";
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

const ccg = new CasparCG({
  host: config.caspar.host, 
  port: config.caspar.port,
  autoReconnectInterval: 100,
  onConnected: () => {
    console.log("Connected to CasparCG (Twitter)");

    //ensure all video layers are not visible
    config.caspar.layers.forEach(l => {
      console.log("Reset layer:", l);
      ccg.clear(config.caspar.channel, l);
    });
  }
});

function sendTweetToCaspar(data){
  ccg.createCommand("SWAP "+config.caspar.channel+"-"+config.caspar.layers[0]+" "+config.caspar.channel+"-"+config.caspar.layers[1]);
  ccg.cgClear(config.caspar.channel, config.caspar.layers[0]);

  if(!data)
    return;

  ccg.cgAdd(config.caspar.channel, config.caspar.layers[1], 0, config.caspar.filename, true, data);
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
    text: tweet.full_text
  };

  var reg = /https:\/\/t.co\/(.{10})/g;
  simple.text = simple.text.replace(reg, "");

  if(tweet.entities && tweet.entities.media && tweet.entities.media.length > 0)
    simple.img = tweet.entities.media[0].media_url+":large";

  return simple;
}

function updateList(){
  const params = { 
    screen_name: config.username,
    count: 100,
    tweet_mode: "extended"
  };
  if(latest_tweet > -1)
    params.since_id = latest_tweet;

  console.log("Scraping for tweets");
  twitter.get('statuses/user_timeline', params, (err, data) => {
    console.log("Got some tweets");
    const new_list = {};
    for(let i in data){
      if(data[i] === undefined || data[i].id === undefined)
        continue;
      const tw = resolveOriginalTweet(data[i]);
      if(tweet_list[tw.raw_id] === undefined) {
        tweet_list[tw.raw_id] = tw;
        new_list[tw.raw_id] = tw;
        if(tw.raw_id > latest_tweet)
          latest_tweet = tw.raw_id;
      }
    }

    io.emit('twitter.latest', new_list);
  });
}

// Setup update interval
updateList();
setTimeout(updateList, config.scrapeInterval);

export function bind(Models, socket, io){

  socket.on('twitter.all', function(){
    updateList();

    socket.emit('twitter.all', tweet_list);   
  });

  socket.on('twitter.refresh', function(){
    updateList();
  });

  socket.on('twitter.show', function(params){
    //send this to the tv!

    if(params.raw_id === undefined || params.id === undefined)
      return;

    const tweetData = tweet_list[params.raw_id];
    if(tweetData === undefined)
      return;

    io.emit('twitter.show', tweetData);
    sendTweetToCaspar(tweetData);

    console.log("Twitter: Show: ", params);

    //delete
    tweet_list[params.raw_id] = undefined;
  });

  socket.on('twitter.delete', function(params){
    if(params.raw_id === undefined || params.id === undefined)
      return;

    if(tweet_list[params.raw_id] === undefined)
      return;

    //delete
    tweet_list[params.raw_id] = undefined;

    io.emit('twitter.delete', params);
    console.log("Twitter: Delete: ", params);
  });

  socket.on('twitter.clear', function(params){
    //clear screen

    io.emit('twitter.clear', params);
    sendTweetToCaspar();

    console.log("Twitter: Clearing screen ");
  });

}
