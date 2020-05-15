const state = require('./stats.js');
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleKeys = require('./../googleKey.json')
const baixador = require('image-downloader')
const path = require('path')
//const os = require('os');
const rootPath = path.resolve(__dirname, '..')
var fs = require('fs')
    , gm = require('gm').subClass({ imageMagick: '+7' });;

const fromRoot = relPath => path.resolve(rootPath, relPath)

async function robot() {

    const content = state.load();
    if (!content.imgBaixadas) content.imgBaixadas = [];
    await lacoImgSentences(content);
    await baixaTodasImages(content);

    state.save(content)
    // console.log(content.sentences)

    async function lacoImgSentences(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            let query

            if (sentenceIndex === 0) {
                query = `${content.searchTerm}`
            } else {
                query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`
            }

            console.log(`[image-robot] Termo de pesquisa: "${query}"`)

            content.sentences[sentenceIndex].images = await pesquisaImg(query)
            content.sentences[sentenceIndex].googleSearchQuery = query
        }


    }
    async function pesquisaImg(query) {
        const resposta = await customSearch.cse.list({
            auth: googleKeys.apiKey,
            cx: googleKeys.searchId,
            q: query,
            searchType: 'image',
            imgSize: 'huge',
            num: 2
        });


        const arrImg = resposta.data.items.map(item => {
            return item.link
        })
        console.log('[Robot-image]=> arr LINK', arrImg)
        return arrImg
    }

    async function baixaTodasImages(content) {

        for (let index = 0; index < content.sentences.length; index++) {
            const element = content.sentences[index].images;
            for (let i = 0; i < element.length; i++) {
                const urlImg = element[i];
                try {
                    if (content.imgBaixadas.includes(urlImg)) {
                        throw new Error('Imagem duplicada')
                    }
                    await baixaImg(urlImg, "./img/"+index+"-"+ content.sentences[index].keywords[0] + "-origi.png",index);
                    content.imgBaixadas.push(urlImg)
                    console.log(index,'[Robot-image]=> Imagem Baixada com sucesso --', urlImg);
                    await converteImg(content.sentences[index].keywords[0],index)
                    console.log(index,'[Robot-image]=> Imagem Convertida e Tratada --', urlImg);
                    break
                } catch (err) {
                    console.log(`${index} [Robot-image] ERROR =>  ${err}  ${urlImg}`);
                }
            }

        }


    }

    async function baixaImg(url, destName,ind) {
        console.log(ind,'[Robot-image]=> Baixando imagem', url, destName)
        return baixador.image({ url: url, dest: destName });
    }

    async function converteImg(img,ind) {
        return new Promise((resolve, reject) => {
            console.log(ind,'[Robot-image]=> Convertendo imagem', img)
            const inputFile = fromRoot(`./img/${ind}-${img}-origi.png`)
            const outputFile = fromRoot(`./img/converted/${ind}-img-video.png`)
            const width = 1920
            const height = 1080


            gm()
                .in(inputFile)
                .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-blur', '0x9')
                .out('-resize', `${width}x${height}^`)
                .out(')')
                .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-resize', `${width}x${height}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .out('-extent', `${width}x${height}`)
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    resolve()
                })
        })


    }
}
module.exports = robot