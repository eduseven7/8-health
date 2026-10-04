# 8 Health — análise e continuidade

> Cópia de `/app/memory/PRD.md` do ambiente Emergent (workout-tracker-1784), onde as versões 1.4.0 a 1.5.2 foram desenvolvidas. Caminhos `/app/...` e `test_reports/` citados abaixo existiam só lá.

## Pedido original

"Estou desenvolvendo um app de treino pessoal para registrar meus treinos na academia, colocar meu plano e ver meu desenvolvimento.
Estou usando github pages para hospedar esse APP em PWA, open source.

Podemos continuar o desenvolvimento desse APP. faça uma análise no nosso código para sugerir melhorias e implementações, e depois prosseguimos"

Usuário confirmou que o código já está no projeto. Prioridades: análise geral com sugestões por prioridade; registro dos treinos e montagem do plano; evolução de cargas e histórico.

## Escopo da análise inicial

Revisão estática funcional, sem implementação de alterações no aplicativo. Foram lidos README.md, CONTEXT.md, manifest.json, sw.js e os trechos centrais de index.html. Revisão complementar realizada pelo code_review_agent em modo somente leitura. Não houve auditoria de segurança, execução dos fluxos no navegador ou validação em aparelhos. Riscos ligados ao ciclo de vida do navegador exigem validação dinâmica futura.

## Primeiro ciclo implementado — versão 1.4.0

Após a análise, o usuário pediu "faça isso" e confirmou explicitamente: "Sim: restauração de backup confiável, salvamento do treino e correção da sugestão de progressão". Não aprovou o restante do backlog neste ciclo.

- **Backup confiável:** `scripts/backup.js` valida formato, versão, IDs, referências das fichas, datas, séries, esforço e unicidade da sessão ativa antes de alterar dados. Importação limpa/grava as seis stores numa única transação. Abortos mantêm o banco anterior. Histórico referenciando fichas/exercícios excluídos é aceito. Exportação v3 lê integralmente as seis stores numa transação; formatos v1/v2 continuam aceitos.
- **Persistência:** `scripts/storage.js` confirma operações apenas em `tx.oncomplete`, usa durabilidade estrita quando suportada e grava cada alteração da sessão imediatamente, sem debounce. Exibe salvando/salvo/erro com retentativa. Conserva rascunho em memória após falha; lifecycle tenta recuperar falhas pendentes. Conclusão, backup e atualização aguardam gravações. Operações críticas bloqueiam interações concorrentes; conclusão só altera o estado após commit, descarte/importação não ressuscitam a sessão antiga.
- **Progressão:** `scripts/progress.js` compara última sessão do mesmo item/ficha, com prescrição original idêntica, todas as séries feitas no topo e quantidade >= alvo, carga homogênea positiva >= prescrita e sem falhei. Guarda `itemId`, `prescrito` e `incremento` nas novas sessões; retirar séries não altera alvo original. Sem usar execução antiga elegível para contornar a última execução incompleta. Históricos legados permanecem acessíveis e podem preencher campos, mas sem snapshot não geram sugestão.
- **Passo configurável:** campo por item da ficha, padrão 2,5 kg, aceita centésimos, usado em sugestões e botões +/−. Testado com 1,25 kg. Validação impede incremento inválido/carga negativa/faixa invertida. CSS mantém legibilidade dos decimais em 390px sem mudar o visual estabelecido.
- **Offline e documentação:** scripts locais incluídos no cache `8health-v9`, isolado por escopo; HTML/scripts ficam na versão instalada até ativação. README e CONTEXT atualizados. Sem dependências de runtime, build, contas ou serviços externos. IndexedDB continua v2; nenhuma recriação do banco.

### Verificação realizada

- Reprodução anterior à correção: backup com dois IDs iguais reduziu 57 exercícios a 1 antes de falhar; uma execução com 1/4 séries gerou sugestão de 42,5 kg indevidamente (contexto isolado de navegador).
- Testing agent: `/app/test_reports/iteration_1.json`, sem bug funcional aberto; cenários v1/v3, validação, rollback atômico real com falha injetada de `IDBObjectStore.add`, falha de put + retry + conclusão, matriz de progressão, passo 1,25 e offline aprovados. Notas de cobertura em `/app/tests/frontend_regression_playwright.md` (notas, não uma suíte executável versionada).
- Verificação final própria: sugestão 4×12 → 41,25 kg; cargas 41.25 visíveis; falha injetada de put exibiu erro/retentativa, recuperação persistiu 42.5 e reload offline retomou 42.5. Screenshots desktop 1920×800 e mobile 390×844, sem overflow. Erro inicial de injeção do próprio harness foi corrigido e o cenário reexecutado com sucesso.
- Sintaxe JavaScript e `git diff --check` verificados. Testes usam dados fictícios, nenhuma API é simulada (não existem APIs no app).
- Limite: sem aparelhos físicos iOS/Android; encerramento forçado durante gravação não pode ser garantido por um navegador. Uso offline comum foi validado em Chromium.
- Prévia servida por supervisor `static-preview` com servidor estático Python apenas neste ambiente; o produto permanece estático e sem requisito Python.

## Segundo ciclo implementado — versão 1.5.0

Usuário pediu "podemos prosseguir" e confirmou "Ambos: duplicar fichas, proteger alterações não salvas, acessar todo o histórico e filtrar por período e ficha". A proposta também incluía corrigir a exibição de esforço no histórico.

- `scripts/plans.js`: duplicação abre nova ficha para revisão, nome único, sem dia fixo, itens com IDs novos; mantém conteúdo e não copia sessões nem altera a original. Só persiste ao salvar.
- Rascunho comparado à base do editor. Ao sair/trocar aba/duplicar/atualizar/importar, modal permite salvar e continuar, manter edição ou descartar. Falhas/validação preservam editor. Mesmo tab Planos não fecha editor. beforeunload considera rascunho; não há promessa de recuperação após encerramento forçado. Modal com foco e Escape/Tab.
- `scripts/history.js`: lotes incrementais de 40, sem teto total, filtros combinados por ficha e todo/7/30/90 dias/personalizado, datas opcionais com final inclusivo no fuso local, erro de intervalo invertido, estados vazios e limpar filtros. Fichas excluídas continuam disponíveis a partir de seus registros. Filtros só afetam lista, não gráficos/volume; mantidos entre abas e resetados no reload/import/wipe.
- Esforço atual por exercício exibido com precedência; esforço legado por série mantido quando não há esforço no exercício. Observações e texto longo quebram linha sem overflow.
- Visual original mantido; selects de filtros empilhados em 390px e datas em duas colunas. Cache `8health-v11` inclui novos scripts. Banco v2/backup v3 permanecem compatíveis.

### Verificação do segundo ciclo

- Reprodução inicial: rascunho perdido ao trocar de aba, apenas 40/55 sessões visíveis e esforço por exercício ausente.
- Teste executável criado pelo testing agent: `tests/test_cycle2.py`, BASE_URL via ambiente, Playwright só para teste. A primeira tentativa do agente travou no próprio seed (deleteDatabase com conexão aberta). Corrigido harness para transação clear+put; o pacote Playwright já estava em `/opt/plugins-venv/bin/python`.
- Execução completa própria da suíte descobriu indicador dirty atrasado um evento; corrigido registro do listener para ocorrer após os handlers no boot. Reexecução passou integralmente: `test_reports/cycle2-validation-final.log` e relatório atualizado `test_reports/iteration_2.json`.
- Verificações complementares por navegador: erro IDB no salvar-e-sair mantém original e rascunho, retentativa permite salvar/navegar, atualização cancelada preserva edição, validação não deixa sair, beforeunload cancelado. Datas São Paulo incluem 00:00 até 23:59:59.999 do dia selecionado e excluem bordas externas. Screenshots 390×844/1920×800 sem overflow, inclusive nomes/observações longos sem espaços.
- Limitações: nenhum aparelho físico iOS/Android. Não há mocks de APIs (app não usa APIs); falhas de banco foram injetadas apenas em contextos de teste isolados.

## Correção de layout — versão 1.5.1

### Pedido original deste ajuste

"aqui na parte de seleção, as repetições, na seleção de repetições, está muito curto. E não está proporcional o passo e etc. um layout um pouco quebrado. Como melhoramos o layout do app?
fora que quando clico em dados, por exemplo, a barra de scroll lateral invade o campo do painel de troca de área, esse espaço com hoje, planos, progresso e dados. E quando eu volto pra outra área, ocorre um leve deslize que não é muito agradável."

Escolhas: manter visual escuro/vermelho, "reorganizar os campos em linhas mais espaçosas, padronizar os controles e separar a rolagem da barra inferior". Ambiente: "Na prévia aqui, pelo computador". Usuário exigiu validação do testing_agent após a correção antes da conclusão.

### Implementado

- Design incremental seguindo `design_guidelines.json`, preservando cores e tipografia existentes.
- Campos em `scripts/plan-fields.js`: cabeçalho com ações 42×42, campos numéricos 48px de altura, repetição com mínimo/máximo legíveis, carga decimal sem corte, descanso/passo na mesma base. Layout em linhas responsivas, com range ocupando linha inteira em containers estreitos; `align-items:end` mantém alinhamento quando rótulos quebram linha.
- `styles/layout.css`: documento limitado à viewport, flex shell e área `#contentViewport` independente. Navbar fixa fica fora da rolagem; gutter estável e barra fina escura sem mudar largura entre telas. Cabeçalho/aviso de atualização fora da área rolável, sem sobreposição entre eles.
- `render()` preserva scrollTop na mesma tela e volta instantaneamente ao topo ao mudar tela. Não usar window.scrollY para UI nova. Elementos de navegação são mantidos, não recriados a cada render. Respeita reduced-motion.
- Descanso mantém espaço reservado conforme altura medida, nome limitado visualmente a duas linhas, sem cobrir controles finais ao rolar até o fim.
- Versão app 1.5.1, SW 8health-v13 inclui novo JS/CSS. Sem migração de banco nem mudança no formato de backup.

### Reprodução e verificação independente

- Antes: campos de reps 26.05px em 390px; documento tinha 1064px para viewport 844px e a barra do documento ultrapassava a região da navbar.
- Testing agent iteration 3: ajustes principais passaram. Aparente salto ao reordenar 0→449 era falso positivo do teste: Playwright rolava até o botão fora de vista ANTES do clique. Instrumentação e validação independente iteration 4 confirmaram before/pointerdown/click/after=449, delta 0; corrigido apenas o harness, não mascarado no app.
- Iteration 4 encontrou desalinhamento real de descanso/passo em iframe 360 devido ao rótulo longo. CSS alinhado pela base; SW atualizado para v13.
- **Validação final obrigatória:** `/app/test_reports/iteration_5.json`, testing_agent, todos L1-L5 aprovados. Campos mobile 52.88px de largura/48px de altura; iframe 360 range 120.55px e descanso/passo topDelta 0/altura 48; nenhum overflow; navegação sem deslocamento X/Y; rootY 0 e scrollbar termina na navbar.
- `tests/test_layout.py` criado/atualizado pelo agente: versão SW lida do código, pré-scroll correto antes de medir reordenação, inspeção de DOM/navegação/mobile/frame360/offline.
- Sem autenticação/APIs/mocks. Apenas fixtures isoladas. Não houve teste em aparelhos físicos; o ambiente reportado pelo usuário (prévia desktop) foi coberto.

## Ajuste pontual do aviso — versão 1.5.2

Pedido: "no PC, o bloco nova versão disponível não está centralizada, centralize-a, simplismente isso". Usuário confirmou somente centralização horizontal, preservando tamanho/aparência/restante do layout.

- Alterada apenas a regra base `#updbar` em index.html: margens fixas laterais substituídas por `width:calc(100% - 36px); margin:0 auto 10px`. Mantidos max-width 604px, cores, padding, botão e demais componentes.
- APP_VERSION 1.5.2 e SW 8health-v14 atualizados para renovação do cache. Nenhuma alteração de dados/funcionalidades.
- Validação independente: testing_agent `/app/test_reports/iteration_6.json`, todos checks solicitados aprovados.

## Arquitetura atualizada

- PWA estático em HTML/CSS/JavaScript, sem dependências nem build. Interface/ações em index.html; scripts/storage.js, backup.js, progress.js, plans.js, history.js e plan-fields.js; layout complementar em styles/layout.css; cache offline em sw.js e metadados em manifest.json.
- IndexedDB OitoHealthDB v2: exercicios, fichas, sessoes, medidas, perfil e dieta. Dados apenas no aparelho.
- Preservar caminhos relativos, execução offline, ausência de contas/nuvem e distinção entre ficha prescrita e sessão realizada.
- Não há necessidade identificada de migrar para React, introduzir servidor ou serviços externos.
- A separação local apenas das três áreas alteradas foi realizada; a extração das demais telas segue no backlog.

## Backlog da análise — situação após os ciclos

### P0 — integridade dos dados

1. **Concluído e verificado:** restauração atômica e validada, com preservação dos dados anteriores em qualquer falha de escrita.

### P1 — confiabilidade e fluxos de treino/plano/progresso

1. **Concluído e verificado em navegador:** persistência imediata, confirmação de transação e recuperação de falha. Validação física iOS/Android ainda não realizada.
2. **Concluído e verificado:** progressão por item/ficha/prescrição original e incremento configurável; nenhum ajuste automático da ficha.
3. **Concluído no ciclo 2:** esforço no histórico, com compatibilidade de séries legadas.
4. **Concluído no ciclo 2:** histórico sem teto, carregar mais e filtros de período/ficha. Filtro por exercício é extensão futura.
5. **Concluído no ciclo 2:** validação e proteção de rascunho ao sair; não inclui autosalvamento persistente de rascunhos.
6. Remoção de série: última série é removida mesmo concluída. Adicionar desfazer ou confirmação para série já registrada.
7. Exercício repetido na mesma sessão: cadastro de itens permite duplicação, mas recorde e chartCarga usam find, ignorando ocorrências posteriores. Definir identidade de item da ficha e agregar todas as ocorrências nas métricas, ou bloquear duplicação explicitamente.

### P2 — evolução e manutenção

- Arquivamento de fichas e compartilhamento somente do plano.
- Gráficos com datas/valores consultáveis, filtros e comparação de carga + repetições; preservar volume como número de séries, separado de carga total.
- Tratar duas fichas no mesmo dia explicitamente: fichaDoDia retorna apenas a primeira.
- Falta validação física de atualização do SW e uma suíte versionada para múltiplos subdiretórios.
- Acessibilidade: permitir zoom (viewport em index.html), rótulos em controles e gestão de foco nos modais.
- Separar persistência, métricas, backup e telas em arquivos locais, mantendo ausência de build e atualizando a lista de arquivos offline.
- Testes automatizados de restauração com falha, migrações, sessão retomada, métricas, exercícios duplicados e histórico longo. Documentar contribuição e licença open source caso ausente.
- Plano alimentar e medidas corporais: adiar até consolidar treino e histórico.

## Próxima etapa sugerida

Aguardar nova escolha: comparar sessões; proteger remoção de séries concluídas; corrigir agregações para movimentos repetidos; arquivar/recolher fichas longas. Não ampliar para alimentação, medidas corporais ou sincronização sem novo pedido.
