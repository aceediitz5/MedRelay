"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  Trophy,
  Flame,
  Zap,
  Crown,
  Medal,
  User,
  TrendingUp,
  Calendar,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  xp_earned: number
  study_streak: number
  level: number
  isCurrentUser: boolean
}

type TimeFilter = "week" | "month" | "all"

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // Calculate date range
      const now = new Date()
      let startDate: string | null = null
      
      if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        startDate = weekAgo.toISOString().split("T")[0]
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        startDate = monthAgo.toISOString().split("T")[0]
      }

      let query = supabase
        .from("daily_study_logs")
        .select("user_id, xp_earned")

      if (startDate) {
        query = query.gte("study_date", startDate)
      }

      const { data: studyLogs } = await query

      // Aggregate XP by user
      const xpByUser: Record<string, number> = {}
      studyLogs?.forEach(log => {
        if (!xpByUser[log.user_id]) xpByUser[log.user_id] = 0
        xpByUser[log.user_id] += log.xp_earned || 0
      })

      // Get user profiles
      const userIds = Object.keys(xpByUser)
      if (userIds.length === 0) {
        setLeaderboard([])
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, study_streak, level")
        .in("id", userIds)

      // Build leaderboard
      const entries: LeaderboardEntry[] = userIds
        .map(userId => {
          const profile = profiles?.find(p => p.id === userId)
          return {
            rank: 0,
            user_id: userId,
            username: profile?.username || "Anonymous",
            avatar_url: profile?.avatar_url,
            xp_earned: xpByUser[userId],
            study_streak: profile?.study_streak || 0,
            level: profile?.level || 1,
            isCurrentUser: userId === user?.id,
          }
        })
        .sort((a, b) => b.xp_earned - a.xp_earned)
        .slice(0, 100)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))

      setLeaderboard(entries)

      // Find current user's rank if not in top 100
      const currentUserEntry = entries.find(e => e.isCurrentUser)
      if (!currentUserEntry && user) {
        const userXp = xpByUser[user.id] || 0
        const userProfile = profiles?.find(p => p.id === user.id)
        const rank = entries.filter(e => e.xp_earned > userXp).length + 1
        setCurrentUserRank({
          rank,
          user_id: user.id,
          username: userProfile?.username || "You",
          avatar_url: userProfile?.avatar_url,
          xp_earned: userXp,
          study_streak: userProfile?.study_streak || 0,
          level: userProfile?.level || 1,
          isCurrentUser: true,
        })
      } else {
        setCurrentUserRank(null)
      }

      setLoading(false)
    }

    fetchLeaderboard()
  }, [timeFilter])

  const filterOptions: { value: TimeFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "week", label: "This Week", icon: Calendar },
    { value: "month", label: "This Month", icon: Calendar },
    { value: "all", label: "All Time", icon: TrendingUp },
  ]

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Compete with other students and climb the ranks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(option.value)}
              className={timeFilter === option.value ? "bg-primary text-primary-foreground" : ""}
            >
              <option.icon className="w-4 h-4 mr-2" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* Second Place */}
          <GlassCard className="text-center pb-6 pt-8 border-gray-400/30">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center mx-auto">
                {leaderboard[1].avatar_url ? (
                  <img 
                    src={leaderboard[1].avatar_url} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-background font-bold">
                2
              </div>
            </div>
            <h3 className="font-semibold text-foreground truncate px-2">{leaderboard[1].username}</h3>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mt-1">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{leaderboard[1].xp_earned.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-warning text-sm mt-1">
              <Flame className="w-3 h-3" />
              <span>{leaderboard[1].study_streak} day streak</span>
            </div>
          </GlassCard>

          {/* First Place */}
          <GlassCard className="text-center pb-8 pt-10 border-yellow-500/30 bg-yellow-500/5" glow>
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto ring-4 ring-yellow-500/30">
                {leaderboard[0].avatar_url ? (
                  <img 
                    src={leaderboard[0].avatar_url} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-yellow-400" />
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-background font-bold text-lg">
                1
              </div>
            </div>
            <h3 className="font-bold text-lg text-foreground truncate px-2">{leaderboard[0].username}</h3>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mt-1">
              <Zap className="w-5 h-5" />
              <span className="font-bold text-lg">{leaderboard[0].xp_earned.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-warning text-sm mt-1">
              <Flame className="w-4 h-4" />
              <span>{leaderboard[0].study_streak} day streak</span>
            </div>
          </GlassCard>

          {/* Third Place */}
          <GlassCard className="text-center pb-4 pt-6 border-amber-700/30">
            <div className="relative inline-block mb-4">
              <div className="w-14 h-14 rounded-full bg-amber-700/20 flex items-center justify-center mx-auto">
                {leaderboard[2].avatar_url ? (
                  <img 
                    src={leaderboard[2].avatar_url} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-amber-700" />
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center text-background font-bold text-sm">
                3
              </div>
            </div>
            <h3 className="font-semibold text-foreground truncate px-2 text-sm">{leaderboard[2].username}</h3>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mt-1 text-sm">
              <Zap className="w-3 h-3" />
              <span className="font-bold">{leaderboard[2].xp_earned.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-warning text-xs mt-1">
              <Flame className="w-3 h-3" />
              <span>{leaderboard[2].study_streak} day streak</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Rankings Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Rankings</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{leaderboard.length} students</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-center">Streak</div>
              <div className="col-span-2 text-right">XP Earned</div>
            </div>
            
            {leaderboard.slice(3).map((entry) => (
              <LeaderboardRow key={entry.user_id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity recorded for this period</p>
          </div>
        )}
      </GlassCard>

      {/* Current User (if not in top 100) */}
      {currentUserRank && (
        <GlassCard className="border-primary/30">
          <p className="text-sm text-muted-foreground mb-3">Your Position</p>
          <LeaderboardRow entry={currentUserRank} highlighted />
        </GlassCard>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, highlighted }: { entry: LeaderboardEntry; highlighted?: boolean }) {
  return (
    <div 
      className={cn(
        "grid grid-cols-12 gap-4 px-4 py-3 rounded-lg items-center transition-colors",
        entry.isCurrentUser || highlighted
          ? "bg-primary/10 border border-primary/30"
          : "bg-secondary/30 hover:bg-secondary/50"
      )}
    >
      <div className="col-span-1">
        <span className={cn(
          "font-bold",
          entry.rank <= 3 && "text-yellow-400"
        )}>
          #{entry.rank}
        </span>
      </div>
      <div className="col-span-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
          {entry.avatar_url ? (
            <img 
              src={entry.avatar_url} 
              alt="" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">
            {entry.username}
            {entry.isCurrentUser && <span className="text-primary ml-2">(You)</span>}
          </p>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-sm">
          <Medal className="w-3 h-3" />
          {entry.level}
        </span>
      </div>
      <div className="col-span-2 text-center">
        <span className="inline-flex items-center gap-1 text-warning text-sm">
          <Flame className="w-4 h-4" />
          {entry.study_streak}
        </span>
      </div>
      <div className="col-span-2 text-right">
        <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
          <Zap className="w-4 h-4" />
          {entry.xp_earned.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
