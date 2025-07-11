export function RecipeLoadingSkeleton() {
  return (
    <div className="flex gap-5 flex-wrap">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-64 h-80 bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
