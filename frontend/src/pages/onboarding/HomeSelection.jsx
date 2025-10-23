import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAppStore from "@/stores/useAppStore";
import { toast } from "sonner";

export default function HomeSelection() {
  const navigate = useNavigate();
  const { logout } = useAppStore();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-prim-100 flex items-center justify-center p-4 relative">
      {/* Logout Button */}
      <div className="absolute top-6 right-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-md pointer-events-none"></div>
          <button
            onClick={handleLogout}
            className="relative z-10 inline-flex items-center font-inter gap-2 bg-orange-700 border-sec-900 border-2 text-sec-900 px-4 py-2 rounded-md hover:bg-orange-800 hover:text-sec-800 transition-colors cursor-pointer"
          >
            <span className="text-md text-prim-100 font-inter font-medium">Log Out</span>
          
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-instru tracking-tight leading-3 mb-6 text-gray-800">
          Welcome to Your Home
        </h1>
        <p className="text-lg md:text-xl font-inter tracking-tight text-gray-700 mb-16">
          Choose one to get your household ready and start tracking together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center font-inter font-medium items-center max-w-lg mx-auto">
          <button
            onClick={() => navigate("/onboarding/create-home")}
            className="w-full sm:w-48 h-14 text-lg bg-sec-200   text-sec-600 rounded-lg"
            
          >
            New Home
          </button>
          <button
            onClick={() => navigate("/onboarding/join-home")}
            className="w-full sm:w-48 h-14 text-lg bg-sec-600  text-prim-100 rounded-lg"
          >
            Existing Home
          </button>
        </div>
      </div>
    </div>
  );
}
