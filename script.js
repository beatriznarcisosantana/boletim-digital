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

  dadosAtuais.forEach(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(item.faltas || [0, 0, 0]);
    const situacao = definirSituacao(media);

    resultados.push({
      disciplina: item.disciplina,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    });

    const linha = document.createElement("tr");

    const tdDisc = document.createElement("td");
    tdDisc.textContent = item.disciplina;
    linha.appendChild(tdDisc);

    const tdN1 = document.createElement("td");
    tdN1.textContent = n1 === null ? "—" : formatarNota(n1);
    linha.appendChild(tdN1);

    const tdN2 = document.createElement("td");
    tdN2.textContent = n2 === null ? "—" : formatarNota(n2);
    linha.appendChild(tdN2);

    const tdN3 = document.createElement("td");
    tdN3.textContent = n3 === null ? "—" : formatarNota(n3);
    linha.appendChild(tdN3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = media === null ? "Ainda não lançada" : formatarNota(media);
    tdMedia.appendChild(strongMedia);
    linha.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltas;
    linha.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    const spanSit = document.createElement("span");
    spanSit.className = "situacao " + situacao.classe;
    spanSit.textContent = situacao.texto;
    tdSit.appendChild(spanSit);
    linha.appendChild(tdSit);

    corpoTabela.appendChild(linha);
  });

  const mediasDisponiveis = resultados
    .map(function (r) { return r.media; })
    .filter(function (m) { return m !== null; });

  const mediaGeral = mediasDisponiveis.length > 0
    ? mediasDisponiveis.reduce(function (a, b) { return a + b; }, 0) / mediasDisponiveis.length
    : null;

  const totalFaltasGeral = resultados.reduce(function (acc, r) {
    return acc + r.faltas;
  }, 0);

  const bomDesempenho = resultados.filter(function (r) {
    return r.situacao.texto === "Bom desempenho";
  }).length;

  const precisamAtencao = resultados.filter(function (r) {
    return r.situacao.texto === "Atenção";
  }).length;

  const frequenciaDemonstrativa = 92;

  areaCards.appendChild(criarCard("Média geral", mediaGeral === null ? "—" : formatarNota(mediaGeral)));
  areaCards.appendChild(criarCard("Total de faltas", totalFaltasGeral));
  areaCards.appendChild(criarCard("Bom desempenho", bomDesempenho + " disciplinas"));
  areaCards.appendChild(criarCard("Precisam de atenção", precisamAtencao + " disciplinas"));
  areaCards.appendChild(criarCard("Frequência", frequenciaDemonstrativa + "% — Frequência adequada"));
}

btnEntrar.addEventListener("click", function () {
  const pin = inputPin.value;
  if (!pin) {
    msgLogin.textContent = "Digite o PIN para acessar.";
    msgLogin.className = "mensagem-status erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pin
    })
  })
    .then(function (res) {
      if (res.status === 401) throw new Error("Turma, chamada ou PIN inválidos.");
      if (res.status === 429) throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
      if (!res.ok) throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
      return res.json();
    })
    .then(function (resposta) {
      pinSessao = pin;
      inputPin.value = "";
      msgLogin.textContent = "";

      if (resposta.dados && resposta.dados.disciplinas && resposta.dados.disciplinas.length > 0) {
        dadosAtuais = resposta.dados.disciplinas;
      } else {
        dadosAtuais = JSON.parse(JSON.stringify(dadosBoletimPadrao));
      }

      areaLogin.style.display = "none";
      painelBoletim.style.display = "block";
      renderizarBoletim();
    })
    .catch(function (err) {
      msgLogin.textContent = err.message || "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status erro";
    });
});

btnAlterarDados.addEventListener("click", function () {
  corpoEdicao.innerHTML = "";
  msgEdicao.textContent = "";

  dadosAtuais.forEach(function (item, index) {
    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    tdDisc.textContent = item.disciplina;
    tr.appendChild(tdDisc);

    const f = item.faltas || [0, 0, 0];

    [item.tri1, item.tri2, item.tri3].forEach(function (nota, iTri) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.dataset.index = index;
      input.dataset.tipo = "nota";
      input.dataset.tri = iTri;
      
      const nVal = normalizarNota(nota);
      input.value = nVal === null ? "" : String(nVal).replace(".", ",");
      
      td.appendChild(input);
      tr.appendChild(td);
    });

    [f[0], f[1], f[2]].forEach(function (falta, iTri) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.dataset.index = index;
      input.dataset.tipo = "falta";
      input.dataset.tri = iTri;
      input.value = falta !== undefined && falta !== null ? falta : 0;
      
      td.appendChild(input);
      tr.appendChild(td);
    });

    corpoEdicao.appendChild(tr);
  });

  areaEdicao.style.display = "block";
});

btnCancelar.addEventListener("click", function () {
  areaEdicao.style.display = "none";
});

function validarNotaInput(val) {
  if (val === "" || val === null || val === undefined) return { ok: true, val: null };
  const str = String(val).trim().replace(",", ".");
  const num = Number(str);
  if (isNaN(num) || num < 0 || num > 10) return { ok: false };
  return { ok: true, val: num };
}

function validarFaltaInput(val) {
  if (val === "" || val === null || val === undefined) return { ok: false };
  const str = String(val).trim();
  const num = Number(str);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) return { ok: false };
  return { ok: true, val: num };
}

btnSalvar.addEventListener("click", function () {
  msgEdicao.textContent = "";
  msgEdicao.className = "mensagem-status";

  const inputs = corpoEdicao.querySelectorAll("input");
  let valido = true;

  inputs.forEach(function (inp) {
    inp.classList.remove("campo-invalido");
  });

  const novosDados = JSON.parse(JSON.stringify(dadosAtuais));

  inputs.forEach(function (inp) {
    const idx = inp.dataset.index;
    const tipo = inp.dataset.tipo;
    const tri = inp.dataset.tri;
    const val = inp.value;

    if (tipo === "nota") {
      const res = validarNotaInput(val);
      if (!res.ok) {
        inp.classList.add("campo-invalido");
        valido = false;
      } else {
        if (tri == 0) novosDados[idx].tri1 = res.val;
        if (tri == 1) novosDados[idx].tri2 = res.val;
        if (tri == 2) novosDados[idx].tri3 = res.val;
      }
    } else if (tipo === "falta") {
      const res = validarFaltaInput(val);
      if (!res.ok) {
        inp.classList.add("campo-invalido");
        valido = false;
      } else {
        if (!novosDados[idx].faltas) novosDados[idx].faltas = [0, 0, 0];
        novosDados[idx].faltas[tri] = res.val;
      }
    }
  });

  if (!valido) {
    msgEdicao.textContent = "Existem campos com valores inválidos. Corrija-os para salvar.";
    msgEdicao.className = "mensagem-status erro";
    return;
  }

  msgEdicao.textContent = "Salvando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinSessao,
      dados: {
        disciplinas: novosDados
      }
    })
  })
    .then(function (res) {
      if (!res.ok) throw new Error("Erro ao salvar alterações no servidor.");
      return res.json();
    })
    .then(function () {
      dadosAtuais = novosDados;
      msgEdicao.textContent = "Dados salvos com sucesso.";
      msgEdicao.className = "mensagem-status sucesso";
      renderizarBoletim();
      setTimeout(function () {
        areaEdicao.style.display = "none";
      }, 1000);
    })
    .catch(function (err) {
      msgEdicao.textContent = err.message || "Erro ao salvar alterações.";
      msgEdicao.className = "mensagem-status erro";
    });
});