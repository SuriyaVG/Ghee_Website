-- Fix existing payment status values to comply with new constraints
-- Update any invalid payment status values to 'pending'

UPDATE orders 
SET payment_status = 'pending' 
WHERE payment_status NOT IN ('pending', 'success', 'failed', 'refunded');

-- Update any invalid order status values to 'pending'
UPDATE orders 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- Verify the updates
SELECT DISTINCT payment_status FROM orders;
SELECT DISTINCT status FROM orders; 