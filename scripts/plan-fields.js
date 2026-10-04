function campoNumericoPlano(i, campo, rotulo, valor, attrs = "", classe = ""){
  const id = campo === "incremento" ? "incremento-" + i : "plan-" + campo + "-" + i;
  const testid = campo === "incremento" ? "increment-input-" + i : "plan-item-" + campo + "-" + i;
  return '<div class="plan-field ' + classe + '"><label for="' + id + '" data-testid="' + testid + '-label">' + esc(rotulo) + '</label>' +
    '<input id="' + id + '" type="number" ' + attrs + ' value="' + esc(valor == null ? "" : valor) +
    '" data-f="it-' + campo + '" data-i="' + i + '" data-testid="' + testid + '"></div>';
}
function camposRepeticoesPlano(it, i){
  return '<fieldset class="plan-reps" data-testid="plan-item-rep-range-' + i + '">' +
    '<legend data-testid="plan-item-rep-label-' + i + '">Repetições</legend><div class="plan-range">' +
    '<input type="number" inputmode="numeric" min="1" step="1" placeholder="mín" aria-label="Repetições mínimas" value="' + esc(it.repMin == null ? "" : it.repMin) +
    '" data-f="it-repmin" data-i="' + i + '" data-testid="plan-item-repmin-' + i + '">' +
    '<span aria-hidden="true">–</span>' +
    '<input type="number" inputmode="numeric" min="1" step="1" placeholder="máx" aria-label="Repetições máximas" value="' + esc(it.repMax == null ? "" : it.repMax) +
    '" data-f="it-repmax" data-i="' + i + '" data-testid="plan-item-repmax-' + i + '"></div></fieldset>';
}
function itemDaFicha(it, i, total){
  const ex = exById(it.exId), nome = ex ? ex.nome : "(removido)";
  return '<section class="card plan-item" data-testid="plan-item-' + i + '" aria-labelledby="planItemName-' + i + '">' +
    '<div class="plan-item-head"><h3 id="planItemName-' + i + '" class="plan-item-name" data-testid="plan-item-name-' + i + '">' + esc(nome) + '</h3>' +
    '<div class="plan-item-actions">' +
    '<button class="icon-btn" data-a="item-up:' + i + '" data-testid="plan-item-up-' + i + '" aria-label="Mover exercício para cima"' + (i === 0 ? ' disabled' : '') + '>' + ICONS.up + '</button>' +
    '<button class="icon-btn" data-a="item-down:' + i + '" data-testid="plan-item-down-' + i + '" aria-label="Mover exercício para baixo"' + (i === total - 1 ? ' disabled' : '') + '>' + ICONS.down + '</button>' +
    '<button class="icon-btn remove-item" data-a="item-del:' + i + '" data-testid="plan-item-remove-' + i + '" aria-label="Remover exercício da ficha">' + ICONS.trash + '</button>' +
    '</div></div><div class="plan-primary">' +
    campoNumericoPlano(i, "series", "Séries", it.series, 'inputmode="numeric" min="1" step="1"', "plan-series") +
    camposRepeticoesPlano(it, i) +
    campoNumericoPlano(i, "carga", "Carga (kg)", it.carga, 'inputmode="decimal" min="0" step="0.01" placeholder="kg"', "plan-load") +
    '</div><div class="plan-secondary">' +
    campoNumericoPlano(i, "desc", "Descanso (s)", it.descanso, 'inputmode="numeric" min="0" step="1"') +
    campoNumericoPlano(i, "incremento", "Passo de carga (kg)", incrementoDoItem(it), 'inputmode="decimal" min="0.01" step="0.01" aria-describedby="planHelp-' + i + '"') +
    '</div><p id="planHelp-' + i + '" class="plan-help" data-testid="increment-help-' + i + '">O passo vale para os botões +/− e a sugestão de progressão.</p>' +
    '<div class="plan-note"><label for="planNote-' + i + '" data-testid="plan-item-note-label-' + i + '">Nota (opcional)</label>' +
    '<input id="planNote-' + i + '" type="text" placeholder="Ex.: pegada aberta" value="' + esc(it.nota || "") +
    '" data-f="it-nota" data-i="' + i + '" data-testid="plan-item-note-' + i + '"></div></section>';
}