// Declara uma constante chamada 'number' com valor 15
const number = 15;

// Verifica se o número é igual a 5, 10 ou 15
if (number === 5 || number === 10 || number === 15) {
  // Se a condição for verdadeira, imprime no console
  console.log('The number is either 5, 10, or 15');
  console.log('Exiting the program.');
};

// Função que verifica regras específicas para um número passado como argumento
function verificarNumero(num) {
    // Regra 1: Se o número for exatamente 15, retorna uma mensagem
    if (num === 15) {
        return "É igual a 15";
    }
    
    // Regra 2: Se o número for múltiplo de 5, retorna mensagem e interrompe a função
    if (num % 5 === 0) {
        return "Função interrompida, pois o número é múltiplo de 5";
    }

    // Regra 3: Se o número estiver entre 10 e 20 (exclusivo), retorna mensagem
    if (num > 10 && num < 20) {
        return "Está entre 10 e 20";
    }

    // Regra 4: Caso nenhuma das anteriores seja verdadeira, retorna esta mensagem
    return "Não está entre 10 e 20";
}

/**
 * Criação de um array chamado 'multiplos' contendo 10 números múltiplos de 3
 */
const multiplos = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];

// --- Execução de testes no terminal ---
// Teste da função verificarNumero passando 15 -> deve retornar: "É igual a 15"
console.log(verificarNumero(15));

// Teste da função verificarNumero passando 10 -> múltiplo de 5, interrompe a função
console.log(verificarNumero(10));

// Teste da função verificarNumero passando 12 -> está entre 10 e 20
console.log(verificarNumero(12));

// Teste da função verificarNumero passando 7 -> não atende nenhuma regra anterior
console.log(verificarNumero(7));

// Mostra no console o array de múltiplos de 3
console.log("Lista de múltiplos:", multiplos);
