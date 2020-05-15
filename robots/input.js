const readline = require('readline-sync')
const Parser = require('rss-parser');
const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 

const state = require('./stats.js')

async function robot(){
    const content = {}
    content.searchTerm = await askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.maxSentences = 7

    state.save(content)

    async function askAndReturnSearchTerm () {
        const response = readline.question('Escreva o termo de pesquisa ou aperte G para ver os trends do google: ')
    
        return (response.toUpperCase() === 'G') ?  await askAndReturnTrend() : response
           
    }
        async function askAndReturnTrend() {
            console.log('Please Wait...')
            const trends = await getGoogleTrends()
            const choice = readline.keyInSelect(trends, 'Escolha o tema:')
            return trends[choice]
        }
        async function getGoogleTrends() {
            const parser = new Parser()
            const trends = await parser.parseURL(TREND_URL)
            return trends.items.map(({ title }) => title)
        }


    function askAndReturnPrefix() {
        const prefix = ['Quem é', 'A historia', 'Fatos Sobre', 'Oque Fez']
        const selectedPrefix = readline.keyInSelect(prefix, `Escolha a opção para o assunto ${content.searchTerm}:`)
        return prefix[selectedPrefix];
    }
}
module.exports = robot