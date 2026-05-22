/**
 * ClawLite Installer Download Links
 * 
 * 根据用户 IP 归属地自动选择下载源：
 * - 中国大陆（CN）→ 阿里云 OSS 镜像（国内高速）
 * - 海外/其他        → GitHub Release（国际版）
 * 
 * OSS 链接由发布技能在每次发布时上传到 shouyiren.oss-cn-qingdao.aliyuncs.com
 */

export const INSTALLER_VERSION = {
  macos: 'v1.5.294',
  windows: 'v1.5.294'
}

// OSS 镜像（国内）
export const OSS_BASE = {
  macos: 'https://shouyiren.oss-cn-qingdao.aliyuncs.com/clawlite',
  windows: 'https://shouyiren.oss-cn-qingdao.aliyuncs.com/clawlite'
}

// GitHub 原版（国际）
export const GITHUB_BASE = {
  macos: 'https://github.com/X-RayLuan/ClawLite-Installer/releases/download',
  windows: 'https://github.com/X-RayLuan/ClawLite-Installer/releases/download'
}

// GitHub Release 静态链接（fallback用，不经过IP检测）
export const MAC_INSTALLER_URL = `${GITHUB_BASE.macos}/${INSTALLER_VERSION.macos}/clawlite.dmg`
export const WIN_INSTALLER_URL = `${GITHUB_BASE.windows}/${INSTALLER_VERSION.windows}/clawlite-setup.exe`

/**
 * 根据用户 IP 归属地返回对应下载链接
 * - CN → OSS
 * - 其他 → GitHub
 * 
 * @param os 'macos' | 'windows'
 * @returns 异步返回下载 URL
 */
export async function getInstallerUrl(os: 'macos' | 'windows'): Promise<string> {
  const version = INSTALLER_VERSION[os]

  try {
    // ipapi.co 免费 tier：1000次/天，足够中小规模使用
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error(`ipapi.co status: ${res.status}`)

    const data = await res.json()
    console.log(`[installer-links] IP country: ${data.country_code}, IP: ${data.ip}`)

    if (data.country_code === 'CN') {
      // 国内用户 → 阿里云 OSS 镜像
      return os === 'windows'
        ? `${OSS_BASE.windows}/${version}/clawlite-setup.exe`
        : `${OSS_BASE.macos}/${version}/clawlite.dmg`
    }
  } catch (err) {
    // 检测失败，打印日志但继续走 GitHub
    console.warn(`[installer-links] IP detection failed, fallback to GitHub:`, err)
  }

  // 海外/检测失败 → GitHub
  return os === 'windows'
    ? `${GITHUB_BASE.windows}/${version}/clawlite-setup.exe`
    : `${GITHUB_BASE.macos}/${version}/clawlite.dmg`
}

/**
 * 同步获取 macOS 下载链接（GitHub static，适合服务端/静态上下文）
 */
export function getMacInstallerUrl(): string {
  return MAC_INSTALLER_URL
}

/**
 * 同步获取 Windows 下载链接（GitHub static，适合服务端/静态上下文）
 */
export function getWinInstallerUrl(): string {
  return WIN_INSTALLER_URL
}

/**
 * 根据 OS name 返回对应下载链接（同步，默认 GitHub）
 * 用于静态/服务端渲染场景
 */
export function getInstallerUrlSync(os: string): string {
  if (os === 'windows') return WIN_INSTALLER_URL
  return MAC_INSTALLER_URL
}