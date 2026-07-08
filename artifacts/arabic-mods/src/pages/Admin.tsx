import { Header } from "@/components/layout/Header"
import { useState, useEffect } from "react"
import {
  useVerifyAdmin, useSetupAdmin, useGetAdminStatus,
  useListMods, useDeleteMod, useCreateMod, useUpdateMod,
  useGetStats, getListModsQueryKey, getGetStatsQueryKey,
  useListAds, useCreateAd, useUpdateAd, useDeleteAd,
  getListAdsQueryKey,
  useGetSettings, useUpdateSettings, getGetSettingsQueryKey,
} from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQueryClient } from "@tanstack/react-query"
import { Edit, Trash2, Plus, LogOut, ArrowRight, BarChart3, Gamepad2, Download, Eye, X, ImagePlus, KeyRound, Megaphone, Globe, Home, ToggleLeft, ToggleRight, Settings, Mail } from "lucide-react"
import type { Mod, Ad } from "@workspace/api-client-react"
import { Link } from "wouter"

interface FormData {
  title: string
  gameName: string
  description: string
  imageUrl: string
  extraImages: string[]
  download1Label: string
  download1Url: string
  download2Label: string
  download2Url: string
}

const EMPTY_FORM: FormData = {
  title: "",
  gameName: "",
  description: "",
  imageUrl: "",
  extraImages: [],
  download1Label: "",
  download1Url: "",
  download2Label: "",
  download2Url: "",
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [setupUsername, setSetupUsername] = useState("")
  const [setupPassword, setSetupPassword] = useState("")
  const [setupConfirm, setSetupConfirm] = useState("")
  const [error, setError] = useState("")
  const [view, setView] = useState<"list" | "form">("list")
  const [editingMod, setEditingMod] = useState<Mod | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [newExtraImageUrl, setNewExtraImageUrl] = useState("")

  // Ad management state
  const [adSection, setAdSection] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [adForm, setAdForm] = useState({ title: "", imageUrl: "", linkUrl: "", position: "home" as "home" | "mod_detail", isActive: true })
  const [showAdForm, setShowAdForm] = useState(false)

  // Settings state
  const [settingsSection, setSettingsSection] = useState(false)
  const [contactUrlInput, setContactUrlInput] = useState("")
  const [settingsSaved, setSettingsSaved] = useState(false)

  const adminHeader = { headers: { "x-admin-password": password } }

  const { data: adminStatus, isLoading: isStatusLoading } = useGetAdminStatus()
  const verifyAdmin = useVerifyAdmin()
  const setupAdmin = useSetupAdmin()
  const { data: mods, isLoading: isModsLoading } = useListMods({
    query: { enabled: isAuthenticated, queryKey: getListModsQueryKey() }
  })
  const { data: stats } = useGetStats({
    query: { enabled: isAuthenticated, queryKey: getGetStatsQueryKey() },
    request: adminHeader,
  })
  const { data: ads, isLoading: isAdsLoading } = useListAds({
    query: { enabled: isAuthenticated, queryKey: getListAdsQueryKey() }
  })
  const deleteMod = useDeleteMod({ request: adminHeader })
  const createMod = useCreateMod({ request: adminHeader })
  const updateMod = useUpdateMod({ request: adminHeader })
  const createAd = useCreateAd({ request: adminHeader })
  const updateAd = useUpdateAd({ request: adminHeader })
  const deleteAd = useDeleteAd({ request: adminHeader })
  const { data: settingsData } = useGetSettings({
    query: { enabled: isAuthenticated, queryKey: getGetSettingsQueryKey() }
  })
  const updateSettings = useUpdateSettings({ request: adminHeader })
  const queryClient = useQueryClient()

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (setupPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }
    if (!setupUsername.trim()) {
      setError("يرجى إدخال اسم المستخدم")
      return
    }
    if (setupPassword !== setupConfirm) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }
    setupAdmin.mutate(
      { data: { username: setupUsername.trim(), password: setupPassword } },
      {
        onSuccess: () => {
          setUsername(setupUsername.trim())
          setPassword(setupPassword)
          setIsAuthenticated(true)
          setError("")
          queryClient.invalidateQueries()
        },
        onError: () => setError("حدث خطأ أثناء الإعداد"),
      }
    )
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    verifyAdmin.mutate(
      { data: { username, password } },
      {
        onSuccess: (res) => {
          if (res.success) {
            setIsAuthenticated(true)
            setError("")
          } else {
            setError("بيانات الدخول غير صحيحة")
          }
        },
        onError: () => setError("بيانات الدخول غير صحيحة"),
      }
    )
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
  }

  const openAdForm = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad)
      setAdForm({ title: ad.title ?? "", imageUrl: ad.imageUrl, linkUrl: ad.linkUrl, position: ad.position as "home" | "mod_detail", isActive: ad.isActive })
    } else {
      setEditingAd(null)
      setAdForm({ title: "", imageUrl: "", linkUrl: "", position: "home", isActive: true })
    }
    setShowAdForm(true)
  }

  // Sync settingsData into the input when loaded
  useEffect(() => {
    if (settingsData !== undefined) {
      setContactUrlInput(settingsData.contactUrl ?? "")
    }
  }, [settingsData])

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings.mutate(
      { data: { contactUrl: contactUrlInput.trim() || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() })
          setSettingsSaved(true)
          setTimeout(() => setSettingsSaved(false), 2500)
        }
      }
    )
  }

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...adForm, title: adForm.title || undefined }
    if (editingAd) {
      updateAd.mutate(
        { id: editingAd.id, data: payload },
        { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() }); setShowAdForm(false) } }
      )
    } else {
      createAd.mutate(
        { data: payload },
        { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() }); setShowAdForm(false) } }
      )
    }
  }

  const handleDeleteAd = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return
    deleteAd.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() }) })
  }

  const toggleAdActive = (ad: Ad) => {
    updateAd.mutate(
      { id: ad.id, data: { imageUrl: ad.imageUrl, linkUrl: ad.linkUrl, position: ad.position as "home" | "mod_detail", isActive: !ad.isActive } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() }) }
    )
  }

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعريب؟")) return
    deleteMod.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListModsQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() })
        },
      }
    )
  }

  const openForm = (mod?: Mod) => {
    if (mod) {
      setEditingMod(mod)
      setFormData({
        title: mod.title,
        gameName: mod.gameName,
        description: mod.description ?? "",
        imageUrl: mod.imageUrl ?? "",
        extraImages: Array.isArray(mod.extraImages) ? mod.extraImages : [],
        download1Label: mod.download1Label ?? "",
        download1Url: mod.download1Url ?? "",
        download2Label: mod.download2Label ?? "",
        download2Url: mod.download2Url ?? "",
      })
    } else {
      setEditingMod(null)
      setFormData(EMPTY_FORM)
    }
    setNewExtraImageUrl("")
    setView("form")
  }

  const addExtraImage = () => {
    const url = newExtraImageUrl.trim()
    if (!url) return
    setFormData((f) => ({ ...f, extraImages: [...f.extraImages, url] }))
    setNewExtraImageUrl("")
  }

  const removeExtraImage = (idx: number) => {
    setFormData((f) => ({ ...f, extraImages: f.extraImages.filter((_, i) => i !== idx) }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: formData.title,
      gameName: formData.gameName,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      extraImages: formData.extraImages,
      download1Label: formData.download1Label || undefined,
      download1Url: formData.download1Url || undefined,
      download2Label: formData.download2Label || undefined,
      download2Url: formData.download2Url || undefined,
    }
    if (editingMod) {
      updateMod.mutate(
        { id: editingMod.id, data: payload },
        { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListModsQueryKey() }); setView("list") } }
      )
    } else {
      createMod.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListModsQueryKey() })
            queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() })
            setView("list")
          },
        }
      )
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (isStatusLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </main>
      </div>
    )
  }

  // ─── First-time setup ─────────────────────────────────────────────────────────
  if (!adminStatus?.isSetup) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <KeyRound className="w-6 h-6" />
                </div>
              </div>
              <CardTitle className="text-2xl text-primary font-bold">إعداد كلمة مرور الإدارة</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">أول مرة — اختر كلمة مرور للوحة التحكم</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-username">اسم المستخدم</Label>
                  <Input
                    id="setup-username"
                    type="text"
                    value={setupUsername}
                    onChange={(e) => setSetupUsername(e.target.value)}
                    dir="ltr"
                    required
                    autoComplete="username"
                    className="focus-visible:ring-primary font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-password">كلمة المرور (6 أحرف على الأقل)</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    dir="ltr"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="focus-visible:ring-primary font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-confirm">تأكيد كلمة المرور</Label>
                  <Input
                    id="setup-confirm"
                    type="password"
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    dir="ltr"
                    required
                    autoComplete="new-password"
                    className="focus-visible:ring-primary font-mono"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-bold">{error}</p>}
                <Button type="submit" className="w-full py-6 text-lg" disabled={setupAdmin.isPending}>
                  {setupAdmin.isPending ? "جاري الحفظ..." : "تعيين كلمة المرور والدخول"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // ─── Login ────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-primary font-bold">تسجيل الدخول للإدارة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    dir="ltr"
                    required
                    autoComplete="username"
                    className="focus-visible:ring-primary font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    required
                    autoComplete="current-password"
                    className="focus-visible:ring-primary font-mono"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-bold">{error}</p>}
                <Button type="submit" className="w-full py-6 text-lg" disabled={verifyAdmin.isPending}>
                  {verifyAdmin.isPending ? "جاري التحقق..." : "دخول"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground">إدارة التعريبات والمحتوى</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {view === "list" ? (
          <>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-card/50 border-primary/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary"><Gamepad2 className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">إجمالي التعريبات</p>
                      <p className="text-3xl font-bold font-mono">{stats.totalMods}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-secondary text-muted-foreground"><Download className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">إجمالي التحميلات</p>
                      <p className="text-3xl font-bold font-mono">{stats.totalDownloads.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-secondary text-muted-foreground"><Eye className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">إجمالي المشاهدات</p>
                      <p className="text-3xl font-bold font-mono">{stats.totalViews.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card/80">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  قائمة التعريبات
                </h2>
                <Button onClick={() => openForm()}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة تعريب
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium w-16 text-center">ID</th>
                      <th className="px-6 py-4 font-medium">التعريب</th>
                      <th className="px-6 py-4 font-medium">اللعبة</th>
                      <th className="px-6 py-4 font-medium w-24 text-center">التحميلات</th>
                      <th className="px-6 py-4 font-medium w-24 text-center">المشاهدات</th>
                      <th className="px-6 py-4 font-medium w-32">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isModsLoading ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
                    ) : mods?.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">لا توجد تعريبات مضافة.</td></tr>
                    ) : (
                      mods?.map((mod) => (
                        <tr key={mod.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-center text-muted-foreground">{mod.id}</td>
                          <td className="px-6 py-4 font-bold">
                            <Link href={`/mod/${mod.id}`} className="hover:text-primary transition-colors">{mod.title}</Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-primary uppercase tracking-wider">{mod.gameName}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-center text-muted-foreground">{mod.downloadCount.toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-center text-muted-foreground">{mod.viewCount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openForm(mod)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(mod.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" disabled={deleteMod.isPending}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── Ads Management ─────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mt-8">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card/80">
                <button
                  type="button"
                  className="font-bold text-lg flex items-center gap-2 hover:text-primary transition-colors"
                  onClick={() => setAdSection((v) => !v)}
                >
                  <Megaphone className="w-5 h-5 text-primary" />
                  إدارة الإعلانات
                  <span className="text-xs text-muted-foreground font-normal mr-1">({ads?.length ?? 0} إعلان)</span>
                  <span className="text-muted-foreground text-sm">{adSection ? "▲" : "▼"}</span>
                </button>
                {adSection && (
                  <Button size="sm" onClick={() => openAdForm()}>
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة إعلان
                  </Button>
                )}
              </div>

              {adSection && (
                <div className="p-4">
                  {showAdForm && (
                    <div className="mb-6 p-4 bg-secondary/20 rounded-lg border border-border">
                      <h3 className="font-bold mb-4">{editingAd ? "تعديل الإعلان" : "إضافة إعلان جديد"}</h3>
                      <form onSubmit={handleAdSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>الموضع</Label>
                            <select
                              value={adForm.position}
                              onChange={(e) => setAdForm({ ...adForm, position: e.target.value as "home" | "mod_detail" })}
                              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                              <option value="home">الصفحة الرئيسية</option>
                              <option value="mod_detail">صفحة التعريب</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>العنوان (اختياري)</Label>
                            <Input value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} placeholder="عنوان الإعلان" className="bg-background" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>رابط صورة الإعلان *</Label>
                          <Input required type="url" dir="ltr" value={adForm.imageUrl} onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })} placeholder="https://..." className="bg-background text-left" />
                        </div>
                        <div className="space-y-2">
                          <Label>رابط الوجهة *</Label>
                          <Input required type="url" dir="ltr" value={adForm.linkUrl} onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })} placeholder="https://..." className="bg-background text-left" />
                        </div>
                        {adForm.imageUrl && (
                          <div className="h-20 w-full max-w-xs rounded overflow-hidden border border-border">
                            <img src={adForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isActive" checked={adForm.isActive} onChange={(e) => setAdForm({ ...adForm, isActive: e.target.checked })} className="w-4 h-4" />
                          <Label htmlFor="isActive">نشط (مرئي للزوار)</Label>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="submit" disabled={createAd.isPending || updateAd.isPending}>
                            {createAd.isPending || updateAd.isPending ? "جاري الحفظ..." : editingAd ? "حفظ التعديلات" : "إضافة الإعلان"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAdForm(false)}>إلغاء</Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {isAdsLoading ? (
                    <p className="text-center text-muted-foreground py-4">جاري التحميل...</p>
                  ) : !ads?.length ? (
                    <p className="text-center text-muted-foreground py-4">لا توجد إعلانات مضافة.</p>
                  ) : (
                    <div className="space-y-2">
                      {ads.map((ad) => (
                        <div key={ad.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-secondary/10">
                          <div className="w-20 h-12 rounded overflow-hidden border border-border flex-shrink-0 bg-secondary/20">
                            <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-sm truncate">{ad.title || "(بلا عنوان)"}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground flex items-center gap-1">
                                {ad.position === "home" ? <Home className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                {ad.position === "home" ? "الرئيسية" : "صفحة التعريب"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate dir-ltr">{ad.linkUrl}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" title={ad.isActive ? "نشط – انقر لإيقاف" : "متوقف – انقر لتفعيل"} onClick={() => toggleAdActive(ad)} className={`transition-colors ${ad.isActive ? "text-primary" : "text-muted-foreground"}`}>
                              {ad.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                            </button>
                            <Button variant="ghost" size="icon" onClick={() => openAdForm(ad)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAd(ad.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── Site Settings ─────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mt-8">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card/80">
                <button
                  type="button"
                  className="font-bold text-lg flex items-center gap-2 hover:text-primary transition-colors"
                  onClick={() => setSettingsSection((v) => !v)}
                >
                  <Settings className="w-5 h-5 text-primary" />
                  إعدادات الموقع
                  <span className="text-muted-foreground text-sm">{settingsSection ? "▲" : "▼"}</span>
                </button>
              </div>

              {settingsSection && (
                <div className="p-4">
                  <form onSubmit={handleSettingsSave} className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                      <Label htmlFor="contactUrl" className="flex items-center gap-2 font-bold">
                        <Mail className="w-4 h-4 text-primary" />
                        رابط صفحة التواصل
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        يظهر في شريط التنقل كزر "تواصل معنا". يمكن أن يكون رابط واتساب، تيليجرام، نموذج اتصال، إلخ.
                      </p>
                      <Input
                        id="contactUrl"
                        type="url"
                        dir="ltr"
                        value={contactUrlInput}
                        onChange={(e) => setContactUrlInput(e.target.value)}
                        placeholder="https://t.me/yourhandle أو https://wa.me/..."
                        className="bg-background text-left"
                      />
                      {contactUrlInput && (
                        <p className="text-xs text-muted-foreground">
                          معاينة:{" "}
                          <a href={contactUrlInput} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                            {contactUrlInput}
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button type="submit" disabled={updateSettings.isPending}>
                        {updateSettings.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                      </Button>
                      {settingsSaved && (
                        <span className="text-sm text-primary font-medium">✓ تم الحفظ</span>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => setView("list")} className="mb-6 hover:bg-transparent hover:text-primary pl-0">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للقائمة
            </Button>
            <Card className="border-border">
              <CardHeader className="bg-secondary/20 border-b border-border">
                <CardTitle className="text-xl">{editingMod ? "تعديل التعريب" : "إضافة تعريب جديد"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-primary font-bold">اسم التعريب *</Label>
                      <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gameName" className="text-primary font-bold">اسم اللعبة بالإنجليزية *</Label>
                      <Input id="gameName" required value={formData.gameName} onChange={(e) => setFormData({ ...formData, gameName: e.target.value })} dir="ltr" className="bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary uppercase text-sm font-bold tracking-widest text-left" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="font-bold">رابط صورة الغلاف</Label>
                    <Input id="imageUrl" type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} dir="ltr" className="bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary text-left" placeholder="https://..." />
                    {formData.imageUrl && (
                      <div className="mt-2 h-32 w-full md:w-64 rounded-md overflow-hidden border border-border">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-primary" />
                      صور إضافية (معرض الصور)
                    </Label>
                    <div className="bg-secondary/20 p-4 rounded-lg border border-border space-y-3">
                      {formData.extraImages.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-12 h-9 rounded overflow-hidden border border-border flex-shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                          </div>
                          <Input value={url} onChange={(e) => {
                            const imgs = [...formData.extraImages]; imgs[idx] = e.target.value
                            setFormData({ ...formData, extraImages: imgs })
                          }} dir="ltr" className="bg-background text-left text-xs flex-1 h-8" />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeExtraImage(idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input type="url" value={newExtraImageUrl} onChange={(e) => setNewExtraImageUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExtraImage() } }}
                          dir="ltr" placeholder="https://... (اضغط Enter أو +)" className="bg-background text-left text-sm h-9" />
                        <Button type="button" variant="outline" size="sm" onClick={addExtraImage} className="flex-shrink-0 h-9">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">الوصف</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[150px] bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary resize-y" />
                  </div>

                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" />
                      روابط التحميل
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-4 rounded-lg border border-border">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="download1Label">الزر الأول - النص</Label>
                          <Input id="download1Label" value={formData.download1Label} onChange={(e) => setFormData({ ...formData, download1Label: e.target.value })} placeholder="تحميل مباشر" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="download1Url">الزر الأول - الرابط</Label>
                          <Input id="download1Url" type="url" value={formData.download1Url} onChange={(e) => setFormData({ ...formData, download1Url: e.target.value })} dir="ltr" placeholder="https://..." className="bg-background text-left" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="download2Label">الزر الثاني - النص</Label>
                          <Input id="download2Label" value={formData.download2Label} onChange={(e) => setFormData({ ...formData, download2Label: e.target.value })} placeholder="رابط بديل" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="download2Url">الزر الثاني - الرابط</Label>
                          <Input id="download2Url" type="url" value={formData.download2Url} onChange={(e) => setFormData({ ...formData, download2Url: e.target.value })} dir="ltr" placeholder="https://..." className="bg-background text-left" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setView("list")}>إلغاء</Button>
                    <Button type="submit" disabled={createMod.isPending || updateMod.isPending}>
                      {createMod.isPending || updateMod.isPending ? "جاري الحفظ..." : editingMod ? "حفظ التعديلات" : "إضافة التعريب"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
