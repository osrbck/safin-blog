import { LuCircleAlert, LuCircleCheck, LuInfo } from 'react-icons/lu'

const ICONS = { error: LuCircleAlert, success: LuCircleCheck, info: LuInfo }

export default function Alert({ kind = 'error', children }) {
  if (!children) return null
  const Icon = ICONS[kind] ?? LuInfo
  return (
    <div className={`alert alert--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon size={16} />
      <span>{children}</span>
    </div>
  )
}
