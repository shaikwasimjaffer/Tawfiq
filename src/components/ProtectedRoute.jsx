import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

const DefaultFallback = () => (
  <div className="fixed inset-0 bg-[#F7F5EF] flex flex-col items-center justify-center p-6 select-none z-50">
    <div className="w-12 h-12 rounded-2xl bg-[#134D37] flex items-center justify-center shadow-[0_4px_16px_rgba(19,77,55,0.2)] animate-pulse">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-white"
        aria-hidden="true"
      >
        <path
          d="M12 2.5C7.5 5.8 4 9.5 4 14.5V21.5H20V14.5C20 9.5 16.5 5.8 12 2.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6.5C9 8.8 6.8 11.5 6.8 15V21.5H17.2V15C17.2 11.5 15 8.8 12 6.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.75"
        />
      </svg>
    </div>
    <p className="font-serif text-sm font-semibold text-[#134D37] mt-3 tracking-tight">
      Tawfiq
    </p>
    <span className="text-[10px] text-[#8C8273] uppercase tracking-widest mt-0.5">
      Verifying believer session...
    </span>
  </div>
);

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement,
}) {
  const {
    isAuthenticated,
    isLoadingAuth,
    authChecked,
    authError,
    checkUserAuth,
  } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  return <Outlet />;
}
