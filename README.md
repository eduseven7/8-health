# 8 Health

Gerenciador de treino pessoal. PWA offline, sem servidor, sem conta, sem nuvem.

Você monta suas fichas uma vez (Treino A, B, C…) e no dia do treino o app abre a ficha
já com a carga e as repetições da última vez — você só confirma ou ajusta. O histórico
de carga vira gráfico de progressão automaticamente.

## Como funciona

- **Fichas** — rotinas com exercícios, séries, repetições-alvo, carga inicial e tempo de descanso.
- **Execução guiada** — cada série tem carga/reps pré-preenchidos com a última execução;
  ao marcar a série, o cronômetro de descanso dispara sozinho e avisa (som + vibração).
- **Progresso** — evolução de carga máxima por exercício e histórico completo de sessões.
- **Dados** — export/import de backup em `.json`.

## Onde os dados ficam

Tudo no **IndexedDB do próprio aparelho**. Nenhuma requisição sai do app —
não há analytics, CDN, fonte externa ou API.

> ⚠️ Como consequência: limpar os dados do navegador, ou trocar de aparelho, **apaga tudo**.
> Use **Dados → Exportar backup** periodicamente. No iPhone o export abre a folha de
> compartilhamento nativa, dá para salvar direto no app Arquivos / iCloud.

## Hospedagem (GitHub Pages)

O projeto é estático e usa apenas caminhos relativos, então funciona em subdiretório
(`https://usuario.github.io/8-health/`) sem ajuste.

1. `Settings → Pages → Source: Deploy from a branch`, branch `main`, pasta `/ (root)`.
2. Abra a URL no celular.
3. **iOS**: Safari → Compartilhar → *Adicionar à Tela de Início*.
   **Android**: Chrome → menu → *Instalar app*.

Depois de instalado, abre em tela cheia e funciona sem internet.

### Publicando uma atualização

O service worker usa *network-first* para HTML/JS, então uma atualização chega na próxima
abertura com rede. Ao mudar arquivos, suba a constante `VERSION` em `sw.js` para
invalidar o cache antigo com certeza.

## Estrutura

```
index.html      app inteiro (HTML + CSS + JS, sem build)
sw.js           service worker / cache offline
manifest.json   metadados do PWA
assets/         ícone e favicon
```

Sem dependências, sem `npm install`, sem passo de build.
