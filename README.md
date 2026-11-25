# AI Master — E-books e vídeos

Projeto adaptado para uma formação baseada em livros digitais, com vídeos complementares opcionais: 32 títulos indicados, 36 módulos, 2.400 horas planejadas e 7 níveis (o último contínuo). Leitura e fichamento são a base; exercícios e projetos são aplicação. As obras são indicadas por assunto, sem afirmar correspondência integral com todas as tecnologias da formação original. Antes de publicar, confira edições, capítulos, idioma, acesso e licenças. Não foram fornecidos e-books pelo solicitante. Nenhum livro está anexado; o catálogo contém links legais para autores, editoras ou bibliotecas. Alguns títulos exigem compra, assinatura ou login.

## 1. Teste local (sem conta)

Extraia o ZIP e abra a pasta no VS Code. Abra `docs/index.html` ou execute no terminal:

```powershell
cd docs
python -m http.server 8000
```

Acesse http://localhost:8000. Sem credenciais, a aplicação oferece modo local para conhecer a interface, sem login real nem biblioteca privada. Ao configurar o Supabase, o modo local é desativado automaticamente. Exporte um backup do AI Master anterior e importe-o após entrar na conta online para migrar registros.

## 2. Configure o Supabase

Se já configurou a versão online anterior, o esquema SQL é compatível: mantenha o banco e a configuração, faça backup e substitua os arquivos em `docs/`. Não reexecute o schema no banco existente.

1. Entre em https://supabase.com/dashboard e crie **um projeto novo** para AI Master.
2. Abra SQL Editor > New query. Copie todo o conteúdo de `supabase/schema.sql` e execute uma vez. O script cria tabelas, funções, políticas RLS e o bucket privado `ai-master-library`. Não execute em um projeto existente sem revisão; o script não é idempotente.
3. Na opção Connect ou nas configurações de API, copie Project URL e Publishable key (ou a chave anon legada).
4. Edite `docs/config.js`: informe `supabaseUrl` e `publishableKey`. Nunca coloque `service_role`, secret key ou senha do banco no GitHub.
5. Em Authentication > Providers, mantenha Email ativo. Ative confirmação de e-mail; configure SMTP próprio para envio real a alunos (o serviço padrão tem restrições). Configure limites, CAPTCHA e políticas de senha conforme sua necessidade.
6. Em Authentication > URL Configuration, informe o endereço definitivo, por exemplo `https://SEU-USUARIO.github.io/ai-master/`, em Site URL e Redirect URLs. Adicione `http://localhost:8000/` e `http://localhost:8000/index.html` para testes. Use exatamente a URL de entrada.
7. Opcional: configure o provedor Google no Supabase e no Google Cloud conforme a documentação oficial. Depois altere `enableGoogleLogin` para `true` em config.js. Não coloque o segredo OAuth no frontend.

## 3. Publique no GitHub Pages

1. Crie um repositório `ai-master`. Envie as pastas `docs`, `supabase` e o README na raiz (não o ZIP fechado nem seus PDFs privados).
2. Em Settings > Pages > Build and deployment, selecione Deploy from a branch, branch `main`, pasta `/docs`. Salve.
3. Abra o endereço informado pelo GitHub Pages e confira a tela de login. O frontend e currículo são públicos; dados pessoais e arquivos privados são protegidos pelo Supabase.
4. Para teste autenticado local, utilize o servidor Python acima, não `file://`, e configure os redirecionamentos.

GitHub Pages destina-se aqui a um projeto educacional não comercial. Se vender acesso, utilize hospedagem compatível com essa finalidade.

## 4. Crie sua conta administradora

Abra o site, clique Criar conta, confirme o e-mail e entre. A tela deve indicar acesso em análise. No SQL Editor execute (substitua o e-mail):

```sql
select user_id,email,approved,is_admin from public.ai_members;
update public.ai_members set approved=true,is_admin=true
where email='SEU_EMAIL_EXATO';
```

Confira que somente sua conta foi alterada. Clique em Verificar aprovação. O menu Administração aparecerá. Novas contas ficam pendentes até serem aprovadas. Administradores só são definidos pelo SQL Editor. Cada usuário lê sua própria linha; apenas administradores visualizam todos os alunos.

## 5. Biblioteca

**Atualização de instalação existente:** faça backup e execute `supabase/migracao_videos.sql` no SQL Editor antes de substituir os arquivos da pasta `docs`. Não execute novamente `schema.sql` em um banco existente. Em projeto novo, execute somente `schema.sql`. O formato do progresso e os registros anteriores foram mantidos.

Os vídeos ficam separados dos e-books na biblioteca e nos módulos. Não são obrigatórios para concluir o módulo. Nenhum link de vídeo foi pré-cadastrado, pois o administrador seleciona os materiais. O acesso a plataformas externas e sua proteção dependem do provedor. Teste o cadastro, a busca, a abertura e a revogação de acesso a um vídeo com contas distintas antes de publicar.

Em Administração, aprove os alunos. Em Adicionar material, escolha PDF, EPUB, link de e-book ou link de vídeo HTTPS, nível e módulo. Os vídeos podem ser do YouTube, Vimeo ou de outra plataforma com link HTTPS autorizado. Não há upload de vídeos nem reprodução embutida; os links abrem em nova aba. Todo o nível disponibiliza o material a todos os módulos desse nível. Escolha Todos os alunos aprovados ou Somente alunos selecionados. Para o segundo caso, use Conceder acesso após cadastrar. Ocultar/revogar impede novas autorizações de leitura; URLs já emitidas permanecem válidas por até 5 minutos. Para exclusão definitiva de arquivo e metadados, utilize Storage e Table Editor no painel Supabase após ocultar o material (exclua o objeto e a linha de ai_materials).

O catálogo de livros digitais contém links de acesso público e comercial. O login do AI Master não concede acesso a serviços externos. PDF/EPUB privados ficam no bucket privado e recebem URL assinada de cinco minutos. PDF abre no leitor do navegador; EPUB pode exigir leitor externo. Isso não é DRM e não impede cópias ou compartilhamento de link temporário. Para sites de terceiros, o AI Master controla a exibição do link, não o login nem a proteção do site externo. Cadastre somente materiais que você tenha direito de distribuir. Limite de arquivo configurado: 50 MB, sujeito ao plano.

## 6. Progresso

Cada aluno possui uma linha individual (marcadores manuais de página/capítulo, leituras concluídas por módulo e obra, fichamentos, checklists, notas, rubricas, sessões e preferências). Ao importar backup anterior à formação por livros, as conclusões dos módulos são reiniciadas; outros registros são mantidos. Salvamento automático com atraso de 600 ms. Alterações pendentes ficam em cache local separado por projeto e ID do aluno. Para migrar o progresso anterior use Configurações > Importar backup. A revisão detecta conflitos entre dispositivos: exporte backup antes de carregar a versão remota. Não há mesclagem automática nem sincronização em tempo real; nova sessão carrega o estado da nuvem. Em computador compartilhado faça logout e limpe os dados do site quando apropriado. Não armazene dados sensíveis nas anotações. Faça backup periódico.

## 7. Testes obrigatórios antes de abrir inscrições

- Crie duas contas A e B, confirme que ambas ficam pendentes e não acessam materiais. Aprove apenas A; B deve permanecer bloqueada.
- Aprove B. Na conta A registre horas, nota e módulo concluído. Confirme que B não recebe esses dados. Entre em A em outro dispositivo e confira a persistência.
- Publique um PDF para todos e outro restrito apenas a A. B não deve ler metadados nem gerar URL assinada do restrito. Teste por chamadas diretas ao Supabase autenticado como B; não confie somente nos botões escondidos.
- Tente modificar o papel admin ou aprovação usando a conta B: o banco deve negar. Revogue aprovação, oculte arquivos, revogue permissões e teste novamente.
- Teste conflitos de edição simultânea, confirmação de e-mail, recuperação de senha, logout, redirecionamentos, expiração de links e telas móveis.
- Revise políticas de segurança, LGPD, direitos de distribuição, retenção de dados, limites do plano e logs antes de publicar para terceiros.

## Arquitetura

```
docs/
  index.html   currículo e interface adaptada
  ebooks.js    catálogo, tela de leitura, marcadores e busca
  config.js    URL e chave pública do Supabase
  online.js    autenticação, sincronização, biblioteca e administração
  online.css   estilos complementares
  .nojekyll    publicação estática
supabase/
  schema.sql   tabelas, RLS, bucket privado e função de sincronização
```

Dependência online: Supabase JS v2.49.4 via CDN com versão fixa. Para uso duradouro, revise a versão e considere hospedar um bundle auditado. Não há backend Python/Node nem chave de serviço no navegador. Não há pagamentos, certificação formal, DRM ou PDFs comerciais. É uma base de integração, não um serviço já publicado ou auditado. A integração real depende de configuração e testes no seu projeto Supabase.

## Documentação oficial

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/reference/javascript/file-buckets-createsignedurl
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
