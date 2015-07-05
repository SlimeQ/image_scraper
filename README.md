# image_scraper

Gets google image search results for a list of words and downloads as many as possible. Metadata for each image as provided by Google is saved to a MongoDB database for later use, along with the local file path and timestamps.

# Setup

You should first have [MongoDB installed](http://docs.mongodb.org/manual/installation/) and the [MongoDB daemon](http://docs.mongodb.org/manual/reference/program/mongod/) running somewhere. The crawl may still run without a valid database connection, but metadata will not be saved.

```
git clone git@github.com:SlimeQ/image_scraper.git
cd image_scraper
npm install
```

# Configuration

Edit conf.js to point the script at your database and local image directory. 

You may also want to change the wait time between requests to suit your local network. If QoS is enabled on your router, making requests too fast might get you temporarily cut off. The Google API will also temporarily ban you if you make requests too fast. Don't be greedy.

# Usage

```
$ node scrape.js lolcat
```
```
[ 'lolcat' ]
googling...
lolcat, page 0
connected to mongodb://localhost:27017/images
https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=lolcat&rsz=8&imgsz=xxlarge&start=0 ---> SUCCESS
finished googling

downloading images...
http://freehighresolutionimages.org/images/img8/lolcats-background-1.png ---> ERR
500
https://upload.wikimedia.org/wikipedia/commons/1/1a/Cat_crying_(Lolcat).jpg ---> SUCCESS
https://c2.staticflickr.com/2/1329/793876953_7e878abcb5_b.jpg ---> SUCCESS
http://img2.wikia.nocookie.net/__cb20110628041723/human-rights-in-cyberspace/images/8/88/I_IZ_SERIUS_ADMNIM_THIZ_IZ_SERIUS_BIZNIS_lolcat.jpg ---> SUCCESS
https://upload.wikimedia.org/wikipedia/commons/f/fa/Lolcat_especially_made_for_Wikinews.jpg ---> SUCCESS
http://i.stack.imgur.com/4BnVp.jpg ---> SUCCESS
http://pre07.deviantart.net/6081/th/pre/f/2012/050/3/f/lucifero_lolcat_by_fraterorion-d4q5ol0.jpg ---> SUCCESS
http://i.huffpost.com/gen/985599/images/o-TWITTER-LOLCAT-facebook.jpg ---> SUCCESS
finished crawl!
db closed
```
If no words are given, a list of random nouns is pulled from an online generator.

