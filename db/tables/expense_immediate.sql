-- Table: public.expense_immediate

-- DROP TABLE public.expense_immediate;

CREATE TABLE public.expense_immediate
(
    expense_immediate_id integer NOT NULL DEFAULT nextval('expense_immediate_expense_immediate_id_seq'::regclass),
    amount numeric(16,2),
    name text COLLATE pg_catalog."default",
    date date,
    category_id integer,
    CONSTRAINT expense_immediate_category_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories (category_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public.expense_immediate
    OWNER to postgres;