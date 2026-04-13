export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div className="text-center space-y-4">
        <div className="h-9 bg-muted rounded-lg w-80 mx-auto animate-pulse" />
        <div className="h-5 bg-muted rounded w-96 mx-auto animate-pulse" />
        <div className="h-10 bg-muted rounded-lg w-96 mx-auto animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-7 bg-muted rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-52 bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
