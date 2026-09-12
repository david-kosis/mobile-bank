import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {login as loginApi,register as registerApi} from '../api/auth';
import {clearSession,getToken,getUser,saveSession} from '../utils/storage';
const AuthContext=createContext(null);
export function AuthProvider({children}){const [user,setUser]=useState(getUser);const [token,setToken]=useState(getToken);const [loading,setLoading]=useState(!!getToken);
useEffect(()=>{const expire=()=>{clearSession();setToken(null);setUser(null);setLoading(false)};window.addEventListener('auth-expired',expire);setLoading(false);return()=>window.removeEventListener('auth-expired',expire)},[]);
const login=async data=>{const result=await loginApi(data);saveSession(result);setToken(result.token);setUser(result.user);return result};
const register=async data=>{const result=await registerApi(data);saveSession(result);setToken(result.token);setUser(result.user);return result};
const logout=()=>{clearSession();setToken(null);setUser(null)};
const value=useMemo(()=>({user,token,loading,isAuthenticated:!!token,login,register,logout}),[user,token,loading]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
