# ClawLite Homebrew Playbook (Day 1 → Day 7)

This folder contains operational templates for shipping ClawLite via Homebrew.

## Files
- `release-checklist.md` — Day 1 release prep checklist
- `clawlite.rb.template` — Day 2 formula template
- `homebrew-validation.sh` — Day 2/3 local validation script

---

## Day-by-day execution

### Day 1 — Prepare release artifact
1. Complete `release-checklist.md`
2. Create/push git tag (example `v0.1.0`)
3. Generate SHA256 for GitHub tarball
4. Record URL + SHA for formula

### Day 2 — Build formula draft
1. Copy template and fill values:
   ```bash
   cp homebrew/clawlite.rb.template homebrew/clawlite.rb
   ```
2. Replace:
   - `url` (release tarball)
   - `sha256`

### Day 3 — Local validation
Run:
```bash
./homebrew/homebrew-validation.sh ./homebrew/clawlite.rb
```
Checks included:
- `brew audit --strict --online`
- install from source
- `clawlite --version` / `--help`
- `brew test`

### Day 4 — Clean-machine regression
- Validate install on fresh macOS environment
- Confirm uninstall/reinstall path

### Day 5 — Documentation updates
- Add install command to main README and docs:
  - `brew tap <tap>`
  - `brew install clawlite`

### Day 6 — Publish formula
- Option A (fast): publish in your own tap
- Option B (later): submit to `homebrew-core`

### Day 7 — Review & stabilize
- Collect install failures
- Fix formula/doc gaps
- Decide if ready for `homebrew-core` PR

---

## Common issues & fixes

### 1) `brew audit` failed
**Symptoms:** style/rules errors.

**Fixes:**
- Follow Homebrew style output exactly.
- Ensure metadata fields are valid (`desc`, `homepage`, `license`).
- Keep test block simple and deterministic.

### 2) SHA256 mismatch
**Symptoms:** `SHA256 mismatch` during install.

**Fixes:**
1. Verify tag URL points to final release tag.
2. Re-download tarball and regenerate hash:
   ```bash
   curl -L -o test.tar.gz <url>
   shasum -a 256 test.tar.gz
   ```
3. Update formula with new hash.

### 3) Dependency conflicts
**Symptoms:** npm/node step fails.

**Fixes:**
- Keep `depends_on "node"` in formula.
- Check lockfile consistency in release tarball.
- Retest with `--build-from-source`.

### 4) Binary not found after install
**Symptoms:** `clawlite` command missing.

**Fixes:**
- Verify package `bin` name in `package.json`.
- Update symlink line in formula:
  ```ruby
  bin.install_symlink libexec/"bin/clawlite"
  ```

### 5) `brew test` unstable
**Symptoms:** test fails due to network/env dependency.

**Fixes:**
- Make test check `--help` output only.
- Avoid external API/network in formula tests.

---

## Quick start
```bash
cp homebrew/clawlite.rb.template homebrew/clawlite.rb
# edit url + sha256
./homebrew/homebrew-validation.sh ./homebrew/clawlite.rb
```
