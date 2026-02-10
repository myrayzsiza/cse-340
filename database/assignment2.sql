-- Assignment 2: SQL Queries

-- Query a: Insert a new account for Tony Stark
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony.stark@example.com',
        'ironman123'
    );

-- Query f: Update inventory image paths to point to /images/vehicles/
UPDATE public.inventory
SET inv_image = CONCAT('/images/vehicles/', inv_image),
    inv_thumbnail = CONCAT('/images/vehicles/', inv_thumbnail);
