-- Table: public.categories

-- DROP TABLE public.categories;

CREATE TABLE public.categories
(
    category_id integer NOT NULL DEFAULT nextval('categories_category_id_seq'::regclass),
    name text COLLATE pg_catalog."default",
    CONSTRAINT categories_pkey PRIMARY KEY (category_id)
)

TABLESPACE pg_default;

ALTER TABLE public.categories
    OWNER to postgres;