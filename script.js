
 /* =========================================================
   BOLETIM DIGITAL — 8º ANO
   ========================================================= */

const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 5,
  apiUrl: "https://boletim-api.profbt.com.br"
};

const dadosBoletimPadrao = [
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

let dadosAtuais = [];
let pinSessao = "";

const corpoTabela = document.getElementById("corpo-tabela");
const areaCards = document.getElementById("cards");
const areaLogin = document.getElementById("area-login");
const painelBoletim = document.getElementById("painel-boletim");
const inputPin = document.getElementById("input-pin");
const btnEntrar = document.getElementById("btn-entrar");
const msgLogin = document.getElementById("msg-login");
const btnAlterarDados = document.getElementById("btn-alterar-dados");
const areaEdicao = document.getElementById("area-edicao");
const corpoEdicao = document.getElementById("corpo-edicao");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const msgEdicao = document.getElementById("msg-edicao");

function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  const texto = String(valor).replace(",", ".");
  const numero = Number(texto);
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

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

function somarFaltas(lista) {
  let total = 0;
  if (Array.isArray(lista)) {
    lista.forEach(function (f) {
      total += Number(f) || 0;
    });
  }
  return total;
}

function definirSituacao(media) {
  if (media === null) {
    return { texto: "Nota ainda não disponível", classe: "sem-nota" };
  }
  if (media >= 6.0) {
    return { texto: "Bom desempenho", classe: "bom" };
  }
  return { texto: "Atenção", classe: "atencao" };
}

function formatarNota(n) {
  if (n === null) return "—";
  return n.toFixed(1).replace(".", ",");
}

function criarCard(titulo, valor) {
  const card = document.createElement("div");
  card.className = "card";
  
  const faixa = document.createElement("div");
  faixa.className = "card-faixa";
  
  const corpo = document.createElement("div");
  corpo.className = "card-corpo";
  
  const divTitulo = document.createElement("div");
  divTitulo.className = "card-titulo";
  divTitulo.textContent = titulo;
  
  const divValor = document.createElement("div");
  divValor.className = "card-valor";
  divValor.textContent = valor;
  
  corpo.appendChild(divTitulo);
  corpo.appendChild(divValor);
  card.appendChild(faixa);
  card.appendChild(corpo);
  
  return card;
}

function renderizarBoletim() {
  corpoTabela.innerHTML = "";
  areaCards.innerHTML = "";

  const resultados = [];