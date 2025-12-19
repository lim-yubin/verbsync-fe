interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <div className="text-sm text-muted-foreground">
            {typeof description === "string" ? (
              <p>{description}</p>
            ) : (
              description
            )}
          </div>
        )}
      </div>
      {action && <div className="flex items-center gap-2 sm:shrink-0">{action}</div>}
    </div>
  );
}

