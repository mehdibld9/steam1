import { Header } from "@/components/layout/Header"
import { useGetMod, useTrackDownload, getGetModQueryKey } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Download, Eye, ArrowRight, ExternalLink } from "lucide-react"
import { Link, useParams } from "wouter"
import { useQueryClient } from "@tanstack/react-query"

export default function ModDetail() {
  const { id } = useParams()
  const modId = id ? parseInt(id, 10) : 0
  const { data: mod, isLoading, isError } = useGetMod(modId, {
    query: {
      enabled: !!modId,
      queryKey: getGetModQueryKey(modId)
    }
  })
  const trackDownload = useTrackDownload()
  const queryClient = useQueryClient()

  const handleDownloadClick = (url: string) => {
    trackDownload.mutate(
      { id: modId },
      {
        onSuccess: (updatedMod) => {
          queryClient.setQueryData(getGetModQueryKey(modId), updatedMod)
        }
      }
    )
    window.open(url, '_blank')
  }

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
          <Link href="/">
            <Button variant="outline">العودة للرئيسية</Button>
          </Link>
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
            {mod.imageUrl ? (
              <div className="w-full h-64 md:h-96 relative border-b border-border">
                <img 
                  src={mod.imageUrl} 
                  alt={mod.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            
            <div className="p-6 md:p-8">
              <div className="text-primary font-bold tracking-wider mb-2 text-sm uppercase">
                {mod.gameName}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{mod.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground bg-background/50 p-4 rounded-lg border border-border inline-flex">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg font-bold text-foreground">{mod.downloadCount}</span>
                  <span className="text-sm">تحميل</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg font-bold text-foreground">{mod.viewCount}</span>
                  <span className="text-sm">مشاهدة</span>
                </div>
              </div>
              
              {mod.description && (
                <div className="prose prose-invert max-w-none mb-10 prose-p:leading-relaxed prose-headings:text-primary">
                  <div className="whitespace-pre-wrap text-muted-foreground text-lg">
                    {mod.description}
                  </div>
                </div>
              )}
              
              <div className="border-t border-border pt-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  روابط التحميل
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.download1Url && (
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-lg justify-between px-6"
                      onClick={() => handleDownloadClick(mod.download1Url!)}
                      data-testid={`btn-download-1-${mod.id}`}
                    >
                      {mod.download1Label || 'تحميل مباشر'}
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  )}
                  {mod.download2Url && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full h-14 text-lg justify-between px-6 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      onClick={() => handleDownloadClick(mod.download2Url!)}
                      data-testid={`btn-download-2-${mod.id}`}
                    >
                      {mod.download2Label || 'رابط بديل'}
                      <ExternalLink className="w-5 h-5" />
                    </Button>
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
