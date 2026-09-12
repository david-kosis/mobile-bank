export const statusTone=status=>({successful:'success',success:'success',pending:'pending',processing:'processing',failed:'failed',reversed:'reversed',disputed:'disputed'}[String(status||'').toLowerCase()]||'neutral');
export const statusLabel=status=>String(status||'unknown').replace(/_/g,' ');
