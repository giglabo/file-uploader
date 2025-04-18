DROP TABLE IF EXISTS upload_files;
DROP TABLE IF EXISTS uploads;

CREATE TABLE uploads
(
  upload_uid      uuid PRIMARY KEY         NOT NULL DEFAULT uuid_generate_v4(),
  root_user_uid   uuid                     NOT NULL,
  hash            varchar                  NOT NULL,
  meta_data       jsonb                    NOT NULL DEFAULT '{}',
  status_uid      uuid                     NOT NULL,
  ts              timestamp WITH TIME ZONE NOT NULL DEFAULT NOW(),
  uts             timestamp WITH TIME ZONE NULL     DEFAULT NOW(),
  CONSTRAINT uploads_uniq01 UNIQUE (upload_uid, root_user_uid),
  CONSTRAINT uploads_uniq02 UNIQUE (hash, root_user_uid),
  CONSTRAINT system_users_root_users_status_uid FOREIGN KEY (status_uid)
    REFERENCES statuses (status_uid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
);

CREATE
  INDEX idx01_uploads
  ON uploads USING btree
    (root_user_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx02_uploads
  ON uploads USING btree
    (status_uid)
  TABLESPACE pg_default;


ALTER TABLE uploads
  ENABLE ROW LEVEL SECURITY;

--upload_files
CREATE TABLE upload_files
(
  upload_file_uid    uuid PRIMARY KEY         NOT NULL DEFAULT uuid_generate_v4(),
  upload_uid         uuid                     NOT NULL,
  root_user_uid      uuid                     NULL,
  status_uid         uuid                     NOT NULL,
  meta_data          jsonb                    NOT NULL DEFAULT '{}',
  s3_multipart_upload_key varchar NOT NULL DEFAULT '',
  s3_object_key           varchar NOT NULL DEFAULT '',
  download_url       varchar                  NULL,
  file_name          varchar                  NOT NULL,
  file_size          bigint                   NOT NULL DEFAULT 0,
  checksum           varchar                  NOT NULL DEFAULT '',
  checksum_algorithm varchar                  NOT NULL DEFAULT 'custom',
  ts                 timestamp WITH TIME ZONE NOT NULL DEFAULT NOW(),
  uts                timestamp WITH TIME ZONE NULL     DEFAULT NOW(),
  CONSTRAINT upload_files_upload_uid FOREIGN KEY (upload_uid)
    REFERENCES uploads (upload_uid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT upload_files_status_uid FOREIGN KEY (status_uid)
    REFERENCES statuses (status_uid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
)
  WITH (
    OIDS = FALSE
  )
  TABLESPACE pg_default;

CREATE
  INDEX idx01_upload_files
  ON upload_files USING btree
    (status_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx02_upload_files
  ON upload_files USING btree
    (root_user_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx03_upload_files
  ON upload_files USING btree
    (upload_uid, root_user_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx04_upload_files
  ON upload_files USING btree
    (upload_uid)
  TABLESPACE pg_default;

ALTER TABLE upload_files
  ENABLE ROW LEVEL SECURITY;

