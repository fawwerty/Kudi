// Kudi — Auth Screens (Login + Register) with Google OAuth
import { useState } from "react";
import { T, Spinner, LocalAuth } from "./utils.jsx";
import { GoogleSignInButton } from "./GoogleAuth.jsx";

// ── Login ─────────────────────────────────────────────────────────────────────
export function LoginScreen({ onLogin, onGoRegister }) {
  const [email,setEmail]=useState(""); const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError("");
    try { onLogin(await LocalAuth.login(email, pw)); }
    catch(err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      {/* Glow orbs */}
      <div style={{position:"absolute",top:"-20%",left:"-5%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle,#6366f112,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-10%",right:"-5%",width:"40vw",height:"40vw",borderRadius:"50%",background:"radial-gradient(circle,#22d3ee08,transparent 70%)",pointerEvents:"none"}}/>

      <div className="fu" style={{width:"100%",maxWidth:440}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:50,height:50,background:T.gradPrimary,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 8px 32px ${T.primaryGlow}`}}>₵</div>
            <span style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:30,fontWeight:800,letterSpacing:"-0.5px"}}>Kudi</span>
          </div>
          <p style={{color:T.txtSub,fontSize:14}}>Ghana's AI-Powered Financial Companion 🇬🇭</p>
        </div>

        <div className="card" style={{padding:"36px 36px 28px",boxShadow:"0 32px 64px #00000066"}}>
          <h2 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:22,fontWeight:700,marginBottom:4}}>Welcome back</h2>
          <p style={{color:T.txtSub,fontSize:14,marginBottom:28}}>Sign in to your account</p>

          {/* Google sign-in */}
          <GoogleSignInButton
            onSuccess={(user) => onLogin(user)}
            onError={msg => setError(msg)}
            label="Continue with Google"
          />

          <div className="or-divider">or sign in with email</div>

          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label className="lbl">Email address</label>
              <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <label className="lbl" style={{margin:0}}>Password</label>
                <button type="button" style={{background:"none",border:"none",color:T.primary,fontSize:13,cursor:"pointer",fontWeight:600}}>Forgot password?</button>
              </div>
              <div style={{position:"relative"}}>
                <input className="inp" type={showPw?"text":"password"} placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} required style={{paddingRight:48}}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.txtMuted,cursor:"pointer",fontSize:16}}>{showPw?"🙈":"👁️"}</button>
              </div>
            </div>
            {error && <div style={{background:"#ef444415",border:"1px solid #ef444440",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fca5a5"}}>⚠️ {error}</div>}
            <button className="btn" type="submit" disabled={loading} style={{width:"100%",marginTop:4}}>
              {loading ? <><Spinner/> Signing in…</> : "Sign In →"}
            </button>
          </form>
          <p style={{textAlign:"center",marginTop:22,fontSize:13,color:T.txtMuted}}>
            Don't have an account?{" "}
            <button onClick={onGoRegister} style={{background:"none",border:"none",color:T.primary,cursor:"pointer",fontWeight:700,fontSize:13}}>Create one free</button>
          </p>
        </div>

        {/* Security note */}
        <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:20,flexWrap:"wrap"}}>
          {["🔒 256-bit SSL","🛡️ AI Fraud Protection","🇬🇭 Ghana DPA Compliant"].map(b=>(
            <span key={b} style={{fontSize:11,color:T.txtMuted}}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────────────────────
export function RegisterScreen({ onGoLogin }) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",phone:"",password:"",confirm:"",role:"customer",terms:false});
  const [errors,setErrors]=useState({}); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));

  const v1=()=>{ const e={};
    if(!form.name.trim()||form.name.trim().length<2) e.name="Name must be at least 2 characters.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Enter a valid email.";
    if(!/^0\d{9}$/.test(form.phone.replace(/\s/g,""))) e.phone="Ghana format: 0XXXXXXXXX";
    setErrors(e); return !Object.keys(e).length;
  };
  const v2=()=>{ const e={};
    if(form.password.length<8) e.password="Min 8 characters.";
    else if(!/[A-Z]/.test(form.password)) e.password="Must include uppercase.";
    else if(!/[0-9]/.test(form.password)) e.password="Must include a number.";
    if(form.password!==form.confirm) e.confirm="Passwords do not match.";
    if(!form.terms) e.terms="You must accept Terms of Service.";
    setErrors(e); return !Object.keys(e).length;
  };
  const strength=()=>{ let s=0; if(form.password.length>=8)s++; if(/[A-Z]/.test(form.password))s++; if(/[0-9]/.test(form.password))s++; if(/[^A-Za-z0-9]/.test(form.password))s++; return s; };
  const sColors=["","#ef4444","#f59e0b","#22d3ee","#10b981"];
  const sLabels=["","Weak","Fair","Good","Strong"];

  const submit=async e=>{ e.preventDefault(); if(!v2())return; setLoading(true);
    try { await LocalAuth.register(form); setDone(true); }
    catch(err) { setErrors({submit:err.message}); }
    setLoading(false);
  };

  const ErrMsg=({f})=>errors[f]?<p style={{fontSize:12,color:T.danger,marginTop:4}}>⚠ {errors[f]}</p>:null;

  if(done) return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="sci" style={{textAlign:"center",maxWidth:380}}>
        <div style={{width:90,height:90,background:"#10b98120",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 24px",border:"2px solid #10b98140"}}>🎉</div>
        <h2 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:28,fontWeight:800,marginBottom:8}}>Account Created!</h2>
        <p style={{color:T.txtSub,fontSize:15,marginBottom:6}}>Welcome to Kudi, {form.name.split(" ")[0]}!</p>
        <p style={{color:T.txtMuted,fontSize:13,marginBottom:30,lineHeight:1.6}}>Your AI-powered banking account is ready. Sign in to access your dashboard.</p>
        <button className="btn" onClick={onGoLogin} style={{width:"100%"}}>Sign In Now →</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-15%",right:"-5%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle,#22d3ee0a,transparent 70%)",pointerEvents:"none"}}/>
      <div className="fu" style={{width:"100%",maxWidth:480}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:42,height:42,background:T.gradPrimary,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>₵</div>
            <span style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:26,fontWeight:800}}>Kudi</span>
          </div>
        </div>
        <div className="card" style={{padding:34,boxShadow:"0 32px 64px #00000066"}}>
          <div style={{display:"flex",gap:8,marginBottom:26}}>
            {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:4,background:s<=step?T.gradPrimary:T.border,transition:"background .4s"}}/>)}
          </div>
          <h2 style={{fontFamily:"Bricolage Grotesque,sans-serif",fontSize:22,fontWeight:700,marginBottom:4}}>
            {step===1?"Create your account":"Set your password"}
          </h2>
          <p style={{color:T.txtSub,fontSize:14,marginBottom:24}}>Step {step} of 2</p>

          {step===1&&(
            <form onSubmit={e=>{e.preventDefault();if(v1())setStep(2);}} style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="lbl">Full name</label><input className="inp" placeholder="e.g. Kwafo Nathaniel" value={form.name} onChange={e=>upd("name",e.target.value)} required/><ErrMsg f="name"/></div>
              <div><label className="lbl">Email address</label><input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e=>upd("email",e.target.value)} required/><ErrMsg f="email"/></div>
              <div>
                <label className="lbl">Phone (Ghana)</label>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:"13px 12px",fontSize:14,color:T.txtSub,whiteSpace:"nowrap"}}>🇬🇭 +233</div>
                  <input className="inp" type="tel" placeholder="0244 123 456" value={form.phone} onChange={e=>upd("phone",e.target.value)} required/>
                </div><ErrMsg f="phone"/>
              </div>
              <div>
                <label className="lbl">Account type</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[["customer","👤","Personal"],["business","🏢","Business"]].map(([v,icon,l])=>(
                    <button key={v} type="button" onClick={()=>upd("role",v)} style={{background:form.role===v?T.primaryGlow:T.bg,border:`1px solid ${form.role===v?T.primary:T.borderLight}`,borderRadius:12,padding:"12px",color:form.role===v?T.txt:T.txtSub,cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s"}}>
                      {icon} {l}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn" type="submit" style={{width:"100%",marginTop:4}}>Continue →</button>
            </form>
          )}

          {step===2&&(
            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="lbl">Create password</label>
                <input className="inp" type="password" placeholder="Min 8 chars, uppercase, number" value={form.password} onChange={e=>upd("password",e.target.value)} required/>
                {form.password&&(
                  <div style={{marginTop:8}}>
                    <div style={{display:"flex",gap:4,marginBottom:4}}>
                      {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:3,background:i<=strength()?sColors[strength()]:T.border,transition:"background .3s"}}/>)}
                    </div>
                    <p style={{fontSize:12,color:sColors[strength()]||T.txtMuted}}>Strength: {sLabels[strength()]||"—"}</p>
                  </div>
                )}
                <ErrMsg f="password"/>
              </div>
              <div><label className="lbl">Confirm password</label><input className="inp" type="password" placeholder="Repeat your password" value={form.confirm} onChange={e=>upd("confirm",e.target.value)} required/><ErrMsg f="confirm"/></div>
              <div style={{display:"flex",gap:10,padding:"12px 14px",background:T.bg,borderRadius:10,border:`1px solid ${T.border}`}}>
                <input type="checkbox" id="terms" checked={form.terms} onChange={e=>upd("terms",e.target.checked)} style={{marginTop:2,accentColor:T.primary,width:16,height:16,flexShrink:0}}/>
                <label htmlFor="terms" style={{fontSize:13,color:T.txtSub,lineHeight:1.5,cursor:"pointer"}}>
                  I agree to Kudi's <span style={{color:T.primary,fontWeight:600}}>Terms of Service</span> and <span style={{color:T.primary,fontWeight:600}}>Privacy Policy</span>. Protected under Ghana's Data Protection Act.
                </label>
              </div>
              <ErrMsg f="terms"/>
              {errors.submit&&<div style={{background:"#ef444415",border:"1px solid #ef444440",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fca5a5"}}>⚠️ {errors.submit}</div>}
              <div style={{display:"flex",gap:8}}>
                <button type="button" className="btn-ghost" onClick={()=>{setStep(1);setErrors({});}} style={{flex:1}}>← Back</button>
                <button className="btn" type="submit" disabled={loading} style={{flex:2}}>{loading?<><Spinner/>Creating…</>:"Create Account 🎉"}</button>
              </div>
            </form>
          )}
          <p style={{textAlign:"center",marginTop:20,fontSize:13,color:T.txtMuted}}>
            Already have an account?{" "}
            <button onClick={onGoLogin} style={{background:"none",border:"none",color:T.primary,cursor:"pointer",fontWeight:700,fontSize:13}}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
