/* Identidade estável do exercício DA ficha, inclusive quando o movimento se repete. */
function novoItemId(){
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, "0")).join("");
}
function prescricaoDoItem(it){
  return { series:it.series, repMin:it.repMin == null ? null : it.repMin,
    repMax:it.repMax == null ? null : it.repMax, carga:num(it.carga) };
}
function incrementoDoItem(it){ return it.incremento == null ? 2.5 : num(it.incremento); }

function ultimaExecucaoContexto(exId, fichaId, itemId){
  for (const sess of concluidas()){
    if (sess.fichaId !== fichaId) continue;
    const candidatos = sess.exercicios.filter(e => e.exId === exId);
    const e = (itemId && candidatos.find(e => e.itemId === itemId)) ||
      (candidatos.length === 1 && !candidatos[0].itemId ? candidatos[0] : null);
    if (!e) continue;
    const feitas = e.series.filter(s => s.feita);
    return { exercicio:e, data:sess.inicio, series:feitas,
      esforco:e.esforco || (feitas.length ? feitas[feitas.length - 1].esforco : "") || "" };
  }
  return null;
}

/* Conservador por intenção: histórico sem prescrição original continua visível
   e pode preencher campos, mas não serve de evidência para aumentar carga. */
function horaDeSubir(atual, fichaId){
  const alvo = atual.prescrito;
  if (!alvo || !alvo.repMax || !alvo.repMin || alvo.repMin > alvo.repMax) return null;
  const ult = ultimaExecucaoContexto(atual.exId, fichaId, atual.itemId);
  if (!ult || !ult.exercicio.prescrito) return null;
  const anterior = ult.exercicio, prescrito = anterior.prescrito;
  if (atual.itemId !== anterior.itemId) return null;
  if (!["series", "repMin", "repMax", "carga"].every(k => alvo[k] === prescrito[k])) return null;
  if (anterior.series.length < prescrito.series || anterior.series.some(s => !s.feita)) return null;
  if (!ult.series.length || !ult.series.every(s => num(s.reps) >= alvo.repMax)) return null;
  if (ult.esforco === "falhei" || ult.series.some(s => s.esforco === "falhei")) return null;
  const carga = num(ult.series[0].carga), incremento = incrementoDoItem(atual);
  if (carga <= 0 || incremento <= 0 || carga < alvo.carga) return null;
  // Não extrapolar a maior carga de uma pirâmide para todas as séries.
  if (!ult.series.every(s => num(s.carga) === carga)) return null;
  const sugerida = Math.round((carga + incremento) * 100) / 100;
  return { carga:sugerida,
    texto:"Última vez " + ult.series.length + "×" + alvo.repMax +
      ", dá para tentar " + nKg(sugerida) + " kg" };
}