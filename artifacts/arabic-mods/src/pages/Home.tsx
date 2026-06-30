import { Header } from "@/components/layout/Header"
import { useListMods, getListModsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { Link } from "wouter"

export default function Home() {
  const { data: mods, isLoading } = useListMods()

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mods?.map((mod) => (
              <Card key={mod.id} className="overflow-hidden flex flex-col group bg-card transition-colors hover:border-primary/50">
                <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                  {mod.imageUrl ? (
                    <img 
                      src={mod.imageUrl} 
                      alt={mod.title} 
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 flex-1">
                  <div className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
                    {mod.gameName}
                  </div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-2" title={mod.title}>
                    {mod.title}
                  </h3>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5" title="التحميلات" data-testid={`text-download-count-${mod.id}`}>
                      <Download className="w-4 h-4 text-primary" />
                      <span className="font-mono">{mod.downloadCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="المشاهدات" data-testid={`text-view-count-${mod.id}`}>
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="font-mono">{mod.viewCount}</span>
                    </div>
                  </div>
                  <Link href={`/mod/${mod.id}`} className="w-full" data-testid={`link-view-mod-${mod.id}`}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      عرض التعريب
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            {mods?.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                لا توجد تعريبات حالياً.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
