const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    await pegarConteudoDoWiki(content);
    sanitizarConteudo(content);
    quebrarConteudoEmSentencas(content);
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
    


}

module.exports = robot