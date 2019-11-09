-- DROP TABLE ios_devices;
CREATE TABLE ios_devices
(
    "time"       timestamp without time zone       NOT NULL,
    device_token text COLLATE pg_catalog."default" NOT NULL
)
