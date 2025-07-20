import React,{createContext, useContext, useEffect, useState} from "react";
import {auth} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
const AuthContext=createContext();
export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider({children}){
    const[currentUser,setcurrent]=useState(null);
    const[loading, setloading]=useState(true);
    useEffect(()=>{
        const unsub=onAuthStateChanged(auth,(user)=>{
            setcurrent(user);
            setloading(false);
        });
        return unsub;
    },[])
    const value={currentUser}
    return (
    <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
    )
}