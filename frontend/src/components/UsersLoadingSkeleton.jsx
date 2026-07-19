function UsersLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-[#081c30]/60 p-4 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#0e3b59] rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-[#0e3b59] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[#16486b]/70 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
