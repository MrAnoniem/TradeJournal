import { supabase } from '../lib/supabase'
import type { TradeScreenshot } from '../types/screenshot'

export const SCREENSHOT_BUCKET='trade-screenshots'
export const MAX_SCREENSHOT_SIZE=5*1024*1024
export const MAX_SCREENSHOTS_PER_TRADE=5
export const ALLOWED_SCREENSHOT_TYPES=['image/png','image/jpeg','image/webp']

export async function listTradeScreenshots(tradeId:string){
  const {data,error}=await supabase.from('trade_screenshots').select('*').eq('trade_id',tradeId).order('created_at',{ascending:true})
  if(error)throw error
  const items=(data??[]) as TradeScreenshot[]
  return Promise.all(items.map(async item=>{
    const {data:signed}=await supabase.storage.from(SCREENSHOT_BUCKET).createSignedUrl(item.storage_path,3600)
    return {...item,url:signed?.signedUrl}
  }))
}

function safeName(name:string){return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/-+/g,'-').slice(-100)}

export async function uploadTradeScreenshots(userId:string,tradeId:string,files:File[]){
  const uploaded:TradeScreenshot[]=[]
  for(const file of files){
    if(!ALLOWED_SCREENSHOT_TYPES.includes(file.type))throw new Error(`${file.name}: alleen PNG, JPG/JPEG en WEBP zijn toegestaan.`)
    if(file.size>MAX_SCREENSHOT_SIZE)throw new Error(`${file.name}: maximaal 5 MB per screenshot.`)
    const path=`${userId}/${tradeId}/${crypto.randomUUID()}-${safeName(file.name)}`
    const {error:uploadError}=await supabase.storage.from(SCREENSHOT_BUCKET).upload(path,file,{contentType:file.type,upsert:false})
    if(uploadError)throw uploadError
    const {data,error}=await supabase.from('trade_screenshots').insert({user_id:userId,trade_id:tradeId,storage_path:path,file_name:file.name,mime_type:file.type,file_size:file.size}).select('*').single()
    if(error){await supabase.storage.from(SCREENSHOT_BUCKET).remove([path]);throw error}
    const {data:signed}=await supabase.storage.from(SCREENSHOT_BUCKET).createSignedUrl(path,3600)
    uploaded.push({...data as TradeScreenshot,url:signed?.signedUrl})
  }
  return uploaded
}

export async function deleteTradeScreenshot(item:TradeScreenshot){
  const {error:storageError}=await supabase.storage.from(SCREENSHOT_BUCKET).remove([item.storage_path])
  if(storageError)throw storageError
  const {error}=await supabase.from('trade_screenshots').delete().eq('id',item.id)
  if(error)throw error
}
