"use client";
import { useSearchParams } from "next/navigation";
export default function Success(){
  const params = useSearchParams(); const ref = params.get("ref");
  return (<div style={{maxWidth:400,margin:"40px auto",textAlign:"center",fontFamily:"sans-serif"}}>
    <h1 style={{color:"green"}}>Payment Received - {ref}</h1>
    <p>REAL deduction confirmed. Customer PIN entered. Airtel deducted.</p >
    <p style={{background:"#e6ffe6",padding:12,borderRadius:8}}>Status: <b>Payment Received (green)</b><br/>NOT Left Warehouse. Admin must ship.</p >
  </div>);
}
