export const INSTALLER_VERSION = 'v1.3.138'

const RELEASE_BASE = `https://github.com/X-RayLuan/ClawLite-Brand-Installer/releases/download/${INSTALLER_VERSION}`

export const MAC_INSTALLER_URL = `${RELEASE_BASE}/clawlite.dmg`
export const WIN_INSTALLER_URL = `${RELEASE_BASE}/clawlite-setup.exe`

export function getInstallerUrl(os: string): string {
  if (os === 'windows') return WIN_INSTALLER_URL
  return MAC_INSTALLER_URL
}
