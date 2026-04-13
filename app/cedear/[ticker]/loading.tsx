export default function CedearLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-48" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-muted rounded-lg w-40" />
          <div className="h-10 bg-muted rounded-lg w-20" />
        </div>
      </div>
      {/* Price + Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-24 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
      {/* Recommendation */}
      <div className="h-20 bg-muted rounded-xl" />
      {/* Chart */}
      <div className="h-[440px] bg-muted rounded-xl" />
      {/* Sub-charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-44 bg-muted rounded-xl" />
        <div className="h-44 bg-muted rounded-xl" />
        <div className="h-36 bg-muted rounded-xl" />
        <div className="h-44 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
