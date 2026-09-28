
/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   Dados fictícios apenas para estudo.
   ========================================================= */

/* ---------------------------------------------------------
   CONCEITO: array
   Um array é uma lista de valores guardados numa variável.
   Aqui, "dadosBoletim" é um array de objetos.
   --------------------------------------------------------- */
const dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

/* ---------------------------------------------------------
   CONCEITO: função
   Uma função é um bloco de código com um nome, que podemos
   chamar quando quisermos. Ela pode receber valores e devolver
   um resultado.
   --------------------------------------------------------- */

// Normaliza qualquer nota para a escala 0–10.
// Retorna um número ou null (quando não há nota lançada).
function normalizarNota(valor) {
  // CONCEITO: if — verifica uma condição e decide o que fazer.
  if (valor === null || valor === undefined || valor === "") {
    return null; // nota ainda não lançada
  }

  // Se vier com vírgula, troca por ponto para o JavaScript entender.
  const texto = String(valor).replace(",", ".");
  const numero = Number(texto);

  // Se não for um número válido, ignora.
  if (isNaN(numero)) {
    return null;
  }

  // Regras de conversão
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras: inválido.
  return null;
}

// Calcula a média usando SOMENTE as notas disponíveis.
// Se não houver nenhuma nota válida, devolve null.
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  return soma / validas.length;
}

// Soma as faltas dos três trimestres.
function somarFaltas(lista) {
  let total = 0;
  lista.forEach(function (f) {
    total += f;
  });
  return total;
}

// Define a situação a partir da média.
function definirSituacao(media) {
  if (media === null) {
    return { texto: "Nota ainda não disponível", classe: "sem-nota" };
  }
  if (media >= 6.0) {
    return { texto: "Bom desempenho", classe: "bom" };
  }
  return { texto: "Atenção", classe: "atencao" };
}

// Formata número no padrão brasileiro: 8.5 -> "8,5"
function formatarNota(n) {
  if (n === null) return "—";
  return n.toFixed(1).replace(".", ",");
}

/* ---------------------------------------------------------
   CONCEITO: DOM
   DOM é a "árvore" da página HTML que o JavaScript pode ler
   e alterar. Aqui pegamos o corpo da tabela e a área dos cards.
   --------------------------------------------------------- */
const corpoTabela = document.getElementById("corpo-tabela");
const areaCards = document.getElementById("cards");

/* ---------------------------------------------------------
   Guardamos os resultados de cada disciplina para usar
   depois nos cards de resumo.
   --------------------------------------------------------- */
const resultados = [];

/* ---------------------------------------------------------
   CONCEITO: forEach
   forEach percorre cada item de um array e executa uma função.
   Aqui percorremos cada disciplina.
   --------------------------------------------------------- */
dadosBoletim.forEach(function (item) {
  // Normaliza as três notas
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  // Média somente com notas disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // Total de faltas
  const totalFaltas = somarFaltas(item.faltas);

  // Situação
  const situacao = definirSituacao(media);

  // Guarda o resultado para os cards
  resultados.push({
    disciplina: item.disciplina,
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  });

  // Cria a linha da tabela
  const linha = document.createElement("tr");
  linha.innerHTML =
    "<td>" + item.disciplina + "</td>" +
    "<td>" + (n1 === null ? "—" : formatarNota(n1)) + "</td>" +
    "<td>" + (n2 === null ? "—" : formatarNota(n2)) + "</td>" +
    "<td>" + (n3 === null ? "—" : formatarNota(n3)) + "</td>" +
    "<td><strong>" + (media === null ? "Ainda não lançada" : formatarNota(media)) + "</strong></td>" +
    "<td>" + totalFaltas + "</td>" +
    "<td><span class='situacao " + situacao.classe + "'>" + situacao.texto + "</span></td>";

  corpoTabela.appendChild(linha);
});

/* ---------------------------------------------------------
   CARDS DE RESUMO
   --------------------------------------------------------- */

// Média geral: média das médias disponíveis
const mediasDisponiveis = resultados
  .map(function (r) { return r.media; })
  .filter(function (m) { return m !== null; });

const mediaGeral = mediasDisponiveis.length > 0
  ? mediasDisponiveis.reduce(function (a, b) { return a + b; }, 0) / mediasDisponiveis.length
  : null;

// Total de faltas geral
const totalFaltasGeral = resultados.reduce(function (acc, r) {
  return acc + r.faltas;
}, 0);

// Disciplinas com bom desempenho
const bomDesempenho = resultados.filter(function (r) {
  return r.situacao.texto === "Bom desempenho";
}).length;

// Disciplinas que precisam de atenção
const precisamAtencao = resultados.filter(function (r) {
  return r.situacao.texto === "Atenção";
}).length;

/* ---------------------------------------------------------
   FREQUÊNCIA DEMONSTRATIVA
   ATENÇÃO: este valor é apenas fictício para demonstração.
   No futuro será calculado de outra forma.
   --------------------------------------------------------- */
const frequenciaDemonstrativa = 92;

// Função para criar um card
function criarCard(titulo, valor) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML =
    "<div class='card-faixa'></div>" +
    "<div class='card-corpo'>" +
      "<div class='card-titulo'>" + titulo + "</div>" +
      "<div class='card-valor'>" + valor + "</div>" +
    "</div>";
  return card;
}

// Adiciona os cards na área de cards
areaCards.appendChild(criarCard("Média geral", mediaGeral === null ? "—" : formatarNota(mediaGeral)));
areaCards.appendChild(criarCard("Total de faltas", totalFaltasGeral));
areaCards.appendChild(criarCard("Bom desempenho", bomDesempenho + " disciplinas"));
areaCards.appendChild(criarCard("Precisam de atenção", precisamAtencao + " disciplinas"));
areaCards.appendChild(criarCard("Frequência", frequenciaDemonstrativa + "% — Frequência adequada"));