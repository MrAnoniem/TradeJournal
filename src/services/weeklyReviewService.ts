import { supabase } from '../lib/supabase'
import type { WeeklyReview } from '../types/weeklyReview'

export async function fetchWeeklyReview(weekStart:string){
  const {data,error}=await supabase.from('weekly_reviews').select('*').eq('week_start',weekStart).maybeSingle()
  if(error)throw error
  return data as WeeklyReview|null
}
export async function saveWeeklyReview(userId:string,weekStart:string,notes:string){
  const {data,error}=await supabase.from('weekly_reviews').upsert({user_id:userId,week_start:weekStart,notes:notes.trim()||null},{onConflict:'user_id,week_start'}).select('*').single()
  if(error)throw error
  return data as WeeklyReview
}
