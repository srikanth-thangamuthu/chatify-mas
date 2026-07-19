import { LoaderIcon } from "lucide-react";
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#030814]">
      <LoaderIcon className="size-10 animate-spin text-[#96a2ac]" />
    </div>
  );
}
export default PageLoader;
