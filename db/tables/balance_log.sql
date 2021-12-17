-- Table: public.balance_log

-- DROP TABLE public.balance_log;

CREATE TABLE public.balance_log
(
    balance_log_id integer NOT NULL DEFAULT nextval('balance_log_balance_log_id_seq'::regclass),
    amount numeric(16,2),
    date date
)

TABLESPACE pg_default;

ALTER TABLE public.balance_log
    OWNER to postgres;