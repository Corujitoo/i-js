const prompt = require('prompt-sync')();

const numero = Number(prompt('Qual é o número que você quer utilizar? '));

let mensagem;

if ((numero >= 10 && numero <= 20) || numero === 25) {
    mensagem = "Número dentro da condição";
} else {
    mensagem = "Número fora da condição";
}
console.log(mensagem);


const is_even = (numero % 2 === 0);

if (is_even) {
    mensagem = "é par";
} else {
    mensagem = "é impar";
}

console.log(mensagem);