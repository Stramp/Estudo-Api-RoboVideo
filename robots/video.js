const state = require('./stats.js')

async function robot() {
    const content = state.load()

    salvaScript(content);

    console.log('entrou robo video')
}

async function salvaScript(content) {
    await state.saveScript(content)
}

module.exports = robot;