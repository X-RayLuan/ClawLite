# ClawLite Homebrew Day 1 — Release Checklist

Use this checklist before updating any formula.

## 1) Version + Tag
- [ ] Decide version (example: `v0.1.0`)
- [ ] Ensure `package.json` version matches
- [ ] Create git tag:

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## 2) Release Tarball URL
- [ ] Confirm tarball URL exists:

```bash
https://github.com/X-RayLuan/ClawLite/archive/refs/tags/v0.1.0.tar.gz
```

## 3) Generate SHA256

```bash
VERSION=v0.1.0
curl -L -o clawlite-${VERSION}.tar.gz \
  https://github.com/X-RayLuan/ClawLite/archive/refs/tags/${VERSION}.tar.gz
shasum -a 256 clawlite-${VERSION}.tar.gz
```

- [ ] Copy SHA256 value into formula

## 4) Smoke Verify Tarball
- [ ] Tarball unpacks correctly
- [ ] Contains expected source files

```bash
tar -tzf clawlite-v0.1.0.tar.gz | head
```

## 5) Update Homebrew Formula Inputs
- [ ] Update `url`
- [ ] Update `sha256`
- [ ] Update `version` (if pinned in formula/test)

## 6) Day 1 Exit Criteria
- [ ] Tag pushed
- [ ] Release tarball downloadable
- [ ] SHA256 generated and recorded
- [ ] Formula-ready inputs complete
