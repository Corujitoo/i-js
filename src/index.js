const prompt = require('prompt-sync')();

const numero = Number(prompt('Qual é o número que você quer utilizar? '));


if (numero === 5 || numero === 10 || numero === 15) {
    console.log("Número proibido. Encerrando script...");
    process.exit();
}



let mensagem = ((numero >= 10 && numero <= 20) || numero === 25) 
    ? "Número dentro da condição" 
    : "Número fora da condição";

console.log(mensagem);


let tipoNumero = (numero % 2 === 0) ? "é par" : "é impar";

console.log(tipoNumero);