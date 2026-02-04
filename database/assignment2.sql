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
        'tony.stark@starkindustries.com',
        'password123'
    );
-- Query b: Update Tony Stark's account_type to 'Admin'
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
-- Query c: Delete Tony Stark's account
DELETE FROM public.account
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
-- Query d: Update GM Hummer's description
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- Query e: INNER JOIN to show Sport category vehicles
SELECT inv.inv_make,
    inv.inv_model,
    c.classification_name
FROM public.inventory inv
    INNER JOIN public.classification c ON inv.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- Query f: Update inventory image paths by adding '/vehicles'
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');