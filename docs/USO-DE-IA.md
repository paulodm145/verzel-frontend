# Registro de uso de IA

## Ferramentas utilizadas

- Claude Code: fundação, BFF de autenticação, kit de UI e implementações iniciais dos epics funcionais em branches e worktrees.
- OpenAI Codex: auditoria do repositório, recuperação de trabalho não integrado, conclusão das telas de autenticação, migração para as convenções do Next 16.3, reconciliação entre branches, validação e documentação final.

## Como a IA foi usada

- leitura dos contratos e transformação em componentes, hooks e testes;
- análise de concorrência no refresh e idempotência de reserva/pagamento;
- geração e revisão de código TypeScript/React;
- execução de lint, typecheck, testes e inspeção do histórico Git;
- recuperação seletiva de arquivos deixados em worktrees e resolução de conflitos.

## Controle e rastreabilidade

As decisões não foram aceitas apenas por terem sido sugeridas por IA. Elas foram confrontadas com os contratos em `docs/doc-frontend`, com o spec de arquitetura e com a documentação instalada do Next.js. O histórico preserva commits por domínio e pull requests por epic.

Não existe registro verificável suficiente para atribuir, arquivo a arquivo, quais trechos anteriores foram escritos manualmente sem assistência. Em vez de inventar essa separação, este documento declara a limitação. A seleção final de escopo, a autorização dos merges e a validação visual permanecem sob responsabilidade humana.
