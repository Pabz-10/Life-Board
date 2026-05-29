import { createClient } from './supabase-server'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
    const firstName = fullName.split(' ')[0] || user.email?.split('@')[0] || 'User'

    const { data: newProfile, error: profileError } = await supabase
      .from('profiles').insert({ id: user.id, username: firstName }).select().single()
    if (profileError) console.error('Error creating profile:', profileError)

    await supabase.from('stats').insert({
      user_id: user.id, books_read: 0, pages_today: 0, reading_streak: 0,
      workouts_this_week: 0, workout_goal: 4, total_workouts: 0,
      current_weight: null, goal_weight: null, water_ml_today: 0,
      water_goal_ml: 3000, leetcode_easy: 0, leetcode_medium: 0,
      leetcode_hard: 0, leetcode_streak: 0,
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

  const { data: stats } = await supabase.from('stats').select('*').eq('user_id', user.id).single()

  const { data: readingLog } = await supabase.from('reading_log')
    .select('id, date, pages').eq('user_id', user.id)
    .order('date', { ascending: false }).limit(14)

  const { data: liftingLog } = await supabase.from('lifting_log')
    .select('id, week_label, volume_kg, created_at').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(10)

  const { data: weightLog } = await supabase.from('weight_log')
    .select('id, logged_at, weight').eq('user_id', user.id)
    .order('logged_at', { ascending: true }).limit(30)

  return {
    profile: profileInfo.profile,
    stats: stats || {},
    readingLog: readingLog || [],
    liftingLog: liftingLog || [],
    weightLog:  weightLog  || [],
  }
}
