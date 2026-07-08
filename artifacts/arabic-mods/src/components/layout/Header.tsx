import * as React from "react"
import { Link } from "wouter"
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react"
import { Mail } from "lucide-react"

export function Header() {
  const { data: settings } = useGetSettings({
    query: { queryKey: getGetSettingsQueryKey(), staleTime: 60_000 }
  })

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex flex-col">
          <span className="font-bold text-xl leading-none">مكتبة التعريب</span>
          <span className="text-primary text-xs font-bold leading-none mt-1">الترجمات العربية</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            الرئيسية
          </Link>
          {settings?.contactUrl && (
            <a
              href={settings.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              تواصل معنا
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
