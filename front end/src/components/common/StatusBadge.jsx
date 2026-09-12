import {statusLabel,statusTone} from '../../utils/transactionStatus';
export default function StatusBadge({status}){return <span className={`status-badge ${statusTone(status)}`}>{statusLabel(status)}</span>}
