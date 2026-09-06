# 8 Health

Acompanhamento de treino para hipertrofia. PWA offline, sem servidor, sem conta, sem nuvem.

Substitui duas coisas que andavam em paralelo: um **plano em PDF**, que dizia o que fazer,
e um **caderno de papel**, onde se anotava o que foi feito. Essa distinção entre *prescrito*
e *realizado* organiza o app inteiro — o vocabulário está em [`CONTEXT.md`](CONTEXT.md).

## O que ele faz

**Fichas com dia da semana.** Cada ficha ocupa um dia fixo, então o app já sabe qual é o
treino de hoje. Dia sem ficha é dia de descanso — mas você pode iniciar qualquer ficha
quando quiser.

**Execução guiada.** As séries vêm pré-preenchidas com a carga e as repetições da última
vez. Ao marcar uma série, o cronômetro de descanso dispara sozinho e avisa (som + vibração).
Cada série aceita um toque opcional de esforço: *fácil*, *limite* ou *falhei*.

**Hora de subir.** Quando todas as séries da última execução bateram o topo da faixa de
repetições, o exercício aparece marcado com a carga sugerida para a próxima vez. O aviso
fica retido se a última série foi marcada como *falhei* — bater o topo no sacrifício não é
estar pronto para subir. O app nunca altera a ficha sozinho.

**Volume semanal por grupo muscular.** Quantas séries cada grupo levou na semana (segunda a
domingo), com a faixa de referência de 10 a 20 séries marcada. Cada série conta para o grupo
principal do exercício: um supino conta para peito, não para tríceps.

**Progresso.** Recorde por exercício, evolução de carga e histórico de sessões com as notas
do dia.

**Notas.** Uma observação livre por treino ("dormi mal") e uma nota permanente por exercício
da ficha ("pegada aberta"), que reaparece durante a execução.

## Onde os dados ficam

Tudo no **IndexedDB do próprio aparelho**. Nenhuma requisição sai do app — não há analytics,
CDN, fonte externa ou API. Cada instalação serve a uma pessoa e não conhece nenhuma outra.

> ⚠️ Limpar os dados do navegador, ou trocar de aparelho, **apaga tudo**.
> Use **Dados → Exportar backup** de tempos em tempos. No iPhone o export abre a folha de
> compartilhamento nativa, dá para salvar direto no app Arquivos / iCloud.

O arquivo de backup também é como um plano viaja entre aparelhos ou entre pessoas. Ele
contém dados pessoais — **nunca commite um backup neste repositório**, que é público. O
`.gitignore` cobre os nomes usuais, mas o cuidado é seu.

## Hospedagem (GitHub Pages)

Projeto estático, só caminhos relativos: funciona em subdiretório
(`https://usuario.github.io/8-health/`) sem ajuste.

1. `Settings → Pages → Deploy from a branch`, branch `main`, pasta `/ (root)`.
2. Abra a URL no celular.
3. **iOS**: Safari → Compartilhar → *Adicionar à Tela de Início*.
   **Android**: Chrome → menu → *Instalar app*.

### Publicando uma atualização

O service worker é *network-first* para HTML/JS, então a atualização chega na próxima
abertura com rede. Ao mudar arquivos, suba a constante `VERSION` em `sw.js`.

## Estrutura

```
index.html      app inteiro (HTML + CSS + JS, sem build)
sw.js           service worker / cache offline
manifest.json   metadados do PWA
CONTEXT.md      glossário do domínio
assets/         ícone e favicon
```

Sem dependências, sem `npm install`, sem passo de build.

## Estado

Fase 1 (treino) concluída. Próximas: plano alimentar, medidas corporais, e o arquivo de
backup de exemplo documentando o formato.
