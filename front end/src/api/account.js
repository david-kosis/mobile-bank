import client from './client';
export const getAccount=()=>client.get('/account/me').then(r=>r.data);
export const getTransactions=()=>client.get('/account/transactions').then(r=>r.data);
