const HISTORICO_LOTE = 40;
const hist = { ficha:"", periodo:"todos", inicio:"", fim:"", limite:HISTORICO_LOTE };
function resetHistorico(){
  Object.assign(hist, { ficha:"", periodo:"todos", inicio:"", fim:"", limite:HISTORICO_LOTE });
  state.sessOpen = null;
}
function diaLocalHistorico(valor){
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const [ano, mes, dia] = valor.split("-").map(Number);
  const d = new Date(0); d.setFullYear(ano, mes - 1, dia); d.setHours(0, 0, 0, 0);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia ? d : null;
}
function intervaloHistorico(){
  let inicio = null, fim = null;
  if (hist.periodo === "personalizado"){
    inicio = hist.inicio ? diaLocalHistorico(hist.inicio) : null;
    fim = hist.fim ? diaLocalHistorico(hist.fim) : null;
    if ((hist.inicio && !inicio) || (hist.fim && !fim)) return { erro:"Informe datas válidas." };
    if (inicio && fim && inicio > fim) return { erro:"A data inicial não pode ser posterior à final." };
    if (fim) fim.setDate(fim.getDate() + 1); // limite exclusivo, inclui o dia final inteiro
  } else if (["7", "30", "90"].includes(hist.periodo)){
    inicio = new Date(); inicio.setHours(0, 0, 0, 0); inicio.setDate(inicio.getDate() - Number(hist.periodo) + 1);
    fim = new Date(); fim.setHours(0, 0, 0, 0); fim.setDate(fim.getDate() + 1);
  }
  return { inicio, fim, erro:"" };
}
function sessoesFiltradas(){
  const { inicio, fim, erro } = intervaloHistorico();
  if (erro) return [];
  return concluidas().filter(s => {
    const data = new Date(s.inicio);
    return (!hist.ficha || String(s.fichaId) === hist.ficha) && (!inicio || data >= inicio) && (!fim || data < fim);
  }).sort((a, b) => new Date(b.inicio) - new Date(a.inicio) || b.id - a.id);
}
function fichasDoHistorico(){
  const fichas = new Map(FICHAS.map(f => [String(f.id), f.nome]));
  concluidas().forEach(s => {
    if (!fichas.has(String(s.fichaId))) fichas.set(String(s.fichaId), s.nome + " (ficha excluída)");
  });
  if (hist.ficha && !fichas.has(hist.ficha)) fichas.set(hist.ficha, "Ficha #" + hist.ficha + " (sem treinos)");
  return [...fichas].sort((a, b) => a[1].localeCompare(b[1], "pt-BR") || Number(a[0]) - Number(b[0]));
}
function filtrosHistorico(){
  const option = (v, texto, atual) => '<option value="' + esc(v) + '"' + (v === atual ? ' selected' : '') + '>' + esc(texto) + '</option>';
  return '<div class="card history-filters" data-testid="history-filters"><div class="history-filter-grid">' +
    '<div><label for="histFicha" data-testid="history-ficha-label">Ficha</label><select id="histFicha" data-f="hist-ficha" data-testid="history-ficha-filter">' +
    option("", "Todas as fichas", hist.ficha) + fichasDoHistorico().map(([id, nome]) => option(id, nome, hist.ficha)).join("") + '</select></div>' +
    '<div><label for="histPeriodo" data-testid="history-period-label">Período</label><select id="histPeriodo" data-f="hist-periodo" data-testid="history-period-filter">' +
    [["todos","Todo o histórico"],["7","Últimos 7 dias"],["30","Últimos 30 dias"],["90","Últimos 90 dias"],["personalizado","Personalizado"]].map(([v, t]) => option(v, t, hist.periodo)).join("") + '</select></div></div>' +
    (hist.periodo === "personalizado" ? '<div class="history-filter-grid history-dates mt">' +
      '<div><label for="histInicio" data-testid="history-start-label">De (opcional)</label><input id="histInicio" type="date" value="' + esc(hist.inicio) + '" data-f="hist-inicio" data-testid="history-start-date"></div>' +
      '<div><label for="histFim" data-testid="history-end-label">Até (opcional)</label><input id="histFim" type="date" value="' + esc(hist.fim) + '" data-f="hist-fim" data-testid="history-end-date"></div></div>' : "") +
    '<p class="ex-meta mt" data-testid="history-filter-help">Os filtros afetam apenas a lista de treinos.</p>' +
    (hist.ficha || hist.periodo !== "todos" ? '<button class="btn btn-sm btn-ghost mt" data-a="hist-clear" data-testid="history-clear-filters">Limpar filtros</button>' : "") + '</div>';
}
const rotuloEsforco = valor => ({ "fácil":"Fácil", limite:"No limite", falhei:"Falhei" })[valor] || "";
function detalheExercicioHistorico(e, sessId, i){
  const feitas = e.series.filter(s => s.feita);
  if (!feitas.length) return "";
  const esforco = rotuloEsforco(e.esforco);
  return '<div class="history-exercise" data-testid="history-exercise-' + sessId + '-' + i + '">' +
    '<div class="history-exercise-name" data-testid="history-exercise-name-' + sessId + '-' + i + '">' + esc(e.nome) + '</div>' +
    '<div class="ex-meta" data-testid="history-series-' + sessId + '-' + i + '">' + feitas.map(s =>
      nKg(num(s.carga)) + ' kg × ' + esc(s.reps) + (!esforco && rotuloEsforco(s.esforco) ? ' (' + esc(rotuloEsforco(s.esforco)) + ')' : '')).join(' · ') + '</div>' +
    (esforco ? '<div class="ex-meta" data-testid="history-effort-' + sessId + '-' + i + '">Esforço: ' + esc(esforco) + '</div>' : '') + '</div>';
}
function cardSessaoHistorico(s){
  const aberto = state.sessOpen === s.id;
  return '<article class="card history-card" data-testid="history-session-' + s.id + '">' +
    '<button class="row history-session-toggle" data-a="sess-open:' + s.id + '" data-testid="history-session-toggle-' + s.id + '" aria-expanded="' + aberto + '" aria-controls="histDetails-' + s.id + '">' +
    '<div class="grow"><h3 class="trunc" data-testid="history-session-name-' + s.id + '">' + esc(s.nome) + '</h3>' +
    '<div class="ex-meta" data-testid="history-session-date-' + s.id + '">' + esc(fmtData(s.inicio)) + ' · ' + esc(DIAS[new Date(s.inicio).getDay()]) + ' · ' +
    fmtClock(new Date(s.fim) - new Date(s.inicio)) + '</div></div><span class="pill ok" data-testid="history-session-series-count-' + s.id + '">' + seriesFeitas(s) + ' séries</span></button>' +
    '<div id="histDetails-' + s.id + '" class="history-details" data-testid="history-session-details-' + s.id + '"' + (aberto ? '' : ' hidden') + '>' + (aberto ?
      (s.observacao ? '<div class="nota" data-testid="history-session-note-' + s.id + '">' + esc(s.observacao) + '</div>' : '') +
      s.exercicios.map((e, i) => detalheExercicioHistorico(e, s.id, i)).join('') +
      '<button class="btn btn-danger mt" data-a="sess-del:' + s.id + '" data-testid="history-delete-session-' + s.id + '">Excluir este treino</button>' : '') + '</div></article>';
}
function viewHistorico(){
  const lista = sessoesFiltradas(), erro = intervaloHistorico().erro;
  const visiveis = lista.slice(0, hist.limite);
  return '<section id="historySection" data-testid="history-section" aria-label="Histórico de treinos">' +
    '<div class="section-label" data-testid="history-heading">Histórico</div>' + filtrosHistorico() +
    (erro ? '<p class="nota" role="alert" data-testid="history-filter-error">' + esc(erro) + '</p>' :
      '<p class="ex-meta history-count" role="status" data-testid="history-results-count">Mostrando ' + visiveis.length + ' de ' + lista.length + ' treinos</p>' +
      (lista.length ? visiveis.map(cardSessaoHistorico).join('') : '<div class="empty" data-testid="history-empty-results"><p data-testid="history-empty-message">Nenhum treino encontrado com esses filtros.</p></div>') +
      (lista.length > hist.limite ? '<button class="btn btn-ghost" data-a="hist-more" data-testid="history-load-more">Carregar mais ' + Math.min(HISTORICO_LOTE, lista.length - hist.limite) + ' treinos</button>' : '')) + '</section>';
}
function mudarFiltroHistorico(el){
  const campo = el.dataset.f.slice(5);
  if (!["ficha", "periodo", "inicio", "fim"].includes(campo)) return;
  hist[campo] = el.value; hist.limite = HISTORICO_LOTE; state.sessOpen = null;
  const foco = el.id;
  render();
  // No toque, focar um select ou campo de data reabre o seletor do sistema
  // (no iPhone, o usuário tinha de escolher o período duas vezes). O foco
  // só volta ao campo recriado quando há teclado e mouse.
  if (matchMedia("(pointer: coarse)").matches) return;
  const novo = document.getElementById(foco);
  if (novo) novo.focus({ preventScroll:true });
}