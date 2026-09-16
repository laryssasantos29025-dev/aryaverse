# Banco de dados

Na Fase 1, o banco será hospedado no Supabase (Postgres). Entidades normalizadas previstas: `User`, `Subject`, `Study`, `Summary`, `Quiz`, `Question`, `Answer`, `Flashcard`, `MindMap`, `Revision`, `Attachment` e `StudyStatistics`.

Relações principais: um usuário possui matérias; uma matéria possui estudos; cada estudo pode possuir um resumo, vários flashcards, uma avaliação com questões/respostas, anexos e revisões. Todas as tabelas de domínio devem conter `user_id` para políticas RLS.
