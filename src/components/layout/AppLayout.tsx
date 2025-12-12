import { useParams } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { ProjectSidebar } from "./ProjectSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { id: projectId } = useParams<{ id: string }>();

  // 프로젝트 페이지인지 확인
  const isProjectPage = !!projectId;

  return (
    <div className="relative min-h-screen bg-background">
      {isProjectPage ? <ProjectSidebar /> : <Sidebar />}
      <div className="md:pl-60">
        <Navbar />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

