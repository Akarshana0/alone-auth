import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a12] flex">
        <Sidebar />
        <div className="flex-1 ml-[260px] flex flex-col min-h-screen max-w-full overflow-hidden transition-all duration-300">
          <Topbar />
          <main className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
            {/* Background ambient glow */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
