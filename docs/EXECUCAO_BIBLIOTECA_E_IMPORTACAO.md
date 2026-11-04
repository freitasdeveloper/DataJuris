# Execução da biblioteca e importação — DataJuris

**Data:** 04/11/2026  
**Branch:** `docs/acervo-juridico-fontes-e-importacao`

## Implementado no repositório
- Novo componente `src/components/LegalLibrary.tsx`.
- Aba Biblioteca conectada ao componente real no `src/App.tsx`.
- Consulta a `documents`, `legal_areas`, `document_types` e `document_files`, mostrando somente documentos com status `published`.
- Busca por título, resumo, área, tipo e fonte; filtro por categoria.
- Download de arquivos por URL assinada temporária; para registros sem arquivo local, abre a URL da fonte externa.
- Estados de carregamento, erro e biblioteca vazia.
- Estilos responsivos adicionados a `src/styles.css`.

## Segurança Supabase
Foi aplicada a migração `202611040007_published_document_storage_read.sql`. O bucket `legal-documents` continua privado. A nova policy permite SELECT por usuários autenticados apenas quando o objeto está vinculado a um registro em `documents` com status `published`. A policy foi verificada em `pg_policies`.

A regra de integridade do banco rejeitou corretamente uma tentativa de criar um documento diretamente como publicado sem metadados de revisão. O registro de referência da Receita Federal foi criado como `draft`, sem forçar aprovação editorial.

## Primeiro registro de referência cadastrado
- **Título:** Modelo de impugnação de pessoa física — Receita Federal.
- **Fonte:** Receita Federal do Brasil.
- **Data indicada pela fonte:** 04/07/2022.
- **URL do arquivo oficial:** https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/formularios/modelos/impugnacao-pf/@@download/file
- **Status:** `draft`.
- **Arquivo no Storage:** não importado.

## Limitação da aquisição dos binários
A página oficial foi aberta, o arquivo foi identificado e seu conteúdo PDF pôde ser lido na visualização web. Porém, a transferência binária pelo ambiente de execução falhou. O conector Supabase disponível nesta sessão oferece SQL/migrações, mas não disponibiliza uma ação de upload de objetos ao Storage. Portanto, não foi possível gravar o PDF nem qualquer outro arquivo binário no bucket.

Também não foi possível baixar em lote os documentos originais do DocJuris. A autorização declarada pelo responsável do DataJuris é tratada como restrita ao acervo DocJuris e não é estendida a terceiros.

## Situação após esta execução
- Biblioteca visual conectada ao Supabase: **implementada no branch**.
- Policy para download autenticado de documentos publicados: **aplicada e verificada**.
- Referência oficial Receita Federal cadastrada: **1 registro em draft**.
- Arquivos binários efetivamente armazenados: **0**.
- Documentos aprovados/publicados nesta operação: **0**.
- Build/testes automatizados: **não executados nesta sessão**.

## Próximo passo para finalizar a importação
Disponibilizar os arquivos em ZIP ou individualmente como anexos nesta conversa, ou habilitar um fluxo de upload autorizado para o bucket. A partir dos arquivos reais, calcular hash SHA-256, validar MIME/tamanho/duplicidade, criar registros e associar os objetos a `document_files`. A aprovação e publicação devem continuar sujeitas à revisão jurídica e de licença.
