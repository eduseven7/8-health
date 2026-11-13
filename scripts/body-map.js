/* Mapa do corpo: frente e costas, cada região pintada pelo Estímulo da semana.
   Desenho próprio em SVG — funciona offline e cada músculo é uma área tocável.
   Só a metade direita é descrita; a esquerda é o espelho. */


/* Cada região pode ter várias formas (as cabeças do músculo), todas da mesma cor. */
const CORPO_BRACO = [
  ["Ombro", "M138,76 C150,77 157,87 157,100 C157,110 155,118 152,124 C147,116 143,105 141,96 C139,88 137,82 138,76 Z"],
  ["Antebraço", "M147,170 C151,166 157,166 161,170 C164,186 168,208 169,228 C165,232 161,232 158,230 C154,212 150,190 147,170 Z"]
];
const CORPO_FRENTE = [
  ["Peito", "M102,82 C110,79 124,78 136,79 C139,86 141,95 141,104 C139,114 132,120 122,122 C114,123 106,121 102,118 Z"],
  ["Bíceps", "M143,113 C147,120 151,126 153,128 C156,138 157,150 156,160 C153,166 148,166 145,160 C142,146 141,130 143,113 Z"],
  ["Core", "M124,126 C130,124 136,120 139,116 C139,134 137,152 134,170 C133,180 134,190 136,198 C130,196 126,190 124,182 Z"],
  ["Core", "M102,126 C108,128 116,128 121,125 L121,140 C115,142 108,142 102,141 Z"],
  ["Core", "M102,145 C108,146 115,146 121,144 L121,159 C115,161 108,161 102,160 Z"],
  ["Core", "M102,164 C108,165 115,165 121,163 L121,178 C115,180 108,180 102,179 Z"],
  ["Core", "M102,183 C108,184 115,184 121,182 C122,196 114,210 102,216 Z"],
  ["Quadríceps", "M127,214 C134,214 138,218 139,226 C141,255 139,282 135,302 C131,300 128,292 127,280 C125,258 125,236 127,214 Z"],
  ["Quadríceps", "M113,218 C118,214 123,214 125,218 C126,240 126,266 124,288 C122,296 118,298 116,290 C113,268 112,242 113,218 Z"],
  ["Quadríceps", "M112,264 C114,276 115,286 117,296 C120,302 122,304 119,308 C114,308 112,302 111,294 C110,282 110,274 112,264 Z"],
  ["Adutores", "M103,227 C106,223 109,221 111,221 C110,236 110,250 110,262 C107,252 104,240 103,227 Z"],
  ["Panturrilha", "M126,321 C132,321 137,328 138,338 C139,354 136,372 131,390 C128,378 126,360 126,344 C126,336 126,328 126,321 Z"],
  ["Panturrilha", "M117,324 C120,321 123,323 124,330 C125,348 124,366 121,386 C117,372 115,350 116,334 Z"]
];
const CORPO_COSTAS = [
  ["Costas", "M101,58 L109,60 C116,67 128,72 137,75 C130,82 120,88 112,92 C108,104 104,116 101,126 Z"],
  ["Costas", "M114,95 C122,91 132,85 139,81 C140,90 140,98 141,106 C134,110 124,110 116,107 Z"],
  ["Costas", "M104,130 C107,120 111,113 115,110 C124,114 134,114 141,111 C140,130 137,150 133,167 C124,171 112,169 104,160 Z"],
  ["Costas", "M101,166 C108,173 120,176 132,172 C132,182 134,190 135,196 C124,190 110,190 101,195 Z"],
  ["Tríceps", "M152,125 C156,132 159,146 159,160 C156,166 152,166 150,160 C149,148 150,136 152,125 Z"],
  ["Tríceps", "M143,113 C147,119 149,124 149,130 C148,142 148,154 147,163 C144,156 142,144 142,132 Z"],
  ["Glúteo", "M101,200 C110,194 124,194 135,200 C139,210 140,224 138,236 C130,244 114,244 103,238 C101,226 101,212 101,200 Z"],
  ["Posterior", "M124,247 C130,247 136,243 138,241 C140,262 139,284 135,304 C131,300 128,292 127,282 C125,270 124,258 124,247 Z"],
  ["Posterior", "M105,243 C110,247 116,249 121,248 C122,262 123,280 122,298 C119,304 115,304 113,298 C110,280 106,262 105,243 Z"],
  ["Panturrilha", "M127,316 C133,318 138,326 138,338 C138,350 135,360 130,366 C128,356 126,344 126,332 Z"],
  ["Panturrilha", "M118,316 C121,316 124,320 124,330 C125,344 124,358 122,368 C118,362 115,350 115,338 C115,328 116,320 118,316 Z"],
  ["Panturrilha", "M123,372 C126,370 129,370 131,370 C131,380 130,390 128,398 L122,398 C121,390 121,380 123,372 Z"]
];
/* Contorno do corpo: dá a forma; os músculos são desenhados por cima. */
const CORPO_BASE = '<path d="M100,6 C112,6 119,16 119,30 C119,40 116,48 110,54 L110,62 C118,68 130,72 138,74 ' +
  'C150,76 157,86 158,100 C160,120 160,140 162,160 C165,180 170,205 171,230 C173,240 174,252 170,262 ' +
  'C166,268 160,266 158,258 C157,248 157,240 157,232 C153,212 149,190 147,170 C145,155 143,140 141,124 ' +
  'C140,140 137,158 134,172 C133,186 137,200 139,214 C142,250 140,285 136,310 C139,330 139,355 133,380 ' +
  'C131,392 131,400 132,406 C138,412 142,418 138,422 L118,422 C116,412 118,404 119,398 C117,372 114,345 116,322 ' +
  'C114,312 114,304 115,296 C113,270 108,245 102,224 L100,222 Z"/>';

function figuraCorpo(partes, est, titulo){
  const formas = partes.concat(CORPO_BRACO);
  const cor = formas.map(([r, d]) => {
    const g = est.regioes[r], nv = NIVEIS_ESTIMULO[g.nivel];
    return '<path class="bm-m' + (state.regiao === r ? " sel" : "") + '" d="' + d + '" fill="' + nv.cor +
      '" data-a="reg:' + r + '"><title>' + esc(r + ": " + nv.nome) + '</title></path>';
  }).join("");
  const metade = '<g class="bm-base">' + CORPO_BASE + '</g>' + cor;
  return '<figure class="bm-fig"><svg viewBox="22 0 156 428" role="img" aria-label="' + esc(titulo) + '">' +
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

  h += '<div class="bm">' + figuraCorpo(CORPO_FRENTE, est, "Frente") +
    figuraCorpo(CORPO_COSTAS, est, "Costas") + '</div>';

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
