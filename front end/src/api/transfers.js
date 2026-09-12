import client from './client';
export const getBeneficiaries=()=>client.get('/transfers/beneficiaries').then(r=>r.data);
export const createBeneficiary=payload=>client.post('/transfers/beneficiaries',payload).then(r=>r.data);
export const createTransfer=payload=>client.post('/transfers',payload).then(r=>r.data);
