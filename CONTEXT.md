# Contexto — 8 Health

Aplicativo de acompanhamento de treino e alimentação para hipertrofia.

Cada instalação serve a **uma pessoa**, com seus dados guardados apenas no próprio
aparelho. Mas o app é distribuído a várias pessoas — de modo que nenhum plano, ficha ou
medida de ninguém pode estar embutido no código. O conteúdo de cada um entra por
restauração de backup ou digitação.

Substitui duas coisas que o usuário usava em paralelo: um **plano em PDF**, que dizia
o que fazer, e um **caderno de papel**, onde ele anotava o que fez. A distinção entre
*prescrito* e *realizado* é a espinha dorsal do domínio e aparece em quase todos os termos.

## Glossário

### Exercício

Um movimento, como "Supino Reto (Barra)". Existe por si só, independente de qualquer
plano — é uma entrada na biblioteca, reutilizável entre fichas.

Não confundir com **Exercício da ficha**, que é o uso de um Exercício dentro de uma Ficha.

### Ficha

Um plano de treino nomeado, como "Treino A — Peito e Tríceps": uma lista ordenada de
exercícios com seus alvos. É **prescrito**, duradouro, e editado deliberadamente pelo
usuário — não muda porque um treino foi feito.

Cada Ficha ocupa um **dia da semana** fixo, o que torna possível saber qual é o treino de
hoje sem o usuário escolher. Um dia sem Ficha é um **dia de descanso**.

É a parte do antigo PDF que dizia quais exercícios fazer.

### Exercício da ficha

O uso de um Exercício dentro de uma Ficha, carregando os **alvos** daquele exercício
naquela ficha: quantas séries, qual faixa de repetições, qual carga, quanto descansar.

O mesmo Exercício pode aparecer em várias Fichas com alvos diferentes.

### Alvo

O que a Ficha prescreve — "4 séries de 8 a 10". É uma intenção, não um fato, e pode ser
uma faixa ("8-10") em vez de um número. Nunca é sobrescrito pelo que foi realizado.

Contrasta com **Série**, que é o que de fato aconteceu.

### Sessão

Uma execução de uma Ficha num dia: o treino que você fez. É **realizada**, pertence a uma
data, e é imutável depois de concluída.

É a página do antigo caderno. Uma Ficha gera muitas Sessões ao longo do tempo; é dessa
sequência que sai a noção de progressão.

### Série

Uma execução única dentro de uma Sessão: a carga que foi levantada, as repetições que
foram feitas, e se foi concluída ou não.

O número de Séries realizadas numa Sessão pode diferir do Alvo da Ficha — o usuário pode
adicionar ou tirar séries durante o treino sem que isso altere a Ficha.

### Volume

O número de Séries concluídas por grupo muscular numa semana. É a medida de estímulo que
o usuário de fato acompanha para hipertrofia — "fiz 16 séries de peito essa semana".

Cada Série conta para **um único grupo**: o do Exercício. Um supino conta para peito e não
para tríceps, ainda que o tríceps trabalhe. O número subestima os músculos auxiliares de
propósito, em troca de não exigir que cada exercício declare musculatura secundária.

A semana vai de **segunda a domingo**, acompanhando a rotina do usuário em vez do
calendário.

Não é tonelagem. Quilos movidos são **Carga total**, e a grossura de um músculo é uma
**Circunferência** — nenhum dos dois é Volume.

### Carga total

A soma de carga × repetições das Séries concluídas numa Sessão. É um número de contexto,
não uma meta: sobe e desce conforme quantas séries foram feitas naquele dia.

### Faixa de repetições

O intervalo de repetições que um Exercício da ficha prescreve — 6 a 10. Tem mínimo e máximo
explícitos, e não uma descrição livre, porque o app compara o que foi realizado contra ela.

Pode estar ausente, para exercícios em que repetição não é a unidade (uma prancha, por
exemplo). Nesse caso o app não avalia nada.

### Esforço

O quão difícil uma Série foi, na percepção do usuário: **fácil**, **no limite** ou
**falhei**. É **realizado** e opcional — uma Série sem Esforço registrado é normal, não
incompleta.

Existe porque a decisão de subir a carga depende de algo que os números não capturam: uma
série de 10 pode ter sobrado ou ter sido a última possível.

### Hora de subir

A conclusão de que um Exercício da ficha está pronto para mais carga: todas as Séries
alcançaram o **topo da faixa de repetições**. É uma sugestão, nunca uma alteração — a Ficha
só muda quando o usuário a edita.

Fica retida quando a última Série foi marcada como **falhei**, porque bater o topo no
sacrifício não é o mesmo que estar pronto para subir.

### Recorde

A maior carga já registrada num Exercício. Deriva do histórico de Séries; não é digitado.

### Nota

Um lembrete permanente preso a um **Exercício da ficha** — "pegada aberta", "banco no 3º
furo". É **prescrito**: vale para toda execução daquele exercício naquela Ficha, e aparece
durante a Sessão.

Distinta da **Observação**, que é sobre um dia específico.

### Observação

Um comentário livre sobre uma **Sessão** — "dormi mal", "ombro incomodou". É **realizado**:
pertence àquele dia e não se repete.

### Dia de treino

Um dia em que existe uma Ficha marcada. O oposto é um **dia de descanso**. A distinção não
serve só ao treino: o Plano Alimentar muda com ela, porque alguns Alimentos só valem em
dia de treino.

### Plano Alimentar

A contraparte alimentar da Ficha: a parte do antigo PDF que dizia o que comer. É
**prescrito** e consultado, não registrado — o usuário lê para saber o que fazer, e não
há a intenção de anotar cada refeição consumida.

É único. As variações do dia a dia não geram planos separados; são Alimentos condicionados
ao **dia de treino**.

### Refeição

Uma parte nomeada do Plano Alimentar — "Café da manhã", "Pós-treino" — contendo Alimentos.

### Alimento

Uma linha de uma Refeição: uma quantidade de alguma coisa, como "150g de arroz". Pode
carregar alternativas na própria descrição ("150g frango ou 180g tilápia") e pode valer só
em **dia de treino**.

### Meta Diária

O que o plano manda consumir por dia em calorias e macronutrientes. É **prescrita** pelo
usuário, não calculada — o que os Alimentos somam é um número separado, e os dois podem
discordar. Essa discordância é informação útil, não um erro a ser corrigido
automaticamente.

### Medida Corporal

Um registro datado do corpo: peso e circunferências. Forma série temporal, como as Sessões.

Não inclui a **altura**, que não muda e vive no Perfil.

### Perfil

O punhado de dados do usuário que não formam histórico — hoje, apenas a altura. Existe para
que atributos estáveis não sejam redigitados a cada Medida Corporal.

## Fora do escopo

- **Registro de refeições consumidas.** O Plano Alimentar é consultado, não preenchido.
- **Fotos de progresso.**
- **Contas, login, sincronização, dados compartilhados entre pessoas.** O app é distribuído
  a várias pessoas, mas cada instalação é de um único usuário e não conhece as outras.
- **Prescrição automática.** O app não monta treino nem dieta; ele guarda e apresenta o
  que o usuário definiu.
