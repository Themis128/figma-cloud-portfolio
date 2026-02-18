# Secrets Retrieval Status

> Last updated: **2026-02-18**  
> Performed by: automated CLI + console review

---

## ✅ Confirmed / Retrieved

| Secret | Value | How retrieved |
|---|---|---|
| `AMPLIFY_PRODUCTION_APP_ID` | `d25rpobpd22vvg` | `aws amplify list-apps` |
| `AMPLIFY_STAGING_APP_ID` | `d25rpobpd22vvg` | Same app — staging is a **branch** (`staging`) of the same Amplify app |
| `AWS_REGION` | `eu-central-1` | Confirmed from ARN `arn:aws:amplify:eu-central-1:278585680617` |
| `VITE_GOOGLE_ANALYTICS_ID` | `G-FT79QM66D3` | Already in `.env.example` |
| `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` | `G-FT79QM66D3` | Already in `.env.example` |

> **Amplify note:** only one app exists (`baltzakis-portfolio`, id `d25rpobpd22vvg`).  
> A `staging` branch should be created inside that same app if you want a staging deployment URL.  
> Run: `aws amplify create-branch --app-id d25rpobpd22vvg --branch-name staging --stage BETA`

---

## ⚠️ Still Need Manual Retrieval (3 secrets)

These require a browser login to an external console.  
Exact step-by-step paths are provided below — each takes < 2 minutes.

---

### 1. `GOOGLE_ANALYTICS_API_SECRET`

**What it is:** A Measurement Protocol v2 API secret — used only on the **server** to forward events to GA4 without going through the browser. Never expose it as a `VITE_` variable.

**Steps:**

1. Open → <https://analytics.google.com/>
2. Bottom-left: click **Admin** (gear icon)
3. In the **Property** column → **Data Streams**
4. Click your web stream (the one with measurement ID `G-FT79QM66D3`)
5. Scroll to **Measurement Protocol API secrets** → click it
6. Click **Create** → give it a label (e.g. `portfolio-server`)
7. Copy the generated secret value

**Where to put it:**

```bash
# .env (server only — NOT in VITE_ prefix)
GOOGLE_ANALYTICS_API_SECRET=<paste here>

# GitHub secret (for CI/CD):
# Repo → Settings → Secrets → Actions → New repository secret
# Name:  GOOGLE_ANALYTICS_API_SECRET
# Value: <paste here>
```

---

### 2. `CODACY_PROJECT_TOKEN`

**What it is:** A per-repository token used by the coverage reporter (`bash <(curl -Ls https://coverage.codacy.com/get.sh)`) to upload coverage to Codacy.

**Steps:**

1. Open → <https://app.codacy.com/gh/Themis128/figma-cloud-portfolio/settings>
2. Left sidebar → **Coverage** (or **Integrations**)
3. Look for **Project Token** — copy it

**Where to put it:**

```bash
# .env
CODACY_PROJECT_TOKEN=<paste here>

# GitHub secret:
# Name:  CODACY_PROJECT_TOKEN
# Value: <paste here>
```

---

### 3. `CODACY_API_TOKEN`

**What it is:** An account-level API token (not project-specific). Used for advanced Codacy API calls and status checks from CI.

**Steps:**

1. Open → <https://app.codacy.com/account/apiTokens>
   *(Profile icon → top-right → Account → API Tokens)*
2. Click **Add API token** → give it a name (e.g. `portfolio-ci`)
3. Copy the generated token immediately (shown once)

**Where to put it:**

```bash
# .env
CODACY_API_TOKEN=<paste here>

# GitHub secret:
# Name:  CODACY_API_TOKEN
# Value: <paste here>
```

---

## 📋 GitHub Secrets Checklist

After you retrieve the 3 secrets above, add them all at:  
👉 <https://github.com/Themis128/figma-cloud-portfolio/settings/secrets/actions>

| GitHub Secret Name | Status |
|---|---|
| `AWS_ACCESS_KEY_ID` | set in AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | set in AWS IAM |
| `AWS_REGION` | ✅ `eu-central-1` |
| `AMPLIFY_PRODUCTION_APP_ID` | ✅ `d25rpobpd22vvg` |
| `AMPLIFY_STAGING_APP_ID` | ✅ `d25rpobpd22vvg` |
| `VITE_GOOGLE_ANALYTICS_ID` | ✅ `G-FT79QM66D3` |
| `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` | ✅ `G-FT79QM66D3` |
| `GOOGLE_ANALYTICS_MEASUREMENT_ID` | ✅ `G-FT79QM66D3` |
| `GOOGLE_ANALYTICS_API_SECRET` | ⚠️ **manual — see step 1 above** |
| `CODACY_PROJECT_TOKEN` | ⚠️ **manual — see step 2 above** |
| `CODACY_API_TOKEN` | ⚠️ **manual — see step 3 above** |
| `VITE_RECAPTCHA_SITE_KEY` | ✅ `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` |
| `VITE_RECAPTCHA_SECRET_KEY` | ✅ `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` |
