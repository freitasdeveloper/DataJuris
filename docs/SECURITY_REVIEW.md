# Revisão de segurança — DataJuris

Última atualização: 04/11/2026

Este documento registra controles já implantados e riscos que ainda precisam ser testados. Não é laudo, pentest ou certificação de segurança.

## Ativos e ameaças

Ativos principais:
- Contas, perfis, papéis e sessões.
- Documentos jurídicos, anexos, metadados de autoria e licença.
- Submissões, tópicos, posts e denúncias.
- Permissões de moderadores e administradores.
- Credenciais e segredos de infraestrutura.

Ameaças prioritárias:
- Acesso indevido a dados de outros usuários (BOLA/IDOR).
- Escalada de privilégio por alteração de campos de moderação.
- Exposição de arquivos privados ou upload de conteúdo malicioso.
- XSS em documentos, posts e artigos.
- Spam, enumeração de contas e abuso de endpoints.
- Vazamento de informações pessoais/sigilosas.
- Exposição de chaves privilegiadas no bundle do frontend.
- Falha de backup, restauração ou resposta a incidentes.

## Controles implantados e verificados

- RLS habilitado nas 16 tabelas públicas.
- Funções privilegiadas de verificação de papel mantidas no schema não exposto `private`.
- Wrappers públicos de autorização executam como `SECURITY INVOKER`.
- Execução direta de funções internas de moderação revogada para `anon` e `authenticated`.
- Trigger de criação de usuário atribui o papel inicial `student`; o cliente não deve definir papéis privilegiados.
- Bucket `legal-documents` privado, limite de 20 MB e tipos permitidos PDF, DOC, DOCX, ODT, TXT e RTF.
- Upload no Storage limitado à pasta UUID do usuário autenticado.
- Leitura/atualização de arquivos limitada ao proprietário ou staff.
- Não há política de DELETE para clientes; exclusões devem ocorrer por fluxo confiável no servidor.
- Triggers impedem autores de alterar flags de moderação e metadados de revisão/publicação, e restringem status de novas denúncias/submissões.
- Eventos de documentos exigem usuário autenticado e documento publicado.
- Escrita de `audit_logs` não é concedida diretamente a clientes.
- Chave publishable é usada no frontend; não colocar `service_role` ou `sb_secret_*` no bundle, repositório ou variáveis `VITE_*`.
- Última consulta do Security Advisor: zero alertas.

## Riscos e tarefas pendentes

1. **Histórico de migrações:** o conector gerou 15 versões remotas, enquanto o GitHub contém seis arquivos versionados. Reconciliar pelo workflow manual descrito em [SUPABASE_VALIDATION.md](SUPABASE_VALIDATION.md) antes de usar `db push`.
2. **Autenticação:** configurar SMTP, confirmação de e-mail, redirects, recuperação de senha, CAPTCHA/rate limits e MFA para contas privilegiadas.
3. **Testes de autorização:** executar matriz com visitante, usuários A/B, moderador e administrador. Ainda não há contas reais de teste cadastradas no projeto.
4. **Storage:** validar upload, download, substituição e bloqueio de acesso cruzado entre A/B. O fluxo de interface ainda não está integrado.
5. **Frontend:** biblioteca, favoritos e caderno ainda dependem de dados/localStorage; conectar operações ao backend com autorização por usuário.
6. **Conteúdo:** implementar sanitização/escape consistente, CSP e validação server-side de uploads, incluindo análise antimalware antes de publicar arquivos.
7. **Performance RLS:** revisar 18 avisos de initplan usando chamadas estáveis como `(select auth.uid())` onde aplicável, sem alterar a semântica das políticas.
8. **Políticas sobrepostas:** revisar os seis grupos identificados pelo Performance Advisor; consolidar somente após testes de regressão.
9. **Índices:** há 26 índices ainda sem uso observado; não remover sem estatísticas de produção e análise de consultas.
10. **Operação:** ativar backups e testar restauração, logs/alertas, retenção, plano de incidentes e controle de acesso administrativo.
11. **LGPD:** definir controlador/operadores, bases legais, transparência, retenção, canal de titulares e procedimentos de exportação/exclusão.
12. **Qualidade:** executar SAST, revisão de dependências, pentest independente, testes E2E, acessibilidade e carga.

## Critério de liberação

Não habilitar uso comercial enquanto houver falhas críticas/altas sem mitigação ou enquanto os testes de autorização, Storage, Auth, backup/restauração e fluxos críticos não estiverem aprovados e documentados.

O estado atual é uma base inicial endurecida, não uma plataforma pronta para produção.
