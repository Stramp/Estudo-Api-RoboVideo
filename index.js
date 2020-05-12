const readline = require('readline-sync')
function start(){
 const content = {}
 content.searchTerm = askAndReturnSearchTerm()
 content.prefix = askAndReturnPrefix()

 function askAndReturnSearchTerm(){
     return readline.question('escolha:')
 }
 function askAndReturnPrefix(){
    const prefix = ['Quem é','A historia','Fatos Sobre','Oque Fez']
    const selectedPrefix = readline.keyInSelect(prefix)
    return prefix[selectedPrefix];
 }
 console.log(content);
}

start(); 