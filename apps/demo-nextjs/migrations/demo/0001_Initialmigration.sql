CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.dual
(
  x varchar(1) NOT NULL
);
INSERT INTO public.dual(x)
VALUES ('x');

ALTER TABLE public.dual
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_migrations
  ENABLE ROW LEVEL SECURITY;
