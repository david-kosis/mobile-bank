import {createContext,useContext,useEffect,useState} from 'react';
const ThemeContext=createContext(null);
export function ThemeProvider({children}){const [theme,setTheme]=useState(()=>localStorage.getItem('bankTheme')||'dark');useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('bankTheme',theme)},[theme]);return <ThemeContext.Provider value={{theme,setTheme,toggleTheme:()=>setTheme(x=>x==='dark'?'light':'dark')}}>{children}</ThemeContext.Provider>}
export const useTheme=()=>useContext(ThemeContext);
