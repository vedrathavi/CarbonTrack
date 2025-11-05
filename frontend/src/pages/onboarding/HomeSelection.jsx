import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAppStore from "@/stores/useAppStore";
import { toast } from "sonner";
import { FiHome, FiLogOut, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";

export default function HomeSelection() {
  const navigate = useNavigate();
  const { logout } = useAppStore();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-prim-100 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-28 w-[28rem] h-[28rem] bg-sec-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-28 -left-28 w-[28rem] h-[28rem] bg-sec-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-[22rem] h-[22rem] bg-prim-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Logout Button (Floating) */}
      <div className="absolute top-6 right-6 z-50 ">
        <div className="btn-3d-wrapper">
          <div className="btn-3d-offset" aria-hidden />
          <button onClick={handleLogout} className="btn-3d btn-3d--primary">
            <span className="text-md text-prim-100 font-inter font-medium">
              Log Out
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-2xl text-center"
      >
        <h1 className="text-5xl md:text-6xl font-instru tracking-tight leading-tight mb-6 text-gray-800">
          Welcome to Your Home
        </h1>
        <p className="text-lg md:text-xl font-inter tracking-tight text-gray-700 mb-16 max-w-lg mx-auto">
          Choose an option below to set up or join your household and start
          managing everything together effortlessly.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center font-inter font-medium items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/onboarding/create-home")}
            className="group w-full sm:w-52 h-14 flex items-center justify-center gap-3 text-lg bg-sec-200 text-sec-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FiHome className="text-2xl " />
            <span>New Home</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/onboarding/join-home")}
            className="group w-full sm:w-52 h-14 flex items-center justify-center gap-3 text-lg bg-sec-600 text-prim-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FiUsers className="text-2xl " />
            <span>Existing Home</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
