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
    <div className="min-h-screen bg-[#E8EFD3] flex items-center justify-center p-4 relative">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-800 rounded-md hover:bg-gray-50 transition-colors"
      >
        Logout
      </button>

      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-serif mb-6 text-gray-800">
          Welcome to Your Home
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-16">
          Choose one to get your household ready and start tracking together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
          <Button
            onClick={() => navigate("/onboarding/create-home")}
            className="w-full sm:w-48 h-14 text-lg bg-[#B8D4BE] hover:bg-[#A5C4AB] text-gray-800 rounded-lg"
            variant="outline"
          >
            New Home
          </Button>
          <Button
            onClick={() => navigate("/onboarding/join-home")}
            className="w-full sm:w-48 h-14 text-lg bg-[#4A6741] hover:bg-[#3E5636] text-white rounded-lg"
          >
            Existing Home
          </Button>
        </div>
      </div>
    </div>
  );
}
