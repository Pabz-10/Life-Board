import { createClient } from './supabase-server'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Check if profile exists
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile, create one (and default stats)
  if (!profile) {
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, username: user.email?.split('@')[0] || 'Hunter' })
      .select()
      .single()

    if (profileError) console.error('Error creating profile:', profileError)
    
    await supabase.from('stats').insert({ user_id: user.id })
    
    profile = newProfile
  }

  return { user, profile }
}

export async function getDashboardData() {
  const supabase = await createClient()
  const profileInfo = await getProfile()
  if (!profileInfo) return null

  const { user } = profileInfo

  // Fetch Stats
  const { data: stats } = await supabase
    .from('stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch Quests
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return {
    profile: profileInfo.profile,
    stats,
    quests: quests || []
  }
}
