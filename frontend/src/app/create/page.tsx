import Navbar from "@/components/Navbar";
import CreatePostForm from "@/components/CreatePostForm";

export default function CreatePost() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Create New Post
          </h1>
          <CreatePostForm />
        </div>
      </main>
    </div>
  );
}
