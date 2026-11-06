export function PostCardSkeleton() {
  return (
    <div className="sk-card" aria-hidden="true">
      <div className="sk sk-media" />
      <div className="sk-body">
        <div className="sk sk--title" style={{ width: '85%' }} />
        <div className="sk sk--text" />
        <div className="sk sk--text" style={{ width: '70%' }} />
        <div className="row" style={{ marginTop: 8 }}>
          <div className="sk sk--circle" style={{ width: 32, height: 32 }} />
          <div className="sk sk--text" style={{ width: 120 }} />
        </div>
      </div>
    </div>
  )
}

export function PostGridSkeleton({ count = 6 }) {
  return (
    <div className="grid" role="status" aria-live="polite" aria-label="Loading stories">
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ArticleSkeleton() {
  return (
    <div className="container container--narrow" role="status" aria-label="Loading story">
      <div className="sk sk--text" style={{ width: 90, height: 24, borderRadius: 999 }} />
      <div className="sk sk--title" style={{ height: 44, marginTop: 20 }} />
      <div className="sk sk--title" style={{ height: 44, width: '70%', marginTop: 10 }} />
      <div className="row" style={{ marginTop: 28 }}>
        <div className="sk sk--circle" style={{ width: 40, height: 40 }} />
        <div className="sk sk--text" style={{ width: 160 }} />
      </div>
      <div className="sk" style={{ aspectRatio: '16/9', marginTop: 32, borderRadius: 20 }} />
      <div className="stack" style={{ marginTop: 40 }}>
        {[100, 95, 88, 60].map((w) => (
          <div key={w} className="sk sk--text" style={{ width: `${w}%`, height: 14 }} />
        ))}
      </div>
    </div>
  )
}

export function RowSkeleton({ rows = 4 }) {
  return (
    <div className="stack" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="sk" style={{ height: 64, borderRadius: 14 }} />
      ))}
    </div>
  )
}
