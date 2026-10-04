/* Rascunho separado da ficha salva: nenhuma edição altera o plano sem confirmação. */
let baseDaFicha = "", saidaFichaPendente = null, focoAntesDaSaida = null;
function assinaturaFicha(d){
  if (!d) return "";
  return JSON.stringify({ nome:d.nome, diaSemana:d.diaSemana == null ? null : d.diaSemana,
    itens:d.itens.map(it => [it.itemId || "", it.exId, it.series, it.repMin == null ? null : it.repMin,
      it.repMax == null ? null : it.repMax, num(it.carga), it.descanso || 0, it.nota || "", incrementoDoItem(it)]) });
}
function fichaAlterada(){ return !!state.draft && assinaturaFicha(state.draft) !== baseDaFicha; }
function limparEdicaoFicha(){ state.fichaEdit = null; state.draft = null; baseDaFicha = ""; }
function abrirEditorFicha(dados, id, copia = false){
  state.view = "planos";
  state.fichaEdit = id;
  state.draft = JSON.parse(JSON.stringify(dados));
  baseDaFicha = assinaturaFicha(copia ? novoDraft() : state.draft);
  render();
}
function editarFicha(id){
  const f = FICHAS.find(f => f.id === id);
  if (f) abrirEditorFicha({ nome:f.nome, diaSemana:f.diaSemana == null ? null : f.diaSemana,
    itens:f.itens, ordem:f.ordem || 0 }, f.id);
}
function duplicarFicha(id){
  const f = FICHAS.find(f => f.id === id);
  if (!f) return;
  const base = f.nome + " — cópia";
  let nome = base, n = 2;
  while (FICHAS.some(f => f.nome.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"))) nome = base + " (" + n++ + ")";
  const copia = JSON.parse(JSON.stringify(f));
  delete copia.id;
  copia.nome = nome;
  copia.diaSemana = null; // não criar duas fichas agendadas para o mesmo dia sem intenção
  copia.ordem = FICHAS.reduce((m, f) => Math.max(m, f.ordem || 0), -1) + 1;
  copia.itens.forEach(it => { it.itemId = novoItemId(); });
  abrirEditorFicha(copia, "new", true);
  toast("Cópia pronta para revisão. Escolha o dia e salve para criar.");
}
function atualizarIndicadorFicha(){
  const el = document.getElementById("draftStatus");
  if (el) el.textContent = fichaAlterada() ? "Alterações não salvas" :
    state.fichaEdit === "new" ? "A ficha será criada ao salvar" : "Nenhuma alteração pendente";
}

function confirmarSaidaFicha(){
  if (!fichaAlterada()) return Promise.resolve(true);
  if (saidaFichaPendente) return Promise.resolve(false);
  focoAntesDaSaida = document.activeElement;
  return new Promise(resolve => {
    saidaFichaPendente = resolve;
    openModal("Alterações não salvas",
      '<div class="stack"><p data-testid="draft-exit-message">Você alterou esta ficha. Salve antes de continuar ou descarte as alterações.</p>' +
      '<button class="btn btn-primary" data-a="draft-save-exit" data-testid="draft-save-exit">Salvar e continuar</button>' +
      '<button id="draftKeep" class="btn btn-ghost" data-a="draft-keep" data-testid="draft-keep">Continuar editando</button>' +
      '<button class="btn btn-danger" data-a="draft-discard" data-testid="draft-discard">Descartar alterações</button></div>');
    document.getElementById("draftKeep").focus();
  });
}
function concluirSaidaFicha(aceita){
  const resolve = saidaFichaPendente;
  saidaFichaPendente = null;
  closeModal();
  if (!aceita && focoAntesDaSaida && focoAntesDaSaida.isConnected) focoAntesDaSaida.focus();
  focoAntesDaSaida = null;
  if (resolve) resolve(aceita);
}
document.addEventListener("keydown", ev => {
  if (!saidaFichaPendente) return;
  if (ev.key === "Escape") { ev.preventDefault(); if (!dadosOcupados) concluirSaidaFicha(false); }
  if (ev.key === "Tab"){
    const botoes = [...document.querySelectorAll("#modal button:not(:disabled)")];
    if (!botoes.length) { ev.preventDefault(); return; }
    const i = botoes.indexOf(document.activeElement);
    if (i < 0 || (ev.shiftKey && i === 0) || (!ev.shiftKey && i === botoes.length - 1)){
      ev.preventDefault(); botoes[ev.shiftKey ? botoes.length - 1 : 0].focus();
    }
  }
});
// Registrar após os handlers dos campos: microtasks podem rodar ENTRE listeners
// de eventos nativos, antes que o rascunho receba o valor digitado.
function observarEdicaoFicha(){
  ["input", "change"].forEach(tipo => document.addEventListener(tipo, atualizarIndicadorFicha));
}