export const getToken=()=>localStorage.getItem('bankToken');
export const getUser=()=>{try{return JSON.parse(localStorage.getItem('bankUser')||'null')}catch{return null}};
export const saveSession=({token,user})=>{localStorage.setItem('bankToken',token);localStorage.setItem('bankUser',JSON.stringify(user));};
export const clearSession=()=>{localStorage.removeItem('bankToken');localStorage.removeItem('bankUser');};
