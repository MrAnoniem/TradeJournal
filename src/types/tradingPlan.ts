export type TradingPlanCategory = 'bias' | 'poi' | 'entry' | 'exit'

export type TradingPlan = {
  id: string
  user_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TradingPlanRule = {
  id: string
  trading_plan_id: string
  user_id: string
  category: TradingPlanCategory
  title: string
  description: string | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export type TradingPlanRuleInput = {
  category: TradingPlanCategory
  title: string
  description: string
  enabled: boolean
}

export type PlanCompleteness = {
  percentage: number
  completed: Record<TradingPlanCategory, boolean>
}
