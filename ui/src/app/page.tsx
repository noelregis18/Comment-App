import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-600">Comment App</h1>
        <p className="text-xl mb-8 text-gray-700">
          A minimalistic and highly scalable comment application with nested comments, user authentication, and notifications.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-semibold mb-3 text-blue-700">Features</h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">🔐</span>
                <span>Secure user authentication</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🧵</span>
                <span>Nested comments with multiple levels</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✏️</span>
                <span>Edit comments within 15 minutes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🗑️</span>
                <span>Delete and restore comments</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔔</span>
                <span>Real-time notifications</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-2xl font-semibold mb-3 text-green-700">Get Started</h2>
            <div className="space-y-4">
              <Link 
                href="/auth/login" 
                className="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="inline-block w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-200"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
