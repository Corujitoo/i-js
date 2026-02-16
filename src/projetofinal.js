// ==========================================
// DESAFIO FINAL 01
// Tema: Mini-sistema de Loja + Caixa + Estoque
// ==========================================

// Objetivo
// Você vai construir um sistema completo (em memória, sem banco de dados) que:
// - mantém um catálogo de produtos e um estoque
// - cria carrinhos de compra, valida quantidades e calcula totais
// - aplica regras de preço (promoções/cupões) com prioridades e restrições
// - calcula impostos (IVA) por categoria
// - finaliza pedidos e imprime um cupom fiscal detalhado
// - gera relatórios simples de vendas

// Regras gerais
// - Não use bibliotecas externas.
// - Use apenas JavaScript (Node.js).
// - Não apague as assinaturas (nomes/params) dos métodos marcados como TODO.
// - Use estruturas de dados adequadas (Map/Array/Object).
// - Todas as validações devem lançar Error com mensagens claras.

// Como usar
// - Complete os TODOs.
// - Ao final, descomente a chamada de runDemo() no fim do arquivo.
// - O demo executa cenários que devem passar.

// ==========================================
// PARTE 0 - Dados e utilitários
// ==========================================

const CATEGORIAS = [
    "eletrodoméstico",
    "decoração",
    "materiais de construção",
    "vestuário",
    "alimentos"
];

const IVA_POR_CATEGORIA = {
    "eletrodoméstico": 0.23,
    "decoração": 0.23,
    "materiais de construção": 0.23,
    "vestuário": 0.23,
    "alimentos": 0.06
};

function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatBRL(value) {
    // Evite Intl se quiser praticar manualmente.
    return `R$ ${round2(value).toFixed(2)}`.replace(".", ",");
}

function assertPositiveNumber(value, label) {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} deve ser um número positivo.`);
    }
}

function assertNonNegativeInt(value, label) {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${label} deve ser um inteiro >= 0.`);
  0;
    }
}

function assertCategoriaValida(categoria) {
    if (!CATEGORIAS.includes(categoria)) {
        throw new Error(`Categoria inválida: ${categoria}. Aceitas: ${CATEGORIAS.join(", ")}`);
    }
}

// ==========================================
// PARTE 1 - Modelos principais (classes)
// ==========================================

// 1) Crie a classe Produto
// Requisitos mínimos:
// - sku (string) único
// - nome (string)
// - preco (number > 0)
// - fabricante (string)
// - categoria (deve estar em CATEGORIAS)
// - numeroMaximoParcelas (int 1..24)
// Métodos:
// - getValorDeParcela(numeroDeParcelas) => number
//   - deve validar: numeroDeParcelas int >=1 e <= numeroMaximoParcelas
//   - retorna preco / numeroDeParcelas (2 casas)

class Produto {
    constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {
        this.sku = sku;
        this.nome = nome;
        this.preco = preco;
        this.fabricante = fabricante;
        this.categoria = categoria;
        this.numeroMaximoParcelas = numeroMaximoParcelas;
    }

    getValorDeParcela(numeroDeParcelas) {
        assertPositiveNumber(this.preco, "Preço do produto");
        assertPositiveNumber(numeroDeParcelas, "Número de parcelas");
        if (numeroDeParcelas > this.numeroMaximoParcelas) {
            throw new Error(`Número de parcelas excede o máximo permitido (${this.numeroMaximoParcelas}).`);
        }

        return round2(this.preco / numeroDeParcelas);
    }
}

// 2) Crie a classe Cliente
// Requisitos:
// - id (string)
// - nome (string)
// - tipo: "REGULAR" | "VIP"
// - saldoPontos (int >= 0)
// Métodos:
// - adicionarPontos(pontos)
// - resgatarPontos(pontos) => diminui saldo, valida

class Cliente {
    constructor({ id, nome, tipo = "REGULAR", saldoPontos = 0 }) {
        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.saldoPontos = saldoPontos;
    }

    adicionarPontos(pontos) {
        assertNonNegativeInt(pontos, "Pontos a serem adicionados");
        this.saldoPontos += pontos;


    }



    resgatarPontos(pontos) {
        assertNonNegativeInt(pontos, "Pontos a serem resgatados");
        if (pontos > this.saldoPontos) {
            throw new Error("Saldo insuficiente de pontos.");
        }
        this.saldoPontos -= pontos;
    }
}

// 3) Crie a classe ItemCarrinho
// Requisitos:
// - sku (string)
// - quantidade (int >= 1)
// - precoUnitario (number > 0) *congelado no momento de adicionar*
// Observação: o carrinho usa precoUnitario do momento (para simular mudança de preço no catálogo).

class ItemCarrinho {
    constructor({ sku, quantidade, precoUnitario }) {
        this.sku = sku;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    getTotal() {
        return round2(this.precoUnitario * this.quantidade);
    }
}

// 4) Crie a classe Estoque
// Use Map para guardar { sku -> quantidade }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - definirQuantidade(sku, quantidade)
// - adicionar(sku, quantidade)
// - remover(sku, quantidade)
// - getQuantidade(sku)
// - garantirDisponibilidade(sku, quantidade)

class Estoque {
    constructor() {
        this.estoque = new Map([]);
    }

    definirQuantidade(sku, quantidade) {
        assertNonNegativeInt(quantidade, "Quantidade a ser definida");
        this.estoque.set(sku, quantidade);
    }

    adicionar(sku, quantidade) {
        assertNonNegativeInt(quantidade, "Quantidade a ser adicionada");
        const quantidadeAtual = this.getQuantidade(sku);
        this.definirQuantidade(sku, quantidadeAtual + quantidade);
    }

    remover(sku, quantidade) {
        this.garantirDisponibilidade(sku, quantidade);
        const estoqueAtual = this.getQuantidade(sku);
        const novoEstoque = estoqueAtual - quantidade;
        this.estoque.set(sku, novoEstoque); // Atualiza o valor no Map
        console.log(`Removido ${quantidade} do SKU ${sku}. Saldo atual: ${novoEstoque}`);
    }

    getQuantidade(sku) {
        return this.estoque.get(sku) || 0;
    }

    garantirDisponibilidade(sku, quantidade) {
        const estoqueAtual = this.getQuantidade(sku);
        if (estoqueAtual < quantidade) {
            throw new Error(`Estoque Insuficiente para o SKU: ${sku}. Disponivel: ${estoqueAtual}, Solicitado: ${quantidade}`);

        }

    }
}

// 5) Crie a classe Catalogo
// Use Map para guardar { sku -> Produto }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - adicionarProduto(produto)
// - getProduto(sku)
// - listarPorCategoria(categoria)
// - atualizarPreco(sku, novoPreco)

class Catalogo {
    constructor() {
        this.produtos = new Map([])
    }

    adicionarProduto(produto) {
        this.produtos.set(produto.sku, produto);
    }

    getProduto(sku) {
        return this.produtos.get(sku)
    }

    listarPorCategoria(categoria) {
        return Array.from(this.produtos.values()).filter(p => p.categoria === categoria);
    }

    atualizarPreco(sku, novoPreco) {
        const produto = this.getProduto(sku);
        if (produto) produto.preco = novoPreco;
    }
}




// 6) Crie a classe CarrinhoDeCompras
// Responsabilidades:
// - adicionar itens (validando estoque)
// - remover itens
// - alterar quantidade
// - calcular subtotal
// - consolidar itens por sku (sem duplicatas)
// Sugestão: use Map sku -> ItemCarrinho
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map



class CarrinhoDeCompras {
    constructor({ catalogo, estoque }) {
        this.catalogo = catalogo; // Catalogo
        this.estoque = estoque; // Estoque
        this.carrinho = new Map(); //Map {"<sku>": <quantidade>} // {"sku1": 3, "sku2": 5}
    }

    // adicionarItem("sku existente e presente no carrinho", 5)
    adicionarItem(sku, quantidade) { // sku: "sku2" quantidade: 3
        // Verificar se o sku existe no estoque
        const quantidadeEmEstoque = this.estoque.getQuantidade(sku);

        if (quantidade > quantidadeEmEstoque) {
            // Caso não exista retornar erro
            throw new Error("Quantidade solicitada maior que a quantidade disponível em estoque!")
        }

        // Daqui em diante, quantidade é menor ou igual a quantidadeEmEstoque

        // Verificar se sku existe em this.carrinho
        const existeNoCarrinho = this.carrinho.has(sku);

        let novoValorDoSku = 0;
        // Caso exista incrementar valor atual
        if (existeNoCarrinho) {
            console.log("O item se encontra no carrinho! Incrementando quantidade!")
            const valorAtualDoSku = this.carrinho.get(sku); // 5
            novoValorDoSku = valorAtualDoSku + quantidade;
            // Caso não exista Adicionar sku ao this.carrinho e atribuir quantidade
        } else {
            console.log("O item não se encontra no carrinho! Criando e atribuindo quantidade!")
            novoValorDoSku = quantidade;
        }

        this.carrinho.set(sku, novoValorDoSku);
        this.estoque.remover(sku, quantidade);
    }

    removerItem(sku) {
        if (!this.carrinho.has(sku)) {
            throw new Error("Item não encontrado no carrinho!");
        }
        const quantidade = this.carrinho.get(sku);
        this.carrinho.delete(sku);
        this.estoque.adicionar(sku, quantidade);
    }

    alterarQuantidade(sku, novaQuantidade) {
        if (!this.carrinho.has(sku)) {
            throw new Error("Item não encontrado no carrinho!");
        }
        const quantidadeAtual = this.carrinho.get(sku);
        const diferenca = novaQuantidade - quantidadeAtual;

        if (diferenca > 0) {
            // isso aumenta a quantidade
            this.adicionarItem(sku, diferenca);
        } else if (diferenca < 0) {
            // isso diminui a quantidade
            this.removerItem(sku, -diferenca);
        }

    }

    listarItens() {
        const listaParaMotor= [];
        for (const [sku, quantidade] of this.carrinho.entries()) {
            const produtoOriginal = this.catalogo.getProduto(sku);
            if (produtoOriginal) {
                listaParaMotor.push(new ItemCarrinho({
                    sku: sku,
                    quantidade: quantidade,
                    precoUnitario: produtoOriginal.preco
                }));
            }
        }
        return listaParaMotor;
    }

    getSubtotal() {
        let subtotal = 0;
        for (const [sku, quantidade] of this.carrinho.entries()) {
            const produto = this.catalogo.getProduto(sku);
            if (produto) {
                subtotal += produto.preco * quantidade;
            }
        }
        return round2(subtotal);
    }
}


// ==========================================
// PARTE 2 - Regras de preço (promoções)
// ==========================================

// Você implementará um motor de preços com as regras abaixo.
// Você deve conseguir produzir um “breakdown” (quebra) do total:
// - subtotal
// - descontos (lista com nome + valor)
// - base de imposto
// - imposto total
// - frete
// - total final

// Estrutura sugerida do breakdown (objeto):
// {
//   subtotal,
//   descontos: [{ codigo, descricao, valor }],
//   totalDescontos,
//   impostoPorCategoria: { [categoria]: valor },
//   totalImpostos,
//   frete,
//   total
// }

// 7) Regras obrigatórias (todas devem existir e ser testáveis):
// R1 - Desconto VIP:
// - Se cliente.tipo === "VIP", aplica 5% no subtotal (apenas uma vez).
// - Não pode ser aplicado se existir cupom "SEM-VIP".
//
// R2 - Cupom:
// - Cupom "ETIC10" => 10% no subtotal
// - Cupom "FRETEGRATIS" => frete zerado
// - Cupom "SEM-VIP" => bloqueia R1
// - Cupom inválido deve lançar Error
//
// R3 - Leve 3 pague 2 (vestuário):
// - Para produtos da categoria "vestuário": a cada 3 unidades (somando SKUs diferentes),
//   a unidade mais barata dentre as 3 sai grátis.
// - Ex: 3 camisetas (10), 1 calça (50), 1 meia (5) => total unidades=5 => aplica 1 grátis
//   (a mais barata dentro do grupo de 3) e sobram 2 sem promo.
//
// R4 - Desconto por valor:
// - Se subtotal >= 500, aplica desconto fixo de 30.
//
// Observação de dificuldade:
// - Você precisa decidir ordem de aplicação e documentar.
// - Você precisa impedir descontos maiores que o subtotal.
// - Deve ser determinístico.

// 8) Crie uma classe MotorDePrecos
// Método principal:
// - calcular({ cliente, itens, cupomCodigo }) => breakdown
// Onde itens é o resultado de carrinho.listarItens()

class MotorDePrecos {
    constructor({ catalogo }) {
        this.catalogo = catalogo;
    }

    calcular({ cliente, itens, cupomCodigo }) {
        // 1. Calcular Subtotal
        let subtotal = 0;
        for (const item of itens) {
            subtotal += item.precoUnitario * item.quantidade;
        };

        const descontos = [];
        let frete = subtotal > 0 ? 15.00 : 0; // Frete padrão

        // 2. R2 - Regras de Cupom
        if (cupomCodigo === "ETIC10") {
            descontos.push({ codigo: "ETIC10", descricao: "Cupom 10%", valor: round2(subtotal * 0.1) });
        } else if (cupomCodigo === "FRETEGRATIS") {
            frete = 0;
        } else if (cupomCodigo && cupomCodigo !== "null" && cupomCodigo !== "SEM-VIP") {
            throw new Error("Cupom inválido");
        }

        // 3. R1 - Desconto VIP (5%)
        if (cliente.tipo === "VIP" && cupomCodigo !== "SEM-VIP") {
            descontos.push({ codigo: "VIP", descricao: "Desconto Cliente VIP", valor: round2(subtotal * 0.05) });
        }

        // 4. R4 - Desconto por valor (Subtotal >= 500)
        if (subtotal >= 500) {
            descontos.push({ codigo: "VALOR500", descricao: "Desconto fixo > 500", valor: 30.00 });
        }

        const totalDescontos = descontos.reduce((acc, d) => acc + d.valor, 0);

        // 5. Cálculo de Impostos (IVA)
        const impostoPorCategoria = {};
        let totalImpostos = 0;

        itens.forEach(item => {
            const produto = this.catalogo.getProduto(item.sku);
            const taxa = IVA_POR_CATEGORIA[produto.categoria] || 0;
            const valorImposto = round2(item.getTotal() * taxa);

            impostoPorCategoria[produto.categoria] = round2((impostoPorCategoria[produto.categoria] || 0) + valorImposto);
            totalImpostos += valorImposto;
        });

        // 6. Total Final
        const total = round2(subtotal - totalDescontos + frete);

        return {
            subtotal: round2(subtotal),
            descontos,
            totalDescontos: round2(totalDescontos),
            impostoPorCategoria,
            totalImpostos: round2(totalImpostos),
            frete,
            total: total < 0 ? 0 : total
        };
    }
}

// ==========================================
// PARTE 3 - Checkout / Pedido / Cupom
// ==========================================

// 9) Crie a classe Pedido
// Requisitos:
// - id (string)
// - clienteId
// - itens (array)
// - breakdown (objeto)
// - status: "ABERTO" | "PAGO" | "CANCELADO"
// - createdAt (Date)
// Métodos:
// - pagar()
// - cancelar()

class Pedido {
    constructor({ id, clienteId, itens, breakdown, cupomCodigo }) {
        this.id = id;
        this.clienteId = clienteId;
        this.itens = itens;
        this.breakdown = breakdown;
        this.cupomCodigo = cupomCodigo;
        this.status = "ABERTO";
        this.createdAt = new Date();
        }


    pagar() {
        if (this.status !== "ABERTO") {
            throw new Error(`Pedido não pode ser pago. Status atual: ${this.status}`);
        }
        this.status = "PAGO";

    }


    cancelar() {
        if (this.status !== "ABERTO") {
            throw new Error(`Pedido não pode ser cancelado. Status atual: ${this.status}`);
        }
        this.status = "CANCELADO";
    }
}


// 10) Crie a classe CaixaRegistradora
// Responsabilidades:
// - receber (catalogo, estoque, motorDePrecos)
// - fecharCompra({ cliente, carrinho, cupomCodigo, numeroDeParcelas }) => Pedido
// Regras:
// - Ao fechar compra, deve remover do estoque as quantidades compradas
// - Se numeroDeParcelas for informado, deve validar com base no Produto (máximo permitido)
// - Deve somar parcelas por item e imprimir um resumo no cupom (opcional, mas recomendado)

class CaixaRegistradora {
    constructor({ catalogo, estoque, motorDePrecos }) {
        this.catalogo = catalogo;
        this.estoque = estoque;
        this.motorDePrecos = motorDePrecos;
    }
    fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
        const itens = carrinho.listarItens();
        const breakdown = this.motorDePrecos.calcular({ cliente, itens, cupomCodigo });
        const pedido = new Pedido({
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36),
            clienteId: cliente.id,
            itens,
            breakdown,
            cupomCodigo: cupomCodigo
        });

        return pedido;
    }
}

// 11) Crie a classe CupomFiscal
// Deve gerar texto em linhas (array de strings) contendo:
// - cabeçalho
// - itens: sku, quantidade, preço unitário, total do item
// - subtotal, descontos (linha por desconto), impostos (por categoria), frete, total
// - status do pedido

class CupomFiscal {
    constructor({ pedido, catalogo }) {
        this.pedido = pedido;
        this.catalogo = catalogo;
    }

    gerarLinhas() {
        const linhas = [];
        linhas.push("===== CUPOM FISCAL =====");
        linhas.push(`Pedido ID: ${this.pedido.id}`);
        linhas.push(`Cliente: ${this.pedido.clienteId}`);
        linhas.push("-----------------------");
        linhas.push("Itens:");

        this.pedido.itens.forEach(item => {
            const sub = item.precoUnitario * item.quantidade;
            linhas.push(`${item.sku.padEnd(10)} x${item.quantidade}  ${formatBRL(sub)}`);
        });

        const b = this.pedido.breakdown;
        linhas.push("-----------------------");
        linhas.push(`Subtotal:      ${formatBRL(b.subtotal)}`);
        
        const infoCupom = this.pedido.cupomCodigo ? ` (${this.pedido.cupomCodigo})` : "";
        linhas.push(`Descontos${infoCupom}:    -${formatBRL(b.totalDescontos)}`);
        linhas.push(`Impostos:      ${formatBRL(b.totalImpostos)}`);
        linhas.push(`Frete:         ${formatBRL(b.frete)}`);
        linhas.push(`TOTAL:         ${formatBRL(b.total)}`);
        linhas.push("=======================");
        
        return linhas;
    } 
}

class Impressora {
 static imprimirLinhas(linhas) {
        if (!linhas || !Array.isArray(linhas)) {
            console.log("Erro: Nenhuma linha para imprimir.");
            return;
        }
        linhas.forEach(linha => console.log(linha));
    }
}

// ==========================================
// PARTE 4 - Relatórios (estruturas de dados + loops)
// ==========================================

// 12) Crie a classe RelatorioVendas
// - Deve armazenar pedidos pagos
// - Deve gerar:
//   - totalArrecadado()
//   - totalImpostos()
//   - totalDescontos()
//   - rankingProdutosPorQuantidade(topN)
//   - arrecadadoPorCategoria()
// Sugestão: use Map para acumular por sku/categoria.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class RelatorioVendas {
    constructor() {
        this.pedidos = [];
        this.catalogo = null;
    }

    registrarPedido(pedido) {
        if (pedido.status !== "PAGO") {
            throw new Error("Apenas pedidos pagos podem ser registrados no relatório.");
        }
        this.pedidos.push(pedido);
    }

    totalArrecadado() {
        let total = 0;
        for (const pedido of this.pedidos) {
            total += pedido.breakdown.total;
        }
        return round2(total);
    }

    totalImpostos() {
        let total = 0;
        for (const pedido of this.pedidos) {
            total += pedido.breakdown.totalImpostos;
        }
        return round2(total);
    }

    totalDescontos() {
        let total = 0;
        for (const pedido of this.pedidos) {
            total += pedido.breakdown.totalDescontos;
        }
        return round2(total);
    }

    rankingProdutosPorQuantidade(topN = 5) {
        const acumuladoPorSku = new Map();

        for (const pedido of this.pedidos) {
            for (const item of pedido.itens) {
                const quantidadeAtual = acumuladoPorSku.get(item.sku) || 0;
                acumuladoPorSku.set(item.sku, quantidadeAtual + item.quantidade);
            }
        }
        return acumuladoPorSku;
    }

    arrecadadoPorCategoria() {
      const acumuladoPorCategoria = new Map();
        
        
        if (!this.catalogo) {
            console.error("Erro: O relatório não possui um catálogo associado.");
            return acumuladoPorCategoria;
        }

        for (const pedido of this.pedidos) {
            for (const item of pedido.itens) {
                const produto = this.catalogo.getProduto(item.sku);
                if (produto) {
                    const categoria = produto.categoria;
                    const valorAtual = acumuladoPorCategoria.get(categoria) || 0;
                   const subtotalItem = item.precoUnitario * item.quantidade;
                    acumuladoPorCategoria.set(categoria, valorAtual + subtotalItem);
                }
            }
        }
        return acumuladoPorCategoria;
    }
}

// ==========================================
// DADOS DE TESTE (para o demo)
// ==========================================

function seedCatalogoEEstoque() {
    const catalogo = new Catalogo();
    const estoque = new Estoque();

    const produtos = [
        // alimentos
        { sku: "ARROZ", nome: "Arroz 1kg", preco: 6.0, fabricante: "Marca A", categoria: "alimentos", numeroMaximoParcelas: 1 },
        { sku: "FEIJAO", nome: "Feijão 1kg", preco: 7.5, fabricante: "Marca B", categoria: "alimentos", numeroMaximoParcelas: 1 },
        { sku: "OLEO", nome: "Óleo 900ml", preco: 8.0, fabricante: "Marca C", categoria: "alimentos", numeroMaximoParcelas: 1 },
        // vestuário
        { sku: "CAMISETA", nome: "Camiseta", preco: 30.0, fabricante: "Hering", categoria: "vestuário", numeroMaximoParcelas: 6 },
        { sku: "CALCA", nome: "Calça Jeans", preco: 120.0, fabricante: "Levis", categoria: "vestuário", numeroMaximoParcelas: 6 },
        { sku: "MEIA", nome: "Meia", preco: 10.0, fabricante: "Puket", categoria: "vestuário", numeroMaximoParcelas: 6 },
        // eletrodoméstico
        { sku: "MICRO", nome: "Micro-ondas", preco: 499.9, fabricante: "LG", categoria: "eletrodoméstico", numeroMaximoParcelas: 12 },
        { sku: "LIQUID", nome: "Liquidificador", preco: 199.9, fabricante: "Philco", categoria: "eletrodoméstico", numeroMaximoParcelas: 10 },
        // decoração
        { sku: "VASO", nome: "Vaso Decorativo", preco: 89.9, fabricante: "Tok&Stok", categoria: "decoração", numeroMaximoParcelas: 5 },
        // materiais de construção
        { sku: "CIMENTO", nome: "Cimento 25kg", preco: 35.0, fabricante: "Holcim", categoria: "materiais de construção", numeroMaximoParcelas: 3 }
    ];

    for (const p of produtos) {
        const produto = new Produto(p);
        catalogo.adicionarProduto(produto);
    }

    // Estoque inicial
    estoque.definirQuantidade("ARROZ", 50);
    estoque.definirQuantidade("FEIJAO", 50);
    estoque.definirQuantidade("OLEO", 50);
    estoque.definirQuantidade("CAMISETA", 20);
    estoque.definirQuantidade("CALCA", 10);
    estoque.definirQuantidade("MEIA", 30);
    estoque.definirQuantidade("MICRO", 5);
    estoque.definirQuantidade("LIQUID", 8);
    estoque.definirQuantidade("VASO", 10);
    estoque.definirQuantidade("CIMENTO", 100);

    return { catalogo, estoque };
}

// ==========================================
// DEMO (cenários obrigatórios)
// ==========================================

// Critérios de aceite (quando você terminar):
// - Cenário A: cliente VIP, sem cupom, compra vestuário com regra leve-3-pague-2
// - Cenário B: cliente REGULAR com cupom ETIC10
// - Cenário C: cupom inválido deve gerar erro
// - Cenário D: tentar comprar acima do estoque deve gerar erro
// - Cenário E: relatório deve refletir pedidos pagos

function runDemo() {
    const { catalogo, estoque } = seedCatalogoEEstoque();
    const motor = new MotorDePrecos({ catalogo });
    const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
    const relatorio = new RelatorioVendas();
    relatorio.catalogo = catalogo;

    const clienteVip = new Cliente({ id: "C1", nome: "Ana", tipo: "VIP", saldoPontos: 0 });
    const clienteRegular = new Cliente({ id: "C2", nome: "Bruno", tipo: "REGULAR", saldoPontos: 0 });

    // Cenário A
    {
        const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
        carrinho.adicionarItem("CAMISETA", 2);
        carrinho.adicionarItem("MEIA", 1);
        carrinho.adicionarItem("CALCA", 1);

        const pedido = caixa.fecharCompra({
            cliente: clienteVip,
            carrinho,
            cupomCodigo: null,
            numeroDeParcelas: 3
        });

        pedido.pagar();
        relatorio.registrarPedido(pedido);

        const cupom = new CupomFiscal({ pedido, catalogo });
        Impressora.imprimirLinhas(cupom.gerarLinhas());
    }

    // Cenário B
    {
        const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
        carrinho.adicionarItem("MICRO", 1);
        carrinho.adicionarItem("VASO", 1);

        const pedido = caixa.fecharCompra({
            cliente: clienteRegular,
            carrinho,
            cupomCodigo: "ETIC10",
            numeroDeParcelas: 10
        });

        pedido.pagar();
        relatorio.registrarPedido(pedido);

        const cupom = new CupomFiscal({ pedido, catalogo });
        Impressora.imprimirLinhas(cupom.gerarLinhas());
    }

    // Cenário C (cupom inválido)
    {
        const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
        carrinho.adicionarItem("ARROZ", 1);

        try {
            caixa.fecharCompra({ cliente: clienteRegular, carrinho, cupomCodigo: "INVALIDO" });
        } catch (err) {
            console.log("(OK) Cupom inválido gerou erro:");
            console.log(String(err.message || err));
        }
    }

    // Cenário D (estoque insuficiente)
    {
        const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
        try {
            carrinho.adicionarItem("MICRO", 999);
        } catch (err) {
            console.log("(OK) Estoque insuficiente gerou erro:");
            console.log(String(err.message || err));
        }
    }

    // Cenário E (relatório)
    {
        console.log("==============================");
        console.log("Relatório");
        console.log("==============================");
        console.log("Total arrecadado:", formatBRL(relatorio.totalArrecadado()));
        console.log("Total impostos:", formatBRL(relatorio.totalImpostos()));
        console.log("Total descontos:", formatBRL(relatorio.totalDescontos()));
        console.log("Top produtos:", relatorio.rankingProdutosPorQuantidade(3));
        console.log("Por categoria:", relatorio.arrecadadoPorCategoria());
    }
}

// Quando terminar tudo, descomente:
runDemo();