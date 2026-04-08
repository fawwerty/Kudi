/**
 * Kudi Mobile — AI Advisor Screen
 * Reflects REAL user transaction data from /api/transactions.
 * Insights are dynamic, not from trained dataset.
 */
import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { fetchApi } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";

interface Msg { role:"user"|"ai"; text:string; }

interface Insight {
  icon: string;
  color: string;
  title: string;
  msg: string;
  detail?: string;
}

function buildInsights(txns: any[]): Insight[] {
  if (txns.length === 0) {
    return [
      {icon:"bulb-outline",color:"#6366f1",title:"No Data Yet",msg:"Make your first transaction to unlock AI insights.",detail:"Start by depositing funds or making a transfer."},
    ];
  }

  const income  = txns.filter(t => t.type==="credit").reduce((s,t) => s + Math.abs(t.amount || 0), 0);
  const expense = txns.filter(t => t.type==="debit").reduce((s,t) => s + Math.abs(t.amount || 0), 0);

  const net     = income - expense;

  // Category breakdown
  const catMap: Record<string,number> = {};
  txns.forEach(t => {
    if (t.type==="debit") catMap[t.category] = (catMap[t.category]||0) + Math.abs(t.amount);
  });
  const topCats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const topCat  = topCats[0];

  const insights: Insight[] = [];

  // Net balance insight
  if (net < 0) {
    insights.push({
      icon:"alert-circle-outline", color:"#ef4444",
      title:"Overspending Alert",
      msg:`Expenses exceed income by ₵${Math.abs(net).toFixed(2)}. Review your spending patterns.`,
      detail:`Total income: ₵${income.toFixed(2)}\nTotal expenses: ₵${expense.toFixed(2)}\nNet: -₵${Math.abs(net).toFixed(2)}\n\nConsider reducing discretionary spending to close this gap.`,
    });
  } else {
    insights.push({
      icon:"checkmark-circle-outline", color:"#10b981",
      title:"Positive Cash Flow",
      msg:`Great job! You're ₵${net.toFixed(2)} ahead this period.`,
      detail:`Total income: ₵${income.toFixed(2)}\nTotal expenses: ₵${expense.toFixed(2)}\nSurplus: ₵${net.toFixed(2)}\n\nConsider moving 10% of surplus to savings.`,
    });
  }

  // Top spending category
  if (topCat) {
    const pct = ((topCat[1]/expense)*100).toFixed(0);
    insights.push({
      icon:"analytics-outline", color:"#f59e0b",
      title:`Top Spend: ${topCat[0]}`,
      msg:`${topCat[0]} accounts for ${pct}% of your expenses (₵${topCat[1].toFixed(2)}).`,
      detail:`Breakdown:\n${topCats.map(([c,a])=>`• ${c}: ₵${a.toFixed(2)}`).join("\n")}\n\nTip: Set a monthly cap on your top category to reduce overspend.`,
    });
  }

  // Transfer activity
  const transfers = txns.filter(t => t.category==="Transfer");
  if (transfers.length > 0) {
    const totalTransfers = transfers.reduce((s,t)=>s+Math.abs(t.amount),0);
    insights.push({
      icon:"swap-horizontal-outline", color:"#22d3ee",
      title:"Transfer Activity",
      msg:`You've made ${transfers.length} transfer(s) totalling ₵${totalTransfers.toFixed(2)}.`,
      detail:`${transfers.length} transfers processed.\nTotal value: ₵${totalTransfers.toFixed(2)}\n\nAll transfers are free within Kudi. Use the MoMo tab to send to mobile wallets.`,
    });
  }

  // MoMo usage
  const momoTxns = txns.filter(t => t.category==="Mobile Money");
  if (momoTxns.length > 0) {
    const momoTotal = momoTxns.reduce((s,t)=>s+Math.abs(t.amount),0);
    insights.push({
      icon:"wallet-outline", color:"#6366f1",
      title:"Mobile Money Usage",
      msg:`${momoTxns.length} MoMo transaction(s) worth ₵${momoTotal.toFixed(2)}.`,
      detail:`MoMo transactions: ${momoTxns.length}\nTotal value: ₵${momoTotal.toFixed(2)}\n\nSet up auto-debit for utilities via MTN MoMo to save time and avoid late fees.`,
    });
  }

  // Investment / savings
  insights.push({
    icon:"trending-up-outline", color:"#6366f1",
    title:"Investment Tip",
    msg:income>0?`Consider saving ₵${(income*0.1).toFixed(2)} (10% of income) in a high-yield fund.`:"Start earning to unlock savings recommendations.",
    detail:`Recommended monthly saving: ₵${(income*0.1).toFixed(2)}\n\nDatabank Index Fund (Ghana) offers an average 18% p.a. return. A ₵${(income*0.1*12*1.18).toFixed(2)}/month deposit could grow to ₵${(income*0.1*12*1.18).toFixed(2)} in one year.`,
  });

  return insights;
}

export default function AdvisorScreen() {
  const { C } = useTheme();
  const s = makeStyles(C);

  const [txns,       setTxns]       = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [insights,   setInsights]   = useState<Insight[]>([]);
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        const res = await fetchApi("/transactions?limit=100");
        const data = res.transactions || [];
        setTxns(data);
        const computed = buildInsights(data);
        setInsights(computed);

        const income  = data.filter((t:any)=>t.type==="credit").reduce((s:number,t:any)=>s+Math.abs(t.amount),0);
        const expense = data.filter((t:any)=>t.type==="debit").reduce((s:number,t:any)=>s+Math.abs(t.amount),0);
        const net = income - expense;

        setMessages([{
          role:"ai",
          text:`Hi! 👋 I'm Kudi AI — your personal financial advisor.\n\nBased on your ${data.length} transaction(s):\n• Income: ₵${income.toFixed(2)}\n• Expenses: ₵${expense.toFixed(2)}\n• Net: ${net>=0?"+":""}₵${net.toFixed(2)}\n\nAsk me anything about your finances!`,
        }]);
      } catch (e) {
        setInsights(buildInsights([]));
        setMessages([{role:"ai",text:"Hi! 👋 I'm Kudi AI. I couldn't load your transaction data right now. Please check your connection and try again."}]);
      }
      setLoadingData(false);
    }
    loadData();
  }, []);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim(); setInput(""); setLoading(true);
    setMessages(p => [...p, {role:"user", text:msg}]);
    await new Promise(r => setTimeout(r, 500));
    const lower = msg.toLowerCase();

    const income  = txns.filter(t=>t.type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0);
    const expense = txns.filter(t=>t.type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0);
    const net = income - expense;
    const catMap: Record<string,number> = {};
    txns.forEach(t => { if(t.type==="debit") catMap[t.category]=(catMap[t.category]||0)+Math.abs(t.amount); });
    const topCats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

    let reply = "";
    if (lower.includes("spend")||lower.includes("top")||lower.includes("categor")) {
      reply = topCats.length>0
        ? `📊 Your top spending categories:\n${topCats.map(([c,a],i)=>`${i+1}. ${c} — ₵${a.toFixed(2)}`).join("\n")}\n\nTotal expenses: ₵${expense.toFixed(2)}`
        : "No expense data yet. Make a transaction to see spending categories!";
    } else if (lower.includes("income")||lower.includes("earn")) {
      reply = `💼 Total income recorded: ₵${income.toFixed(2)}\n\nThis covers ${txns.filter(t=>t.type==="credit").length} credit transaction(s).`;
    } else if (lower.includes("balance")||lower.includes("net")) {
      reply = `📈 Net balance this period: ${net>=0?"+":""}₵${net.toFixed(2)}\n\n${net>=0?"You're in surplus — consider saving the excess.":"Expenses exceed income. Review top categories to find savings."}`;
    } else if (lower.includes("transfer")) {
      const tf = txns.filter(t=>t.category==="Transfer");
      reply = tf.length>0
        ? `↔️ ${tf.length} transfer(s) found.\nTotal: ₵${tf.reduce((s,t)=>s+Math.abs(t.amount),0).toFixed(2)}`
        : "No transfers yet. Use the Home screen to send funds.";
    } else if (lower.includes("momo")||lower.includes("mobile money")) {
      const mm = txns.filter(t=>t.category==="Mobile Money");
      reply = mm.length>0
        ? `📱 ${mm.length} mobile money transaction(s).\nTotal: ₵${mm.reduce((s,t)=>s+Math.abs(t.amount),0).toFixed(2)}\n\nTip: Auto-debit utilities to save time.`
        : "No MoMo transactions yet. Use the MoMo tab to deposit or pay bills.";
    } else if (lower.includes("invest")||lower.includes("save")) {
      reply = income>0
        ? `📈 Recommended monthly saving: ₵${(income*0.1).toFixed(2)} (10% of ₵${income.toFixed(2)} income).\n\nDatabank Index Fund offers ~18% p.a. in Ghana.`
        : "Start by depositing funds and building an income history.";
    } else if (lower.includes("fraud")||lower.includes("security")) {
      reply = `🛡️ AI fraud detection is active on your account.\n\nAll transactions are analysed in real-time using GradientBoosting (AUC 0.9964). Suspicious activity triggers an immediate block.`;
    } else {
      reply = `I can help with:\n• "My spending" — top categories\n• "My income" — earnings\n• "Net balance" — financial health\n• "Transfer activity"\n• "MoMo usage"\n• "Investment tips"\n• "Fraud protection"\n\nWhat would you like to know?`;
    }
    setMessages(p => [...p, {role:"ai", text:reply}]);
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({animated:true}), 100);
  };


  const onInsightPress = (ins: Insight) => {
    Alert.alert(ins.title, ins.detail || ins.msg, [{text:"Got it"}]);
  };

  return (
    <KeyboardAvoidingView style={{flex:1,backgroundColor:C.bg}} behavior={Platform.OS==="ios"?"padding":"height"}>
      <ScrollView ref={scrollRef} style={s.root} contentContainerStyle={s.content}>
        {/* Header */}
        <Text style={s.title}><Ionicons name="sparkles-outline" size={24} color={C.txt} /> AI Advisor</Text>
        <Text style={s.sub}>Powered by your real transaction data</Text>

        {/* Loading state */}
        {loadingData && (
          <View style={{alignItems:"center",padding:24}}>
            <ActivityIndicator color={C.primary} size="large"/>
            <Text style={{color:C.txtSub,marginTop:12}}>Loading your financial insights…</Text>
          </View>
        )}

        {/* Dynamic Insights — each card is clickable */}
        {!loadingData && insights.map((ins,i) => (
          <TouchableOpacity key={i} activeOpacity={0.75} onPress={() => onInsightPress(ins)}
            style={[s.insightCard, {borderLeftColor:ins.color,borderLeftWidth:3}]}>
            <Ionicons name={ins.icon as any} size={24} color={ins.color} style={{marginTop:2}} />
            <View style={{flex:1}}>
              <Text style={[s.insightTitle, {color:ins.color}]}>{ins.title}</Text>
              <Text style={s.insightMsg}>{ins.msg}</Text>
              <Text style={{color:C.primary,fontSize:11,marginTop:4,fontWeight:"600"}}>Tap for details →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* AI Chat */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>AI Chat</Text>
          <Text style={s.sectionSub}>Ask anything about your finances</Text>
          <View style={s.chatBox}>
            {messages.map((m,i) => (
              <View key={i} style={[s.bubble, m.role==="user"?s.bubbleUser:s.bubbleAI]}>
                <Text style={[s.bubbleTxt, m.role==="user"&&{color:"#fff"}]}>{m.text}</Text>
              </View>
            ))}
            {loading && (
              <View style={s.bubbleAI}>
                <View style={{flexDirection:"row",gap:4}}>
                  {[0,1,2].map(i=><View key={i} style={s.dot}/>)}
                </View>
              </View>
            )}
          </View>
          <View style={{flexDirection:"row",gap:8,marginTop:10}}>
            <TextInput
              style={[s.input,{flex:1}]}
              placeholder="Ask about your finances…"
              placeholderTextColor={C.txtMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity style={s.btn} onPress={send}>
              <Text style={s.btnTxt}>➤</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:8}}>
            {["My spending","My income","Net balance","MoMo","Invest","Fraud"].map(q=>(
              <TouchableOpacity key={q} onPress={()=>setInput(q)} style={s.quickChip}>
                <Text style={s.quickChipTxt}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={{height:32}}/>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    root:        {flex:1,backgroundColor:C.bg},
    content:     {padding:20,paddingTop:60},
    title:       {color:C.txt,fontSize:24,fontWeight:"800",marginBottom:4},
    sub:         {color:C.txtSub,fontSize:13,marginBottom:20},
    insightCard: {backgroundColor:C.card,borderRadius:12,padding:14,flexDirection:"row",gap:12,marginBottom:10,borderWidth:1,borderColor:C.border},
    insightIcon: {fontSize:22},
    insightTitle:{fontWeight:"700",fontSize:13,marginBottom:3},
    insightMsg:  {color:C.txtSub,fontSize:12,lineHeight:17},
    section:     {backgroundColor:C.card,borderRadius:16,padding:18,marginBottom:16,borderWidth:1,borderColor:C.border},
    sectionTitle:{color:C.txt,fontSize:16,fontWeight:"700",marginBottom:4},
    sectionSub:  {color:C.txtMuted,fontSize:12,marginBottom:14},
    input:       {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:11,padding:12,color:C.txt,fontSize:14},
    btn:         {backgroundColor:C.primary,borderRadius:11,paddingHorizontal:16,paddingVertical:12,alignItems:"center",justifyContent:"center"},
    btnTxt:      {color:"#fff",fontWeight:"700",fontSize:14},
    chatBox:     {backgroundColor:C.bg,borderRadius:12,padding:12,minHeight:120,gap:8},
    bubble:      {maxWidth:"85%",padding:10,borderRadius:12},
    bubbleUser:  {backgroundColor:C.primary,alignSelf:"flex-end",borderBottomRightRadius:4},
    bubbleAI:    {backgroundColor:C.card,alignSelf:"flex-start",borderBottomLeftRadius:4,borderWidth:1,borderColor:C.border},
    bubbleTxt:   {color:C.txt,fontSize:13,lineHeight:18},
    dot:         {width:6,height:6,borderRadius:3,backgroundColor:C.primary},
    quickChip:   {backgroundColor:C.bg,borderRadius:16,paddingHorizontal:10,paddingVertical:5,marginRight:6,borderWidth:1,borderColor:C.borderLight},
    quickChipTxt:{color:C.txtSub,fontSize:12},
  });
}
