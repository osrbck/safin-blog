import { LuMoon, LuSun } from 'react-icons/lu'
import { useTheme } from '../context/themeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button type="button" className="btn btn--ghost btn--icon" onClick={toggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title={dark ? 'Light theme' : 'Dark theme'}>
      {dark ? <LuSun size={18} /> : <LuMoon size={18} />}
    </button>
  )
}
