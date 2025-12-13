import React from "react";
import { ShieldAlert, Lock } from "lucide-react";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon Container */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-red-300 rounded-full animate-pulse opacity-70"></div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-7xl md:text-8xl font-bold text-gray-800 mb-2">
            403
          </h1>
          <div className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full mb-4">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-semibold">FORBIDDEN</span>
          </div>
        </div>

        {/* Message */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            You don't have permission to access this page. This area is
            restricted to authorized users only.
          </p>
        </div>

        {/* Additional Help */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
