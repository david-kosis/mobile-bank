export default function Toast({message,type='info',onClose}){if(!message)return null;return <button className={`toast toast-${type}`} onClick={onClose}>{message}</button>}
