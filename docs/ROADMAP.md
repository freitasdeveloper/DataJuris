# DataJuris — escopo funcional e roadmap

## Referência funcional observada
A inspeção pública do DocJuris identificou: navegação por áreas do Direito; pesquisa na página inicial; listagens de modelos por categoria; título, visualizações e data nas listagens; documentos recentes; apresentação institucional; vídeos; fórum; envio de contribuições; contato e doação. A categoria consultada apresenta uma listagem de modelos e contagens por categoria.

Esta observação serve como referência de produto. Não foram copiados código-fonte, textos institucionais, identidade, imagens ou documentos de terceiros.

## Princípios do DataJuris
1. Identidade visual própria e interface responsiva.
2. Conteúdo jurídico com origem, autoria, data, versão e licença registrados.
3. Nenhum modelo publicado sem revisão/moderação e aviso de que exige adequação ao caso concreto.
4. Privacidade por padrão e controles de acesso por função.
5. Busca rápida, acessível e tolerante a acentos/termos relacionados.
6. Auditoria das operações administrativas e de moderação.

## Módulos planejados

### 1. Portal público
- Página inicial com busca global, áreas, documentos recentes e destaques.
- Páginas institucionais, contato, termos, privacidade e política editorial.
- SEO técnico, metadados, sitemap e páginas acessíveis.

### 2. Biblioteca jurídica
- CRUD de documentos e categorias.
- Metadados: título, resumo, área, subárea, tipo, tags, autor, fonte, licença, versão, data de revisão, formato e status.
- Busca textual, filtros combináveis, ordenação e paginação.
- Visualização segura, download autorizado, favoritos e histórico.
- Contagem de visualizações/downloads sem duplicação artificial.
- Importação em lote e detecção de duplicatas.

### 3. Contas e perfis
- Cadastro, login, recuperação de senha e verificação de e-mail.
- Perfis de estudante, advogado, colaborador, moderador e administrador.
- Preferências, favoritos, histórico e gestão de sessões.
- Exclusão/exportação de dados conforme LGPD.

### 4. Contribuições e moderação
- Formulário de envio com arquivo, autoria, fonte e declaração de direitos.
- Quarentena de uploads, validação MIME, limite de tamanho e antivírus.
- Estados: rascunho, enviado, em revisão, aprovado, recusado e publicado.
- Fila de moderação, comentários internos e trilha de auditoria.

### 5. Comunidade / fórum
- Perguntas, respostas, comentários, tags e busca.
- Denúncia, bloqueio, moderação, rate limiting e prevenção de spam.
- Regras de convivência e aviso contra exposição de dados pessoais/sigilosos.

### 6. Conteúdo editorial
- Artigos, notícias, vídeos e categorias editoriais.
- Autoria, referências, data de publicação/atualização e revisão.
- Não republicar conteúdo de terceiros sem autorização/licença.

### 7. Painel administrativo
- Gestão de usuários, permissões, documentos, categorias, artigos e denúncias.
- Indicadores de uso e relatórios exportáveis.
- Auditoria imutável de ações críticas.

### 8. Assistência por IA (fase posterior)
- Pesquisa semântica e extração de metadados.
- Rascunhos e sumarização com citações de fontes.
- Avisos de incerteza, validação humana obrigatória e registro de modelo/prompt.
- Nunca apresentar saída de IA como aconselhamento jurídico definitivo.

## Arquitetura-alvo
- Frontend: React + TypeScript + Vite (fundação já criada).
- Backend: API REST tipada, autenticação segura e autorização RBAC.
- Banco: PostgreSQL com migrações versionadas.
- Arquivos: armazenamento de objetos privado com URLs temporárias.
- Busca: PostgreSQL full-text inicialmente; mecanismo dedicado se volume justificar.
- Observabilidade: logs estruturados, métricas, rastreamento e alertas.
- Infra: ambientes separados (desenvolvimento, homologação e produção), CI/CD e backups testados.

A escolha final de backend, provedor de hospedagem, banco e storage deve ser validada com custo, escala, região e requisitos de privacidade antes da implantação.

## Modelo de dados inicial
- users, roles, user_roles, sessions
- legal_areas, document_types, tags
- documents, document_versions, document_files, document_tags
- favorites, download_events, view_events
- submissions, moderation_reviews, audit_logs
- forum_topics, forum_posts, forum_reports
- articles, article_categories, media_assets
- contact_messages, consent_records

## Requisitos não funcionais
- Responsivo e utilizável por teclado e leitor de tela.
- WCAG 2.2 AA como meta de acessibilidade.
- Criptografia em trânsito e em repouso.
- Senhas com hash moderno (Argon2id ou equivalente).
- Proteção CSRF/XSS/SQLi, validação server-side e rate limiting.
- Uploads fora da raiz pública, validação de tipo real e antivírus.
- Backups automáticos e teste periódico de restauração.
- Política de retenção, consentimento e atendimento aos direitos LGPD.
- Testes unitários, integração, E2E, segurança e carga.

## Critérios de aceite por módulo
- Operações de criar, ler, atualizar e excluir respeitam permissões.
- Busca e filtros retornam resultados corretos e combináveis.
- Arquivos inválidos, excessivos ou maliciosos são rejeitados.
- Usuários não acessam dados privados de outros usuários.
- Logs permitem rastrear operações críticas sem armazenar segredos.
- Layout funciona em celular, tablet e desktop.
- Testes automatizados passam no pipeline antes de publicação.

## Fases
- [x] Fase 0 — levantamento funcional público e definição de escopo.
- [x] Fase 1 — estrutura inicial React/TypeScript/Vite e protótipo de biblioteca.
- [ ] Fase 2 — API, banco, autenticação e RBAC.
- [ ] Fase 3 — CRUD real de documentos, arquivos, busca e histórico.
- [ ] Fase 4 — contribuição e moderação.
- [ ] Fase 5 — fórum e conteúdo editorial.
- [ ] Fase 6 — painel administrativo, relatórios e auditoria.
- [ ] Fase 7 — hardening, testes, acessibilidade, carga e publicação.

## Limitações explícitas do protótipo
Os registros da biblioteca são demonstrativos. Favoritos usam localStorage no navegador. Cadastro/login, downloads reais, upload, fórum, blog, administração, API e banco de dados ainda não estão implementados. O protótipo não deve ser anunciado como plataforma pronta para uso comercial.
