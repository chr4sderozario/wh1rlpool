# Security Specification - WH1RLPOOL

## Data Invariants
1. A product can only be created/updated/deleted by an admin.
2. An order must belong to a signed-in user and that user's email must be verified.
3. Users can only read their own private info and orders.
4. User profiles (public part) can be read by any signed-in user (for context) but only modified by the owner.
5. All IDs must be valid.
6. Admin emails: `sohanbiswas@chr4s.com`, `johnrozario@chr4s.com`.

## The Dirty Dozen Payloads (Rejection Targets)
1. **User trying to create a product:** (Identity Spoofing)
   - Payload: `{ name: "Steal Stock", price: 0, stock: 100 }`
   - Path: `products/new_product`
   - Expected: `PERMISSION_DENIED`
2. **User trying to update a product price:** (Integrity Breach)
   - Payload: `{ price: 0.01 }`
   - Path: `products/existing_id`
   - Expected: `PERMISSION_DENIED`
3. **User browsing another user's private info:** (Privacy Leak)
   - Path: `users/victim_id/private/info`
   - Expected: `PERMISSION_DENIED`
4. **User creating an order for another user:** (Identity Spoofing)
   - Payload: `{ userId: "victim_id", total: 100, items: [] }`
   - Expected: `PERMISSION_DENIED`
5. **Admin attempting to change their own role in the profile:** (Privilege Escalation)
   - Action: `update` on `public/profile`
   - Payload: `{ role: "super_admin" }` (or even user changing to admin)
   - Expected: `PERMISSION_DENIED` (role must be immutable or set only by system/exists)
6. **Poisoning product ID:** (Resource Exhaustion)
   - Path: `products/[1MB_STRING_ID]`
   - Expected: `PERMISSION_DENIED`
7. **Bypassing validation with extra fields:** (Ghost Field Attack)
   - Payload: `{ name: "Jersey", price: 50, stock: 10, isVerifiedAdmin: true }`
   - Expected: `PERMISSION_DENIED`
8. **Updating order status to 'delivered' by user:** (State Shortcutting)
   - Payload: `{ status: "delivered" }`
   - Expected: `PERMISSION_DENIED`
9. **Blanket read on all orders:** (Query Scraping)
   - Operation: `list` on `orders`
   - Expected: `PERMISSION_DENIED` (unless filtered by userId)
10. **Unauthorized delete of profile:**
    - Operation: `delete` on `users/some_id/public/profile` by non-owner.
    - Expected: `PERMISSION_DENIED`
11. **Injecting invalid types into price:**
    - Payload: `{ price: "FREE" }`
    - Expected: `PERMISSION_DENIED`
12. **Creating order without email verification:**
    - User state: `email_verified: false`
    - Expected: `PERMISSION_DENIED`
