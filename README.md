# AryaVerse

> Para a autenticação local (nome + senha), consulte [docs/local-auth.md](docs/local-auth.md).

Workspace inteligente para estudos. AryaVerse organiza matérias, estudos e revisões em uma experiência de workspace — não de chat.

## Fase atual

Fase 1 concluída visualmente: estrutura Next.js, dashboard responsivo, navegação lateral, fundações de tipos e prompts isolados. Integrações de autenticação e banco estão preparadas para configuração com Supabase.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Lucide, Framer Motion, Supabase, OpenAI, React Hook Form e Zod. O projeto está pronto para deploy na Vercel.

## Executar

1. Copie `.env.example` para `.env.local` e preencha as credenciais quando as integrações forem ativadas.
2. Execute `npm run dev`.
3. Abra `http://localhost:3000`.

## Estrutura

- `src/app`: rotas e layout.
- `src/components`: componentes visuais reutilizáveis.
- `src/features`: módulos por domínio.
- `src/lib`: utilitários e prompts da Arya.
- `src/types`: contratos do domínio.
- `docs`: documentação de API e banco.

Consulte [a documentação do banco](docs/database.md) e [a documentação da API](docs/api.md).
