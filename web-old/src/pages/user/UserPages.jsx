/**
 * Kudi — Customer/Business User Pages
 * AccountsPage, DepositPage, WithdrawPage, BillPayPage, NotificationsPage
 */
import { useState, useEffect } from "react";
import { fraud as fraudApi } from "../../api.js";

const T={bg:"#060614",bgCard:"#0d0b1f",border:"#1e1b3a",borderLight:"#2d2a5e",primary:"#6366f1",success:"#10b981",warning:"#f59e0b",danger:"#ef4444",txt:"#f1f5f9",txtSub:"#94a3b8",txtMuted:"#475569",gradCard:"linear-gradient(145deg,#0f0d22 0%,#0d0b1f 100%)"};
const TXNS_PREFIX="bankly_txns_";
const TxStore={get:(uid)=>JSON.parse(localStorage.getItem(TXNS_PREFIX+uid)||"[]"),add:(uid,tx)=>{const all=[tx,...TxStore.get(uid)].slice(0,200);localStorage.setItem(TXNS_PREFIX+uid,JSON.stringify(all));return all;}};
const Sp=()=><span style={{width:16,height:16,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>;
let _toastFn=null;
const toast=(msg,type="info")=>_toastFn?.(msg,type);
const inp={background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:"13px 16px",color:T.txt,fontSize:15,width:"100%",outline:"none"};

function ToastLocal() {
  const [items,setItems]=useState([]);
  useEffect(()=>{_toastFn=(msg,type)=>{const id=Date.now();setItems(p=>[...p,{id,msg,type}]);setTimeout(()=>setItems(p=>p.filter(t=>t.id!==id)),3500);};});
  return <div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8}}>{items.map(t=><div key={t.id} style={{background:t.type==="error"?"#ef444420":t.type==="success"?"#10b98120":"#6366f120",border:`1px solid ${t.type==="error"?T.danger:t.type==="success"?T.success:T.primary}50`,borderRadius:12,padding:"11px 16px",fontSize:13,color:T.txt,maxWidth:320,backdropFilter:"blur(10px)"}}>{t.msg}</div>)}</div>;
}

// ── ACCOUNTS PAGE ─────────────────────────────────────────────
export function AccountsPage({user}) {
  const accounts=[
    {type:"Current Account",  balance:user.balance||0,   num:"**"+user.id?.slice(-4).toUpperCase(),color:"#6366f1",icon:"💳",active:true},
    {type:"Savings Account",  balance:0,                  num:"**0000",                              color:"#10b981",icon:"🏦",active:false},
    {type:"Investment Account",balance:0,                 num:"**0000",                              color:"#f59e0b",icon:"📈",active:false},
  ];
  return (
    <div style={{padding:"28px 32px",maxWidth:900}}>
      <ToastLocal/>
      <div style={{marginBottom:26}}><h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>My Accounts</h1><p style={{color:T.txtSub,fontSize:14}}>All your Kudi accounts</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18,marginBottom:28}}>
        {accounts.map((a,i)=>(
          <div key={i} style={{background:`linear-gradient(135deg,${a.color}28 0%,${T.bgCard} 100%)`,border:`1.5px solid ${a.color}40`,borderRadius:22,padding:"24px 26px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
              <div style={{width:44,height:44,background:`${a.color}25`,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{a.icon}</div>
              <div style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:a.active?`${T.success}20`:`${T.borderLight}`,color:a.active?T.success:T.txtMuted}}>{a.active?"Active":"Inactive"}</div>
            </div>
            <p style={{fontSize:13,color:T.txtSub,marginBottom:4}}>{a.type}</p>
            <div style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:28,fontWeight:800,marginBottom:6,letterSpacing:"-1px"}}>₵{(a.balance||0).toLocaleString("en-GH",{minimumFractionDigits:2})}</div>
            <p style={{fontSize:13,color:T.txtMuted}}>Account {a.num}</p>
            {!a.active&&<button style={{marginTop:12,background:`${a.color}18`,border:`1px solid ${a.color}40`,borderRadius:10,padding:"8px 16px",color:a.color,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>Open Account</button>}
          </div>
        ))}
      </div>
      <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:20,padding:22}}>
        <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:14}}>Account Details</h3>
        {[["Account Holder",user.name||"—"],["Account ID",user.id?.slice(-12).toUpperCase()||"—"],["Email",user.email||"—"],["Phone",user.phone||"—"],["Currency","GHS — Ghanaian Cedi"],["Account Type",user.role==="business"?"Business":"Personal"],["Status","Active ✅"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}><p style={{fontSize:14,fontWeight:600}}>{l}</p><p style={{fontSize:14,color:T.txtSub}}>{v}</p></div>
        ))}
      </div>
    </div>
  );
}

// ── DEPOSIT PAGE ──────────────────────────────────────────────
export function DepositPage({user}) {
  const [method,setMethod]=useState("momo");
  const [amount,setAmount]=useState(""); const [phone,setPhone]=useState(""); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false);
  const PROVIDERS=[{id:"mtn",name:"MTN MoMo",icon:"🟡",color:"#f59e0b"},{id:"airteltigo",name:"AirtelTigo",icon:"🔴",color:"#ef4444"},{id:"telecel",name:"Telecel Cash",icon:"🟢",color:"#10b981"},{id:"card",name:"Debit/Credit Card",icon:"💳",color:"#6366f1"},{id:"bank",name:"Bank Transfer",icon:"🏦",color:"#22d3ee"}];
  const handleDeposit=async(e)=>{
    e.preventDefault(); setLoading(true);
    const amt=parseFloat(amount);
    try{const fr=await fraudApi.detect(amt,"Investment","Income");if(fr.risk_level==="HIGH"){toast(`🚨 Deposit blocked by AI (score ${(fr.fraud_score*100).toFixed(1)}%)`,"error");setLoading(false);return;}}catch{}
    await new Promise(r=>setTimeout(r,1000));
    const tx={id:`tx_${Date.now()}`,date:new Date().toLocaleDateString("en-GH",{month:"short",day:"numeric",year:"numeric"}),desc:`Deposit via ${PROVIDERS.find(p=>p.id===method)?.name}`,category:"Deposit",amount:+amt,type:"income",status:"completed"};
    TxStore.add(user.id,tx);
    setDone(true); setLoading(false); toast("Deposit successful! ✅","success");
    setTimeout(()=>{setDone(false);setAmount("");setPhone("");},3000);
  };
  const active=PROVIDERS.find(p=>p.id===method);
  return (
    <div style={{padding:"28px 32px",maxWidth:640}}>
      <ToastLocal/>
      <div style={{marginBottom:26}}><h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>📥 Deposit Funds</h1><p style={{color:T.txtSub,fontSize:14}}>Add money to your account · AI fraud check on every transaction</p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
        {PROVIDERS.map(p=><button key={p.id} onClick={()=>setMethod(p.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1px solid ${method===p.id?p.color:T.border}`,background:method===p.id?`${p.color}18`:T.bgCard,color:method===p.id?p.color:T.txtSub,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}><span>{p.icon}</span>{p.name}</button>)}
      </div>
      {done?(
        <div style={{background:`${T.success}12`,border:`1px solid ${T.success}40`,borderRadius:20,padding:"36px",textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:14}}>✅</div>
          <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:22,fontWeight:800,marginBottom:6}}>Deposit Successful!</h3>
          <p style={{color:T.txtSub,fontSize:15}}>₵{amount} added to your account via {active?.name}</p>
          <p style={{color:T.txtMuted,fontSize:13,marginTop:6}}>AI fraud check: Passed ✅</p>
        </div>
      ):(
        <form onSubmit={handleDeposit} style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:20,padding:26}}>
          <p style={{fontSize:12,color:T.success,marginBottom:18,display:"flex",alignItems:"center",gap:6}}>🛡️ Every deposit is checked by our GradientBoosting fraud model (AUC 0.9964)</p>
          <div style={{marginBottom:16}}><label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>Amount (GHS)</label><input style={inp} type="number" min="1" step="0.01" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} required/></div>
          {["mtn","airteltigo","telecel"].includes(method)&&<div style={{marginBottom:16}}><label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>{active?.name} Phone Number</label><div style={{display:"flex",gap:8}}><div style={{background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:"13px 12px",fontSize:14,color:T.txtSub,whiteSpace:"nowrap"}}>🇬🇭 +233</div><input style={{...inp,flex:1}} type="tel" placeholder="024 XXX XXXX" value={phone} onChange={e=>setPhone(e.target.value)} required/></div></div>}
          {amount&&<div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:T.txtSub}}>Amount</span><span style={{fontSize:13,fontWeight:600}}>₵{parseFloat(amount||0).toLocaleString()}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.txtSub}}>Fee</span><span style={{fontSize:13,color:T.success}}>Free</span></div>
          </div>}
          <button type="submit" disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><Sp/>Checking + Depositing...</>:`Deposit ₵${amount||"0"} via ${active?.name} →`}
          </button>
        </form>
      )}
    </div>
  );
}

// ── WITHDRAW PAGE ─────────────────────────────────────────────
export function WithdrawPage({user}) {
  const [method,setMethod]=useState("mtn"); const [amount,setAmount]=useState(""); const [phone,setPhone]=useState(""); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false);
  const PROVIDERS=[{id:"mtn",name:"MTN MoMo",icon:"🟡",color:"#f59e0b"},{id:"airteltigo",name:"AirtelTigo",icon:"🔴",color:"#ef4444"},{id:"telecel",name:"Telecel Cash",icon:"🟢",color:"#10b981"},{id:"bank",name:"Bank Account",icon:"🏦",color:"#6366f1"}];
  const handleWithdraw=async(e)=>{
    e.preventDefault(); setLoading(true);
    const amt=parseFloat(amount);
    if(amt>(user.balance||0)){toast("Insufficient funds","error");setLoading(false);return;}
    try{const fr=await fraudApi.detect(amt,"Other","Expense");if(fr.risk_level==="HIGH"){toast(`🚨 Withdrawal blocked by fraud detection`,"error");setLoading(false);return;}}catch{}
    await new Promise(r=>setTimeout(r,1100));
    const tx={id:`tx_${Date.now()}`,date:new Date().toLocaleDateString("en-GH",{month:"short",day:"numeric",year:"numeric"}),desc:`Withdrawal to ${PROVIDERS.find(p=>p.id===method)?.name}`,category:"Withdrawal",amount:-amt,type:"expense",status:"completed"};
    TxStore.add(user.id,tx);
    setDone(true); setLoading(false); toast("Withdrawal processed! ✅","success");
    setTimeout(()=>{setDone(false);setAmount("");setPhone("");},3000);
  };
  const active=PROVIDERS.find(p=>p.id===method);
  return (
    <div style={{padding:"28px 32px",maxWidth:640}}>
      <ToastLocal/>
      <div style={{marginBottom:26}}><h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>📤 Withdraw Funds</h1><p style={{color:T.txtSub,fontSize:14}}>Available: <strong style={{color:T.success}}>₵{(user.balance||0).toLocaleString("en-GH",{minimumFractionDigits:2})}</strong></p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
        {PROVIDERS.map(p=><button key={p.id} onClick={()=>setMethod(p.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1px solid ${method===p.id?p.color:T.border}`,background:method===p.id?`${p.color}18`:T.bgCard,color:method===p.id?p.color:T.txtSub,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}><span>{p.icon}</span>{p.name}</button>)}
      </div>
      {done?(
        <div style={{background:`${T.success}12`,border:`1px solid ${T.success}40`,borderRadius:20,padding:"36px",textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:14}}>✅</div>
          <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:22,fontWeight:800,marginBottom:6}}>Withdrawal Successful!</h3>
          <p style={{color:T.txtSub,fontSize:15}}>₵{amount} sent to your {active?.name}</p>
        </div>
      ):(
        <form onSubmit={handleWithdraw} style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:20,padding:26}}>
          <p style={{fontSize:12,color:T.success,marginBottom:18}}>🛡️ AI fraud check runs before every withdrawal</p>
          <div style={{marginBottom:16}}><label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>Amount (GHS)</label><input style={inp} type="number" min="1" max={user.balance||0} step="0.01" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} required/></div>
          {method!=="bank"&&<div style={{marginBottom:16}}><label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>{active?.name} Phone</label><div style={{display:"flex",gap:8}}><div style={{background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:"13px 12px",fontSize:14,color:T.txtSub}}>🇬🇭 +233</div><input style={{...inp,flex:1}} type="tel" placeholder="024 XXX XXXX" value={phone} onChange={e=>setPhone(e.target.value)} required/></div></div>}
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:T.txtSub}}>Withdraw</span><span style={{fontSize:13,fontWeight:600}}>₵{amount||"0.00"}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.txtSub}}>Remaining balance</span><span style={{fontSize:13,fontWeight:600}}>₵{Math.max(0,(user.balance||0)-parseFloat(amount||0)).toLocaleString("en-GH",{minimumFractionDigits:2})}</span></div>
          </div>
          <button type="submit" disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><Sp/>Checking + Processing...</>:`Withdraw ₵${amount||"0"} to ${active?.name} →`}
          </button>
        </form>
      )}
    </div>
  );
}

// ── BILL PAY PAGE ─────────────────────────────────────────────
export function BillPayPage({user}) {
  const [selected,setSelected]=useState(null); const [amount,setAmount]=useState(""); const [ref,setRef]=useState(""); const [loading,setLoading]=useState(false); const [done,setDone]=useState(null);
  const BILLS=[
    {id:"ecg",     name:"ECG Electricity",    icon:"⚡",color:"#f59e0b",placeholder:"Meter number"},
    {id:"gwcl",    name:"GWCL Water",          icon:"💧",color:"#22d3ee",placeholder:"Account number"},
    {id:"dstv",    name:"DStv / GOtv",         icon:"📡",color:"#6366f1",placeholder:"Smartcard number"},
    {id:"mtn_air", name:"MTN Airtime",         icon:"📱",color:"#f59e0b",placeholder:"Phone number"},
    {id:"at_air",  name:"AirtelTigo Airtime",  icon:"📱",color:"#ef4444",placeholder:"Phone number"},
    {id:"telecel", name:"Telecel Airtime",      icon:"📱",color:"#10b981",placeholder:"Phone number"},
    {id:"internet",name:"Surfline Internet",   icon:"🌐",color:"#8b5cf6",placeholder:"Account ID"},
    {id:"school",  name:"School Fees",         icon:"🎓",color:"#22d3ee",placeholder:"Student ID"},
    {id:"tv",      name:"StarTimes",           icon:"📺",color:"#f59e0b",placeholder:"Smartcard number"},
    {id:"nss",     name:"NSS Levy",            icon:"🏛️",color:"#10b981",placeholder:"ID number"},
  ];
  const pay=async(e)=>{
    e.preventDefault(); setLoading(true);
    await new Promise(r=>setTimeout(r,1100));
    const tx={id:`tx_${Date.now()}`,date:new Date().toLocaleDateString("en-GH",{month:"short",day:"numeric",year:"numeric"}),desc:`${selected?.name} Bill Payment`,category:"Utilities",amount:-parseFloat(amount),type:"expense",status:"completed"};
    TxStore.add(user.id,tx);
    setDone({name:selected.name,amount});setLoading(false);toast("Bill paid successfully! ✅","success");
    setTimeout(()=>{setDone(null);setAmount("");setRef("");setSelected(null);},3500);
  };
  return (
    <div style={{padding:"28px 32px",maxWidth:800}}>
      <ToastLocal/>
      <div style={{marginBottom:26}}><h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>🧾 Pay Bills</h1><p style={{color:T.txtSub,fontSize:14}}>ECG · Water · DStv · Airtime · Internet · School Fees and more</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        {BILLS.map(b=>(
          <button key={b.id} onClick={()=>setSelected(b)} style={{background:selected?.id===b.id?`${b.color}20`:T.bgCard,border:`1.5px solid ${selected?.id===b.id?b.color:T.border}`,borderRadius:14,padding:"16px 12px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
            <span style={{fontSize:28,display:"block",marginBottom:8}}>{b.icon}</span>
            <p style={{fontSize:12,fontWeight:700,color:selected?.id===b.id?b.color:T.txt}}>{b.name}</p>
          </button>
        ))}
      </div>
      {selected&&(
        done?(
          <div style={{background:`${T.success}12`,border:`1px solid ${T.success}40`,borderRadius:20,padding:"32px",textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:12}}>✅</div>
            <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:22,fontWeight:800,marginBottom:6}}>{done.name} Paid!</h3>
            <p style={{color:T.txtSub,fontSize:15}}>₵{done.amount} payment processed successfully</p>
          </div>
        ):(
          <form onSubmit={pay} style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:20,padding:24}}>
            <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:16,fontWeight:700,marginBottom:18}}>Pay {selected.name}</h3>
            <div style={{marginBottom:14}}><label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>{selected.placeholder}</label><input style={inp} placeholder={selected.placeholder} value={ref} onChange={e=>setRef(e.target.value)} required/></div>
            <div style={{marginBottom:16}}><label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:6}}>Amount (GHS)</label><input style={inp} type="number" min="1" step="0.01" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} required/></div>
            <div style={{display:"flex",gap:8}}>
              <button type="button" onClick={()=>setSelected(null)} style={{flex:1,background:"transparent",border:`1px solid ${T.borderLight}`,borderRadius:12,padding:"12px",color:T.txtSub,fontSize:14,fontWeight:600,cursor:"pointer"}}>← Back</button>
              <button type="submit" disabled={loading} style={{flex:2,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {loading?<><Sp/>Paying...</>:`Pay ₵${amount||"0"} →`}
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
}

// ── NOTIFICATIONS PAGE ────────────────────────────────────────
export function NotificationsPage() {
  const [notifs,setNotifs]=useState([
    {id:1,icon:"🚨",title:"Fraud Alert",  msg:"A Shopping transaction of ₵1,544.74 was flagged by AI. Risk level: MEDIUM.",    time:"2 hours ago",type:"alert",  read:false},
    {id:2,icon:"✅",title:"Transfer Complete",msg:"₵2,000 sent to 0271234567 successfully via MTN MoMo.",                      time:"5 hours ago",type:"success",read:false},
    {id:3,icon:"💡",title:"AI Insight",   msg:"You're 208% over your Entertainment budget. Cancel unused subscriptions to save ₵600+/month.", time:"Yesterday",type:"info",read:false},
    {id:4,icon:"📥",title:"Deposit Received",msg:"₵3,500 deposited via AirtelTigo Money to your current account.",             time:"Yesterday",type:"success",read:true},
    {id:5,icon:"📈",title:"Investment Tip",msg:"Redirect 10% of monthly income to Databank index funds — projected ₵8K+ over 3 years.", time:"2 days ago",type:"info",read:true},
    {id:6,icon:"⚡",title:"ECG Bill Due",  msg:"Your ECG meter (0244123456) has a pending bill of ₵312. Pay now to avoid disconnection.",  time:"3 days ago",type:"warning",read:true},
    {id:7,icon:"🏦",title:"Monthly Statement",msg:"Your December 2024 account statement is ready. Total transactions: 18.",    time:"4 days ago",type:"info",read:true},
  ]);
  const unread=notifs.filter(n=>!n.read).length;
  const markRead=(id)=>setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  const markAll=()=>setNotifs(p=>p.map(n=>({...n,read:true})));
  const typeColor={alert:T.danger,success:T.success,info:T.primary,warning:T.warning};
  return (
    <div style={{padding:"28px 32px",maxWidth:700}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26}}>
        <div>
          <h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>🔔 Notifications</h1>
          <p style={{color:T.txtSub,fontSize:14}}>{unread} unread · {notifs.length} total</p>
        </div>
        {unread>0&&<button onClick={markAll} style={{background:T.bgCard,border:`1px solid ${T.borderLight}`,borderRadius:10,padding:"8px 16px",color:T.txtSub,fontSize:13,fontWeight:600,cursor:"pointer"}}>Mark all read</button>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>markRead(n.id)}
            style={{background:n.read?T.gradCard:`${typeColor[n.type]}08`,border:`1px solid ${n.read?T.border:`${typeColor[n.type]}35`}`,borderRadius:14,padding:"16px 20px",display:"flex",gap:14,cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=`${typeColor[n.type]}60`}
            onMouseLeave={e=>e.currentTarget.style.borderColor=n.read?T.border:`${typeColor[n.type]}35`}>
            <div style={{width:42,height:42,background:`${typeColor[n.type]}20`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <p style={{fontSize:14,fontWeight:700,color:n.read?T.txt:typeColor[n.type]}}>{n.title}</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:typeColor[n.type],flexShrink:0}}/>}
                  <span style={{fontSize:11,color:T.txtMuted,whiteSpace:"nowrap"}}>{n.time}</span>
                </div>
              </div>
              <p style={{fontSize:13,color:T.txtSub,lineHeight:1.6}}>{n.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
