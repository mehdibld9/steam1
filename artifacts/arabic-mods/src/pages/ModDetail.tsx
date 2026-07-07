import { Header } from "@/components/layout/Header"
import { useGetMod, getGetModQueryKey } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Download, Eye, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Link, useParams } from "wouter"
import { useState, useMemo } from "react"
import { AdBanner } from "@/components/AdBanner"

export default function ModDetail() {
  const { id } = useParams()
  const modId = id ? parseInt(id, 10) : 0
  const { data: mod, isLoading, isError } = useGetMod(modId, {
    query: { enabled: !!modId, queryKey: getGetModQueryKey(modId) }
  })
  const [imgIndex, setImgIndex] = useState(0)

  const allImages = useMemo(() => {
    const imgs: string[] = []
    if (mod?.imageUrl) imgs.push(mod.imageUrl)
    if (mod?.extraImages && Array.isArray(mod.extraImages)) {
      imgs.push(...mod.extraImages.filter(Boolean))
    }
    return imgs
  }, [mod])

  const hasPrev = imgIndex > 0
  const hasNext = imgIndex < allImages.length - 1

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-64 bg-card rounded-xl border border-border mb-8" />
            <div className="h-8 bg-card rounded w-1/4 mb-4" />
            <div className="h-12 bg-card rounded w-3/4 mb-8" />
            <div className="h-32 bg-card rounded mb-8" />
          </div>
        </main>
      </div>
    )
  }

  if (isError || !mod) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">التعريب غير موجود</h1>
          <Link href="/"><Button variant="outline">العودة للرئيسية</Button></Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>

          <div className="bg-card border border-border rounded-xl overflow-hidden mb-8 shadow-sm">

            {/* Image gallery */}
            {allImages.length > 0 && (
              <div className="relative border-b border-border group">
                <div className="w-full h-64 md:h-96 overflow-hidden bg-black">
                  <img
                    key={allImages[imgIndex]}
                    src={allImages[imgIndex]}
                    alt={`${mod.title} - صورة ${imgIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Arrow: previous (right in RTL) */}
                {hasPrev && (
                  <button
                    onClick={() => setImgIndex(i => i - 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                {/* Arrow: next (left in RTL) */}
                {hasNext && (
                  <button
                    onClick={() => setImgIndex(i => i + 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="الصورة التالية"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Dots indicator */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`rounded-full transition-all ${
                          i === imgIndex
                            ? "bg-primary w-3 h-3"
                            : "bg-white/50 hover:bg-white/80 w-2 h-2"
                        }`}
                        aria-label={`الصورة ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Counter */}
                {allImages.length > 1 && (
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-mono">
                    {imgIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
            )}

            {/* Thumbnails strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-b border-border bg-background/50">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                      i === imgIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="text-primary font-bold tracking-wider mb-2 text-sm uppercase">
                {mod.gameName}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{mod.title}</h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground bg-background/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg font-bold text-foreground">{mod.downloadCount.toLocaleString()}</span>
                  <span className="text-sm">تحميل</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg font-bold text-foreground">{mod.viewCount.toLocaleString()}</span>
                  <span className="text-sm">مشاهدة</span>
                </div>
              </div>

              {mod.description && (
                <div className="mb-10">
                  <div className="whitespace-pre-wrap text-muted-foreground text-lg leading-relaxed">
                    {mod.description}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  روابط التحميل
                </h2>

                <AdBanner position="mod_detail" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {mod.download1Url && (
                    <Link href={`/download/${mod.id}/1`}>
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg justify-between px-6"
                      >
                        {mod.download1Label || "تحميل مباشر"}
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}
                  {mod.download2Url && (
                    <Link href={`/download/${mod.id}/2`}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-14 text-lg justify-between px-6 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      >
                        {mod.download2Label || "رابط بديل"}
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}
                  {!mod.download1Url && !mod.download2Url && (
                    <div className="col-span-full text-center p-6 border border-dashed border-border rounded-lg text-muted-foreground">
                      لا توجد روابط تحميل متاحة حالياً.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
