
    const catalogo = new Catalogo();
    const estoque = new Estoque();
    const carrinho = new CarrinhoDeCompras({
    catalogo: catalogo,
    estoque: estoque})

class Garrafa {
    constructor(conteudo) {
        this.conteudo = conteudo;
    }

    setConteudo(novoConteudo) {
        this.conteudo = novoConteudo;
    }

    servir () {
        console.log("Servindo" + this.conteudo)
    }
}

const garrafaDoBruno = new Garrafa("agua");
const garrafaDoPaulo = new Garrafa("vodka");

garrafaDoPaulo.conteudo = "vinho"
garrafaDoPaulo.servir()

garrafaDoPaulo.servir()
