/**
 * Stands in for real per-user-per-account auth scoping, which doesn't exist
 * anywhere in this app (no auth, no `currentUser`, no session). Persisted UI
 * state that's meant to read as "per user per account" — chart layout order,
 * for now — is keyed off this single hardcoded identity instead.
 */
export const MOCK_ACCOUNT_KEY = "colgate-vn:demo-user";
