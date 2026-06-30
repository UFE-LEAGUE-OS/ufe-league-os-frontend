const https = require('https');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'src', 'data', 'bbcFootballFeed.json');

https.get('https://feeds.bbci.co.uk/sport/football/rss.xml', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(data)) !== null && items.length < 12) {
      const item = match[1];
      
      const getField = (tag) => {
        const regex = new RegExp('<' + tag + '><![CDATA\\[(.*?)\\]\\]></' + tag + '>');
        const m = item.match(regex);
        return m ? m[1] : '';
      };
      
      const getLink = () => {
        const m = item.match(/<link>(.*?)<\/link>/);
        return m ? m[1] : '';
      };
      
      const getThumb = () => {
        const m = item.match(/media:thumbnail[^>]*url="(.*?)"/);
        return m ? m[1] : '';
      };
      
      items.push({
        title: getField('title'),
        desc: getField('description'),
        link: getLink(),
        pubDate: getField('pubDate'),
        thumb: getThumb()
      });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
    console.log('Saved ' + items.length + ' items to ' + outputPath);
  });
});