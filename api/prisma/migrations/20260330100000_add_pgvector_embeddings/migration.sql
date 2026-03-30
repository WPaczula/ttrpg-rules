-- api/prisma/migrations/20260330100000_add_pgvector_embeddings/migration.sql

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embedding (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding vector(1536) NOT NULL
);

CREATE INDEX idx_document_embedding_category ON document_embedding (category);
CREATE INDEX idx_document_embedding_cosine ON document_embedding
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
