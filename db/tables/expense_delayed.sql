-- Table: public.expense_delayed

-- DROP TABLE public.expense_delayed;

CREATE TABLE public.expense_delayed
(
    expense_delayed_id integer NOT NULL DEFAULT nextval('expense_delayed_expense_delayed_id_seq'::regclass),
    amount numeric(16,2),
    name text COLLATE pg_catalog."default",
    date date DEFAULT ((date(date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)) + '1 mon'::interval) + '1 day'::interval),
    category_id integer,
    CONSTRAINT expense_delayed_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories (category_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public.expense_delayed
    OWNER to postgres;