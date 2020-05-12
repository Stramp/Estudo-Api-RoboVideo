const readline = require('readline-sync')
const Parser = require('rss-parser');

const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 

function start(){
 const content = {}
 content.searchTerm = askAndReturnSearchTerm()
 content.prefix = askAndReturnPrefix()

 async function askAndReturnSearchTerm () {
    const response = readline.question('Type a Wikipedia search term or G to fetch google trends: ')

    return (response.toUpperCase() === 'G') ?  await askAndReturnTrend() : response
       
  }

  async function askAndReturnTrend() {
    console.log('Please Wait...')
    const trends = await getGoogleTrends()
    const choice = readline.keyInSelect(trends, 'Choose your trend:')
    
    return trends[choice] 

  }

  async function getGoogleTrends () {
    const parser = new Parser()
    const trends = await parser.parseURL(TREND_URL)
    return trends.items.map(({title}) => title)
  }

 function askAndReturnPrefix(){
    const prefix = ['Quem é','A historia','Fatos Sobre','Oque Fez']
    const selectedPrefix = readline.keyInSelect(prefix,`Choose an option for ${content.searchTerm}:`)
    return prefix[selectedPrefix];
 }
 console.log(content);
}

start(); 