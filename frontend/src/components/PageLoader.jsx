import { LoaderIcon } from "lucide-react";
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#040912]">
      <LoaderIcon className="size-10 animate-spin text-[#7dd3fc]" />
    </div>
  );
}
export default PageLoader;
