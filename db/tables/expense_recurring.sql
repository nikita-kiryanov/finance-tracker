-- Table: public.expense_recurring

-- DROP TABLE public.expense_recurring;

CREATE TABLE public.expense_recurring
(
    expense_recurring_id integer NOT NULL DEFAULT nextval('recurring_expenses_recurring_expenses_id_seq'::regclass),
    amount numeric(16,2),
    name text COLLATE pg_catalog."default",
    first_occurance date,
    frequency interval
)

TABLESPACE pg_default;

ALTER TABLE public.expense_recurring
    OWNER to postgres;