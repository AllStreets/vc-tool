export default function DealDiscovery({ deals }) {
  if (!deals || deals.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">No deals loaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deals.slice(0, 30).map((deal) => (
        <div
          key={deal.id}
          className="card hover:border-gray-600 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg">{deal.company_name}</h3>
              {deal.data?.title && (
                <p className="text-sm text-gray-400 mt-1">{deal.data.title}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                deal.funding_type?.includes('Series A') ? 'bg-yellow-900 text-yellow-200' :
                deal.funding_type?.includes('Series B') ? 'bg-orange-900 text-orange-200' :
                deal.funding_type?.includes('Series C') ? 'bg-red-900 text-red-200' :
                deal.funding_type?.includes('Acquisition') ? 'bg-purple-900 text-purple-200' :
                deal.funding_type?.includes('IPO') ? 'bg-green-900 text-green-200' :
                'bg-blue-900 text-blue-200'
              }`}>
                {deal.funding_type}
              </span>
            </div>
          </div>

          {deal.data?.description && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{deal.data.description}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
            {deal.data?.source && (
              <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                {deal.data.source}
              </span>
            )}
            {deal.source && (
              <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                {deal.source}
              </span>
            )}
            {deal.data?.publishedAt && (
              <span className="text-xs text-gray-400 px-2 py-1">
                {new Date(deal.data.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {deal.data?.url && (
            <a
              href={deal.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Read more →
            </a>
          )}
        </div>
      ))}

      {deals.length > 30 && (
        <p className="text-center text-gray-500 py-4 text-sm">
          Showing 30 of {deals.length} deals
        </p>
      )}
    </div>
  )
}
