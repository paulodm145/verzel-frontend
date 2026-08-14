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

Na portaria, cada resultado combina cor, texto e ícone próprio. Cor isolada falha para pessoas daltônicas; ícones pequenos falham quando o operador precisa ler a tela a distância.

## Tema por cookie

O tema `light`, `dark` ou `system` fica em cookie e é lido no servidor. O HTML inicial já recebe o atributo correto, evitando flash, script bloqueante e divergência de hidratação.

## Formulários e erros

React Hook Form e Zod fornecem a validação local. Erros estruturados da API são tratados por código, nunca por texto. Paths de validação são traduzidos; erros de corpo e campos desconhecidos aparecem no erro geral em vez de desaparecer silenciosamente.

## Scanner progressivo

O leitor usa `BarcodeDetector` quando disponível e carrega `zxing-wasm` somente como fallback. O input manual permanece visível porque câmera pode ser negada, indisponível ou lenta. Uma trava de dois segundos impede que o mesmo QR produza imediatamente os estados “válido” e “já utilizado”.

## Fontes locais do sistema

A aplicação usa uma pilha de fontes do sistema. Isso elimina chamada externa durante o build, melhora a reprodutibilidade offline e evita que uma ferramenta operacional dependa do Google Fonts para renderizar corretamente.

## Testes cirúrgicos

A suíte cobre concorrência, idempotência, temporizadores, scanner, estados de validação, parsing de erros e componentes compartilhados complexos. Não há meta artificial de cobertura nem testes de markup trivial; o objetivo é detectar regressões de comportamento.
