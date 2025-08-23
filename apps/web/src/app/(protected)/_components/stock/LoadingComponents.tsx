import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function StockPageLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header Loading */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Loading indicator with animation */}
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando sistema de inventario...</p>
          </div>
        </div>

        {/* Tabs Loading */}
        <div className="space-y-4">
          <div className="flex space-x-2 border-b">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-20" />
            ))}
          </div>

          {/* Content Cards Loading */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional loading cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function SalesSystemLoading() {
  return (
    <div className="space-y-6">
      {/* Cash register info loading */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Products panel loading */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart panel loading */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Cargando sistema de ventas...</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional loading sections */}
      <div className="w-full space-y-4">
        <Card className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
