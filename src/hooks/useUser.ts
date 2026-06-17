import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

let cachedProfile: Profile | null = null
let cachedLoading = false

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(cachedProfile)
  const [loading, setLoading] = useState(cachedLoading)

  useEffect(() => {
    if (cachedProfile) return

    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (!userId) {
        setLoading(false)
        cachedLoading = false
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      cachedProfile = data
      setProfile(data)
      setLoading(false)
      cachedLoading = false
    }

    setLoading(true)
    cachedLoading = true
    fetchProfile()
  }, [])

  return { profile, loading }
}
