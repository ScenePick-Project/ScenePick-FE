import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-between items-center gap-2 text-sm text-gray-500">
          <p>Copyright 2025. ScenePick All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-gray-900 transition-colors">
              이용약관
            </Link>
            <Link
              to="/privacy"
              className="hover:text-gray-900 transition-colors"
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
