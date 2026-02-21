export default function APIStatusBar({ status }) {
  const apis = status.apis || {}
  const activePlugins = status.activePlugins || []

  const getTrendColor = (enabled, status) => {
    if (status === 'awaiting-access') return 'bg-yellow-900 text-yellow-200'
    if (!enabled) return 'bg-gray-800 text-gray-400'
    return 'bg-green-900 text-green-200'
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(apis).map(([name, config]) => (
        <div
          key={name}
          className={`status-badge px-3 py-1 rounded-full text-xs font-semibold transition-colors ${getTrendColor(config.enabled, config.status)}`}
          title={config.note || (config.enabled ? 'Connected' : 'Not configured')}
        >
          <span className="status-indicator mr-2 inline-block"></span>
          {config.name}
          {config.status === 'awaiting-access' && ' (pending)'}
        </div>
      ))}
    </div>
  )
}
