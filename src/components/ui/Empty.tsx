import { Icon } from '../icons/Icon'
export function Empty({onAdd}:{onAdd:()=>void}){return <div className="empty-state"><strong>Nog geen trades</strong><p>Voeg je eerste trade toe. Je dashboard en statistieken worden automatisch bijgewerkt.</p><button className="small-primary" onClick={onAdd}><Icon name="plus" size={16}/>Eerste trade</button></div>}
