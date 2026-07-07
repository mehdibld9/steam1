import { Header } from "@/components/layout/Header"
import { useGetMod, useTrackDownload, getGetModQueryKey, getListModsQueryKey } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { useParams, Link } from "wouter"
import { useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { ArrowRight, Download, ExternalLink, Timer } from "lucide-react"

export default function DownloadPage() {
  const { id, which } = useParams<{ id: string; which: string }>()
  const modId = id ? parseInt(id, 10) : 0
  const { data: mod, isLoading } = useGetMod(modId, {
    query: { enabled: !!modId, queryKey: getGetModQueryKey(modId) }
  })
  const trackDownload = useTrackDownload()
  const queryClient = useQueryClient()

  const [countdown, setCountdown] = useState(10)
  const [ready, setReady] = useState(false)
  const tracked = useRef(false)

  useEffect(() => {
    if (!mod) return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          setReady(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [mod])

  const downloadUrl = mod
    ? which === "1"
      ? mod.download1Url
      : mod.download2Url
    : null

  const downloadLabel = mod
    ? which === "1"
      ? mod.download1Label || "تحميل مباشر"
      : mod.download2Label || "رابط بديل"
    : ""

  const handleDownload = () => {
    if (!downloadUrl || !ready) return
    if (!tracked.current) {
      tracked.current = true
      trackDownload.mutate(
        { id: modId },
        {
          onSuccess: (updated) => {
            queryClient.setQueryData(getGetModQueryKey(modId), updated)
            queryClient.invalidateQueries({ queryKey: getListModsQueryKey() })
          }
        }
      )
    }
    window.location.href = downloadUrl
  }

  const circumference = 2 * Math.PI * 36
  const progress = ((10 - countdown) / 10) * circumference

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </main>
      </div>
    )
  }

  if (!mod || !downloadUrl) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">الرابط غير متاح</p>
            <Link href={`/mod/${modId}`}><Button variant="outline">العودة</Button></Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-8">

          {/* Mod info */}
          <div>
            <div className="text-primary text-xs font-bold uppercase tracking-wider mb-1">{mod.gameName}</div>
            <h1 className="text-2xl font-bold">{mod.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{downloadLabel}</p>
          </div>

          {/* Countdown ring */}
          <div className="flex flex-col items-center gap-4">
            {!ready ? (
              <>
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="36"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono text-primary">{countdown}</span>
                    <span className="text-xs text-muted-foreground">ثانية</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Timer className="w-4 h-4" />
                  انتظر لتفعيل زر التحميل
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Download className="w-8 h-8" />
                </div>
                <p className="text-primary font-bold">الرابط جاهز!</p>
              </div>
            )}
          </div>

          {/* Download button */}
          <Button
            size="lg"
            className="w-full h-14 text-lg gap-3"
            disabled={!ready}
            onClick={handleDownload}
          >
            <ExternalLink className="w-5 h-5" />
            {ready ? downloadLabel : `يرجى الانتظار ${countdown} ثانية...`}
          </Button>

          {/* Back link */}
          <Link href={`/mod/${modId}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة إلى صفحة التعريب
          </Link>

        </div>
      </main>
    </div>
  )
}
