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

## Leitor de QR sem CDN em runtime

O fallback `zxing-wasm` baixa o binário `.wasm` durante o uso e, por padrão, da CDN da jsDelivr. Foi verificado em navegador: `https://fastly.jsdelivr.net/npm/zxing-wasm@3.1.2/dist/reader/zxing_reader.wasm`. É o pior lugar possível para uma dependência externa. Quem cai no fallback é exatamente quem não tem `BarcodeDetector` — **Safari no iPhone** e Firefox —, ou seja, o celular mais provável na porta de um evento; e a descoberta de que falta internet pública aconteceria com a fila esperando.

O binário passou a ser servido pelo próprio domínio, copiado do `node_modules` por `scripts/copy-zxing-wasm.mjs` no `predev`/`prebuild`. Copiar em vez de versionar mantém o arquivo casado com a versão instalada; versionado, ele descasaria calado no primeiro `npm update`. É a mesma razão que levou a Inter a ser vendorizada em vez de vir do Google Fonts — a diferença é que aqui a falha não é cosmética, é a portaria parar.

Junto veio o defeito irmão: o loop de decodificação não tratava exceção, então uma falha ao carregar o decodificador rejeitava a promessa e o loop deixava de se reagendar. A câmera continuava exibindo imagem e nunca mais lia nada, sem uma palavra ao operador. Agora a falha interrompe o loop uma única vez e vira mensagem pedindo o código manual, que já está sempre em tela.

## O que o QR carrega

O QR do ingresso contém o `qrContent` assinado pela API, não uma URL. É isso que sustenta o requisito de "código que não possa ser forjado": quem copia a imagem não consegue fabricar outra válida. A consequência é que apontar o app de câmera do sistema operacional para o QR mostra uma cadeia opaca e não abre nada — o consumidor daquele payload é a tela da portaria, que é onde o enunciado pede a leitura por câmera.

Foi considerado embutir uma URL no QR para que qualquer câmera abrisse algo legível. Descartado: para preservar a assinatura, a URL teria de carregar o token inteiro, o que engorda o payload, adensa o QR e piora justamente a leitura à distância na porta — penalizando o usuário principal do código em favor de um caso secundário. Quem precisa *ver* o ingresso tem o link de compartilhamento para `/ticket/[code]`.

## Link de compartilhamento montado no frontend

`GET /tickets/mine` devolve `shareUrl`, e o exemplo do `05-ingressos-e-portaria.md` passa esse campo direto para `navigator.share`. Seguir o exemplo à risca compartilha `https://<api>/tickets/TKT-...`, que responde **JSON**: quem recebe o link vê um objeto, não um ingresso. Foi o que aconteceu em produção.

Não é defeito da API — é o único link que ela consegue montar, porque não conhece o endereço deste frontend. Mesma natureza da recomendação de `localStorage` em `02-autenticacao.md`: o doc descreve o que a API resolve sozinha, não o que este projeto deve fazer. O link passa a ser montado sobre a página pública `/ticket/[code]`, que existe exatamente para isso e já renderiza título, data, local, assento, código, status e QR.

O campo continua no tipo, marcado como deliberadamente não usado. Apagá-lo esconderia a pegadinha do próximo leitor, que iria buscá-lo na resposta e usá-lo de novo.

## Contraste conferido por teste, não por comentário

Os tokens traziam a razão de contraste anotada ao lado da cor. Número escrito à mão envelhece calado: quem ajusta uma cor não reabre a calculadora, e a promessa de AA vira folclore. `theme-contrast.test.ts` lê o `globals.css` de verdade, converte `oklch` para sRGB e recalcula 20 pares por tema; a paleta fixa dos 4 estados da portaria é lida do próprio componente.

Todos os pares passam AA nos dois temas — o mais apertado é `muted-foreground` sobre `muted` no escuro, com 4,51:1. Os estados da portaria ficam entre 5,01:1 e 6,70:1. O teste falha com a razão medida na mensagem, então quem baixar um contraste descobre na hora, e não em auditoria.

## Movimento reduzido cobre o que o CSS não alcança

A regra global `scroll-behavior: auto` sob `prefers-reduced-motion` não vale para rolagem pedida por JavaScript com `behavior: "smooth"` explícito — nesse caso o CSSOM manda animar de todo jeito. As setas do carrossel continuavam animando para quem pediu menos movimento. A preferência passou a ser lida por `matchMedia` no próprio componente.

O mesmo ajuste corrigiu um defeito vizinho, encontrado medindo o foco em navegador real: o navegador revela o elemento *focado* — o link — e não o card que o envolve. Com rolagem instantânea ele parava assim que o link cabia e deixava **36 px do último card para fora da trilha**, exatamente para o usuário de teclado que pediu menos movimento. Com rolagem suave o efeito não aparecia, porque a animação terminava no limite da trilha. A trilha agora rola o filho direto no `focus`.

## Alvos de toque e o link que se anuncia botão

Os links soltos "Voltar para eventos" e a marca no painel de autenticação tinham 16 e 20 px de altura. Ganharam padding vertical até os 24 px mínimos da WCAG 2.2 (2.5.8), sem mudar o tamanho do texto. "Entrar" e "Cadastre-se" ficaram como estão: link no meio de uma frase tem isenção explícita no critério, e inflá-los quebraria a linha de texto.

O `Button` renderizado como link (`nativeButton={false}`) expõe `role="button"` no `<a>`, então o leitor de tela anuncia "botão" onde há navegação. É escolha deliberada do Base UI, não descuido: para link ele deixa o Enter com a navegação nativa e adiciona o Espaço no `keyup`, cumprindo o contrato de teclado que o papel promete. Trocar isso significaria abandonar o `Button` nos links e reimplementar as variantes como classe — custo alto, ganho semântico pequeno, e uma inconsistência nova entre botão e link com a mesma aparência. Fica registrado como trade-off aceito.

## Responsividade verificada, não presumida

A largura mínima de 360 px foi conferida em navegador nas duas temperaturas de tema e em três larguras (360, 768, 1280), nas telas públicas e nas de cada papel: nenhuma produz rolagem horizontal na página. Tabela do organizador e mapa de assentos rolam dentro do próprio contêiner, que é o comportamento desejado — o que não pode rolar de lado é o corpo da página.

A verificação foi feita com script de auditoria fora do repositório, dirigindo o servidor de desenvolvimento. Ele não virou dependência do projeto: exigiria navegador baixado no CI para cobrir algo que muda a cada ajuste de layout, e o retorno não paga a manutenção. O que ficou versionado é o que tem resposta objetiva e estável — contraste e comportamento de foco.

## Testes cirúrgicos

A suíte cobre concorrência, idempotência, temporizadores, scanner, estados de validação, parsing de erros, contraste de tema e componentes compartilhados complexos. Não há meta artificial de cobertura nem testes de markup trivial; o objetivo é detectar regressões de comportamento.

Da revisão final saíram três alvos novos, todos de regra e não de aparência: o destino do CTA de compra com `next` preservado por papel, a navegação que não pode exibir atalho de outro papel, e o comportamento do carrossel sob `prefers-reduced-motion`.
