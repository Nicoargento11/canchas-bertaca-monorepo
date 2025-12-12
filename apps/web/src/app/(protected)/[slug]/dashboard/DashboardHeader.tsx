import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-card px-3 sm:px-6 shadow-sm transition-colors">
      <SidebarTrigger className="-ml-1 text-black hover:bg-[#22C55E]/10 flex-shrink-0" />

      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">{children}</div>
      </div>
    </header>
  );
}
