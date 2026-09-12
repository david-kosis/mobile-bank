import axios from 'axios';
export const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
const client=axios.create({baseURL:API_URL,timeout:15000,headers:{'Content-Type':'application/json'}});
client.interceptors.request.use(c=>{const token=localStorage.getItem('bankToken');if(token)c.headers.Authorization=`Bearer ${token}`;return c;});
client.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){localStorage.removeItem('bankToken');localStorage.removeItem('bankUser');window.dispatchEvent(new Event('auth-expired'));}return Promise.reject(e);});
export default client;
