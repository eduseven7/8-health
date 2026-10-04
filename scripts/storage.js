/* IndexedDB: sucesso significa transação concluída, não apenas pedido aceito. */
function emTransacao(stores, modo, agendar){
  return new Promise((resolve, reject) => {
    let tx;
    try {
      try { tx = db.transaction(stores, modo, modo === "readwrite" ? { durability:"strict" } : {}); }
      catch (err) { if (!(err instanceof TypeError)) throw err; tx = db.transaction(stores, modo); }
      tx.onabort = () => reject(tx.error || new Error("Gravação cancelada"));
      tx.onerror = () => {}; // o erro aborta a transação; onabort comunica a falha
      const resultado = agendar(tx);
      tx.oncomplete = () => resolve(resultado ? resultado() : undefined);
    } catch (err) {
      if (tx) { try { tx.abort(); } catch (_) {} }
      reject(err);
    }
  });
}
function operacaoDB(store, modo, operacao, ...args){
  return emTransacao(store, modo, tx => {
    const req = tx.objectStore(store)[operacao](...args);
    return () => req.result;
  });
}
const dbAll = s => operacaoDB(s, "readonly", "getAll");
const dbPut = (s, v) => operacaoDB(s, "readwrite", "put", v);
const dbAdd = (s, v) => operacaoDB(s, "readwrite", "add", v);
const dbDel = (s, k) => operacaoDB(s, "readwrite", "delete", k);
const dbClear = s => operacaoDB(s, "readwrite", "clear");

let dadosOcupados = false;
let sessaoNaoSalva = null, revisaoSalvamento = 0, estadoSalvamento = "salvo";
const gravacoesPendentes = new Set();

function mostrarSalvamento(){
  const el = document.getElementById("saveStatus");
  if (el) el.textContent = estadoSalvamento === "erro"
    ? "Não foi possível salvar. Mantenha o app aberto e tente novamente."
    : estadoSalvamento === "salvando" ? "Salvando no aparelho…" : "Salvo neste aparelho";
  const retry = document.getElementById("saveRetry");
  if (retry) retry.hidden = estadoSalvamento !== "erro";
}

/* Cada interação abre a transação imediatamente. O IndexedDB mantém a ordem das
   escritas; uma confirmação antiga nunca confirma uma revisão mais recente. */
function salvarSessao(sess, redraw){
  const revisao = ++revisaoSalvamento;
  sessaoNaoSalva = sess;
  estadoSalvamento = "salvando";
  const escrita = dbPut("sessoes", sess).then(() => {
    if (revisao === revisaoSalvamento){ sessaoNaoSalva = null; estadoSalvamento = "salvo"; }
    return true;
  }).catch(err => {
    console.error("Falha ao salvar sessão", err);
    if (revisao === revisaoSalvamento){
      estadoSalvamento = "erro";
      toast("Não foi possível salvar o treino. Tente novamente.");
    }
    return false;
  }).finally(() => { gravacoesPendentes.delete(escrita); mostrarSalvamento(); });
  gravacoesPendentes.add(escrita);
  if (redraw) render();
  mostrarSalvamento();
  return escrita;
}

async function garantirSessaoSalva(){
  while (gravacoesPendentes.size) await Promise.all([...gravacoesPendentes]);
  if (sessaoNaoSalva && !await salvarSessao(sessaoNaoSalva, false)){
    throw new Error("A sessão ainda não foi salva");
  }
}
function limparEstadoSalvamento(){
  ++revisaoSalvamento;
  sessaoNaoSalva = null;
  estadoSalvamento = "salvo";
}
function recuperarGravacao(){
  if (sessaoNaoSalva && !gravacoesPendentes.size) salvarSessao(sessaoNaoSalva, false);
}
document.addEventListener("visibilitychange", recuperarGravacao);
window.addEventListener("pagehide", recuperarGravacao);

function controlesOcupados(ocupado){
  document.querySelectorAll("button,input,select,textarea").forEach(el => {
    if (ocupado){
      if (!el.disabled){ el.dataset.operationDisabled = "1"; el.disabled = true; }
    } else if (el.dataset.operationDisabled){
      el.disabled = false; delete el.dataset.operationDisabled;
    }
  });
  document.getElementById("app").setAttribute("aria-busy", String(ocupado));
}
async function executarExclusivo(acao){
  if (dadosOcupados) return;
  dadosOcupados = true;
  controlesOcupados(true);
  try { return await acao(); }
  catch (err){ console.error(err); toast("Não foi possível concluir a operação. Tente novamente."); return false; }
  finally { dadosOcupados = false; controlesOcupados(false); }
}