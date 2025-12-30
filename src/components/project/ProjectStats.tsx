import { useTranslation } from "react-i18next";
import { Globe, Key, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProjectStatsProps {
  localesCount: number;
  keysCount: number;
  translationsCount: number;
}

export function ProjectStats({
  localesCount,
  keysCount,
  translationsCount,
}: ProjectStatsProps) {
  const { t } = useTranslation();
  
  const stats = [
    {
      label: t("stats.languages"),
      value: localesCount,
      icon: Globe,
      description: t("stats.languagesDescription"),
    },
    {
      label: t("stats.keys"),
      value: keysCount,
      icon: Key,
      description: t("stats.keysDescription"),
    },
    {
      label: t("stats.translations"),
      value: translationsCount,
      icon: Languages,
      description: t("stats.translationsDescription"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

