# Revisão de segurança — DataJuris

## Dados e ativos
- Contas, perfis e identificadores de sessão.
- Documentos jurídicos, anexos e metadados de autoria/licença.
- Conteúdo do fórum, denúncias e mensagens de contato.
- Permissões de moderadores e administradores.
- Segredos de infraestrutura e credenciais de integração.

## Principais ameaças
- Acesso indevido a documentos privados ou submissões de outros usuários.
- Escalada de privilégio por alteração de metadados no cliente.
- Upload de arquivos executáveis, malware ou conteúdo ilegal.
- XSS em documentos, posts e artigos.
- Spam, enumeração de contas, abuso de endpoints e scraping.
- Exposição acidental de dados pessoais/sigilosos em fórum.
- Vazamento de chaves privilegiadas no bundle do frontend.
- Restauração de backup incompleta ou indisponibilidade do serviço.

## Controles previstos
- RLS no PostgreSQL e autorização no servidor.
- Papel inicial de usuário atribuído por trigger; privilégios elevados somente por procedimento administrativo.
- Storage privado, limites de tamanho e validação de MIME/conteúdo no backend.
- Sanitização de conteúdo rico e renderização segura.
- Rate limiting, CAPTCHA e verificação de e-mail.
- MFA para contas privilegiadas.
- Auditoria de ações administrativas, gravada por backend confiável (sem INSERT direto por clientes).
- Eventos de documentos registrados apenas por usuários autenticados e vinculados a documentos publicados.
- Submissões com caminho de armazenamento limitado ao prefixo do próprio usuário.
- Criação de tópicos/posts sem permitir estado oculto/travado enviado pelo cliente.
- Segredos apenas no ambiente servidor; chave service_role nunca no frontend.
- Backups com teste de restauração e plano de resposta a incidentes.

## Pontos que exigem revisão antes de produção
1. Testar todas as políticas RLS com usuário anônimo, usuário A, usuário B, moderador e administrador.
2. Revisar políticas do Storage separadamente; as migrações ainda não criam as políticas de bucket.
3. Implementar moderação e trilha de auditoria em todas as operações sensíveis.
4. Verificar escape/sanitização e CSP contra XSS.
5. Configurar limites de requisição e proteção antiabuso.
6. Fazer revisão LGPD, contratos de operadores, retenção e atendimento de titulares.
7. Fazer SAST, dependabot, análise de dependências, pentest e testes de carga.

## Critério de liberação
A plataforma só deve ser liberada quando os itens acima estiverem implementados, testados e documentados, com ausência de vulnerabilidades críticas/altas não mitigadas. 5. Aplicar e validar a migração `202611040002_security_hardening.sql` e executar a matriz de testes em `docs/SUPABASE_VALIDATION.md`.

Este documento é um plano inicial, não um laudo de segurança.
