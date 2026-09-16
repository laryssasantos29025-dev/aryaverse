# Autenticação local

O AryaVerse está configurado para uso pessoal local. O primeiro acesso acontece em `/cadastro` com nome e senha; os acessos seguintes usam `/login`.

A senha nunca é persistida em texto puro. O navegador salva apenas um hash PBKDF2-SHA-256 com salt aleatório e 310.000 iterações, separado do perfil e dos dados de estudo.

Não há recuperação automática por e-mail. Para redefinir manualmente uma senha esquecida em uma instalação local, abra as ferramentas do navegador, remova a chave `arya-local-profile` do Local Storage do site e acesse `/cadastro` novamente. Essa operação remove somente o perfil de acesso local.

Como esta autenticação é local e não possui servidor de credenciais, ela não deve ser usada para disponibilizar uma instalação pública na internet.
