const state = require('./stats.js')
const spawn = require('child_process').spawn
const path = require('path')
const os = require('os');
const rootPath = path.resolve(__dirname, '..')

const fromRoot = relPath => path.resolve(rootPath, relPath)

async function robot() {
    const content = state.load()

    await salvaScript(content);
    await renderVideoWithAfterEffects()

    console.log('entrou robo video')
}

async function salvaScript(content) {
    await state.saveScript(content)
}

async function renderVideoWithAfterEffects() {
    return new Promise((resolve, reject) => {
      const systemPlatform=os.platform
      let aerenderFilePath = ''
      
      if (systemPlatform== 'darwin'){
          console.log('1')
          aerenderFilePath = '/Applications/Adobe After Effects CC 2019/aerender'
        }else if (systemPlatform=='win32'){
            console.log('2')
            aerenderFilePath = 'C:\\Program Files\\Adobe\\Adobe After Effects CC 2018\\Support Files\\aerender.exe'
           // aerenderFilePath = "\Arquivos de programa\Adobe\Adobe After Effects CC\Arquivos de suporte\aerender.exe"
        }else{
            console.log('3')
        return reject(new Error('System not Supported'))
      }
      
      const templateFilePath = fromRoot('./video/template-video-robo-v1.aep')
      const destinationFilePath = fromRoot('./video/output.mov')

      console.log('> [video-robot] Starting After Effects '+aerenderFilePath)

      const aerender = spawn(aerenderFilePath, [
        '-comp', 'main',
        '-project', templateFilePath,
        '-output', destinationFilePath
      ])

      aerender.stdout.on('data', (data) => {
        process.stdout.write(data)
      })

      aerender.on('close', () => {
        console.log('> [video-robot] After Effects closed')
        resolve()
      })
    })
  }

module.exports = robot;