import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-32 h-32 bg-linear-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8">
          <FaExclamationTriangle className="text-blue-600 text-5xl" />
        </div>

        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaHome className="mr-3" />
            Back to Home
          </Link>
          
          <Link
            to="/events"
            className="inline-flex items-center justify-center bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300"
          >
            <FaSearch className="mr-3" />
            Browse Events
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-600 mb-4">
            Try searching for events or navigating from the homepage.
          </p>
          <div className="flex items-center justify-center text-gray-500">
            <FaExclamationTriangle className="mr-2" />
            <span className="text-sm">
              If you believe this is an error, please contact support.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;