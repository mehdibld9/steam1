import { useListAds } from "@workspace/api-client-react"

interface AdBannerProps {
  position: "home" | "mod_detail"
}

export function AdBanner({ position }: AdBannerProps) {
  const { data: ads } = useListAds()
  const filtered = ads?.filter((ad) => ad.position === position && ad.isActive) ?? []

  if (filtered.length === 0) return null

  return (
    <div className="flex flex-col gap-3 my-4">
      {filtered.map((ad) => (
        <a
          key={ad.id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors group relative"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title ?? "إعلان"}
            className="w-full object-cover max-h-28 group-hover:opacity-95 transition-opacity"
            onError={(e) => (e.currentTarget.parentElement!.style.display = "none")}
          />
          <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
            إعلان
          </div>
        </a>
      ))}
    </div>
  )
}
