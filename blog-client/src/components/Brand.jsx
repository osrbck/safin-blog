import { Link } from 'react-router-dom'

export function BrandMark() {
  return (
    <span className="brand__mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <path d="M10 21c3.5 0 6.5-1.5 6.5-5.5S13.5 10 10 10m12 1c-3.5 0-6.5 1.5-6.5 5.5S19.5 22 23 22" />
      </svg>
    </span>
  )
}

export default function Brand({ to = '/', onClick }) {
  return (
    <Link to={to} className="brand" onClick={onClick} aria-label="Safin home">
      <BrandMark />
      <span>Safin</span>
    </Link>
  )
}
