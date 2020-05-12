const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
const watsonKey = require('./../watsonKey.json')
const watsonLang = require('watson-developer-cloud/natural-language-understanding/v1')

const nLu = new watsonLang({
    iam_apikey:watsonKey.apikey,
    version:'2019-02-01',
    url:watsonKey.url
})


async function robot(content){
    await pegarConteudoDoWiki(content);
    sanitizarConteudo(content);
    quebrarConteudoEmSentencas(content);
    limitarSentences(content);
    await fetchKeywordsOfAllSentences(content);
    
    async function pegarConteudoDoWiki(content){
        const algorithmiaAutentificacao = algorithmia('simMDJkUo0/CNMxug9+ViwcQdoP1');
        const wikiAlgorithmia = algorithmiaAutentificacao.algo('web/WikipediaParser/0.1.2?timeout=300');
        
        const wikiResposta = await wikiAlgorithmia.pipe({
                                                            "articleName": content.searchTerm,
                                                            "lang": "pt"
                                                        });

        const wikipediaDados = wikiResposta.get();
        content.contentOriginal = wikipediaDados.content;

    }

    function sanitizarConteudo(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.contentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                  return false
                }

            return true
            })

        return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
    function quebrarConteudoEmSentencas(content) {
        content.sentences = []
        
        
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
    function limitarSentences(content){
       // console.log("AHSDuiAHSDuiAHSDuiAHSdiuASHDui"+content.sentences)
        content.sentences = content.sentences.slice(0,content.maxSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        console.log('> [text-robot] Starting to fetch keywords from Watson')
    
        for (const sentence of content.sentences) {
          console.log(`> [text-robot] Sentence: "${sentence.text}"`)
    
          sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    
          console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
        }
      }
    
    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
            nLu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {console.log("error ?")
                    reject(error)
                    return
                }
                //console.log("entrou aqui ? ",response.keywords)
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
    
            resolve(keywords)
            })
        })
      }
    


}

module.exports = robot


