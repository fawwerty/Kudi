/**
 * Kudi Admin Portal — Complete
 * Tabs: Overview · User Management · Audit Logs · Fraud Alerts · Analytics · System Settings
 */
import { useState } from "react";
import { BarChart,Bar,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell } from "recharts";

const T={bg:"#060614",bgCard:"#0d0b1f",border:"#1e1b3a",borderLight:"#2d2a5e",primary:"#6366f1",accent:"#22d3ee",success:"#10b981",warning:"#f59e0b",danger:"#ef4444",txt:"#f1f5f9",txtSub:"#94a3b8",txtMuted:"#475569",gradCard:"linear-gradient(145deg,#0f0d22 0%,#0d0b1f 100%)"};
const Sp=()=><span style={{width:16,height:16,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>;
const TABS=[{id:"overview",label:"Overview",icon:"⚡"},{id:"users",label:"User Management",icon:"👥"},{id:"audit",label:"Audit Logs",icon:"📋"},{id:"fraud",label:"Fraud Alerts",icon:"🛡️"},{id:"analytics",label:"Analytics",icon:"📊"},{id:"settings",label:"System Settings",icon:"⚙️"}];
const USERS=[
  {id:"usr_001",name:"Kwafo Nathaniel",email:"kwafo@example.com",phone:"0244123456",role:"admin",   balance:24839,status:"active",  joined:"Jan 15, 2024"},
  {id:"usr_002",name:"Ama Asantewaa",  email:"ama@example.com",  phone:"0271234567",role:"customer",balance:8204,  status:"active",  joined:"Feb 3, 2024"},
  {id:"usr_003",name:"Kwame Mensah",   email:"kwame@example.com",phone:"0554321098",role:"teller",  balance:15000, status:"active",  joined:"Mar 12, 2024"},
  {id:"usr_004",name:"Abena Osei",     email:"abena@example.com",phone:"0261234567",role:"customer",balance:3450,  status:"active",  joined:"Apr 5, 2024"},
  {id:"usr_005",name:"Kofi Boateng",   email:"kofi@example.com", phone:"0201234567",role:"business",balance:52000, status:"active",  joined:"May 20, 2024"},
  {id:"usr_006",name:"Akosua Frimpong",email:"akosua@example.com",phone:"0241234567",role:"customer",balance:1200, status:"suspended",joined:"Jun 8, 2024"},
  {id:"usr_007",name:"Yaw Darko",      email:"yaw@example.com",  phone:"0209876543",role:"customer",balance:7890,  status:"active",  joined:"Jul 14, 2024"},
  {id:"usr_008",name:"Efua Quaye",     email:"efua@example.com", phone:"0551234567",role:"customer",balance:4320,  status:"active",  joined:"Aug 2, 2024"},
];
const TXNS=[
  {id:"tx_001",user:"Ama Asantewaa",   email:"ama@example.com",   type:"income", category:"Deposit",     amount:2000,  risk:"LOW",   date:"Dec 29, 2024",status:"completed"},
  {id:"tx_002",user:"Kofi Boateng",    email:"kofi@example.com",  type:"expense",category:"Transfer",    amount:15000, risk:"MEDIUM",date:"Dec 28, 2024",status:"completed"},
  {id:"tx_003",user:"Abena Osei",      email:"abena@example.com", type:"expense",category:"Shopping",    amount:1544,  risk:"HIGH",  date:"Dec 28, 2024",status:"flagged"},
  {id:"tx_004",user:"Kwame Mensah",    email:"kwame@example.com", type:"income", category:"Mobile Money",amount:3500,  risk:"LOW",   date:"Dec 27, 2024",status:"completed"},
  {id:"tx_005",user:"Yaw Darko",       email:"yaw@example.com",   type:"expense",category:"Bills",       amount:312,   risk:"LOW",   date:"Dec 26, 2024",status:"completed"},
  {id:"tx_006",user:"Akosua Frimpong", email:"akosua@example.com",type:"expense",category:"Travel",      amount:4800,  risk:"HIGH",  date:"Dec 25, 2024",status:"blocked"},
  {id:"tx_007",name:"Efua Quaye",email:"efua@example.com",type:"income",category:"Salary",amount:8000,risk:"LOW",date:"Dec 24, 2024",status:"completed",user:"Efua Quaye"},
  {id:"tx_008",user:"Kwafo Nathaniel", email:"kwafo@example.com", type:"expense",category:"Investment",  amount:5000,  risk:"LOW",   date:"Dec 23, 2024",status:"completed"},
];
const GROWTH=[
  {m:"Jan",users:12,txns:89,volume:45000,fraud:2},{m:"Feb",users:18,txns:134,volume:67000,fraud:1},
  {m:"Mar",users:24,txns:178,volume:89000,fraud:3},{m:"Apr",users:31,txns:221,volume:112000,fraud:4},
  {m:"May",users:38,txns:267,volume:134000,fraud:2},{m:"Jun",users:45,txns:312,volume:156000,fraud:5},
  {m:"Jul",users:52,txns:358,volume:179000,fraud:3},{m:"Aug",users:60,txns:403,volume:201000,fraud:6},
  {m:"Sep",users:67,txns:448,volume:224000,fraud:4},{m:"Oct",users:74,txns:493,volume:247000,fraud:7},
  {m:"Nov",users:82,txns:539,volume:269000,fraud:5},{m:"Dec",users:90,txns:584,volume:292000,fraud:8},
];
const RC={HIGH:"#ef4444",MEDIUM:"#f59e0b",LOW:"#10b981"};
const ROC={admin:"#ef4444",teller:"#22d3ee",business:"#f59e0b",customer:"#6366f1"};
const CT=({active,payload,label})=>{if(!active||!payload?.length)return null;return<div style={{background:"#1a1740",border:`1px solid ${T.borderLight}`,borderRadius:10,padding:"10px 14px"}}><p style={{color:T.txtSub,fontSize:12,marginBottom:4}}>{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color,fontSize:13}}>{p.name}: <strong>{p.value?.toLocaleString()}</strong></p>)}</div>;};
const Badge=({label,color,bg})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:bg||`${color}20`,color,width:"fit-content"}}>{label}</span>;
const SC=({label,value,icon,color,sub})=>(
  <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:-16,right:-16,width:60,height:60,borderRadius:"50%",background:`${color}18`,filter:"blur(14px)"}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <span style={{fontSize:13,color:T.txtSub,fontWeight:500}}>{label}</span>
      <div style={{width:34,height:34,background:`${color}22`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>
    </div>
    <div style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:24,fontWeight:800,color:T.txt,letterSpacing:"-1px",marginBottom:3}}>{value}</div>
    {sub&&<p style={{fontSize:11,color:T.txtMuted}}>{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [tab,setTab]=useState("overview");
  const [users,setUsers]=useState(USERS);
  const [txFilter,setTxFilter]=useState("all");
  const [srch,setSrch]=useState("");
  const [roleF,setRoleF]=useState("all");
  const [selUser,setSelUser]=useState(null);
  const [editRole,setEditRole]=useState("");
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  const filtU=users.filter(u=>{
    if(roleF!=="all"&&u.role!==roleF)return false;
    if(srch&&!u.name.toLowerCase().includes(srch.toLowerCase())&&!u.email.toLowerCase().includes(srch.toLowerCase()))return false;
    return true;
  });
  const filtT=TXNS.filter(t=>{
    if(txFilter==="flagged"&&t.risk!=="HIGH")return false;
    if(txFilter==="blocked"&&t.status!=="blocked")return false;
    return true;
  });

  const changeRole=async()=>{if(!editRole||!selUser)return;setSaving(true);await new Promise(r=>setTimeout(r,800));setUsers(p=>p.map(u=>u.id===selUser.id?{...u,role:editRole}:u));showToast(`${selUser.name}'s role updated to ${editRole}`);setSaving(false);setSelUser(null);setEditRole("");};
  const toggleStatus=async(uid,cur)=>{await new Promise(r=>setTimeout(r,500));setUsers(p=>p.map(u=>u.id===uid?{...u,status:cur==="active"?"suspended":"active"}:u));showToast(`User ${cur==="active"?"suspended":"reinstated"}`);};

  const inp={background:T.bgCard,border:`1px solid ${T.borderLight}`,borderRadius:10,padding:"9px 14px",color:T.txt,fontSize:13,outline:"none"};
  const btn=(c="#6366f1")=>({background:`${c}20`,border:`1px solid ${c}40`,borderRadius:8,padding:"5px 10px",color:c,fontSize:11,fontWeight:700,cursor:"pointer"});

  return (
    <div style={{padding:"28px 32px",maxWidth:1300}}>
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:T.bgCard,border:`1px solid ${toast.type==="success"?T.success:T.danger}50`,borderRadius:12,padding:"11px 18px",fontSize:13,color:T.txt,backdropFilter:"blur(10px)"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:T.danger,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:11,color:T.danger,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>Admin Portal</span>
        </div>
        <h1 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800,marginBottom:4}}>Control Centre</h1>
        <p style={{color:T.txtSub,fontSize:14}}>{users.length} users · {TXNS.length} transactions · Model AUC 0.9964</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1px solid ${tab===t.id?T.danger:T.border}`,background:tab===t.id?`${T.danger}18`:T.bgCard,color:tab===t.id?"#fca5a5":T.txtSub,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14,marginBottom:22}}>
            <SC label="Total Users"      value={users.length}                         icon="👥" color="#6366f1" sub={`${users.filter(u=>u.status==="active").length} active`}/>
            <SC label="Platform Balance" value={`₵${(users.reduce((s,u)=>s+u.balance,0)/1000).toFixed(0)}k`} icon="💰" color="#10b981" sub="All accounts combined"/>
            <SC label="Transactions"     value={TXNS.length}                          icon="↔️" color="#22d3ee" sub="This period"/>
            <SC label="Fraud Alerts"     value={TXNS.filter(t=>t.risk==="HIGH").length} icon="🚨" color="#ef4444" sub="Require review"/>
            <SC label="Volume Processed" value={`₵${(TXNS.reduce((s,t)=>s+t.amount,0)/1000).toFixed(0)}k`} icon="📊" color="#f59e0b" sub="Total"/>
            <SC label="AI Fraud AUC"     value="0.9964"                              icon="🤖" color="#a78bfa" sub="GradientBoosting"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:20}}>
            <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:22}}>
              <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:16}}>Platform Growth 2024</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={GROWTH}>
                  <XAxis dataKey="m" tick={{fill:T.txtMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:T.txtMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CT/>}/>
                  <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Users"/>
                  <Line type="monotone" dataKey="txns"  stroke="#10b981" strokeWidth={2.5} dot={false} name="Transactions"/>
                  <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2}   dot={false} name="Fraud"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:22}}>
              <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:14}}>Role Distribution</h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={[{name:"Customer",value:5},{name:"Business",value:1},{name:"Teller",value:1},{name:"Admin",value:1}]} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                    {["#6366f1","#f59e0b","#22d3ee","#ef4444"].map((c,i)=><Cell key={i} fill={c}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:"#1a1740",border:`1px solid ${T.borderLight}`,borderRadius:10,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
              {[["Customers","5","#6366f1"],["Business","1","#f59e0b"],["Tellers","1","#22d3ee"],["Admins","1","#ef4444"]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:2,background:c}}/><span style={{fontSize:12,color:T.txtSub}}>{l}</span></div>
                  <span style={{fontSize:12,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:22}}>
            <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:14}}>🚨 Recent High-Risk Transactions</h3>
            {TXNS.filter(t=>t.risk==="HIGH").map(tx=>(
              <div key={tx.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px",borderRadius:10,background:`${T.danger}08`,border:`1px solid ${T.danger}25`,marginBottom:8}}>
                <span style={{fontSize:20}}>⚠️</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:700}}>{tx.user}</p>
                  <p style={{fontSize:12,color:T.txtMuted}}>{tx.category} · {tx.date}</p>
                </div>
                <span style={{fontSize:15,fontWeight:700,color:T.danger}}>₵{tx.amount.toLocaleString()}</span>
                <Badge label={tx.status.toUpperCase()} color={tx.status==="blocked"?T.danger:T.warning}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER MANAGEMENT */}
      {tab==="users"&&(
        <div>
          <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
            <input style={{...inp,width:250}} placeholder="🔍 Search users…" value={srch} onChange={e=>setSrch(e.target.value)}/>
            <div style={{display:"flex",gap:6}}>
              {["all","customer","business","teller","admin"].map(r=>(
                <button key={r} onClick={()=>setRoleF(r)} style={{background:roleF===r?`${T.danger}18`:T.bgCard,border:`1px solid ${roleF===r?T.danger:T.border}`,borderRadius:9,padding:"8px 12px",color:roleF===r?"#fca5a5":T.txtSub,fontSize:12,fontWeight:700,cursor:"pointer",textTransform:"capitalize",transition:"all .2s"}}>{r==="all"?"All":r}</button>
              ))}
            </div>
          </div>
          <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 130px",padding:"11px 20px",borderBottom:`1px solid ${T.border}`,background:"#0a0820"}}>
              {["User","Email","Role","Balance","Status","Actions"].map(h=><span key={h} style={{fontSize:11,fontWeight:700,color:T.txtMuted,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</span>)}
            </div>
            {filtU.map((u,i)=>(
              <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 130px",padding:"14px 20px",borderBottom:i<filtU.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,background:`${ROC[u.role]||T.primary}25`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:ROC[u.role]||T.primary}}>{u.name[0]}</div>
                  <div><p style={{fontSize:13,fontWeight:700}}>{u.name}</p><p style={{fontSize:11,color:T.txtMuted}}>{u.phone}</p></div>
                </div>
                <span style={{fontSize:12,color:T.txtSub}}>{u.email}</span>
                <Badge label={u.role} color={ROC[u.role]||T.primary}/>
                <span style={{fontSize:13,fontWeight:600}}>₵{u.balance.toLocaleString()}</span>
                <Badge label={u.status} color={u.status==="active"?T.success:T.danger}/>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setSelUser(u);setEditRole(u.role);}} style={btn(T.primary)}>Edit</button>
                  <button onClick={()=>toggleStatus(u.id,u.status)} style={btn(u.status==="active"?T.warning:T.success)}>{u.status==="active"?"🔒":"✓"}</button>
                </div>
              </div>
            ))}
          </div>
          {selUser&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)"}}>
              <div style={{background:T.bgCard,border:`1px solid ${T.borderLight}`,borderRadius:22,padding:28,width:"100%",maxWidth:360,boxShadow:"0 32px 80px #000"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
                  <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:18,fontWeight:800}}>Edit User Role</h3>
                  <button onClick={()=>setSelUser(null)} style={{background:"none",border:"none",color:T.txtMuted,cursor:"pointer",fontSize:22}}>×</button>
                </div>
                <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
                  <p style={{fontSize:14,fontWeight:700}}>{selUser.name}</p><p style={{fontSize:12,color:T.txtMuted}}>{selUser.email}</p>
                </div>
                <label style={{fontSize:13,color:T.txtSub,fontWeight:600,display:"block",marginBottom:8}}>New Role</label>
                <select value={editRole} onChange={e=>setEditRole(e.target.value)}
                  style={{background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:10,padding:"11px 14px",color:T.txt,fontSize:14,width:"100%",marginBottom:16,cursor:"pointer",outline:"none"}}>
                  {["customer","business","teller","admin"].map(r=><option key={r}>{r}</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setSelUser(null)} style={{flex:1,background:"transparent",border:`1px solid ${T.borderLight}`,borderRadius:10,padding:"11px",color:T.txtSub,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                  <button onClick={changeRole} disabled={saving} style={{flex:2,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    {saving?<Sp/>:"Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AUDIT LOGS */}
      {tab==="audit"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["all","All"],["flagged","Flagged"],["blocked","Blocked"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTxFilter(v)} style={{background:txFilter===v?`${T.danger}18`:T.bgCard,border:`1px solid ${txFilter===v?T.danger:T.border}`,borderRadius:9,padding:"8px 14px",color:txFilter===v?"#fca5a5":T.txtSub,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>{l}</button>
            ))}
          </div>
          <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"90px 2fr 1fr 1fr 80px 90px 90px",padding:"11px 20px",borderBottom:`1px solid ${T.border}`,background:"#0a0820"}}>
              {["ID","User","Category","Amount","Risk","Date","Status"].map(h=><span key={h} style={{fontSize:11,fontWeight:700,color:T.txtMuted,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</span>)}
            </div>
            {filtT.map((tx,i)=>(
              <div key={tx.id} style={{display:"grid",gridTemplateColumns:"90px 2fr 1fr 1fr 80px 90px 90px",padding:"13px 20px",borderBottom:i<filtT.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                <span style={{fontSize:11,color:T.txtMuted,fontFamily:"monospace"}}>{tx.id}</span>
                <div><p style={{fontSize:13,fontWeight:600}}>{tx.user}</p><p style={{fontSize:11,color:T.txtMuted}}>{tx.email}</p></div>
                <span style={{fontSize:13,color:T.txtSub}}>{tx.category}</span>
                <span style={{fontSize:13,fontWeight:700,color:tx.type==="income"?T.success:T.txt}}>{tx.type==="income"?"+":"-"}₵{tx.amount.toLocaleString()}</span>
                <Badge label={tx.risk} color={RC[tx.risk]}/>
                <span style={{fontSize:12,color:T.txtMuted}}>{tx.date}</span>
                <Badge label={tx.status} color={tx.status==="completed"?T.success:tx.status==="blocked"?T.danger:T.warning}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FRAUD ALERTS */}
      {tab==="fraud"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
            <SC label="HIGH Risk" value={TXNS.filter(t=>t.risk==="HIGH").length} icon="🚨" color={T.danger}  sub="Require action"/>
            <SC label="MEDIUM Risk" value={TXNS.filter(t=>t.risk==="MEDIUM").length} icon="⚠️" color={T.warning} sub="Under review"/>
            <SC label="Model AUC" value="0.9964" icon="🤖" color={T.accent} sub="GradientBoosting"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TXNS.filter(t=>t.risk!=="LOW").map(tx=>(
              <div key={tx.id} style={{background:`${RC[tx.risk]}08`,border:`1px solid ${RC[tx.risk]}35`,borderRadius:16,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:18}}>{tx.risk==="HIGH"?"🚨":"⚠️"}</span>
                      <span style={{fontSize:15,fontWeight:700}}>{tx.user}</span>
                      <Badge label={`${tx.risk} RISK`} color={RC[tx.risk]}/>
                    </div>
                    <p style={{fontSize:12,color:T.txtMuted}}>{tx.email} · {tx.category} · {tx.date}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:18,fontWeight:800,color:RC[tx.risk]}}>₵{tx.amount.toLocaleString()}</p>
                    <Badge label={tx.status.toUpperCase()} color={tx.status==="blocked"?T.danger:T.warning}/>
                  </div>
                </div>
                <p style={{fontSize:13,color:T.txtSub,lineHeight:1.6,borderTop:`1px solid ${T.border}`,paddingTop:10}}>
                  {tx.risk==="HIGH"?`🚨 Flagged by AI (GradientBoosting). ₵${tx.amount.toLocaleString()} is anomalous for ${tx.category} category. Status: ${tx.status}. Recommend ${tx.status==="blocked"?"review and close.":"immediate block + user notification."}`:`⚠️ Elevated risk: ₵${tx.amount.toLocaleString()} is above average for ${tx.category}. Manual review recommended.`}
                </p>
                {tx.status!=="blocked"&&(
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <button style={{...btn(T.danger),padding:"7px 14px"}}>🚫 Block</button>
                    <button style={{...btn(T.success),padding:"7px 14px"}}>✅ Approve</button>
                    <button style={{...btn(T.accent),padding:"7px 14px"}}>📧 Notify User</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {tab==="analytics"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
            <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:22}}>
              <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:16}}>Transaction Volume 2024</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={GROWTH} barSize={10}>
                  <XAxis dataKey="m" tick={{fill:T.txtMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:T.txtMuted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₵${(v/1000).toFixed(0)}k`}/>
                  <Tooltip content={<CT/>}/>
                  <Bar dataKey="volume" name="Volume" fill="#6366f1" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:18,padding:22}}>
              <h3 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,marginBottom:16}}>User Growth 2024</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={GROWTH}>
                  <XAxis dataKey="m" tick={{fill:T.txtMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:T.txtMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CT/>}/>
                  <Line type="monotone" dataKey="users" stroke="#22d3ee" strokeWidth={2.5} dot={false} name="Users"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM SETTINGS */}
      {tab==="settings"&&(
        <div style={{maxWidth:680}}>
          {[
            {title:"Platform",items:[{l:"Name",v:"Kudi Ghana"},{l:"Version",v:"2.0.0"},{l:"Environment",v:"Production"},{l:"AI Backend",v:"http://localhost:8001 ✅"},{l:"Payment Gateway",v:"Paystack Ghana"}]},
            {title:"Security",items:[{l:"JWT Expiry",v:"15 minutes"},{l:"Refresh Token",v:"7 days"},{l:"Rate Limit",v:"120 req/min"},{l:"Auth Limit",v:"10 attempts/15min"},{l:"Password Policy",v:"Min 8 + uppercase + number"}]},
            {title:"AI Models",items:[{l:"Fraud Model",v:"GradientBoosting AUC 0.9964"},{l:"Advisor Model",v:"RandomForest 100% accuracy"},{l:"Training Data",v:"1,500 transactions (2020-2024)"},{l:"Anomalies 2024",v:"22 detected"},{l:"Last Retrained",v:"Mar 25, 2024"}]},
          ].map(s=>(
            <div key={s.title} style={{background:T.gradCard,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.border}`,background:"#0a0820"}}><h3 style={{fontSize:11,fontWeight:700,color:T.txtMuted,textTransform:"uppercase",letterSpacing:".5px"}}>{s.title}</h3></div>
              {s.items.map((item,i,arr)=>(
                <div key={item.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 20px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                  <p style={{fontSize:14,fontWeight:600}}>{item.l}</p><p style={{fontSize:13,color:T.txtSub}}>{item.v}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
