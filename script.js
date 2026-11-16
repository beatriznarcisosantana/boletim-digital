// Array de objetos com os dados brutos fictícios do 8º Ano
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

// Converte qualquer formato de nota para a escala de 0 a 10
function normalizarNota(valor) {
  // Se estiver vazio, nulo ou indefinido, retorna null (nota ainda não lançada)
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Troca vírgula por ponto e transforma texto em número
  const textoLimpo = String(valor).trim().replace(",", ".");
  const numero = Number(textoLimpo);

  // Se não for um número válido ou for negativo, ignora
  if (Number.isNaN(numero) || numero < 0) {
    return null;
  }

  // Se estiver entre 0 e 10, mantém como está
  if (numero <= 10) {
    return numero;
  }

  // Se for maior que 10 até 100 (ex: 82 ou 100), divide por 10
  if (numero <= 100) {
    return numero / 10;
  }

  // Valores acima de 100 são inválidos
  return null;
}

// Formata o número com 1 casa decimal e vírgula (ex: 8.2 -> "8,2")
function formatarNota(nota) {
  if (nota === null) {
    return '<span class="nota-ausente">Ainda não lançada</span>';
  }
  return nota.toFixed(1).replace(".", ",");
}

// Calcula a média apenas com as notas que já existem
function calcularMedia(n1, n2, n3) {
  const notasValidas = [n1, n2, n3].filter(nota => nota !== null);

  if (notasValidas.length === 0) {
    return null;
  }

  let soma = 0;
  notasValidas.forEach(nota => {
    soma += nota;
  });

  return soma / notasValidas.length;
}

// Soma as faltas dos três trimestres
function somarFaltas(listaFaltas) {
  let total = 0;
  listaFaltas.forEach(falta => {
    total += falta;
  });
  return total;
}

// Define a situação da disciplina com base na média mínima 6,0
function obterSituacao(media) {
  if (media === null) {
    return { texto: "Nota ainda não disponível", classe: "situacao-indisponivel" };
  }
  if (media >= 6.0) {
    return { texto: "Bom desempenho", classe: "situacao-bom" };
  }
  return { texto: "Atenção", classe: "situacao-atencao" };
}

// Função principal que monta a tabela e atualiza os cards
function renderizarBoletim() {
  const corpoTabela = document.getElementById("tabela-corpo");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalGeralFaltas = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  // Percorre cada disciplina do array
  dadosBoletim.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const media = calcularMedia(n1, n2, n3);
    const faltasDisciplina = somarFaltas(item.faltas);
    const situacao = obterSituacao(media);

    // Acumula valores para os cards do topo
    totalGeralFaltas += faltasDisciplina;

    if (media !== null) {
      somaMediasGerais += media;
      qtdDisciplinasComMedia++;

      if (media >= 6.0) {
        qtdBomDesempenho++;
      } else {
        qtdAtencao++;
      }
    }

    // Cria uma nova linha na tabela usando DOM
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarNota(n1)}</td>
      <td>${formatarNota(n2)}</td>
      <td>${formatarNota(n3)}</td>
      <td><strong>${media !== null ? media.toFixed(1).replace(".", ",") : "—"}</strong></td>
      <td>${faltasDisciplina}</td>
      <td><span class="situacao ${situacao.classe}">${situacao.texto}</span></td>
    `;

    corpoTabela.appendChild(linha);
  });

  // Atualiza os valores dos cards no topo da página
  const mediaGeral = qtdDisciplinasComMedia > 0
    ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",")
    : "—";

  document.getElementById("media-geral").textContent = mediaGeral;
  document.getElementById("total-faltas").textContent = totalGeralFaltas;
  document.getElementById("qtd-bom").textContent = qtdBomDesempenho;
  document.getElementById("qtd-atencao").textContent = qtdAtencao;

  // Frequência fictícia apenas demonstrativa nesta etapa (será tratada de outra forma no futuro)
  document.getElementById("frequencia-valor").textContent = "92%";
  document.getElementById("frequencia-texto").textContent = "Frequência adequada";
}

// Executa tudo assim que a página carrega
renderizarBoletim();