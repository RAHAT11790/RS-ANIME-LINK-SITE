# RS Links Security Specification

## Data Invariants
1. A link must have a `slug`, `originalUrl`, `userId`, and `clicks`.
2. `slug` must be unique (enforced by application logic, rules check for existence where possible).
3. `clicks` must only increment.
4. `userId` of a link must be immutable.
5. Stats can only be read by the link owner.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Attempt to create a link with someone else's `userId`.
2. **State Shortcutting**: Attempt to update `clicks` to 999999 bypassing the increment.
3. **Ghost Fields**: Attempt to add `isAdmin: true` to a profile.
4. **Link Hijack**: Attempt to change the `originalUrl` of someone else's link.
5. **Slug Poisoning**: Injecting a 2MB string as a slug.
6. **Stat Exfiltration**: Attempt to read stats of a link you don't own.
7. **Anonymous Vandalism**: Attempt to delete a public link without being the owner.
8. **PII Leak**: Reading `email` of another user from `/profiles`.
9. **Creation Spam**: Creating links without being signed in.
10. **Immutable Guard Bypass**: Changing the `userId` field during an update.
11. **Stat Spoofing**: Creating stats for a link that doesn't exist.
12. **Recursive Cost**: Deeply nested document lookups.

## Implementation details
I will implement strict `isValidLink` and `isValidProfile` helpers.
Update actions for links will be partitioned into `linkUpdate` (owner only) and `clickIncrement` (anyone).
