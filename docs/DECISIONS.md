# Decisões de arquitetura e produto

## BFF e sessão em cookies `httpOnly`

A API entrega tokens no corpo, mas o Next dispõe de servidor. O BFF impede que JavaScript do navegador leia access e refresh tokens e concentra renovação, retry e limpeza de sessão. O cookie `vz_user` não é credencial: serve apenas à navegação por papel; a autorização real continua na API.

O refresh é proativo, a 80% da vida do access token, e single-flight por processo. A limitação conhecida é deploy com múltiplas instâncias: sem lock externo, instâncias distintas ainda podem renovar simultaneamente. Redis ou sessão server-side seria a evolução de produção.

## Proxy com allowlist

O proxy encaminha apenas cabeçalhos necessários, incluindo `Idempotency-Key`, em vez de copiar a requisição inteira. Isso reduz o risco de vazar cookies e cabeçalhos internos para a API.

## Idempotência por intenção

Reserva e pagamento geram uma chave quando o usuário toma uma decisão. Retries reutilizam a chave; escolher outro assento ou iniciar novo pagamento gera outra. Assim, duplo clique não duplica a operação e uma nova intenção não reaproveita resultado antigo.

## Separação de estado

TanStack Query guarda dados da API. Zustand guarda apenas seleção de assento, chaves de intenção e preferências de interface. Evitar cópias de dados remotos em store global reduz divergência entre cache e tela.

## UI operacional

A referência é a densidade do AdminLTE: sidebar fixa, cards delimitados, tabelas compactas e uma cor primária sóbria. Foram evitados gradientes, sombras excessivas e ornamentos de landing page porque os fluxos de organização e portaria são operacionais.

Esta regra vale para as áreas autenticadas, não para a vitrine — ver "Dois registros visuais sobre um sistema". O que não se divide é a proibição de gradiente decorativo, emoji como ícone e segunda cor de marca: isso continua valendo em toda a aplicação.

Na portaria, cada resultado combina cor, texto e ícone próprio. Cor isolada falha para pessoas daltônicas; ícones pequenos falham quando o operador precisa ler a tela a distância.

## Shells por contexto

A vitrine, as áreas autenticadas e a portaria usam cascas distintas. Home, catálogo e detalhe são públicos e priorizam descoberta; cliente e organizador recebem somente a navegação do próprio papel; a portaria elimina a sidebar para preservar área e foco no scanner. O proxy protege operações e áreas privadas, enquanto o catálogo permanece acessível sem sessão.

Pôsteres usam proporção `2:3` com `object-contain`, inclusive nos fallbacks, para preservar a arte e evitar mudança de layout. A autenticação aceita `next` apenas quando ele é um caminho interno e o mantém entre login e cadastro, permitindo retomar o checkout sem criar redirecionamento aberto.

A área pública adota composição editorial inspirada em catálogos de streaming, sem importar a estética operacional para a vitrine. Um evento real ocupa o destaque, pôsteres formam a navegação visual e metadados ficam subordinados ao título. Foram removidas bordas de cards e caixas promocionais; separação acontece por escala, espaço e contraste de superfície. A imagem ampliada no destaque é decorativa, enquanto o pôster `2:3` continua inteiro para não sacrificar informação. Não há gradiente decorativo nem nova cor de marca: isso preserva a identidade sóbria e evita a aparência genérica de landing page gerada.

## Dois registros visuais sobre um sistema

A vitrine e o painel têm trabalhos opostos: uma precisa dar vontade de entrar, o outro precisa deixar operar rápido. Aplicar a densidade operacional à vitrine a torna um relatório; aplicar o respiro da vitrine ao painel reduz quantas linhas o organizador enxerga por tela. Por isso os dois registros convivem — streaming no público, densidade nas áreas autenticadas — sobre tokens, tipografia, raio, espaçamento e componentes de formulário idênticos. É o mesmo sistema em dois registros, não dois temas concorrentes.

A superfície escura da vitrine vem de um par de tokens `--cinema` que permanece escuro nos dois temas, em vez de forçar `dark` na área pública. Forçar o tema quebraria a escolha de três estados guardada em cookie; o par de tokens dá o clima cinematográfico sem tirar do usuário o controle do tema.

## Carrossel sem biblioteca e sem rotação automática

A trilha horizontal usa `scroll-snap` nativo. Uma biblioteca de carrossel entregaria arrasto com inércia ao custo de uma dependência num projeto que até aqui construiu o próprio kit — e o navegador já resolve arrasto, momentum e acessibilidade de rolagem melhor do que um reimplementador.

Nada rotaciona sozinho. Banner automático move conteúdo sob o cursor de quem estava lendo, exige tratamento de pausa em hover e foco, e é uma das causas clássicas de reclamação de acessibilidade. O movimento é sempre iniciado pelo usuário, as setas são atalho e não o único caminho, e `prefers-reduced-motion` desliga a rolagem suave.

Existe **uma** fileira, não várias. `GET /events` oferece apenas busca e paginação: não há eixo de popularidade, gênero ou recomendação. Fileiras como "Populares" ou "Recomendados para você" seriam rótulos sobre dados que a API não expressa — vistosas e falsas. Pelo mesmo motivo o painel do organizador não ganhou cards de contagem por status: `GET /events/mine` aceita só `search`, `skip` e `take`, e o número teria de ser inventado ou obtido varrendo todas as páginas.

## Tema por cookie

O tema `light`, `dark` ou `system` fica em cookie e é lido no servidor. O HTML inicial já recebe o atributo correto, evitando flash, script bloqueante e divergência de hidratação.

## Formulários e erros

React Hook Form e Zod fornecem a validação local. Erros estruturados da API são tratados por código, nunca por texto. Paths de validação são traduzidos; erros de corpo e campos desconhecidos aparecem no erro geral em vez de desaparecer silenciosamente.

## Scanner progressivo

O leitor usa `BarcodeDetector` quando disponível e carrega `zxing-wasm` somente como fallback. O input manual permanece visível porque câmera pode ser negada, indisponível ou lenta. Uma trava de dois segundos impede que o mesmo QR produza imediatamente os estados “válido” e “já utilizado”.

## Fontes locais

A regra é ausência de dependência externa, não ausência de fonte própria. A versão anterior desta decisão adotava a pilha do sistema, mas o CSS já pedia `Inter` sem carregá-la: na prática o projeto não cumpria nem uma coisa nem outra, e a hierarquia tipográfica variava conforme o sistema operacional de quem abrisse.

Os arquivos da Inter passam a ser versionados no repositório e carregados por `next/font/local`. Não há chamada ao Google Fonts em build nem em runtime, o clone continua reprodutível offline, e o resultado deixa de depender do que está instalado na máquina do avaliador. `next/font/google` foi descartado justamente por baixar a fonte durante o build.

## Testes cirúrgicos

A suíte cobre concorrência, idempotência, temporizadores, scanner, estados de validação, parsing de erros e componentes compartilhados complexos. Não há meta artificial de cobertura nem testes de markup trivial; o objetivo é detectar regressões de comportamento.
