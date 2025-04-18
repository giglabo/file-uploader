-- Drop triggers
DROP TRIGGER IF EXISTS trigger_copy_uploads_to_archive ON uploads;
DROP TRIGGER IF EXISTS trigger_copy_upload_files_to_archive ON upload_files;

-- Drop functions
DROP FUNCTION IF EXISTS copy_uploads_to_archive();
DROP FUNCTION IF EXISTS copy_upload_files_to_archive();

DROP TABLE IF EXISTS upload_archive_files;
DROP TABLE IF EXISTS upload_archives;

CREATE TABLE upload_archives
(
  upload_archive_uid uuid PRIMARY KEY         NOT NULL,
  root_user_uid      uuid                     NOT NULL,
  hash               varchar                  NOT NULL,
  meta_data          jsonb                    NOT NULL DEFAULT '{}',
  status_uid         uuid                     NOT NULL,
  ts                 timestamp WITH TIME ZONE NOT NULL,
  uts                timestamp WITH TIME ZONE NULL,
  CONSTRAINT upload_archives_uniq01 UNIQUE (upload_archive_uid, root_user_uid),
  CONSTRAINT system_users_root_users_status_uid FOREIGN KEY (status_uid)
    REFERENCES statuses (status_uid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
);

CREATE
  INDEX idx01_upload_archives
  ON upload_archives USING btree
    (root_user_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx02_upload_archives
  ON upload_archives USING btree
    (status_uid)
  TABLESPACE pg_default;


ALTER TABLE upload_archives
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE upload_archive_files
(
  upload_archive_file_uid uuid PRIMARY KEY         NOT NULL,
  upload_archive_uid      uuid                     NOT NULL,
  root_user_uid           uuid                     NOT NULL,
  status_uid              uuid                     NOT NULL,
  meta_data               jsonb                    NOT NULL DEFAULT '{}',
  s3_multipart_upload_key varchar                  NOT NULL DEFAULT '',
  s3_object_key           varchar                  NOT NULL DEFAULT '',
  download_url            varchar                  NULL,
  file_name               varchar                  NOT NULL,
  file_size               bigint                   NOT NULL DEFAULT 0,
  checksum                varchar                  NOT NULL DEFAULT '',
  checksum_algorithm      varchar                  NOT NULL DEFAULT 'custom',
  ts                      timestamp WITH TIME ZONE NOT NULL,
  uts                     timestamp WITH TIME ZONE NULL,
  CONSTRAINT upload_archive_files_upload_archive_uid FOREIGN KEY (upload_archive_uid)
    REFERENCES upload_archives (upload_archive_uid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  CONSTRAINT upload_archive_files_status_uid FOREIGN KEY (status_uid)
    REFERENCES statuses (status_uid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
)
  WITH (
    OIDS = FALSE
  )
  TABLESPACE pg_default;

CREATE
  INDEX idx01_upload_archive_files
  ON upload_archive_files USING btree
    (status_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx02_upload_archive_files
  ON upload_archive_files USING btree
    (root_user_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx03_upload_archive_files
  ON upload_archive_files USING btree
    (upload_archive_uid, root_user_uid)
  TABLESPACE pg_default;

CREATE
  INDEX idx04_upload_archive_files
  ON upload_archive_files USING btree
    (upload_archive_uid)
  TABLESPACE pg_default;

ALTER TABLE upload_archive_files
  ENABLE ROW LEVEL SECURITY;
---
CREATE OR REPLACE FUNCTION copy_uploads_to_archive()
  RETURNS TRIGGER AS
$$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO upload_archives (upload_archive_uid,
                                 root_user_uid,
                                 hash,
                                 meta_data,
                                 status_uid,
                                 ts,
                                 uts)
    VALUES (NEW.upload_uid,
            NEW.root_user_uid,
            NEW.hash,
            NEW.meta_data,
            NEW.status_uid,
            NEW.ts,
            NEW.uts);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE upload_archives
    SET root_user_uid   = CASE
                            WHEN NEW.root_user_uid IS DISTINCT FROM OLD.root_user_uid
                              THEN NEW.root_user_uid
                            ELSE upload_archives.root_user_uid
      END,
        hash            = CASE
                            WHEN NEW.hash IS DISTINCT FROM OLD.hash
                              THEN NEW.hash
                            ELSE upload_archives.hash
          END,
        meta_data       = CASE
                            WHEN NEW.meta_data IS DISTINCT FROM OLD.meta_data
                              THEN NEW.meta_data
                            ELSE upload_archives.meta_data
          END,
        status_uid      = CASE
                            WHEN NEW.status_uid IS DISTINCT FROM OLD.status_uid
                              THEN NEW.status_uid
                            ELSE upload_archives.status_uid
          END,
        uts             = CASE
                            WHEN NEW.uts IS DISTINCT FROM OLD.uts
                              THEN NEW.uts
                            ELSE upload_archives.uts
          END
    WHERE upload_archive_uid = NEW.upload_uid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_copy_uploads_to_archive
  AFTER INSERT OR UPDATE
  ON uploads
  FOR EACH ROW
EXECUTE FUNCTION copy_uploads_to_archive();

CREATE OR REPLACE FUNCTION copy_upload_files_to_archive()
  RETURNS TRIGGER AS
$$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO upload_archive_files (upload_archive_file_uid,
                                      upload_archive_uid,
                                      root_user_uid,
                                      status_uid,
                                      meta_data,
                                      file_name,
                                      file_size,
                                      checksum,
                                      checksum_algorithm,
                                      s3_multipart_upload_key,
                                      s3_object_key,
                                      download_url,
                                      ts,
                                      uts)
    VALUES (NEW.upload_file_uid,
            NEW.upload_uid,
            NEW.root_user_uid,
            NEW.status_uid,
            NEW.meta_data,
            NEW.file_name,
            NEW.file_size,
            NEW.checksum,
            NEW.checksum_algorithm,
            NEW.s3_multipart_upload_key,
            NEW.s3_object_key,
            NEW.download_url,
            NEW.ts,
            NEW.uts);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE upload_archive_files
    SET upload_archive_uid      = CASE
                                    WHEN NEW.upload_uid IS DISTINCT FROM OLD.upload_uid
                                      THEN NEW.upload_uid
                                    ELSE upload_archive_files.upload_archive_uid
      END,
        root_user_uid           = CASE
                                    WHEN NEW.root_user_uid IS DISTINCT FROM OLD.root_user_uid
                                      THEN NEW.root_user_uid
                                    ELSE upload_archive_files.root_user_uid
          END,
        status_uid              = CASE
                                    WHEN NEW.status_uid IS DISTINCT FROM OLD.status_uid
                                      THEN NEW.status_uid
                                    ELSE upload_archive_files.status_uid
          END,
        meta_data               = CASE
                                    WHEN NEW.meta_data IS DISTINCT FROM OLD.meta_data
                                      THEN NEW.meta_data
                                    ELSE upload_archive_files.meta_data
          END,
        file_name               = CASE
                                    WHEN NEW.file_name IS DISTINCT FROM OLD.file_name
                                      THEN NEW.file_name
                                    ELSE upload_archive_files.file_name
          END,
        file_size               = CASE
                                    WHEN NEW.file_size IS DISTINCT FROM OLD.file_size
                                      THEN NEW.file_size
                                    ELSE upload_archive_files.file_size
          END,
        checksum                = CASE
                                    WHEN NEW.checksum IS DISTINCT FROM OLD.checksum
                                      THEN NEW.checksum
                                    ELSE upload_archive_files.checksum
          END,
        checksum_algorithm      = CASE
                                    WHEN NEW.checksum_algorithm IS DISTINCT FROM OLD.checksum_algorithm
                                      THEN NEW.checksum_algorithm
                                    ELSE upload_archive_files.checksum_algorithm
          END,
        s3_multipart_upload_key = CASE
                                    WHEN NEW.s3_multipart_upload_key IS DISTINCT FROM OLD.s3_multipart_upload_key
                                      THEN NEW.s3_multipart_upload_key
                                    ELSE upload_archive_files.s3_multipart_upload_key
          END,
        s3_object_key           = CASE
                                    WHEN NEW.s3_object_key IS DISTINCT FROM OLD.s3_object_key
                                      THEN NEW.s3_object_key
                                    ELSE upload_archive_files.s3_object_key
          END,
        download_url           = CASE
                                    WHEN NEW.download_url IS DISTINCT FROM OLD.download_url
                                      THEN NEW.download_url
                                    ELSE upload_archive_files.download_url
          END,
        uts                     = CASE
                                    WHEN NEW.uts IS DISTINCT FROM OLD.uts
                                      THEN NEW.uts
                                    ELSE upload_archive_files.uts
          END
    WHERE upload_archive_file_uid = NEW.upload_file_uid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_copy_upload_files_to_archive
  AFTER INSERT OR UPDATE
  ON upload_files
  FOR EACH ROW
EXECUTE FUNCTION copy_upload_files_to_archive();
