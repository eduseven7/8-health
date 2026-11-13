/* Estímulo semanal por região do corpo. Ver CONTEXT.md.
   Só lê fichas e sessões concluídas; não grava nada. */

const NIVEIS_ESTIMULO = [
  { cor:"#2B313B", nome:"Fora das fichas" },
  { cor:"#3FB950", nome:"Relaxado" },
  { cor:"#EBD772", nome:"Começou" },
  { cor:"#E3A008", nome:"Bom estímulo" },
  { cor:"#FF9A8F", nome:"Semana completa" },
  { cor:"#E5484D", nome:"Completa + evolução em parte" },
  { cor:"#A3151B", nome:"Completa + evolução em tudo" }
];

/* Séries que as fichas mandam fazer por região numa semana. Sem nenhum dia
   marcado, cada ficha conta uma vez. */
function seriesPrescritasPorRegiao(){
  const comDia = FICHAS.filter(f => f.diaSemana != null);
  const base = comDia.length ? comDia : FICHAS;
  const conta = {};
  base.forEach(f => f.itens.forEach(it => {
    const ex = exById(it.exId);
    if (!ex || tipoDoEx(ex) === "cardio") return;
    const r = regiaoDoEx(ex);
    if (r) conta[r] = (conta[r] || 0) + (it.series || 0);
  }));
  return conta;
}

function resumoExecucao(e, tipo){
  const f = e.series.filter(x => x.feita);
  const medida = tipo === "isometria" ? "seg" : "reps";
  return { n:f.length,
    carga:f.reduce((m, x) => Math.max(m, num(x.carga)), 0),
    total:f.reduce((a, x) => a + num(x[medida]), 0) };
}

/* A execução anterior do mesmo exercício: de preferência o mesmo item da mesma
   ficha; sem isso, o mesmo movimento em qualquer ficha. `lista` vem da mais
   recente para a mais antiga. */
function execucaoAnterior(lista, sess, e){
  const antes = lista.filter(s => new Date(s.inicio) < new Date(sess.inicio));
  const feito = x => x.series.some(y => y.feita);
  for (const s of antes){
    if (s.fichaId !== sess.fichaId) continue;
    const a = s.exercicios.find(x => x.exId === e.exId && feito(x) && (!e.itemId || !x.itemId || x.itemId === e.itemId));
    if (a) return a;
  }
  for (const s of antes){
    const a = s.exercicios.find(x => x.exId === e.exId && feito(x));
    if (a) return a;
  }
  return null;
}

/* Superação: mais carga, ou mais repetições (ou segundos) sem baixar a carga. */
function comparaExecucao(e, anterior, tipo){
  const a = resumoExecucao(e, tipo), b = resumoExecucao(anterior, tipo);
  const un = tipo === "isometria" ? " s" : " reps";
  if (a.carga > b.carga) return { melhora:true, texto:"+" + nKg(a.carga - b.carga) + " kg" };
  if (a.carga === b.carga && a.total > b.total) return { melhora:true, texto:"+" + Math.round(a.total - b.total) + un };
  return { melhora:false, texto:a.carga < b.carga ? "carga menor" : a.total < b.total ? "abaixo da última" : "igual à última" };
}

function estimuloSemana(offset){
  const ini = inicioSemana(offset), fim = new Date(ini);
  fim.setDate(fim.getDate() + 7);
  const prescritas = seriesPrescritasPorRegiao();
  const regioes = {};
  REGIOES.forEach(r => { regioes[r] = { prescritas:prescritas[r] || 0, feitas:0, itens:[] }; });
  let cardioMin = 0;
  const todas = concluidas();

  todas.forEach(s => {
    const d = new Date(s.inicio);
    if (d < ini || d >= fim) return;
    s.exercicios.forEach(e => {
      const tipo = tipoNaSessao(e), feitas = e.series.filter(x => x.feita);
      if (!feitas.length) return;
      if (tipo === "cardio"){ cardioMin += feitas.reduce((a, x) => a + num(x.min), 0); return; }
      const reg = regioes[regiaoNaSessao(e)];
      if (!reg) return;
      reg.feitas += feitas.length;
      const anterior = execucaoAnterior(todas, s, e);
      let cmp = anterior ? comparaExecucao(e, anterior, tipo) : { melhora:null, texto:"primeira vez" };
      if (cmp.melhora && s.execucao === "melhorar") cmp = { melhora:false, texto:cmp.texto + ", execução a melhorar" };
      reg.itens.push({ nome:e.nome, series:feitas.length, melhora:cmp.melhora, texto:cmp.texto });
    });
  });

  REGIOES.forEach(r => {
    const g = regioes[r];
    // Treinou algo que nenhuma ficha prescreve: não há total a completar.
    const alvo = g.prescritas || g.feitas;
    g.fracao = alvo ? Math.min(1, g.feitas / alvo) : 0;
    const comparaveis = g.itens.filter(i => i.melhora !== null);
    const melhores = comparaveis.filter(i => i.melhora).length;
    g.nivel = !alvo ? 0 : !g.feitas ? 1 : g.fracao < .5 ? 2 : g.fracao < 1 ? 3 :
      !melhores ? 4 : melhores < comparaveis.length ? 5 : 6;
  });
  return { ini, fim, regioes, cardioMin };
}
