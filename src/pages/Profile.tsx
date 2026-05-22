import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NovelCard } from '@/components/NovelCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Settings, LogOut, Loader2, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function Profile() {
  const { id } = useParams()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [library, setLibrary] = useState<any[]>([])
  const [authoredNovels, setAuthoredNovels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isOwnProfile = !id || (user && id === user.id)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const targetId = id || user?.id
        if (!targetId) {
          navigate('/')
          return
        }

        const u = await pb.collection('users').getOne(targetId)
        setProfileUser(u)

        const [libRes, novelsRes] = await Promise.all([
          pb
            .collection('library_entries')
            .getFullList({ filter: `user = "${targetId}"`, expand: 'novel,last_chapter' }),
          pb.collection('novels').getFullList({ filter: `author = "${targetId}"` }),
        ])

        setLibrary(libRes)
        setAuthoredNovels(novelsRes)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id, user, navigate])

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Usuário não encontrado.
      </div>
    )
  }

  const reading = library.filter((e) => e.status === 'reading')
  const plan = library.filter((e) => e.status === 'plan_to_read')
  const completed = library.filter((e) => e.status === 'completed')

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="h-48 bg-muted w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12 -mt-16 md:ml-6">
          <Avatar className="w-32 h-32 border-4 border-background bg-card shadow-xl relative z-20">
            <AvatarImage
              src={
                profileUser?.avatar
                  ? pb.files.getURL(profileUser, profileUser.avatar)
                  : `https://img.usecurling.com/ppl/thumbnail?seed=${profileUser?.id}`
              }
            />
            <AvatarFallback>{profileUser?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {profileUser?.name || profileUser?.email?.split('@')[0] || 'Usuário'}
              </h1>
            </div>
            {profileUser.bio && (
              <p className="text-muted-foreground text-sm max-w-2xl mt-2">{profileUser.bio}</p>
            )}
          </div>
          {isOwnProfile && (
            <div className="flex gap-3 shrink-0">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 mb-8">
            <TabsTrigger
              value="library"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 text-base text-muted-foreground"
            >
              Biblioteca ({library.length})
            </TabsTrigger>
            {authoredNovels.length > 0 && (
              <TabsTrigger
                value="authored"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 text-base text-muted-foreground"
              >
                Obras ({authoredNovels.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="library" className="animate-in fade-in">
            <div className="space-y-12">
              {reading.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" /> Lendo
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {reading.map((entry) => (
                      <div key={entry.id} className="relative group">
                        <NovelCard novel={entry.expand?.novel} />
                        {entry.expand?.last_chapter && (
                          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary border">
                            Cap. {entry.expand.last_chapter.chapter_number}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Quero Ler</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {plan.map((entry) => (
                      <NovelCard key={entry.id} novel={entry.expand?.novel} />
                    ))}
                  </div>
                </div>
              )}

              {completed.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Concluídos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {completed.map((entry) => (
                      <NovelCard key={entry.id} novel={entry.expand?.novel} />
                    ))}
                  </div>
                </div>
              )}

              {library.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  A biblioteca está vazia.
                </div>
              )}
            </div>
          </TabsContent>

          {authoredNovels.length > 0 && (
            <TabsContent value="authored" className="animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {authoredNovels.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
