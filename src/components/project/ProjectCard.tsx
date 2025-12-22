import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ProjectCardProps {
  id: string;
  name: string;
  defaultLocale: string;
  createdAt: string;
  role?: "OWNER" | "EDITOR" | "VIEWER";
}

export function ProjectCard({
  id,
  name,
  defaultLocale,
  createdAt,
  role,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.PROJECT_DETAIL(id));
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Card
      className="group relative cursor-pointer transition-all hover:border-foreground/20 hover:shadow-sm"
      onClick={handleClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold tracking-tight truncate flex-1">
            {name}
          </h3>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            <span>{defaultLocale}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            기본 언어
          </Badge>
          {role && role !== "OWNER" && (
            <Badge variant="outline" className="text-xs">
              {role === "EDITOR" ? "편집자" : "조회자"}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
    </Card>
  );
}

