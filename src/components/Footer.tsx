import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Music Personality Test
            </h3>
            <p className="text-gray-600 text-sm">
              Discover your musical identity through scientific personality assessment
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>
              © {new Date().getFullYear()} Music Personality Test. All rights reserved.
            </p>
            <p className="mt-1">
              Built with ❤️ for music lovers everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}