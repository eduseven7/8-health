/* Mapa do corpo: frente e costas, cada região pintada pelo Estímulo da semana.
   Desenho próprio em SVG — funciona offline e cada músculo é uma área tocável.
   Só a metade direita é descrita; a esquerda é o espelho. */

const CORPO_BRACO = [
  ["Ombro", "M127,66 C140,63 151,72 151,87 C151,95 147,101 142,103 C136,97 130,88 126,78 Z"],
  [null,    "M140,105 C148,101 154,105 155,117 C156,131 154,143 150,149 C144,149 140,145 139,137 C138,125 138,113 140,105 Z"],
  ["Antebraço", "M140,153 C148,151 156,153 158,161 C161,177 163,193 161,205 C157,207 153,207 150,205 C145,191 140,171 140,153 Z"]
];
const CORPO_FRENTE = [
  ["Peito", "M101,72 L123,70 C131,76 136,88 134,99 C124,107 110,107 101,103 Z"],
  ["Core", "M101,108 C110,112 123,110 131,104 C133,122 131,142 127,158 C120,166 108,170 101,170 Z"],
  ["Adutores", "M101,193 L113,188 C112,208 110,228 108,246 C104,234 101,216 101,193 Z"],
  ["Quadríceps", "M117,187 L132,179 C138,197 138,225 132,253 C130,263 126,269 120,271 C114,268 111,258 111,246 C113,226 115,206 117,187 Z"],
  ["Panturrilha", "M111,293 C118,289 128,291 131,299 C134,317 130,341 126,363 C122,367 118,367 115,363 C110,341 108,313 111,293 Z"]
];
const CORPO_COSTAS = [
  ["Costas", "M101,63 L110,60 L126,67 C129,80 133,96 133,108 C131,126 127,142 123,152 C115,158 107,160 101,160 Z"],
  ["Glúteo", "M101,166 L124,160 C134,168 137,184 133,198 C125,206 110,206 101,202 Z"],
  ["Posterior", "M103,209 C112,213 124,211 132,205 C137,223 136,245 131,263 C126,271 114,271 108,263 C104,245 102,225 103,209 Z"],
  ["Panturrilha", "M108,291 C116,285 130,287 133,297 C137,315 132,337 126,363 C122,367 118,367 115,363 C108,341 105,311 108,291 Z"]
];
/* Partes sem músculo próprio: só dão forma à silhueta. */
const CORPO_BASE =
  '<ellipse cx="100" cy="28" rx="17" ry="21"/><rect x="91" y="44" width="18" height="18" rx="5"/>' +
  '<path d="M100,58 L110,58 L128,68 L128,110 L132,180 L100,196 Z"/>' +
  '<ellipse cx="121" cy="281" rx="10" ry="10"/><ellipse cx="157" cy="217" rx="7" ry="11"/>' +
  '<path d="M114,366 L128,366 L135,384 C128,388 116,388 112,384 Z"/>';

function figuraCorpo(partes, bracoMeio, est, titulo){
  const formas = partes.concat(CORPO_BRACO.map(p => [p[0] || bracoMeio, p[1]]));
  const base = '<g class="bm-base">' + CORPO_BASE + formas.map(f => '<path d="' + f[1] + '"/>').join("") + '</g>';
  const cor = formas.map(([r, d]) => {
    const g = est.regioes[r], nv = NIVEIS_ESTIMULO[g.nivel];
    return '<path class="bm-m' + (state.regiao === r ? " sel" : "") + '" d="' + d + '" fill="' + nv.cor +
      '" data-a="reg:' + r + '"><title>' + esc(r + ": " + nv.nome) + '</title></path>';
  }).join("");
  const metade = base + cor;
  return '<figure class="bm-fig"><svg viewBox="30 0 140 392" role="img" aria-label="' + esc(titulo) + '">' +
    '<g>' + metade + '</g><g transform="translate(200,0) scale(-1,1)">' + metade + '</g></svg>' +
    '<figcaption>' + esc(titulo) + '</figcaption></figure>';
}

function detalheRegiao(r, g){
  const nv = NIVEIS_ESTIMULO[g.nivel];
  let h = '<div class="bm-det" data-testid="body-region-detail"><div class="row"><i class="bm-dot" style="background:' + nv.cor + '"></i>' +
    '<h3 class="grow">' + esc(r) + '</h3><span class="pill">' + g.feitas + (g.prescritas ? " de " + g.prescritas : "") + ' séries</span></div>' +
    '<div class="ex-meta" style="margin-top:4px">' + esc(nv.nome) +
    (g.nivel === 0 ? ". Nenhuma ficha treina esta região." : g.nivel === 1 ? ". Nenhuma série feita nesta semana." : "") + '</div>';
  h += g.itens.map(i => '<div class="bm-it"><span class="grow trunc">' + esc(i.nome) + '</span>' +
    '<span class="' + (i.melhora ? "up" : "") + '">' + (i.melhora ? ICONS.arrowUp + " " : "") + esc(i.texto) + '</span></div>').join("");
  return h + '</div>';
}

function painelCorpo(){
  const est = estimuloSemana(state.semana);
  const fimLbl = new Date(est.ini); fimLbl.setDate(fimLbl.getDate() + 6);
  if (state.regiao && !est.regioes[state.regiao]) state.regiao = null;

  let h = '<div class="card" data-testid="body-map-card"><div class="wk">' +
    '<button class="icon-btn" data-a="wk:-1" aria-label="Semana anterior">' + ICONS.prev + '</button>' +
    '<span class="lbl">' + (state.semana === 0 ? "Esta semana" : "") + ' ' +
    fmtDataCurta(est.ini) + ' – ' + fmtDataCurta(fimLbl) + '</span>' +
    '<button class="icon-btn" data-a="wk:1" aria-label="Semana seguinte"' + (state.semana >= 0 ? ' style="opacity:.25"' : "") + '>' + ICONS.next + '</button></div>';

  h += '<div class="bm">' + figuraCorpo(CORPO_FRENTE, "Bíceps", est, "Frente") +
    figuraCorpo(CORPO_COSTAS, "Tríceps", est, "Costas") + '</div>';

  if (est.cardioMin > 0) h += '<div class="bm-cardio"><span class="pill" data-testid="body-cardio-minutes">Cardio · ' +
    esc(fmtMin(est.cardioMin)) + ' na semana</span></div>';

  h += state.regiao ? detalheRegiao(state.regiao, est.regioes[state.regiao])
    : '<div class="ex-meta" style="text-align:center;margin-top:10px">Toque numa região para ver os detalhes.</div>';

  h += '<div class="bm-leg" data-testid="body-map-legend">' + [
    [[1], "Relaxado: nada feito"], [[2, 3], "Bom estímulo: parte das séries"],
    [[4, 5, 6], "Intenso: todas as séries; mais escuro se evoluiu"], [[0], "Fora das fichas"]
  ].map(([nvs, txt]) => '<span>' + nvs.map(n => '<i class="bm-dot" style="background:' + NIVEIS_ESTIMULO[n].cor + '"></i>').join("") +
    esc(txt) + '</span>').join("") + '</div></div>';
  return h;
}
