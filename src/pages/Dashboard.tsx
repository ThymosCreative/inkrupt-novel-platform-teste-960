import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, MessageSquare, Eye, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [novels, setNovels] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    try {
      const novelsRes = await pb.collection('novels').getFullList({
        filter: `author = "${user.id}"`,
        sort: '-created',
      })
      setNovels(novelsRes)

      const reviewsReq = pb.collection('reviews').getList(1, 10, {
        filter: `novel.author = "${user.id}"`,
        sort: '-created',
        expand: 'user,novel',
      })

      const commentsReq = pb.collection('comments').getList(1, 10, {
        filter: `chapter.novel.author = "${user.id}"`,
        sort: '-created',
        expand: 'user,chapter,chapter.novel',
      })

      const [reviewsRes, commentsRes] = await Promise.all([reviewsReq, commentsReq])

      setTotalReviews(reviewsRes.totalItems)

      const allActivities = [
        ...reviewsRes.items.map((i) => ({ ...i, type: 'review' })),
        ...commentsRes.items.map((i) => ({ ...i, type: 'comment' })),
      ]
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .slice(0, 10)

      setActivities(allActivities)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  const totalReads = novels.reduce((acc, n) => acc + (n.reads || 0), 0)
  const ratedNovels = novels.filter((n) => n.rating > 0)
  const avgRating = ratedNovels.length
    ? ratedNovels.reduce((acc, n) => acc + n.rating, 0) / ratedNovels.length
    : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black">Author Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reads</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReads.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Your Novels</h2>
          <div className="bg-card rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Reads</th>
                    <th className="px-4 py-3 font-medium text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {novels.map((novel) => (
                    <tr key={novel.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <Link to={`/novel/${novel.id}`} className="hover:underline">
                          {novel.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          {novel.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{novel.reads?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-right">
                        {novel.rating ? novel.rating.toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                  {novels.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No novels published yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="bg-card border-muted overflow-hidden">
                <CardContent className="p-4 flex gap-3">
                  <div className="mt-1 shrink-0">
                    {activity.type === 'review' ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold text-foreground">
                        {activity.expand?.user?.name || 'User'}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        {activity.type === 'review' ? 'reviewed' : 'commented on'}
                      </span>{' '}
                      <Link
                        to={`/novel/${activity.type === 'review' ? activity.novel : activity.expand?.chapter?.novel}`}
                        className="font-medium text-foreground hover:underline truncate inline-block max-w-full align-bottom"
                      >
                        {activity.type === 'review'
                          ? activity.expand?.novel?.title
                          : activity.expand?.chapter?.expand?.novel?.title}
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
                      "{activity.content}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(activity.created).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border rounded-xl bg-card">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
