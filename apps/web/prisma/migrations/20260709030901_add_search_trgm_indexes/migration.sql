CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS snippets_title_trgm_idx
  ON "snippets" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS snippets_description_trgm_idx
  ON "snippets" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tags_name_trgm_idx
  ON "tags" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS snippets_user_id_idx
  ON "snippets" ("userId");
