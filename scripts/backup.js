/* Validação antes de qualquer escrita. Os registros são preservados, inclusive
   campos adicionais conhecidos por versões futuras das telas. */
function validarBackup(dados){
  const exigir = (ok, msg) => { if (!ok) throw new Error(msg); };
  const objeto = v => v !== null && typeof v === "object" && !Array.isArray(v);
  const id = v => Number.isSafeInteger(v) && v > 0;
  const texto = v => typeof v === "string" && v.trim().length > 0;
  const numero = (v, inteiro = false) => {
    if (v === "" || v == null) return true;
    if (typeof v !== "number" && typeof v !== "string") return false;
    if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(String(v).trim())) return false;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) && n >= 0 && (!inteiro || Number.isSafeInteger(n));
  };
  const faixa = e => {
    exigir((e.repMin == null || id(e.repMin)) && (e.repMax == null || id(e.repMax)), "Faixa de repetições inválida.");
    exigir(e.repMin == null || e.repMax == null || e.repMin <= e.repMax, "O mínimo de repetições supera o máximo.");
  };
  const lista = (valores, nome) => {
    exigir(Array.isArray(valores), "Lista inválida: " + nome + ".");
    const ids = new Set();
    valores.forEach(v => {
      exigir(objeto(v) && id(v.id), "Registro sem ID válido em " + nome + ".");
      exigir(!ids.has(v.id), "IDs duplicados em " + nome + ".");
      ids.add(v.id);
    });
    return ids;
  };
  const optionalText = v => v == null || typeof v === "string";
  const itemExtra = e => {
    exigir(e.itemId == null || texto(e.itemId), "Identificação do item inválida.");
    exigir(e.incremento == null || (numero(e.incremento) && num(e.incremento) > 0), "Incremento de carga inválido.");
    exigir(optionalText(e.nota), "Nota inválida.");
  };

  exigir(objeto(dados), "Backup não reconhecido.");
  const versao = dados.versao == null ? 1 : dados.versao;
  exigir([1, 2, 3].includes(versao), "Versão de backup não suportada. Atualize o app antes de restaurar.");
  exigir(dados.app === "8health" || (versao === 1 && dados.app == null), "Este arquivo não é um backup do 8 Health.");
  exigir(Array.isArray(dados.exercicios) && Array.isArray(dados.fichas), "Backup não reconhecido.");
  // Migração opera somente na cópia lida do arquivo, nunca nos dados do aparelho.
  dados = migrarBackup(dados);
  dados.sessoes = dados.sessoes === undefined ? [] : dados.sessoes;
  dados.medidas = dados.medidas === undefined ? [] : dados.medidas;
  const exIds = lista(dados.exercicios, "exercícios");
  lista(dados.fichas, "fichas"); lista(dados.sessoes, "sessões"); lista(dados.medidas, "medidas");
  dados.exercicios.forEach(e => exigir(texto(e.nome) && GRUPOS.includes(e.grupo), "Nome ou grupo de exercício inválido."));
  dados.fichas.forEach(f => {
    exigir(texto(f.nome) && Array.isArray(f.itens), "Ficha inválida.");
    exigir(f.diaSemana == null || (Number.isInteger(f.diaSemana) && f.diaSemana >= 0 && f.diaSemana <= 6), "Dia de treino inválido.");
    const itens = new Set();
    f.itens.forEach(e => {
      exigir(objeto(e) && exIds.has(e.exId), "Ficha aponta para exercício inexistente.");
      exigir(id(e.series) && e.series <= 1000, "Quantidade de séries inválida.");
      faixa(e); itemExtra(e);
      exigir(numero(e.carga) && numero(e.descanso, true), "Carga ou descanso inválido.");
      exigir(!e.itemId || !itens.has(e.itemId), "Identificações de itens duplicadas na ficha.");
      if (e.itemId) itens.add(e.itemId);
    });
  });
  let ativas = 0;
  dados.sessoes.forEach(s => {
    exigir(texto(s.nome) && id(s.fichaId) && ["ativa", "concluida"].includes(s.status), "Sessão inválida.");
    exigir(typeof s.inicio === "string" && Number.isFinite(Date.parse(s.inicio)), "Data da sessão inválida.");
    if (s.status === "ativa") { ativas++; exigir(s.fim == null, "Sessão ativa com data de conclusão."); }
    else exigir(typeof s.fim === "string" && Number.isFinite(Date.parse(s.fim)) && Date.parse(s.fim) >= Date.parse(s.inicio), "Data de conclusão inválida.");
    exigir(Array.isArray(s.exercicios) && optionalText(s.observacao), "Conteúdo da sessão inválido.");
    const itens = new Set();
    s.exercicios.forEach(e => {
      // Fichas/exercícios excluídos legitimamente não invalidam o histórico.
      exigir(objeto(e) && id(e.exId) && texto(e.nome) && Array.isArray(e.series), "Exercício da sessão inválido.");
      exigir(e.grupo == null || GRUPOS.includes(e.grupo), "Grupo da sessão inválido.");
      faixa(e); itemExtra(e);
      exigir(numero(e.descanso, true) && ESFORCOS.includes(e.esforco || ""), "Descanso ou esforço inválido.");
      exigir(!e.itemId || !itens.has(e.itemId), "Identificações de itens duplicadas na sessão.");
      if (e.itemId) itens.add(e.itemId);
      if (e.prescrito != null){
        exigir(objeto(e.prescrito) && id(e.prescrito.series) && e.prescrito.series <= 1000, "Prescrição original inválida.");
        faixa(e.prescrito);
        exigir(typeof e.prescrito.carga === "number" && numero(e.prescrito.carga), "Carga prescrita inválida.");
      }
      e.series.forEach(sr => exigir(objeto(sr) && typeof sr.feita === "boolean" &&
        numero(sr.carga) && numero(sr.reps, true) && ESFORCOS.includes(sr.esforco || ""), "Série inválida."));
    });
  });
  exigir(ativas <= 1, "O backup contém mais de um treino em andamento.");
  STORES_CHAVE.forEach(nome => {
    let valores = dados[nome] === undefined ? [] : dados[nome];
    // v1/v2 usavam objetos; v3 preserva os registros k/v do IndexedDB.
    if (objeto(valores)) valores = Object.entries(valores).map(([k, v]) => ({ k, v }));
    exigir(Array.isArray(valores), "Conteúdo inválido: " + nome + ".");
    const chaves = new Set();
    valores.forEach(v => {
      exigir(objeto(v) && texto(v.k) && !chaves.has(v.k), "Chave inválida ou duplicada em " + nome + ".");
      chaves.add(v.k);
    });
    dados[nome] = valores;
  });
  return dados;
}

function gravarBackupAtomico(dados){
  return emTransacao(STORES, "readwrite", tx => {
    STORES.forEach(nome => {
      const store = tx.objectStore(nome);
      store.clear();
      dados[nome].forEach(registro => store.add(registro));
    });
  });
}
function lerBackup(){
  return emTransacao(STORES, "readonly", tx => {
    const pedidos = STORES.map(nome => [nome, tx.objectStore(nome).getAll()]);
    return () => Object.assign({ app:"8health", versao:3, exportadoEm:new Date().toISOString() },
      Object.fromEntries(pedidos.map(([nome, req]) => [nome, req.result])));
  });
}