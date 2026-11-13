/* Tipo e região do Exercício. Ver CONTEXT.md.
   Os dois são derivados quando ausentes: exercícios e sessões gravados antes
   da 1.6 não têm os campos, e nenhum dado precisa ser reescrito para isso. */
const TIPOS = ["carga", "isometria", "cardio"];
const ROTULO_TIPO = { carga:"Carga e repetições", isometria:"Isometria (tempo)", cardio:"Cardio (duração)" };

/* Regiões do mapa do corpo. "Pernas" é um grupo só no Volume, mas no mapa
   cada parte da perna tem cor própria. Cardio não é uma região. */
const REGIOES = ["Peito","Costas","Ombro","Bíceps","Tríceps","Antebraço","Core",
  "Quadríceps","Posterior","Glúteo","Adutores","Panturrilha"];

function tipoPadrao(nome, grupo){
  if (grupo === "Cardio") return "cardio";
  return /prancha|isom[eé]tri/i.test(nome || "") ? "isometria" : "carga";
}
function regiaoPadrao(nome, grupo){
  if (grupo === "Cardio" || !grupo) return null;
  if (grupo !== "Pernas") return REGIOES.includes(grupo) ? grupo : null;
  const n = nome || "";
  if (/panturrilha|g[eê]meos|s[oó]leo/i.test(n)) return "Panturrilha";
  if (/flexora|stiff|posterior|terra romeno/i.test(n)) return "Posterior";
  if (/p[eé]lvica|gl[uú]teo|abdutor/i.test(n)) return "Glúteo";
  if (/adutor/i.test(n)) return "Adutores";
  return "Quadríceps";
}
const tipoDoEx = ex => !ex ? "carga" : TIPOS.includes(ex.tipo) ? ex.tipo : tipoPadrao(ex.nome, ex.grupo);
const regiaoDoEx = ex => !ex ? null : REGIOES.includes(ex.regiao) ? ex.regiao : regiaoPadrao(ex.nome, ex.grupo);

/* Exercício DE UMA SESSÃO: vale o retrato guardado no dia; sem ele, o cadastro atual. */
function tipoNaSessao(e){
  if (TIPOS.includes(e.tipo)) return e.tipo;
  const ex = exById(e.exId);
  return ex ? tipoDoEx(ex) : tipoPadrao(e.nome, e.grupo);
}
function regiaoNaSessao(e){
  if (tipoNaSessao(e) === "cardio") return null;
  if (REGIOES.includes(e.regiao)) return e.regiao;
  const ex = exById(e.exId);
  return ex ? regiaoDoEx(ex) : regiaoPadrao(e.nome, e.grupo);
}
const tipoDoItem = it => tipoDoEx(exById(it.exId));

const fmtSeg = s => { s = Math.round(num(s)); return s >= 60 ? Math.floor(s / 60) + ":" + pad2(s % 60) : s + " s"; };
const fmtMin = m => nKg(num(m)) + " min";

/* Texto de uma Série feita, na unidade do tipo. */
function textoSerie(sr, tipo){
  /* registros anteriores à 1.6 guardaram prancha e cardio como carga × repetições */
  if ((tipo === "cardio" && sr.min == null) || (tipo === "isometria" && sr.seg == null)) tipo = "carga";
  if (tipo === "cardio") return fmtMin(sr.min);
  if (tipo === "isometria") return fmtSeg(sr.seg) + (num(sr.carga) > 0 ? " com " + nKg(num(sr.carga)) + " kg" : "");
  return nKg(num(sr.carga)) + " kg × " + sr.reps;
}

/* ---------- cronômetro da isometria ----------
   Conta para cima: a prancha vai até onde a pessoa aguenta, não até um alvo.
   Parar grava os segundos e conclui a série. */
let crono = null;
function cronoAtivo(i, j){ const s = sessaoAtiva(); return !!crono && !!s && crono.sess === s.id && crono.i === i && crono.j === j; }
function cronoSegundos(){ return crono ? Math.floor((Date.now() - crono.inicio) / 1000) : 0; }
function pararCrono(){ if (crono){ clearInterval(crono.iv); crono = null; } }
function iniciarCrono(i, j){
  const s = sessaoAtiva();
  if (!s) return;
  pararCrono();
  crono = { sess:s.id, i, j, inicio:Date.now(), iv:setInterval(() => {
    const el = document.querySelector('[data-crono="' + i + ':' + j + '"]');
    if (el) el.textContent = fmtClock(Date.now() - crono.inicio);
  }, 250) };
}
