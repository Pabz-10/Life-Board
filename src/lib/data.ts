import { createClient } from './supabase-server'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, username: user.email?.split('@')[0] || 'User' })
      .select()
      .single()

    if (profileError) console.error('Error creating profile:', profileError)

    // Create stats row with real tracking columns
    await supabase.from('stats').insert({
      user_id: user.id,
      books_read: 0,
      pages_today: 0,
      reading_streak: 0,
      workouts_this_week: 0,
      workout_goal: 4,
      total_workouts: 0,
      current_weight: null,
      goal_weight: null,
      water_ml_today: 0,
      water_goal_ml: 3000,
      leetcode_easy: 0,
      leetcode_medium: 0,
      leetcode_hard: 0,
      leetcode_streak: 0,
    })

    profile = newProfile
  }

  return { user, profile }
}

export async function getDashboardData() {
  const supabase = await createClient()
  const profileInfo = await getProfile()
  if (!profileInfo) return null

  const { user } = profileInfo

  const { data: stats } = await supabase
    .from('stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch recent reading log (last 14 days)
  const { data: readingLog } = await supabase
    .from('reading_log')
    .select('date, pages')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(14)

  // Fetch recent lifting sessions (last 6 weeks)
  const { data: liftingLog } = await supabase
    .from('lifting_log')
    .select('week_label, volume_kg')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch weight log (last 30 days)
  const { data: weightLog } = await supabase
    .from('weight_log')
    .select('logged_at, weight')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(30)

  return {
    profile: profileInfo.profile,
    stats: stats || {},
    readingLog: readingLog || [],
    liftingLog: liftingLog || [],
    weightLog: weightLog || [],
  }
}
