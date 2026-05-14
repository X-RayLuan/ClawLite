export const INSTALLER_VERSION = {
  macos: 'v1.5.222',
  windows: 'v1.5.222'
} as const

const MAC_RELEASE_BASE = `https://github.com/X-RayLuan/ClawLite-Installer/releases/download/${INSTALLER_VERSION.macos}`
const WIN_RELEASE_BASE = `https://github.com/X-RayLuan/ClawLite-Installer/releases/download/${INSTALLER_VERSION.windows}`

export const MAC_INSTALLER_URL = `${MAC_RELEASE_BASE}/clawlite.dmg`
export const WIN_INSTALLER_URL = `${WIN_RELEASE_BASE}/clawlite-setup.exe`

export function getInstallerUrl(os: string): string {
  if (os === 'windows') return WIN_INSTALLER_URL
  return MAC_INSTALLER_URL
}
