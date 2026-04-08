/**
 * Kudi Teller Portal — Service Queue · Account Lookup · Process Transactions · Customer Service
 */
import { useState } from "react";

const T={bg:"#060614",bgCard:"#0d0b1f",border:"#1e1b3a",borderLight:"#2d2a5e",primary:"#22d3ee",success:"#10b981",warning:"#f59e0b",danger:"#ef4444",txt:"#f1f5f9",txtSub:"#94a3b8",txtMuted:"#475569",gradCard:"linear-gradient(145deg,#0f0d22 0%,#0d0b1f 100%)"};
const Sp=()=><span style={{width:16,height:16,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>;
const TABS=[{id:"queue",label:"Service Queue",icon:"🎫"},{id:"lookup",label:"Account Lookup",icon:"🔍"},{id:"process",label:"Process Transaction",icon:"💳"},{id:"service",label:"Customer Service",icon:"🤝"}];
const QUEUE=[
  {ticket:"T-001",customer:"Ama Asantewaa",phone:"0271234567",service:"Deposit",      time:"9:02 AM",status:"waiting"},
  {ticket:"T-002",customer:"Kofi Boateng", phone:"0201234567",service:"Withdrawal",   time:"9:08 AM",status:"waiting"},
  {ticket:"T-003",customer:"Yaw Darko",    phone:"0209876543",service:"Account Open", time:"9:15 AM",status:"waiting"},
  {ticket:"T-004",customer:"Efua Quaye",   phone:"0551234567",service:"Transfer",      time:"9:22 AM",status:"serving"},
];
const ACCOUNTS={
  "0244123456":{name:"Kwafo Nathaniel",id:"ACC-001",balance:24839,type:"Current",status:"active",txns:[{date:"Dec 29",desc:"MoMo Deposit",amount:2000,t:"income"},{date:"Dec 28",desc:"Rent",amount:-1047,t:"expense"},{date:"Dec 27",desc:"Groceries",amount:-312,t:"expense"}]},
  "0271234567":{name:"Ama Asantewaa",id:"ACC-002",balance:8204,type:"Savings",status:"active",txns:[{date:"Dec 29",desc:"Salary",amount:5000,t:"income"},{date:"Dec 28",desc:"Shopping",amount:-655,t:"expense"}]},
};
const inp={background:"#060614",border:"1px solid #2d2a5e",borderRadius:11,padding:"12px 14px",color:"#f1f5f9",fontSize:14,width:"100%",outline:"none"};

export default function TellerDashboard() {
  const [tab,setTab]=useState("queue");
  const [queue,setQueue]=useState(QUEUE);
  const [phone,setPhone]=useState(""); const [found,setFound]=useState(null); const [searchErr,setSearchErr]=useState("");
  const [txType,setTxType]=useState("deposit"); const [txAmt,setTxAmt]=useState(""); const [txPhone,setTxPhone]=useState(""); const [txNote,setTxNote]=useState("");
  const [proc,setProc]=useState(false); const [txDone,setTxDone]=useState(null);
  const [issue,setIssue]=useState(""); const [isSaving,setIsSaving]=useState(false);
  const [toast,setToast]=useState(null);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  const lookup=()=>{setSearchErr("");setFound(null);const a=ACCOUNTS[phone.replace(/\s/g,"")];if(!a){setSearchErr("No account found for this phone number.");return;}setFound(a);};
  const serveNext=()=>{const n=queue.find(q=>q.status==="waiting");if(!n)return;setQueue(q=>q.map(t=>t.ticket===n.ticket?{...t,status:"serving"}:t.status==="serving"?{...t,status:"done"}:t));showToast(`Now serving ${n.customer} (${n.ticket})`);};
  const processTx=async(e)=>{e.preventDefault();setProc(true);await new Promise(r=>setTimeout(r,1200));setTxDone({type:txType,amount:parseFloat(txAmt),time:new Date().toLocaleTimeString()});setProc(false);showToast(`${txType} of ₵${txAmt} processed`);setTimeout(()=>setTxDone(null),4000);setTxAmt("");setTxPhone("");setTxNote("");};
  const submitIssue=async()=>{if(!issue.trim())return;setIsSaving(true);await new Promise(r=>setTimeout(r,900));showToast("Issue submitted to admin");setIsSaving(false);setIssue("");};

  return (
    <div style={{padding:"28px 32px",maxWidth:1100}}>
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:T.bgCard,border:`1px solid ${T.success}50`,borderRadius:12,padding:"11px 18px",fontSize:13,color:T.txt,backdropFilter:"blur(10px)"}}>{toast}</div>}
      <div style={{marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{width:10,height:10,borderRadius:"50%",background:T.primary,animation:"pulse 2s infinite"}}/><span style={{fontSize:11,color:T.primary,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>Teller Station</span></div>
        <h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>Teller Portal</h1>
        <p style={{color:T.txtSub,fontSize:14}}>{queue.filter(q=>q.status==="waiting").length} waiting · {queue.filter(q=>q.status==="serving").length} being served</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        {[[queue.filter(q=>q.status==="waiting").length,"In Queue","🎫","#22d3ee"],[queue.filter(q=>q.status==="serving").length,"Serving","⚡","#10b981"],[queue.filter(q=>q.status==="done").length,"Served Today","✅","#6366f1"],["3","Pending Issues","⚠️","#f59e0b"]].map(([v,l,i,c])=>(
          <div key={l} style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:T.txtSub}}>{l}</span><span style={{fontSize:18}}>{i}</span></div>
            <div style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:24,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1px solid ${tab===t.id?T.primary:T.border}`,background:tab===t.id?`${T.primary}18`:T.bgCard,color:tab===t.id?"#67e8f9":T.txtSub,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>{t.icon} {t.label}</button>)}
      </div>

      {tab==="queue"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:16,fontWeight:700}}>Live Service Queue</h3>
            <button onClick={serveNext} style={{background:`${T.primary}20`,border:`1px solid ${T.primary}40`,borderRadius:10,padding:"9px 18px",color:T.primary,fontSize:13,fontWeight:700,cursor:"pointer"}}>→ Serve Next</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {queue.map(q=>(
              <div key={q.ticket} style={{background:q.status==="serving"?`${T.success}10`:T.gradCard,border:`1px solid ${q.status==="serving"?T.success:q.status==="done"?T.borderLight:T.border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,opacity:q.status==="done"?0.5:1,transition:"all .3s"}}>
                <div style={{width:48,height:48,background:q.status==="serving"?`${T.success}22`:`${T.primary}18`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:12,fontWeight:700,color:q.status==="serving"?T.success:T.primary}}>{q.ticket}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:700,marginBottom:2}}>{q.customer}</p>
                  <p style={{fontSize:12,color:T.txtMuted}}>{q.phone} · {q.service} · {q.time}</p>
                </div>
                <div style={{display:"inline-flex",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:q.status==="serving"?`${T.success}22`:q.status==="done"?T.border:`${T.primary}18`,color:q.status==="serving"?T.success:q.status==="done"?T.txtMuted:T.primary}}>{q.status==="serving"?"● Serving":q.status==="done"?"✓ Done":"Waiting"}</div>
                {q.status==="serving"&&<button onClick={()=>setQueue(p=>p.map(t=>t.ticket===q.ticket?{...t,status:"done"}:t))} style={{background:`${T.success}20`,border:`1px solid ${T.success}40`,borderRadius:8,padding:"7px 12px",color:T.success,fontSize:12,fontWeight:700,cursor:"pointer"}}>Done ✓</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="lookup"&&(
        <div style={{maxWidth:680}}>
          <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:16}}>Account Lookup</h3>
          <div style={{display:"flex",gap:10,marginBottom:18}}>
            <input style={inp} placeholder="Customer phone number (e.g. 0271234567)" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookup()}/>
            <button onClick={lookup} style={{background:`${T.primary}20`,border:`1px solid ${T.primary}40`,borderRadius:11,padding:"12px 20px",color:T.primary,fontSize:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Search →</button>
          </div>
          {searchErr&&<p style={{color:T.danger,fontSize:13,marginBottom:14}}>⚠ {searchErr}</p>}
          {found&&(
            <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{background:`${T.primary}12`,padding:"18px 22px",borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><h4 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:18,fontWeight:800,marginBottom:4}}>{found.name}</h4><p style={{fontSize:13,color:T.txtSub}}>{found.id} · {found.type}</p></div>
                  <div style={{textAlign:"right"}}><p style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:24,fontWeight:800,color:T.primary}}>₵{found.balance.toLocaleString()}</p><div style={{display:"inline-flex",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:`${T.success}22`,color:T.success}}>{found.status}</div></div>
                </div>
              </div>
              {found.txns.map((tx,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"12px 22px",borderBottom:i<found.txns.length-1?`1px solid ${T.border}`:"none"}}>
                  <div><p style={{fontSize:13,fontWeight:600}}>{tx.desc}</p><p style={{fontSize:11,color:T.txtMuted}}>{tx.date}</p></div>
                  <span style={{fontSize:13,fontWeight:700,color:tx.t==="income"?T.success:T.txt}}>{tx.t==="income"?"+":"-"}₵{Math.abs(tx.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="process"&&(
        <div style={{maxWidth:520}}>
          <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:18}}>Process Transaction</h3>
          {txDone?(
            <div style={{background:`${T.success}12`,border:`1px solid ${T.success}40`,borderRadius:18,padding:"30px",textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <h4 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:20,fontWeight:800,marginBottom:6}}>Transaction Complete</h4>
              <p style={{color:T.txtSub,fontSize:14}}>{txDone.type.toUpperCase()} of ₵{txDone.amount.toLocaleString()} at {txDone.time}</p>
            </div>
          ):(
            <form onSubmit={processTx} style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
                {[["deposit","📥 Deposit"],["withdrawal","📤 Withdrawal"],["transfer","↔️ Transfer"],["bill","🧾 Bill Pay"]].map(([v,l])=>(
                  <button key={v} type="button" onClick={()=>setTxType(v)} style={{background:txType===v?`${T.primary}20`:"#060614",border:`1px solid ${txType===v?T.primary:"#2d2a5e"}`,borderRadius:11,padding:"12px",color:txType===v?"#67e8f9":"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:700,transition:"all .2s"}}>{l}</button>
                ))}
              </div>
              {[["Customer Phone","0244 XXX XXX",txPhone,e=>setTxPhone(e.target.value),"tel",true],["Amount (GHS)","0.00",txAmt,e=>setTxAmt(e.target.value),"number",true],["Note","Reference or note",txNote,e=>setTxNote(e.target.value),"text",false]].map(([label,ph,val,onChange,type,required])=>(
                <div key={label} style={{marginBottom:14}}>
                  <label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>{label}</label>
                  <input style={inp} type={type} placeholder={ph} value={val} onChange={onChange} required={required}/>
                </div>
              ))}
              <button type="submit" disabled={proc} style={{width:"100%",background:"linear-gradient(135deg,#06b6d4,#22d3ee)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {proc?<><Sp/>Processing...</>:`Process ${txType.charAt(0).toUpperCase()+txType.slice(1)} →`}
              </button>
            </form>
          )}
        </div>
      )}

      {tab==="service"&&(
        <div style={{maxWidth:680}}>
          <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:18}}>Customer Service Tools</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[["🔑","Reset PIN","Trigger customer PIN reset"],["📋","Statement","Generate account statement"],["🔒","Freeze Account","Temporarily freeze account"],["📱","Link MoMo","Link mobile money to account"]].map(([icon,label,desc])=>(
              <button key={label} type="button" style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px",textAlign:"left",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${T.primary}60`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;}}>
                <span style={{fontSize:26,display:"block",marginBottom:8}}>{icon}</span>
                <p style={{fontSize:14,fontWeight:700,marginBottom:3}}>{label}</p>
                <p style={{fontSize:12,color:T.txtMuted}}>{desc}</p>
              </button>
            ))}
          </div>
          <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}>
            <h4 style={{fontSize:14,fontWeight:700,marginBottom:12}}>🚨 Escalate to Admin</h4>
            <textarea value={issue} onChange={e=>setIssue(e.target.value)} placeholder="Describe the issue requiring admin attention…"
              style={{...inp,height:90,resize:"vertical",marginBottom:12,fontFamily:"inherit"}}/>
            <button onClick={submitIssue} disabled={isSaving||!issue.trim()} style={{background:`${T.primary}20`,border:`1px solid ${T.primary}40`,borderRadius:10,padding:"9px 18px",color:T.primary,fontSize:13,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
              {isSaving?<><Sp/>Submitting...</>:"Submit to Admin →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
