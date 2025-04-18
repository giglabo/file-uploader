DROP TABLE IF EXISTS public.statuses;
CREATE TABLE public.statuses
(
  status_uid uuid PRIMARY KEY        NOT NULL,
  code       character varying(32)   NOT NULL,
  name       character varying(1024) NOT NULL,
  CONSTRAINT statuses_code UNIQUE (code)
)
  WITH (
    OIDS = FALSE
  )
  TABLESPACE pg_default;

COMMENT
  ON TABLE public.statuses
  IS 'statuses';


INSERT INTO public.statuses(status_uid, code, name)
VALUES ('f83ea1ca-61a5-46de-9049-0d6bff0c9e2a', 'ACTIVE', 'Active');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('99b0ef1f-0403-47bb-bc92-c6f3f50f24ca', 'INACTIVE', 'InActive');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('00154f32-1218-4f7d-8e87-64ee5c921212', 'ARCHIVED', 'Archived');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('c4e840f2-9235-4b05-9a02-7989b57311f3', 'DELETED', 'Deleted');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('2c12d5b7-1ab7-4701-964a-f472b0211261', 'BLOCKED', 'Blocked');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('2158c337-25b5-4026-9e48-70435c0e0d7d', 'ACCEPTED', 'Accepted');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('b4cba29e-ec55-4cb1-8644-4c92c77ab738', 'DECLINED', 'Declined');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('c03dba9c-fe6c-4ce0-8968-9bd6562b534c', 'ERROR', 'Error');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('5ad640a2-6083-4e68-9ad9-0ef623a4afc4', 'FAILED', 'Failed');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('79672d40-43d4-4917-bb0b-5aa8c3ced7a1', 'PROCESSED', 'Processed');

INSERT INTO public.statuses(status_uid, code, name)
VALUES ('8866b889-6a2e-4fc8-bea5-3aa953dd3b85', 'UNKNOWN', 'Unknown');

INSERT INTO statuses(status_uid, code, name)
VALUES ('78b89386-5e5c-4db0-aa1f-f5fe28424c2a', 'IN_PROCESS', 'In Process');


ALTER TABLE public.statuses
  ENABLE ROW LEVEL SECURITY;
