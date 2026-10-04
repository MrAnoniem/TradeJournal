export const money = (value: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)
export const formatDate = (value: string) => new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
export const toLocalInput = (value: string) => { const d = new Date(value); const off = d.getTimezoneOffset(); return new Date(d.getTime()-off*60000).toISOString().slice(0,16) }
