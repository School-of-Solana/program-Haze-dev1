import Navbar from "@/components/Navbar";
import ProfileView from "@/components/ProfileView";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProfileView />
        </div>
      </main>
    </div>
  );
}
