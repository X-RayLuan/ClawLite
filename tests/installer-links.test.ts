import test from 'node:test'
import assert from 'node:assert/strict'

import {
  INSTALLER_VERSION,
  MAC_INSTALLER_URL,
  WIN_INSTALLER_URL,
  getInstallerUrl
} from '../src/lib/installer-links.ts'

test('installer links are pinned to the published v1.3.89 release', () => {
  assert.equal(INSTALLER_VERSION, 'v1.3.89')
  assert.equal(
    WIN_INSTALLER_URL,
    'https://github.com/X-RayLuan/ClawLite-Installer/releases/download/v1.3.89/clawlite-setup.exe'
  )
  assert.equal(
    MAC_INSTALLER_URL,
    'https://github.com/X-RayLuan/ClawLite-Installer/releases/download/v1.3.89/clawlite.dmg'
  )
})

test('getInstallerUrl returns the pinned windows and macOS artifacts', () => {
  assert.equal(
    getInstallerUrl('windows'),
    'https://github.com/X-RayLuan/ClawLite-Installer/releases/download/v1.3.89/clawlite-setup.exe'
  )
  assert.equal(
    getInstallerUrl('macos'),
    'https://github.com/X-RayLuan/ClawLite-Installer/releases/download/v1.3.89/clawlite.dmg'
  )
  assert.equal(
    getInstallerUrl('linux'),
    'https://github.com/X-RayLuan/ClawLite-Installer/releases/download/v1.3.89/clawlite.dmg'
  )
})
