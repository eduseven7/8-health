/* Painel de diagnóstico do layout, para medir no aparelho o que o desktop
   não reproduz (viewport do PWA instalado, áreas seguras, posição da barra).
   Abre e fecha com 5 toques rápidos na data do cabeçalho. Fica ligado entre
   aberturas do app até ser fechado. Não altera dados. */
(function(){
  const CHAVE = "8health:diag";
  let painel = null, toques = [];

  function sonda(css){
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;" + css;
    document.body.appendChild(el);
    const h = el.getBoundingClientRect().height;
    el.remove();
    return Math.round(h * 10) / 10;
  }

  function caixa(id){
    const el = id === "body" ? document.body : document.getElementById(id);
    if (!el) return "—";
    const r = el.getBoundingClientRect();
    return Math.round(r.top) + "→" + Math.round(r.bottom) + " (" + Math.round(r.height) + ")";
  }

  function medir(){
    const de = document.documentElement, vv = window.visualViewport;
    const pos = id => { const el = document.getElementById(id); return el ? getComputedStyle(el).position : "—"; };
    return [
      ["versão", (typeof APP_VERSION !== "undefined" ? APP_VERSION : "?")],
      ["standalone", matchMedia("(display-mode: standalone)").matches + " / " + (navigator.standalone === true)],
      ["screen", screen.width + "×" + screen.height],
      ["innerHeight", innerHeight],
      ["visualViewport", vv ? Math.round(vv.height) + " (top " + Math.round(vv.offsetTop) + ")" : "—"],
      ["html client/scroll", de.clientHeight + " / " + de.scrollHeight],
      ["body", caixa("body")],
      ["100% / vh", sonda("height:100%") + " / " + sonda("height:100vh")],
      ["dvh / svh / lvh", sonda("height:100dvh") + " / " + sonda("height:100svh") + " / " + sonda("height:100lvh")],
      ["safe top / bottom", sonda("height:env(safe-area-inset-top,0px)") + " / " + sonda("height:env(safe-area-inset-bottom,0px)")],
      ["reparos da janela", window.vpReparos ? window.vpReparos.tentativas + " (último " + (window.vpReparos.ultimo || "—") + ")" : "inativo"],
      ["brandbar", caixa("brandbar")],
      ["conteúdo", caixa("contentViewport")],
      ["tabbar", caixa("tabbar") + " " + pos("tabbar")],
      ["scrollY", Math.round(scrollY)],
      ["UA", navigator.userAgent.replace(/^Mozilla\/5\.0 /, "").slice(0, 90)]
    ];
  }

  function desenhar(){
    if (!painel) return;
    painel.innerHTML = '<b>Diagnóstico — print e envie</b>' +
      medir().map(([k, v]) => '<div><span>' + k + '</span> ' + v + '</div>').join("") +
      '<button type="button" data-d="fechar">Fechar</button> · <button type="button" data-d="reparar">Reparar janela</button>';
    painel.querySelector('[data-d="fechar"]').onclick = () => alternar(false);
    painel.querySelector('[data-d="reparar"]').onclick = () => {
      if (window.vpReparar) window.vpReparar();
      setTimeout(desenhar, 300);
    };
  }

  function alternar(ligar){
    if (ligar && !painel){
      painel = document.createElement("div");
      painel.style.cssText = "position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 56px);z-index:200;" +
        "background:rgba(0,0,0,.92);color:#9fe870;border:1px solid #3FB950;border-radius:10px;padding:10px 12px;" +
        "font:11px/1.5 ui-monospace,Menlo,monospace;color-scheme:dark;max-width:520px;margin:0 auto";
      document.body.appendChild(painel);
      desenhar();
    } else if (!ligar && painel){
      painel.remove();
      painel = null;
    }
    try{ ligar ? localStorage.setItem(CHAVE, "1") : localStorage.removeItem(CHAVE); }catch{}
  }

  function iniciar(){
    const data = document.getElementById("todayLabel");
    // cursor:pointer faz o Safari do iPhone tratar o span como tocável;
    // sem isso, o toque não gera click
    if (data){ data.style.cursor = "pointer"; data.style.padding = "8px 0 8px 12px"; data.style.marginTop = data.style.marginBottom = "-8px"; }
    if (data) data.addEventListener("click", () => {
      const agora = Date.now();
      toques = toques.filter(t => agora - t < 2000).concat(agora);
      if (toques.length >= 5){ toques = []; alternar(!painel); }
    });
    addEventListener("resize", desenhar);
    if (window.visualViewport) visualViewport.addEventListener("resize", desenhar);
    addEventListener("scroll", desenhar, { passive: true });
    let ligado = false;
    try{ ligado = localStorage.getItem(CHAVE) === "1"; }catch{}
    if (ligado) setTimeout(() => alternar(true), 600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
