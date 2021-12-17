-- Table: public.income_recurring

-- DROP TABLE public.income_recurring;

CREATE TABLE public.income_recurring
(
    income_recurring_id integer NOT NULL DEFAULT nextval('income_recurring_income_recurring_id_seq'::regclass),
    amount numeric(16,2),
    name text COLLATE pg_catalog."default",
    first_occurance date,
    frequency interval
)

TABLESPACE pg_default;

ALTER TABLE public.income_recurring
    OWNER to postgres;