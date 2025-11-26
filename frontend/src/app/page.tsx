import Navbar from "@/components/Navbar";
import PostList from "@/components/PostList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to SolBlog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              A decentralized blogging platform on Solana
            </p>
          </div>
          <PostList />
        </div>
      </main>
    </div>
  );
}
