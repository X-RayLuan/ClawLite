import test from 'node:test'
import assert from 'node:assert/strict'

import {
  INSTALLER_VERSION,
  MAC_INSTALLER_URL,
  WIN_INSTALLER_URL,
  getInstallerUrl
} from '../src/lib/installer-links.ts'

test('installer links keep macOS on the previous line and move Windows to v1.3.148', () => {
  assert.equal(INSTALLER_VERSION.windows, 'v1.3.148')
  assert.equal(INSTALLER_VERSION.macos, 'v1.3.147')
  assert.equal(
    WIN_INSTALLER_URL,
    'https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/download/v1.3.148/clawlite-setup.exe'
  )
  assert.equal(
    MAC_INSTALLER_URL,
    'https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/download/v1.3.147/clawlite.dmg'
  )
})

test('getInstallerUrl returns the pinned windows and macOS artifacts', () => {
  assert.equal(
    getInstallerUrl('windows'),
    'https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/download/v1.3.148/clawlite-setup.exe'
  )
  assert.equal(
    getInstallerUrl('macos'),
    'https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/download/v1.3.147/clawlite.dmg'
  )
  assert.equal(
    getInstallerUrl('linux'),
    'https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/download/v1.3.147/clawlite.dmg'
  )
})
