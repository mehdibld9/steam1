import { Header } from "@/components/layout/Header"
import { useState, useEffect } from "react"
import { useVerifyAdmin, useListMods, useDeleteMod, useCreateMod, useUpdateMod, useGetStats, getListModsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQueryClient } from "@tanstack/react-query"
import { Edit, Trash2, Plus, LogOut, ArrowRight, BarChart3, Gamepad2, Download, Eye } from "lucide-react"
import type { Mod, ModInput, ModUpdate } from "@workspace/api-client-react"
import { Link } from "wouter"

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingMod, setEditingMod] = useState<Mod | null>(null)
  
  const adminRequestOptions = { headers: { 'x-admin-password': password } };

  const verifyAdmin = useVerifyAdmin()
  const { data: mods, isLoading: isModsLoading } = useListMods({ query: { enabled: isAuthenticated, queryKey: getListModsQueryKey() } })
  const { data: stats } = useGetStats({ 
    query: { enabled: isAuthenticated, queryKey: getGetStatsQueryKey() },
    request: adminRequestOptions
  })
  const deleteMod = useDeleteMod({ request: adminRequestOptions })
  const createMod = useCreateMod({ request: adminRequestOptions })
  const updateMod = useUpdateMod({ request: adminRequestOptions })
  const queryClient = useQueryClient()

  // Form state
  const [formData, setFormData] = useState<ModInput>({
    title: "",
    gameName: "",
    description: "",
    imageUrl: "",
    download1Label: "",
    download1Url: "",
    download2Label: "",
    download2Url: ""
  })

  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      verifyAdmin.mutate({ data: { password: savedPassword } }, {
        onSuccess: (res) => {
          if (res.success) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('adminPassword')
            setPassword("")
          }
        }
      })
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    verifyAdmin.mutate({ data: { password } }, {
      onSuccess: (res) => {
        if (res.success) {
          setIsAuthenticated(true)
          localStorage.setItem('adminPassword', password)
          setError("")
        } else {
          setError("كلمة المرور غير صحيحة")
        }
      },
      onError: () => {
        setError("حدث خطأ أثناء تسجيل الدخول")
      }
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminPassword')
    setIsAuthenticated(false)
    setPassword("")
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا التعريب؟")) {
      deleteMod.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListModsQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() })
        }
      })
    }
  }

  const openForm = (mod?: Mod) => {
    if (mod) {
      setEditingMod(mod)
      setFormData({
        title: mod.title,
        gameName: mod.gameName,
        description: mod.description || "",
        imageUrl: mod.imageUrl || "",
        download1Label: mod.download1Label || "",
        download1Url: mod.download1Url || "",
        download2Label: mod.download2Label || "",
        download2Url: mod.download2Url || ""
      })
    } else {
      setEditingMod(null)
      setFormData({
        title: "",
        gameName: "",
        description: "",
        imageUrl: "",
        download1Label: "",
        download1Url: "",
        download2Label: "",
        download2Url: ""
      })
    }
    setView('form')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingMod) {
      updateMod.mutate({ id: editingMod.id, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListModsQueryKey() })
          setView('list')
        }
      })
    } else {
      createMod.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListModsQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() })
          setView('list')
        }
      })
    }
  }

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
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    required
                    className="focus-visible:ring-primary text-center tracking-widest font-mono text-lg py-6"
                    data-testid="input-admin-password"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-bold">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg" 
                  disabled={verifyAdmin.isPending}
                  data-testid="btn-admin-login"
                >
                  {verifyAdmin.isPending ? "جاري التحقق..." : "دخول"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground">إدارة التعريبات والمحتوى</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" data-testid="btn-admin-logout">
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {view === 'list' ? (
          <>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-card/50 border-primary/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">إجمالي التعريبات</p>
                      <p className="text-3xl font-bold font-mono text-foreground">{stats.totalMods}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-secondary text-muted-foreground">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">إجمالي التحميلات</p>
                      <p className="text-3xl font-bold font-mono text-foreground">{stats.totalDownloads}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-secondary text-muted-foreground">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">إجمالي المشاهدات</p>
                      <p className="text-3xl font-bold font-mono text-foreground">{stats.totalViews}</p>
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
                <Button onClick={() => openForm()} data-testid="btn-admin-add-mod">
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
                      <th className="px-6 py-4 font-medium w-32">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isModsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">جاري التحميل...</td>
                      </tr>
                    ) : mods?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">لا توجد تعريبات مضافة.</td>
                      </tr>
                    ) : (
                      mods?.map((mod) => (
                        <tr key={mod.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-center text-muted-foreground">{mod.id}</td>
                          <td className="px-6 py-4 font-bold">
                            <Link href={`/mod/${mod.id}`} className="hover:text-primary transition-colors">
                              {mod.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-primary uppercase tracking-wider">
                              {mod.gameName}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-center text-muted-foreground">{mod.downloadCount}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => openForm(mod)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                title="تعديل"
                                data-testid={`btn-edit-mod-${mod.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(mod.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="حذف"
                                disabled={deleteMod.isPending}
                                data-testid={`btn-delete-mod-${mod.id}`}
                              >
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
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setView('list')} 
              className="mb-6 hover:bg-transparent hover:text-primary pl-0"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للقائمة
            </Button>
            
            <Card className="border-border">
              <CardHeader className="bg-secondary/20 border-b border-border">
                <CardTitle className="text-xl">
                  {editingMod ? "تعديل التعريب" : "إضافة تعريب جديد"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-primary font-bold">اسم التعريب *</Label>
                      <Input
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary"
                        data-testid="input-mod-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gameName" className="text-primary font-bold">اسم اللعبة بالإنجليزية *</Label>
                      <Input
                        id="gameName"
                        required
                        value={formData.gameName}
                        onChange={(e) => setFormData({...formData, gameName: e.target.value})}
                        dir="ltr"
                        className="bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary uppercase text-sm font-bold tracking-widest text-left"
                        data-testid="input-mod-gamename"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="font-bold">رابط صورة الغلاف</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      dir="ltr"
                      className="bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary text-left"
                      placeholder="https://..."
                      data-testid="input-mod-image"
                    />
                    {formData.imageUrl && (
                      <div className="mt-2 h-32 w-full md:w-64 rounded-md overflow-hidden border border-border">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="min-h-[150px] bg-secondary/50 focus-visible:ring-primary border-transparent focus-visible:border-primary resize-y"
                      data-testid="input-mod-description"
                    />
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
                          <Input
                            id="download1Label"
                            value={formData.download1Label}
                            onChange={(e) => setFormData({...formData, download1Label: e.target.value})}
                            placeholder="تحميل مباشر"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="download1Url">الزر الأول - الرابط</Label>
                          <Input
                            id="download1Url"
                            type="url"
                            value={formData.download1Url}
                            onChange={(e) => setFormData({...formData, download1Url: e.target.value})}
                            dir="ltr"
                            placeholder="https://..."
                            className="bg-background text-left"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="download2Label">الزر الثاني - النص</Label>
                          <Input
                            id="download2Label"
                            value={formData.download2Label}
                            onChange={(e) => setFormData({...formData, download2Label: e.target.value})}
                            placeholder="رابط بديل"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="download2Url">الزر الثاني - الرابط</Label>
                          <Input
                            id="download2Url"
                            type="url"
                            value={formData.download2Url}
                            onChange={(e) => setFormData({...formData, download2Url: e.target.value})}
                            dir="ltr"
                            placeholder="https://..."
                            className="bg-background text-left"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setView('list')}>
                      إلغاء
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMod.isPending || updateMod.isPending}
                      className="px-8"
                      data-testid="btn-mod-submit"
                    >
                      {createMod.isPending || updateMod.isPending ? "جاري الحفظ..." : "حفظ التعريب"}
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
