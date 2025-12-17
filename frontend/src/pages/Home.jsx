import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaRocket,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

const Home = () => {
  const { isAuthenticated, user } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl mb-8">
              <FaCalendarAlt className="text-white text-3xl" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Welcome to{" "}
              <span className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Eventify
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Your simple and secure platform for managing events. Create, organize, and track events with ease.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/events"
                    className="inline-flex items-center justify-center bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FaChartLine className="mr-3" />
                    Go to Events Page
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FaRocket className="mr-3" />
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300"
                  >
                    Sign In
                    <FaArrowRight className="ml-3" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose Eventify?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, powerful tools for all your event management needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendarAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Easy Event Creation
              </h3>
              <p className="text-gray-600">
                Create events in minutes with our intuitive interface. No complicated setup required.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUserFriends className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Manage Attendees
              </h3>
              <p className="text-gray-600">
                Keep track of participants, send updates, and manage RSVPs all in one place.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security and reliable infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Create an Account
                </h3>
                <p className="text-gray-600">
                  Sign up for free and set up your profile in minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Explore the Platform
                </h3>
                <p className="text-gray-600">
                  Familiarize yourself with our easy-to-use dashboard and tools.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Start Creating Events
                </h3>
                <p className="text-gray-600">
                  Create your first event and invite participants.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaRocket className="mr-3" />
                Start Your Journey
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Simplify Event Management?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of users who trust Eventify for their event organization needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/create-event"
                className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-300"
              >
                Create Your First Event
              </Link>
            ) : (
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-300"
              >
                Sign Up Free
              </Link>
            )}
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <FaCalendarAlt className="text-white" />
                </div>
                <span className="text-xl font-bold">Eventify</span>
              </div>
              <p className="text-gray-400">
                Simple, secure event management for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-gray-400 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Eventify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;