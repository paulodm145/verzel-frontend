# Registro de uso de IA

## Ferramentas utilizadas

- Claude Code: fundação, BFF de autenticação, kit de UI e implementações iniciais dos epics funcionais em branches e worktrees; depois, modernização visual, revisão de acessibilidade e correções encontradas em produção.
- OpenAI Codex: auditoria do repositório, recuperação de trabalho não integrado, conclusão das telas de autenticação, migração para as convenções do Next 16.3, reconciliação entre branches, validação e documentação final.

## Como a IA foi usada

- leitura dos contratos e transformação em componentes, hooks e testes;
- análise de concorrência no refresh e idempotência de reserva/pagamento;
- geração e revisão de código TypeScript/React;
- execução de lint, typecheck, testes e inspeção do histórico Git;
- recuperação seletiva de arquivos deixados em worktrees e resolução de conflitos;
- auditoria de contraste, responsividade e navegação por teclado dirigindo um navegador real, com script fora do repositório (não virou dependência: exigiria navegador no CI para cobrir o que muda a cada ajuste de layout);
- conferência dos próprios testes por mutação — quebrar o código de propósito para provar que o teste falha quando deve.

## Fases posteriores

Depois da primeira entrega funcional, três ciclos foram conduzidos com Claude Code:

**Modernização visual (epic 09).** Dois registros visuais sobre um sistema — vitrine com linguagem de streaming, painel com densidade operacional — sobre tokens, tipografia e componentes de formulário idênticos. A IA implementou; a escolha de manter dois registros em vez de unificar foi decidida antes, com o motivo registrado em `DECISIONS.md`.

**Revisão de acessibilidade, temas e responsividade (09.10).** Conduzida por medição, não por leitura de código: contraste recalculado a partir do `globals.css` e fixado em teste; responsividade a 360/768/1280 px nos dois temas e em todas as telas; ordem de tabulação e foco dirigindo um navegador real. Duas hipóteses da IA foram derrubadas pela medição — o header não estourava a 360 px como ela supôs, e o `snap-mandatory` não era a causa do card cortado no foco. O defeito real era outro: com rolagem instantânea, o navegador revela o link focado e não o card, deixando 36 px de fora.

**Correções encontradas em produção (epic 10).** Achadas usando a aplicação publicada, não em revisão de código:

- o botão de compartilhar entregava o `shareUrl` da API, que aponta para o host da API e responde JSON;
- o leitor de QR baixava seu `.wasm` da CDN da jsDelivr em runtime, quebrando a portaria em Safari/iPhone sem internet pública, e falhava em silêncio;
- o QR carregava o token assinado, que a câmera nativa do celular não sabe abrir.

O último caso é o mais instrutivo sobre o limite da IA aqui. O argumento dela para manter o token era válido — assinatura impede forjar ingresso, e URL com token dentro adensa o QR e piora a leitura à distância. Mas defendia estar tecnicamente correto às custas de ser usável, e insistiu depois de o problema já ter sido relatado. A reversão foi decisão humana, tomada a partir do uso, e está registrada como reversão explícita.

## Controle e rastreabilidade

As decisões não foram aceitas apenas por terem sido sugeridas por IA. Elas foram confrontadas com os contratos em `docs/doc-frontend`, com o spec de arquitetura e com a documentação instalada do Next.js. O histórico preserva commits por domínio e pull requests por epic.

Não existe registro verificável suficiente para atribuir, arquivo a arquivo, quais trechos anteriores foram escritos manualmente sem assistência. Em vez de inventar essa separação, este documento declara a limitação. A seleção final de escopo, a autorização dos merges e a validação visual permanecem sob responsabilidade humana.
