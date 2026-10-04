# 8 Health

Acompanhamento de treino para hipertrofia. PWA offline, sem servidor, sem conta, sem nuvem.

Substitui duas coisas que andavam em paralelo: um **plano em PDF**, que dizia o que fazer,
e um **caderno de papel**, onde se anotava o que foi feito. Essa distinção entre *prescrito*
e *realizado* organiza o app inteiro — o vocabulário está em [`CONTEXT.md`](CONTEXT.md).

## O que ele faz

**Fichas com dia da semana.** Cada ficha ocupa um dia fixo, então o app já sabe qual é o
treino de hoje. Dia sem ficha é dia de descanso — mas você pode iniciar qualquer ficha
quando quiser.

**Duplicação de fichas.** Abra uma ficha em **Planos → Duplicar ficha**. A cópia abre
para revisão com exercícios, ordem, metas, notas e passo de carga preservados, mas sem
dia fixo. Escolha o dia e salve: a ficha original e seu histórico não são modificados.
Cada cópia recebe identificações próprias; nenhuma sessão realizada é duplicada.

**Proteção de alterações.** Ao sair de uma ficha alterada, o app oferece **Salvar e
continuar**, **Continuar editando** ou **Descartar alterações**. Uma falha ao salvar
mantém a edição aberta. Tocar novamente na aba Planos não fecha o editor. Recarregar
ou fechar a página também solicita confirmação quando o navegador permite; isso não
é salvamento automático de rascunhos e não garante recuperação após encerramento
forçado pelo sistema.

**Layout da ficha.** Cada exercício tem seus controles de ordem/remoção no cabeçalho,
sem reduzir a largura dos campos. Séries, faixa de repetições e carga se reorganizam
conforme o espaço disponível; descanso e passo de carga permanecem alinhados mesmo
quando um rótulo ocupa duas linhas. Os campos numéricos têm altura consistente de 48px.

**Navegação estável.** Apenas a área central rola. Cabeçalho, aviso de atualização e
barra Hoje/Planos/Progresso/Dados ficam fora dessa rolagem; a barra lateral termina
antes da navegação inferior. Trocar de área abre o início da tela imediatamente,
sem animação de deslocamento. Atualizações da mesma tela mantêm a posição de leitura.

**Execução guiada.** As séries vêm pré-preenchidas com a carga e as repetições da última
vez. Ao marcar uma série, o cronômetro de descanso dispara sozinho e avisa (som + vibração).
Cada exercício aceita um toque opcional de esforço: *fácil*, *limite* ou *falhei*.
Cada alteração inicia sua gravação imediatamente. A tela mostra quando ela foi
confirmada pelo banco local e permite tentar novamente em caso de falha. Antes de
concluir, exportar, restaurar ou atualizar, o app aguarda as gravações pendentes.
Encerrar o navegador à força ou desligar o aparelho durante uma gravação ainda pode
interrompê-la; nenhum app de navegador consegue garantir esse último instante.

**Hora de subir.** Compara a última execução do mesmo item na mesma ficha, com a mesma
prescrição original (séries, faixa e carga). Só sugere aumento quando todas as séries
estão concluídas, há pelo menos a quantidade prescrita, todas atingiram o topo da faixa
com a mesma carga positiva (não abaixo da prescrita) e não houve esforço *falhei*.
Séries incompletas, retiradas abaixo do alvo, cargas diferentes ou mudanças na prescrição
não geram sugestão. O passo de carga é configurável em cada exercício da ficha
(padrão 2,5 kg), também nos botões +/−. O app nunca altera a ficha sozinho.

Sessões antigas continuam no histórico e podem preencher campos da mesma ficha. Como
não guardavam a prescrição original, não justificam uma sugestão de aumento: ela volta
a ser avaliada após uma nova execução compatível. Adicionar ou retirar séries durante
o treino não altera o alvo original guardado na sessão nem a ficha.

**Volume semanal por grupo muscular.** Quantas séries cada grupo levou na semana (segunda a
domingo), com a faixa de referência de 10 a 20 séries marcada. Cada série conta para o grupo
principal do exercício: um supino conta para peito, não para tríceps.

**Progresso.** Recorde por exercício, evolução de carga e histórico de sessões com as notas
do dia. A lista mostra 40 sessões por vez; **Carregar mais** permite acessar todo o
histórico. Os filtros por ficha e período se combinam: todo o histórico, últimos
7/30/90 dias ou datas personalizadas, com início e fim opcionais. Os dias usam o fuso
local do aparelho; a data final é incluída por inteiro. Fichas excluídas continuam
disponíveis no filtro enquanto tiverem sessões registradas. Os filtros afetam apenas
a lista, não o gráfico de carga nem o painel de volume semanal.

Ao abrir uma sessão, o esforço do exercício aparece junto às séries. Em registros
antigos, sem esforço por exercício, os esforços de cada série continuam exibidos.
Filtros e quantidade carregada são mantidos ao trocar de aba, até recarregar o app;
**Limpar filtros**, restaurar um backup ou apagar os dados reinicia essa seleção.

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

### Restauração confiável

O arquivo é validado antes de mudar qualquer dado: versão, IDs duplicados, referências
das fichas, datas e estrutura dos registros. A substituição acontece em uma única
transação: se qualquer gravação falhar, os dados anteriores permanecem intactos.
Excluir uma ficha ou exercício da biblioteca não invalida seu histórico no backup.
O usuário confirma a quantidade de fichas e sessões antes da substituição.

O export usa formato **v3** e lê todos os registros do banco em uma única transação.
`exercicios`, `fichas`, `sessoes` e `medidas` são listas de registros com `id`;
`perfil` e `dieta` são listas de registros com `k`, preservadas integralmente.
Importações v1 e v2 continuam aceitas; os objetos antigos de perfil/dieta são convertidos
em registros `{k, v}`. Versões desconhecidas são recusadas, sem alterar os dados.
O banco permanece na versão 2: esta atualização não apaga nem recria seus stores.

## Hospedagem (GitHub Pages)

Projeto estático, só caminhos relativos: funciona em subdiretório
(`https://usuario.github.io/8-health/`) sem ajuste.

1. `Settings → Pages → Deploy from a branch`, branch `main`, pasta `/ (root)`.
2. Abra a URL no celular.
3. **iOS**: Safari → Compartilhar → *Adicionar à Tela de Início*.
   **Android**: Chrome → menu → *Instalar app*.

### Publicando uma atualização

Ao mudar arquivos, suba **duas** constantes: `VERSION` em `sw.js` (invalida o cache) e
`APP_VERSION` em `index.html` (é o número exibido em *Dados*).

Quem já tem o app instalado não precisa fazer nada: ao abrir com internet, o app detecta a
versão nova e mostra uma barra **"Nova versão disponível → Atualizar"**. A versão nova fica
esperando até esse toque, para nunca ser trocada no meio de um treino. O app também procura
atualizações sempre que volta ao primeiro plano, e há um botão manual em *Dados*.

> **Nunca desinstale o app para atualizar.** Atualizar preserva os dados; desinstalar os
> apaga — no iOS, remover da Tela de Início leva o armazenamento junto.

## Estrutura

```
index.html      interface e ações (HTML + CSS + JS, sem build)
scripts/        transações, backup, progressão, fichas e histórico
styles/         ajustes responsivos e estrutura de rolagem/navegação
sw.js           service worker / cache offline
manifest.json   metadados do PWA
CONTEXT.md      glossário do domínio
assets/         ícone e favicon
```

Sem dependências, sem `npm install`, sem passo de build.

### Testes de regressão (opcionais)

`tests/test_cycle2.py` verifica duplicação, proteção de edição, histórico, filtros,
esforço e carregamento offline em um contexto isolado, com dados fictícios. Requer
Python e Playwright **apenas para executar os testes**, não para usar o aplicativo.
Com o app servido por HTTP/HTTPS, defina `BASE_URL` e execute:

```sh
python tests/test_cycle2.py
python tests/test_layout.py
```

As capturas ficam em `test_reports/artifacts/`. O app não precisa de mudanças para
executar os testes e nenhum banco de uma instalação pessoal é usado.

`test_layout.py` cobre larguras de campos, alinhamento, scroll, troca de áreas,
prévia estreita de 360px, descanso e cache offline. Nos testes ou novas telas, use
`#contentViewport.scrollTop` em vez de `window.scrollY`: o documento não rola mais.

## Estado

Fase 1 (treino) concluída. Próximas: plano alimentar, medidas corporais, e o arquivo de
backup de exemplo documentando o formato.
