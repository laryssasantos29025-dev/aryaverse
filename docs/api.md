# API

As rotas serão implementadas via Route Handlers do App Router, protegidas por sessão Supabase e validação Zod.

- `POST /api/studies`: cria um estudo e valida o conteúdo.
- `POST /api/studies/:id/process`: inicia processamento da Arya.
- `GET /api/subjects`: lista matérias do usuário autenticado.
- `POST /api/quizzes/:id/submit`: corrige avaliação e agenda revisões.

Cada rota aplicará rate limiting e retornará erros no formato `{ "error": { "code": "...", "message": "..." } }`.
