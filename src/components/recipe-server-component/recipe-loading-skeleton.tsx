export function RecipeLoadingSkeleton() {
  return (
    <div className="flex gap-5 flex-wrap" role="status" aria-label="Loading recipes">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-64 h-80 bg-gray-200 rounded-lg animate-pulse relative overflow-hidden"
        >
          {}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          {}
          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            {}
            <div
              className="h-6 bg-gray-300 rounded-md w-3/4 animate-pulse"
              style={{ animationDelay: '0.1s' }}
            />

            {}
            <div
              className="h-4 bg-gray-300 rounded-md w-1/2 animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />

            {}
            <div className="flex gap-2 mt-2">
              <div
                className="h-3 bg-gray-300 rounded-md w-12 animate-pulse"
                style={{ animationDelay: '0.3s' }}
              />
              <div
                className="h-3 bg-gray-300 rounded-md w-12 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>

          {}
          <div className="absolute top-2 right-2 flex gap-2">
            <div
              className="w-8 h-8 bg-gray-300 rounded-md animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div
              className="w-8 h-8 bg-gray-300 rounded-md animate-pulse"
              style={{ animationDelay: '0.6s' }}
            />
            <div
              className="w-8 h-8 bg-gray-300 rounded-md animate-pulse"
              style={{ animationDelay: '0.7s' }}
            />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading recipes...</span>
    </div>
  );
}
