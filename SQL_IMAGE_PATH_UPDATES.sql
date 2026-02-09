-- ============================================
-- IMAGE PATH FIX - SQL UPDATE EXAMPLES
-- ============================================
-- This file contains SQL examples to update image paths in the inventory table
-- to use the correct /images/vehicles/ directory structure

-- ============================================
-- OPTION 1: Batch Replace for All Items
-- ============================================
-- Use this if all paths need the /vehicles/ directory added

-- Fix full-size images (remove /images/ and add back with /vehicles/)
UPDATE inventory 
SET inv_image = '/images/vehicles/' || 
    SUBSTRING(inv_image FROM POSITION('/' IN REVERSE(inv_image)) - CHAR_LENGTH(inv_image) + 2)
WHERE inv_image IS NOT NULL 
  AND inv_image NOT LIKE '%/vehicles/%';

-- Fix thumbnails
UPDATE inventory 
SET inv_thumbnail = '/images/vehicles/' || 
    SUBSTRING(inv_thumbnail FROM POSITION('/' IN REVERSE(inv_thumbnail)) - CHAR_LENGTH(inv_thumbnail) + 2)
WHERE inv_thumbnail IS NOT NULL 
  AND inv_thumbnail NOT LIKE '%/vehicles/%';

-- ============================================
-- OPTION 2: Simple Find & Replace
-- ============================================
-- PostgreSQL: Use REPLACE function

UPDATE inventory SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/')
WHERE inv_image LIKE '/images/%' AND inv_image NOT LIKE '%/vehicles/%';

UPDATE inventory SET inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE inv_thumbnail LIKE '/images/%' AND inv_thumbnail NOT LIKE '%/vehicles/%';

-- ============================================
-- OPTION 3: Individual Vehicle Updates
-- ============================================
-- Use this method if you need precise control over each vehicle

UPDATE inventory SET 
  inv_image = '/images/vehicles/camaro.jpg',
  inv_thumbnail = '/images/vehicles/camaro-tn.jpg'
WHERE inv_make = 'Chevy' AND inv_model = 'Camaro';

UPDATE inventory SET 
  inv_image = '/images/vehicles/batmobile.jpg',
  inv_thumbnail = '/images/vehicles/batmobile-tn.jpg'
WHERE inv_make = 'Batmobile' AND inv_model = 'Custom';

UPDATE inventory SET 
  inv_image = '/images/vehicles/survan.jpg',
  inv_thumbnail = '/images/vehicles/survan-tn.jpg'
WHERE inv_make = 'FBI' AND inv_model = 'Surveillance Van';

UPDATE inventory SET 
  inv_image = '/images/vehicles/dog-car.jpg',
  inv_thumbnail = '/images/vehicles/dog-car-tn.jpg'
WHERE inv_make = 'Dog' AND inv_model = 'Car';

UPDATE inventory SET 
  inv_image = '/images/vehicles/wrangler.jpg',
  inv_thumbnail = '/images/vehicles/wrangler-tn.jpg'
WHERE inv_make = 'Jeep' AND inv_model = 'Wrangler';

UPDATE inventory SET 
  inv_image = '/images/vehicles/adventador.jpg',
  inv_thumbnail = '/images/vehicles/adventador-tn.jpg'
WHERE inv_make = 'Lamborghini' AND inv_model = 'Adventador';

UPDATE inventory SET 
  inv_image = '/images/vehicles/aerocar.jpg',
  inv_thumbnail = '/images/vehicles/aerocar-tn.jpg'
WHERE inv_make = 'Aerocar International' AND inv_model = 'Aerocar';

UPDATE inventory SET 
  inv_image = '/images/vehicles/monster-truck.jpg',
  inv_thumbnail = '/images/vehicles/monster-truck-tn.jpg'
WHERE inv_make = 'Monster' AND inv_model = 'Truck';

UPDATE inventory SET 
  inv_image = '/images/vehicles/crwn-vic.jpg',
  inv_thumbnail = '/images/vehicles/crwn-vic-tn.jpg'
WHERE inv_make = 'Ford' AND inv_model = 'Crown Victoria';

UPDATE inventory SET 
  inv_image = '/images/vehicles/delorean.jpg',
  inv_thumbnail = '/images/vehicles/delorean-tn.jpg'
WHERE inv_make = 'DeLorean' AND inv_model = 'DMC-12';

UPDATE inventory SET 
  inv_image = '/images/vehicles/escalade.jpg',
  inv_thumbnail = '/images/vehicles/escalade-tn.jpg'
WHERE inv_make = 'Cadillac' AND inv_model = 'Escalade';

UPDATE inventory SET 
  inv_image = '/images/vehicles/fire-truck.jpg',
  inv_thumbnail = '/images/vehicles/fire-truck-tn.jpg'
WHERE inv_make = 'Fire' AND inv_model = 'Truck';

UPDATE inventory SET 
  inv_image = '/images/vehicles/hummer.jpg',
  inv_thumbnail = '/images/vehicles/hummer-tn.jpg'
WHERE inv_make = 'Hummer' AND inv_model = 'H3';

UPDATE inventory SET 
  inv_image = '/images/vehicles/mechanic.jpg',
  inv_thumbnail = '/images/vehicles/mechanic-tn.jpg'
WHERE inv_make = 'Mechanic' AND inv_model = 'Special';

UPDATE inventory SET 
  inv_image = '/images/vehicles/model-t.jpg',
  inv_thumbnail = '/images/vehicles/model-t-tn.jpg'
WHERE inv_make = 'Ford' AND inv_model = 'Model T';

UPDATE inventory SET 
  inv_image = '/images/vehicles/mystery-van.jpg',
  inv_thumbnail = '/images/vehicles/mystery-van-tn.jpg'
WHERE inv_make = 'Mystery' AND inv_model = 'Van';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all images are now correct
-- Should return 0 rows if all images are fixed

SELECT inv_id, inv_make, inv_model, inv_image, inv_thumbnail 
FROM inventory 
WHERE inv_image NOT LIKE '/images/vehicles/%' 
   OR inv_thumbnail NOT LIKE '/images/vehicles/%'
   OR inv_image IS NULL 
   OR inv_thumbnail IS NULL;

-- ============================================
-- CHECK CURRENT IMAGE PATHS
-- ============================================
-- Run this to see all current image paths in database

SELECT inv_id, inv_make, inv_model, inv_image, inv_thumbnail 
FROM inventory 
ORDER BY inv_id;

-- ============================================
-- REVERT CHANGES (if needed)
-- ============================================
-- This will only work if you kept a backup of original data
-- Otherwise, restore from your database backup

-- Replace paths back to original format (example)
-- UPDATE inventory SET inv_image = REPLACE(inv_image, '/images/vehicles/', '/images/')
-- WHERE inv_image LIKE '%/images/vehicles/%';
