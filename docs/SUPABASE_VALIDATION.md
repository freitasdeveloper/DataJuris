# Validação do Supabase — DataJuris

Este roteiro registra o estado real da infraestrutura e os testes que ainda precisam ser concluídos antes de habilitar cadastros públicos ou armazenar documentos reais.

## Estado confirmado em 04/11/2026

- Projeto: `tlpbmatbkdphpvnkprxn`
- URL: `https://tlpbmatbkdphpvnkprxn.supabase.co`
- PostgreSQL remoto: versão 17.11.
- Migrações SQL versionadas no GitHub: seis arquivos, de `202611040001` a `202611040006`.
- Tabelas públicas: 16; RLS habilitado em todas as 16.
- Dados iniciais: 12 áreas jurídicas e 8 tipos de documentos.
- Storage: bucket `legal-documents` privado, limite de 20 MB e allowlist PDF/DOC/DOCX/ODT/TXT/RTF.
- Storage policies: upload na pasta UUID do próprio usuário; leitura e atualização por proprietário ou staff; sem política de exclusão pelo cliente.
- Índices de chaves estrangeiras: 15 criados.
- Integridade: cinco triggers de moderação/revisão instalados.
- Verificação SQL adicional: 6 linhas de evento de trigger (5 triggers distintos), 3 políticas de Storage e 15 índices encontrados.
- Security Advisor: zero alertas na última verificação registrada.
- Performance Advisor: ainda aponta 18 oportunidades de otimização de expressões RLS, 6 políticas permissivas sobrepostas e 26 índices sem uso observado. Não remover índices sem medir tráfego real.

## Arquivos e migrações

1. `supabase/migrations/202611040001_initial_schema.sql`
2. `supabase/migrations/202611040002_security_hardening.sql`
3. `supabase/migrations/202611040003_private_role_helpers.sql`
4. `supabase/migrations/202611040004_private_storage.sql`
5. `supabase/migrations/202611040005_foreign_key_indexes.sql`
6. `supabase/migrations/202611040006_content_integrity_triggers.sql`

Os arquivos acima estão versionados neste repositório. As alterações de schema correspondentes já foram aplicadas ao projeto Supabase por operações do conector e verificadas por consultas ao banco. **Não execute `supabase db push` até concluir a reconciliação do histórico descrita abaixo.**

## Divergência do histórico remoto

O conector Supabase registrou operações individuais com 15 versões geradas automaticamente. O histórico remoto consultado contém:

| Versão remota | Operação |
|---|---|
| `20261104221825` | initial_schema |
| `20261104221843` | security_hardening |
| `20261104221927` | private_role_helpers |
| `20261104222116` | create_private_legal_documents_bucket |
| `20261104222119` | private_storage_upload_policy |
| `20261104222122` | private_storage_read_policy |
| `20261104222126` | private_storage_update_policy |
| `20261104222340` | foreign_key_indexes |
| `20261104222430` | content_integrity_function |
| `20261104222435` | protect_topic_moderation_fields |
| `20261104222437` | protect_post_moderation_fields |
| `20261104222439` | protect_report_status |
| `20261104222440` | protect_submission_moderation_fields |
| `20261104222442` | protect_document_review_fields |
| `20261104222453` | restrict_content_integrity_function |

Isso não corresponde aos seis timestamps dos arquivos do GitHub. A reconciliação precisa retirar do **registro de histórico** as 15 versões geradas e registrar as seis versões dos arquivos como aplicadas. Essa operação é de histórico: `supabase migration repair` não executa nem desfaz o SQL das migrações; altera apenas os registros de controle. Consulte a [documentação oficial do comando](https://supabase.com/docs/reference/cli/supabase-migration-repair).

### Como reconciliar sem instalar nada na sua máquina

Foi adicionado ao repositório o workflow manual:

`.github/workflows/repair-supabase-migration-history.yml`

1. No GitHub, abra **Settings → Secrets and variables → Actions**.
2. Cadastre os secrets `SUPABASE_ACCESS_TOKEN` (token pessoal de acesso do Supabase) e `SUPABASE_DB_PASSWORD` (senha do banco deste projeto). Não coloque esses valores em arquivos, commits ou mensagens.
3. Abra **Actions → Repair Supabase Migration History → Run workflow**.
4. No campo de confirmação, digite exatamente `REPAIR-DATAJURIS-HISTORY`.
5. Confira o log da execução. O workflow mostra o histórico antes e depois da reconciliação.

O workflow aponta explicitamente para o projeto `tlpbmatbkdphpvnkprxn`. Primeiro remove as 15 versões remotas listadas acima do histórico; depois registra como aplicadas as seis versões presentes no GitHub. **Não executa `db push` nem reaplica o schema.** Só execute após conferir que o projeto selecionado é o DataJuris e que o estado do banco continua correspondente aos seis arquivos.

Após a execução, `supabase migration list` deve mostrar as seis versões locais como aplicadas no remoto, sem as 15 versões geradas. Se aparecer qualquer versão inesperada, pare e investigue antes de executar novas migrações.

## Testes automatizados no GitHub

Também foram adicionados:

- `supabase/config.toml`: configuração do projeto para a Supabase CLI e o ambiente de CI.
- `supabase/tests/database/001_schema_security.test.sql`: 13 verificações pgTAP para tabelas, RLS, triggers, funções privilegiadas, Storage, índices e dados iniciais.
- `.github/workflows/database-tests.yml`: inicia um Supabase limpo no runner do GitHub e executa `supabase test db` em cada push/PR para `main`.

O teste automatizado valida a reconstrução do banco a partir dos arquivos versionados. Ele não substitui testes com usuários reais no projeto hospedado.

## Autenticação e testes com contas reais

No momento da última consulta, `auth.users` não continha usuários. Portanto, ainda não foi possível comprovar isolamento entre contas distintas.

No Supabase Dashboard, ainda é necessário:
1. Configurar confirmação de e-mail e SMTP confiável.
2. Cadastrar URLs de redirecionamento do site publicado e dos ambientes de teste.
3. Configurar limites de requisição/CAPTCHA e proteção adequada para contas privilegiadas.
4. Criar duas contas comuns (A e B), uma conta moderadora e uma administradora.
5. Testar cadastro, confirmação, login, logout e recuperação de senha.
6. Executar a matriz abaixo pelo cliente autenticado, sem usar a chave `service_role` no navegador.

## Matriz de testes de autorização

| Cenário | Resultado esperado |
|---|---|
| Visitante consulta documentos publicados | Permitido |
| Visitante consulta rascunhos/submissões | Negado |
| Usuário A lê/edita o próprio perfil | Permitido |
| Usuário A altera perfil de B | Negado |
| Usuário A lê favoritos de B | Negado |
| Usuário A cria favorito próprio | Permitido |
| Usuário A cria documento próprio em rascunho | Permitido |
| Usuário A publica documento diretamente | Negado |
| Usuário A atualiza documento de B | Negado |
| Usuário A envia submissão com prefixo de B | Negado |
| Usuário A cria tópico oculto/travado diretamente | Negado |
| Usuário A cria post em tópico bloqueado/oculto | Negado |
| Usuário comum lê ou injeta `audit_logs` | Negado |
| Moderador gerencia conteúdo conforme a política | Permitido |
| Usuário comum assume papel admin/moderator | Negado |
| Usuário A lê ou altera arquivo de B no Storage | Negado |

Registre data, conta utilizada, resultado e evidência de cada cenário.

## Critérios para liberar

- [x] Seis arquivos SQL versionados no GitHub.
- [x] 16 tabelas públicas com RLS habilitado.
- [x] Bucket privado e três políticas de Storage.
- [x] Cinco triggers de integridade/moderação.
- [x] 15 índices de chaves estrangeiras.
- [x] Testes pgTAP e CI adicionados ao repositório.
- [ ] Workflow de reconciliação do histórico executado e validado.
- [ ] CI de banco concluído com sucesso.
- [ ] Otimizar avisos de initplan e revisar políticas permissivas sobrepostas.
- [ ] Isolamento entre contas A/B e Storage testado.
- [ ] Autenticação, e-mail e recuperação de senha validados.
- [ ] Fluxos reais da interface conectados e testados de ponta a ponta.
- [ ] Backups e restauração testados.
- [ ] Revisão LGPD, monitoramento, resposta a incidentes e testes de carga concluídos.

A infraestrutura de banco recebeu uma base inicial de segurança, mas o DataJuris **não está liberado para uso comercial** enquanto os critérios pendentes não forem concluídos.
