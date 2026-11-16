const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 5,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Array de objetos com os dados brutos fictícios do 8º Ano
const dadosBoletimInicial = [
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

let pinSessao = "";
let dadosBoletim = [];
let modoEdicao = false;

// Instâncias dos gráficos (camada somente leitura)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// Converte qualquer formato de nota antiga para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const textoLimpo = String(valor).trim().replace(",", ".");
  const numero = Number(textoLimpo);

  if (Number.isNaN(numero) || numero < 0) {
    return null;
  }

  if (numero <= 10) {
    return numero;
  }

  if (numero <= 100) {
    return numero / 10;
  }

  return null;
}

// Normaliza a lista de disciplinas vinda do projeto local ou da API
function prepararDisciplinas(lista) {
  return lista.map(item => {
    const faltasBrutas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    return {
      disciplina: String(item.disciplina || ""),
      tri1: normalizarNota(item.tri1),
      tri2: normalizarNota(item.tri2),
      tri3: normalizarNota(item.tri3),
      faltas: [
        Number.isInteger(Number(faltasBrutas[0])) && Number(faltasBrutas[0]) >= 0 ? Number(faltasBrutas[0]) : 0,
        Number.isInteger(Number(faltasBrutas[1])) && Number(faltasBrutas[1]) >= 0 ? Number(faltasBrutas[1]) : 0,
        Number.isInteger(Number(faltasBrutas[2])) && Number(faltasBrutas[2]) >= 0 ? Number(faltasBrutas[2]) : 0
      ]
    };
  });
}

// Valida nota digitada pelo estudante no editor (0 a 10 ou vazio)
function validarNotaEditor(texto) {
  const limpo = String(texto).trim();
  if (limpo === "") {
    return { valido: true, valor: null };
  }

  if (!/^\d+([.,]\d+)?$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = Number(limpo.replace(",", "."));
  if (Number.isNaN(numero) || numero < 0 || numero > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: Math.round(numero * 10) / 10 };
}

// Valida falta digitada pelo estudante no editor (inteiro >= 0)
function validarFaltaEditor(texto) {
  const limpo = String(texto).trim();
  if (limpo === "" || !/^\d+$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = Number(limpo);
  if (!Number.isInteger(numero) || numero < 0) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

// Formata o número para exibição na célula
function criarElementoNota(nota) {
  if (nota === null) {
    const span = document.createElement("span");
    span.className = "nota-ausente";
    span.textContent = "Ainda não lançada";
    return span;
  }
  return document.createTextNode(nota.toFixed(1).replace(".", ","));
}

// Formata nota para preencher input de edição
function formatarNotaParaInput(nota) {
  if (nota === null || nota === undefined) {
    return "";
  }
  return String(nota).replace(".", ",");
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

function definirMensagem(elementoId, texto, tipo) {
  const el = document.getElementById(elementoId);
  el.textContent = texto;
  el.className = "mensagem-status";
  if (tipo) {
    el.classList.add("mensagem-" + tipo);
  }
}

// Atualiza o cabeçalho da tabela conforme o modo (visualização ou edição)
function atualizarCabecalhoTabela() {
  const tr = document.getElementById("tabela-cabecalho");
  tr.innerHTML = "";

  const colunas = modoEdicao
    ? ["Disciplina", "1º Tri", "2º Tri", "3º Tri", "Faltas 1º", "Faltas 2º", "Faltas 3º", "Média", "Situação"]
    : ["Disciplina", "1º Tri", "2º Tri", "3º Tri", "Média", "Faltas", "Situação"];

  colunas.forEach(titulo => {
    const th = document.createElement("th");
    th.textContent = titulo;
    tr.appendChild(th);
  });
}

function criarInputEdicao(valorInicial, tipoCampo, indiceDisciplina, campoNome) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "input-edicao";
  input.value = valorInicial;
  input.dataset.tipo = tipoCampo;
  input.dataset.indice = String(indiceDisciplina);
  input.dataset.campo = campoNome;
  input.addEventListener("input", () => {
    input.classList.remove("input-invalido");
  });
  return input;
}

// Função principal que monta a tabela e atualiza os cards
function renderizarBoletim() {
  atualizarCabecalhoTabela();

  const corpoTabela = document.getElementById("tabela-corpo");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalGeralFaltas = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosBoletim.forEach((item, indice) => {
    const n1 = item.tri1;
    const n2 = item.tri2;
    const n3 = item.tri3;

    const media = calcularMedia(n1, n2, n3);
    const faltasDisciplina = somarFaltas(item.faltas);
    const situacao = obterSituacao(media);

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

    const linha = document.createElement("tr");

    // Coluna Disciplina (segura com textContent)
    const tdDisciplina = document.createElement("td");
    const strongDisciplina = document.createElement("strong");
    strongDisciplina.textContent = item.disciplina;
    tdDisciplina.appendChild(strongDisciplina);
    linha.appendChild(tdDisciplina);

    if (modoEdicao) {
      // Notas editáveis
      const tdTri1 = document.createElement("td");
      tdTri1.appendChild(criarInputEdicao(formatarNotaParaInput(n1), "nota", indice, "tri1"));
      linha.appendChild(tdTri1);

      const tdTri2 = document.createElement("td");
      tdTri2.appendChild(criarInputEdicao(formatarNotaParaInput(n2), "nota", indice, "tri2"));
      linha.appendChild(tdTri2);

      const tdTri3 = document.createElement("td");
      tdTri3.appendChild(criarInputEdicao(formatarNotaParaInput(n3), "nota", indice, "tri3"));
      linha.appendChild(tdTri3);

      // Faltas editáveis por trimestre
      const tdFalta1 = document.createElement("td");
      tdFalta1.appendChild(criarInputEdicao(String(item.faltas[0]), "falta", indice, "falta0"));
      linha.appendChild(tdFalta1);

      const tdFalta2 = document.createElement("td");
      tdFalta2.appendChild(criarInputEdicao(String(item.faltas[1]), "falta", indice, "falta1"));
      linha.appendChild(tdFalta2);

      const tdFalta3 = document.createElement("td");
      tdFalta3.appendChild(criarInputEdicao(String(item.faltas[2]), "falta", indice, "falta2"));
      linha.appendChild(tdFalta3);

      // Média atual
      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = media !== null ? media.toFixed(1).replace(".", ",") : "—";
      tdMedia.appendChild(strongMedia);
      linha.appendChild(tdMedia);

      // Situação atual
      const tdSituacao = document.createElement("td");
      const spanSituacao = document.createElement("span");
      spanSituacao.className = "situacao " + situacao.classe;
      spanSituacao.textContent = situacao.texto;
      tdSituacao.appendChild(spanSituacao);
      linha.appendChild(tdSituacao);
    } else {
      // Modo visualização
      const tdTri1 = document.createElement("td");
      tdTri1.appendChild(criarElementoNota(n1));
      linha.appendChild(tdTri1);

      const tdTri2 = document.createElement("td");
      tdTri2.appendChild(criarElementoNota(n2));
      linha.appendChild(tdTri2);

      const tdTri3 = document.createElement("td");
      tdTri3.appendChild(criarElementoNota(n3));
      linha.appendChild(tdTri3);

      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = media !== null ? media.toFixed(1).replace(".", ",") : "—";
      tdMedia.appendChild(strongMedia);
      linha.appendChild(tdMedia);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = String(faltasDisciplina);
      linha.appendChild(tdFaltas);

      const tdSituacao = document.createElement("td");
      const spanSituacao = document.createElement("span");
      spanSituacao.className = "situacao " + situacao.classe;
      spanSituacao.textContent = situacao.texto;
      tdSituacao.appendChild(spanSituacao);
      linha.appendChild(tdSituacao);
    }

    corpoTabela.appendChild(linha);
  });

  // Atualiza os valores dos cards no topo da página
  const mediaGeral = qtdDisciplinasComMedia > 0
    ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",")
    : "—";

  document.getElementById("media-geral").textContent = mediaGeral;
  document.getElementById("total-faltas").textContent = String(totalGeralFaltas);
  document.getElementById("qtd-bom").textContent = String(qtdBomDesempenho);
  document.getElementById("qtd-atencao").textContent = String(qtdAtencao);

  // Frequência fictícia demonstrativa preservada
  document.getElementById("frequencia-valor").textContent = "92%";
  document.getElementById("frequencia-texto").textContent = "Frequência adequada";
}

function alternarBotoesEdicao(editando) {
  document.getElementById("btn-alterar").hidden = editando;
  document.getElementById("btn-salvar").hidden = !editando;
  document.getElementById("btn-cancelar").hidden = !editando;
}

// =========================================================
// CAMADA DE GRÁFICOS (SOMENTE LEITURA SOBRE dadosBoletim)
// =========================================================

function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  const copia = dadosBoletim.map(item => {
    const media = calcularMedia(item.tri1, item.tri2, item.tri3);
    return {
      disciplina: item.disciplina,
      media: media !== null ? Number(media.toFixed(1)) : null
    };
  });

  const labels = copia.map(item => item.disciplina);
  const valores = copia.map(item => item.media);
  const coresFundo = valores.map(valor => {
    if (valor === null) {
      return "rgba(156, 163, 175, 0.5)";
    }
    return valor >= 6.0 ? "rgba(22, 101, 52, 0.78)" : "rgba(217, 119, 6, 0.82)";
  });
  const coresBorda = valores.map(valor => {
    if (valor === null) {
      return "#9ca3af";
    }
    return valor >= 6.0 ? "#166534" : "#b45309";
  });

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Média",
          data: valores,
          backgroundColor: coresFundo,
          borderColor: coresBorda,
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (contexto) {
              const valor = contexto.parsed.x;
              if (valor === null || valor === undefined) {
                return contexto.label + ": Sem nota";
              }
              return contexto.label + ": " + valor.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: {
            color: "#4b5563",
            stepSize: 2
          },
          grid: {
            color: "#e5e7eb"
          }
        },
        y: {
          ticks: {
            color: "#374151",
            autoSkip: false,
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  const chavesTrimestres = ["tri1", "tri2", "tri3"];
  const mediasTrimestrais = chavesTrimestres.map(chave => {
    const notasValidas = dadosBoletim
      .map(item => item[chave])
      .filter(nota => nota !== null && nota !== undefined);

    if (notasValidas.length === 0) {
      return null;
    }

    const soma = notasValidas.reduce((acumulador, nota) => acumulador + nota, 0);
    return Number((soma / notasValidas.length).toFixed(1));
  });

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Média Geral",
          data: mediasTrimestrais,
          borderColor: "#374151",
          backgroundColor: "rgba(55, 65, 81, 0.14)",
          pointBackgroundColor: "#374151",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
          tension: 0.25,
          fill: true,
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (contexto) {
              const valor = contexto.parsed.y;
              if (valor === null || valor === undefined) {
                return "Média: Sem notas lançadas";
              }
              return "Média: " + valor.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            color: "#4b5563",
            stepSize: 2
          },
          grid: {
            color: "#e5e7eb"
          }
        },
        x: {
          ticks: {
            color: "#374151",
            font: {
              weight: "600"
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  dadosBoletim.forEach(item => {
    const listaFaltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    faltasTri1 += Number(listaFaltas[0]) || 0;
    faltasTri2 += Number(listaFaltas[1]) || 0;
    faltasTri3 += Number(listaFaltas[2]) || 0;
  });

  const totalFaltas = faltasTri1 + faltasTri2 + faltasTri3;
  const situacaoCritica = totalFaltas >= 350;

  const badgePerigo = document.getElementById("estadoFaltas");
  const cardFaltas = document.getElementById("card-grafico-faltas");

  if (badgePerigo) {
    badgePerigo.hidden = !situacaoCritica;
  }

  if (cardFaltas) {
    if (situacaoCritica) {
      cardFaltas.classList.add("grafico-card-perigo");
    } else {
      cardFaltas.classList.remove("grafico-card-perigo");
    }
  }

  const corBarra = situacaoCritica ? "rgba(220, 38, 38, 0.85)" : "rgba(55, 65, 81, 0.82)";
  const corBordaBarra = situacaoCritica ? "#b91c1c" : "#1f2937";

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Faltas",
          data: [faltasTri1, faltasTri2, faltasTri3],
          backgroundColor: corBarra,
          borderColor: corBordaBarra,
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (contexto) {
              const valor = contexto.parsed.y;
              return contexto.label + ": " + valor + (valor === 1 ? " falta" : " faltas");
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#4b5563",
            precision: 0
          },
          grid: {
            color: "#e5e7eb"
          }
        },
        x: {
          ticks: {
            color: "#374151",
            font: {
              weight: "600"
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// =========================================================
// FLUXO PROTEGIDO DE AUTENTICAÇÃO, EDIÇÃO E SALVAMENTO
// =========================================================

// Autenticação e carregamento do boletim pela API
async function abrirBoletim(event) {
  event.preventDefault();

  const inputPin = document.getElementById("input-pin");
  const btnEntrar = document.getElementById("btn-entrar");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    definirMensagem("mensagem-acesso", "Digite seu PIN.", "erro");
    return;
  }

  btnEntrar.disabled = true;
  definirMensagem("mensagem-acesso", "Conectando...", "info");

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      definirMensagem("mensagem-acesso", "Turma, chamada ou PIN inválidos.", "erro");
      return;
    }

    if (resposta.status === 429) {
      definirMensagem("mensagem-acesso", "Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      return;
    }

    if (!resposta.ok) {
      definirMensagem("mensagem-acesso", "Não foi possível conectar ao servidor. Tente novamente.", "erro");
      return;
    }

    const resultado = await resposta.json();

    // Guarda o PIN somente em memória e limpa o campo
    pinSessao = pinDigitado;
    inputPin.value = "";
    definirMensagem("mensagem-acesso", "", "");

    // Se dados não for null, usa exclusivamente os dados da API; caso contrário usa os locais
    if (resultado && resultado.dados && Array.isArray(resultado.dados.disciplinas)) {
      dadosBoletim = prepararDisciplinas(resultado.dados.disciplinas);
    } else {
      dadosBoletim = prepararDisciplinas(dadosBoletimInicial);
    }

    document.getElementById("secao-acesso").hidden = true;
    document.getElementById("conteudo-boletim").hidden = false;

    modoEdicao = false;
    alternarBotoesEdicao(false);
    renderizarBoletim();
    atualizarGraficos();
  } catch (erro) {
    definirMensagem("mensagem-acesso", "Não foi possível conectar ao servidor. Tente novamente.", "erro");
  } finally {
    btnEntrar.disabled = false;
  }
}

// Ativa o modo de edição
function iniciarEdicao() {
  modoEdicao = true;
  alternarBotoesEdicao(true);
  definirMensagem("mensagem-edicao", "", "");
  renderizarBoletim();
}

// Cancela a edição sem salvar alterações
function cancelarEdicao() {
  modoEdicao = false;
  alternarBotoesEdicao(false);
  definirMensagem("mensagem-edicao", "", "");
  renderizarBoletim();
}

// Valida todos os campos editados e salva na API
async function salvarAlteracoes() {
  const inputs = document.querySelectorAll("#tabela-corpo .input-edicao");
  let temErro = false;

  // Cria cópia temporária dos dados atuais para preencher após validar
  const novosDados = dadosBoletim.map(item => ({
    disciplina: item.disciplina,
    tri1: item.tri1,
    tri2: item.tri2,
    tri3: item.tri3,
    faltas: [...item.faltas]
  }));

  inputs.forEach(input => {
    input.classList.remove("input-invalido");
    const indice = Number(input.dataset.indice);
    const tipo = input.dataset.tipo;
    const campo = input.dataset.campo;

    if (tipo === "nota") {
      const resultado = validarNotaEditor(input.value);
      if (!resultado.valido) {
        input.classList.add("input-invalido");
        temErro = true;
      } else {
        novosDados[indice][campo] = resultado.valor;
      }
    } else if (tipo === "falta") {
      const resultado = validarFaltaEditor(input.value);
      if (!resultado.valido) {
        input.classList.add("input-invalido");
        temErro = true;
      } else {
        const idxFalta = Number(campo.replace("falta", ""));
        novosDados[indice].faltas[idxFalta] = resultado.valor;
      }
    }
  });

  if (temErro) {
    definirMensagem(
      "mensagem-edicao",
      "Existem campos inválidos destacados em vermelho. Notas devem ser de 0 a 10 (ou vazio) e faltas devem ser números inteiros maiores ou iguais a 0.",
      "erro"
    );
    return;
  }

  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelar = document.getElementById("btn-cancelar");
  btnSalvar.disabled = true;
  btnCancelar.disabled = true;
  definirMensagem("mensagem-edicao", "Salvando...", "info");

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novosDados
        }
      })
    });

    if (resposta.status === 401) {
      definirMensagem("mensagem-edicao", "Turma, chamada ou PIN inválidos.", "erro");
      return;
    }

    if (resposta.status === 429) {
      definirMensagem("mensagem-edicao", "Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      return;
    }

    if (!resposta.ok) {
      definirMensagem("mensagem-edicao", "Não foi possível salvar os dados. Tente novamente.", "erro");
      return;
    }

    dadosBoletim = novosDados;
    modoEdicao = false;
    alternarBotoesEdicao(false);
    renderizarBoletim();
    atualizarGraficos();
    definirMensagem("mensagem-edicao", "Dados salvos com sucesso.", "sucesso");
  } catch (erro) {
    definirMensagem("mensagem-edicao", "Não foi possível conectar ao servidor. Tente novamente.", "erro");
  } finally {
    btnSalvar.disabled = false;
    btnCancelar.disabled = false;
  }
}

document.getElementById("form-acesso").addEventListener("submit", abrirBoletim);
document.getElementById("btn-alterar").addEventListener("click", iniciarEdicao);
document.getElementById("btn-cancelar").addEventListener("click", cancelarEdicao);
document.getElementById("btn-salvar").addEventListener("click", salvarAlteracoes);