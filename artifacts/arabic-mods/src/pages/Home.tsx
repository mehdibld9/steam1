import { Header } from "@/components/layout/Header"
import { useListMods } from "@workspace/api-client-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Eye, Search } from "lucide-react"
import { Link } from "wouter"
import { useState, useMemo } from "react"

export default function Home() {
  const { data: mods, isLoading } = useListMods({ query: { refetchOnWindowFocus: true } })
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMods = useMemo(() => {
    if (!mods) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return mods
    return mods.filter(
      (mod) =>
        mod.title.toLowerCase().includes(q) ||
        mod.gameName.toLowerCase().includes(q)
    )
  }, [mods, searchQuery])

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Search bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="ابحث عن تعريب أو لعبة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card border-border focus-visible:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mb-4">
                {filteredMods.length === 0
                  ? "لم يتم العثور على نتائج"
                  : `${filteredMods.length} نتيجة`}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMods.map((mod) => (
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
                      <div className="flex items-center gap-1.5" title="التحميلات">
                        <Download className="w-4 h-4 text-primary" />
                        <span className="font-mono">{mod.downloadCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="المشاهدات">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="font-mono">{mod.viewCount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Link href={`/mod/${mod.id}`} className="w-full">
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                        عرض التعريب
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              {filteredMods.length === 0 && !searchQuery && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  لا توجد تعريبات حالياً.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
