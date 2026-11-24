export default function Loading() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton mt-5 h-16 w-3/4 max-w-xl" />
      <div className="skeleton mt-4 h-5 w-1/2 max-w-md" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] w-full" />
            <div className="skeleton mt-4 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
