# Custom Domain Setup — GoDaddy → ZERO FLARE (§16.3)

Status: **documented, awaiting the domain name + owner action** (the domain lives in the team's GoDaddy account; per the brief we do not invent the name and never modify DNS without authorization).

Current production URL (verified live): **https://zero-flare-lab-vp48.zai-ai.site**

---

## Option A — GoDaddy domain forwarding (works today, zero platform changes)

ZCode Sites serves the app on its own `*.zai-ai.site` host with HTTPS already provisioned and does not expose custom-domain binding to this CLI. The no-purchase, no-migration path is GoDaddy's built-in **domain forwarding**:

1. Sign in at godaddy.com → **My Products** →Domains → your domain → **DNS → Forwarding**.
2. Set **Forward to:** `https://zero-flare-lab-vp48.zai-ai.site`
   - Settings: **301 (Permanent)** recommended; **Masked** also works (keeps your domain in the address bar) but breaks some deep-link shares — 301 is the honest option.
   - Forward type: **Only forward the root domain** is insufficient — choose forward with subdomains (`www` too).
3. Wait for propagation (usually minutes; up to 48 h worst case). GoDaddy provisions the forwarding HTTPS certificate automatically.
4. Verify: open `https://<your-domain>/` → lands on ZERO FLARE; then run `curl -s https://<your-domain>/api/selftest` → expect `"ok":true` with 10 checks.

**DNS records to leave untouched:** MX, SPF/TXT, DKIM (CNAME) — any existing email records. Forwarding does not require deleting them. Do NOT change nameservers.

**Limitations (documented honestly):** the browser address bar shows the GoDaddy-forwarded URL via redirect (301) or a frame (masked); path preservation works for 301 (visitors land on the same path); TLS terminates at GoDaddy's forwarder.

## Option B — Full DNS binding (requires a host that supports custom domains)

If the team later moves hosting to Vercel/Railway/Render/Cloudflare (all have free tiers that support custom domains):

1. In the hosting provider: add custom domain `<your-domain>`.
2. In GoDaddy DNS management add the provider's records, e.g.:
   - **CNAME** `www` → `cname.<provider>.com` (or the provider-provided target)
   - **A** `@` → the provider's apex IP (Vercel: `76.76.21.21`; Railway/Render/Cloudflare provide their own)
3. Keep MX/SPF/DKIM records intact. Wait for the provider's TLS issuance (automatic).
4. Redeploy if the platform requires it; re-run the gate battery against the custom domain.

## What we need from the domain owner (blocked items)

- [ ] The actual domain name (not guessed — per brief).
- [ ] Confirmation whether GoDaddy forwarding (Option A) is acceptable for the submission, or Option B is wanted.
- [ ] Whoever owns the account performs the steps above (we never touch DNS directly).

## Acceptance criteria (§16.4)

- [ ] `https://<domain>/` returns 200 with the ZERO FLARE home.
- [ ] `https://<domain>/api/selftest` → ok:true (10 checks).
- [ ] `https://<domain>/api/scientific-qa-eval` → ok:true (15 checks).
- [ ] `https://<domain>/api/ai-status` → honest provider status.
- [ ] HTTPS padlock valid; no mixed content.
