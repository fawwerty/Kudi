import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Modal, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const _dark = {
  bg:"#060614", card:"#0d0b1f", border:"#1e1b3a", borderLight:"#2d2a5e",
  primary:"#6366f1", success:"#10b981", danger:"#ef4444", warning:"#f59e0b",
  txt:"#f1f5f9", txtSub:"#94a3b8", txtMuted:"#475569",
};

const PROVIDERS = [
  {id:"mtn",       name:"MTN MoMo",     icon:"radio-button-on-outline",color:"#f59e0b",fee:"0.5%",  desc:"Mobile Money"},
  {id:"airteltigo",name:"AirtelTigo",   icon:"radio-button-on-outline",color:"#ef4444",fee:"0.75%", desc:"Money"},
  {id:"telecel",   name:"Telecel Cash", icon:"radio-button-on-outline",color:"#10b981",fee:"0.5%",  desc:"Cash"},
];

const BANKS_GH = [
  "GCB Bank","Ecobank Ghana","Absa Bank Ghana","Standard Chartered",
  "Fidelity Bank","Cal Bank","Access Bank Ghana","Zenith Bank",
  "First National Bank","Agricultural Development Bank",
  "Republic Bank","National Investment Bank","Prudential Bank",
  "OmniBSIC Bank","Universal Merchant Bank","GT Bank Ghana",
];

const BILL_TYPES = [
  {icon:"flash-outline",label:"ECG (Electricity)",   code:"ecg"},
  {icon:"water-outline",label:"GWCL (Water)",        code:"gwcl"},
  {icon:"tv-outline",label:"DStv / GOtv",         code:"dstv"},
  {icon:"phone-portrait-outline",label:"MTN Airtime",         code:"mtn_air"},
  {icon:"phone-portrait-outline",label:"AirtelTigo Airtime",  code:"at_air"},
  {icon:"home-outline",label:"DSTV Ghana",          code:"dstv_gh"},
  {icon:"globe-outline",label:"Surfline Internet",   code:"surfline"},
  {icon:"school-outline",label:"School Fees",         code:"school"},
];

type Tab = "deposit"|"withdraw"|"transfer"|"bills"|"banks";

export default function MobileMoneyScreen() {
  const { C } = useTheme();
  const [provider, setProvider]   = useState("mtn");
  const [activeTab, setActiveTab] = useState<Tab>("deposit");
  const [phone, setPhone]         = useState("");
  const [amount, setAmount]       = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote]           = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [acctNumber, setAcctNumber]     = useState("");
  const [billType, setBillType]         = useState("");
  const [billRef, setBillRef]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  const activeProvider = PROVIDERS.find(p => p.id === provider)!;

  const processPayment = async (actionLabel: string) => {
    if (!amount || parseFloat(amount) <= 0) { Alert.alert("Error", "Enter a valid amount."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSuccessMsg(`${actionLabel} of ₵${amount} via ${activeProvider.name} completed!`);
    setSuccessModal(true);
    setAmount(""); setPhone(""); setRecipient(""); setNote(""); setBillRef("");
    setTimeout(() => setSuccessModal(false), 3000);
  };

  const TABS: {id:Tab; label:string; icon:string}[] = [
    {id:"deposit",  label:"Deposit",  icon:"download-outline"},
    {id:"withdraw", label:"Withdraw", icon:"upload-outline"},
    {id:"transfer", label:"Transfer", icon:"swap-horizontal-outline"},
    {id:"bills",    label:"Bills",    icon:"receipt-outline"},
    {id:"banks",    label:"Banks",    icon:"business-outline"},
  ];

  const s = makeStyles(C);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: C.bg }}
    >
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.pageTitle}><Ionicons name="phone-portrait-outline" size={24} color={C.txt} /> Mobile Money</Text>
      <Text style={s.pageSub}>Send, Deposit and Pay via Ghana Mobile Networks</Text>

      {/* Provider selector */}
      <View style={s.providerRow}>
        {PROVIDERS.map(p => (
          <TouchableOpacity key={p.id} onPress={() => setProvider(p.id)}
            style={[s.providerCard, provider===p.id && {borderColor:p.color, backgroundColor:`${p.color}18`}]}>
            <Ionicons name={p.icon as any} size={28} color={provider===p.id ? p.color : C.txtSub} style={{marginBottom:6}} />
            <Text style={[s.providerName, provider===p.id&&{color:p.color}]}>{p.name}</Text>
            <Text style={s.providerFee}>Fee: {p.fee}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab bar */}
      <View style={{height: 50, marginBottom: 14}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} onPress={() => setActiveTab(t.id)}
              style={[s.tab, activeTab===t.id&&s.tabActive]}>
              <Ionicons name={t.icon as any} size={18} color={activeTab===t.id ? C.txt : C.txtSub} />
              <Text style={[s.tabTxt, activeTab===t.id&&{color:C.txt}]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Deposit */}
      {activeTab==="deposit" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Deposit via {activeProvider.name}</Text>
          <Text style={s.lbl}>Your Phone Number</Text>
          <View style={s.phoneRow}>
            <View style={s.flag}><Text style={{color:C.txtSub,fontSize:13}}>🇬🇭 +233</Text></View>
            <TextInput style={[s.input,{flex:1}]} placeholder="024 XXX XXXX" placeholderTextColor={C.txtMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <Text style={s.lbl}>Amount (GHS)</Text>
          <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          {amount ? <Text style={s.feeInfo}>Fee: ₵{(parseFloat(amount||"0")*0.005).toFixed(2)} · You receive: ₵{(parseFloat(amount||"0")*0.995).toFixed(2)}</Text> : null}
          <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Deposit")} disabled={loading}>
            {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Deposit Now →</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Withdraw */}
      {activeTab==="withdraw" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Withdraw to {activeProvider.name}</Text>
          <Text style={s.lbl}>Your Phone Number</Text>
          <View style={s.phoneRow}>
            <View style={s.flag}><Text style={{color:C.txtSub,fontSize:13}}>🇬🇭 +233</Text></View>
            <TextInput style={[s.input,{flex:1}]} placeholder="024 XXX XXXX" placeholderTextColor={C.txtMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <Text style={s.lbl}>Amount (GHS)</Text>
          <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Withdrawal")} disabled={loading}>
            {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Withdraw Now →</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Transfer (P2P) */}
      {activeTab==="transfer" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Send to Another Account</Text>
          <Text style={s.lbl}>Recipient Phone / Email</Text>
          <TextInput style={s.input} placeholder="0244 123 456 or email" placeholderTextColor={C.txtMuted} value={recipient} onChangeText={setRecipient} />
          <Text style={s.lbl}>Amount (GHS)</Text>
          <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <Text style={s.lbl}>Note (optional)</Text>
          <TextInput style={s.input} placeholder="e.g. Rent, School fees…" placeholderTextColor={C.txtMuted} value={note} onChangeText={setNote} />
          <View style={s.summaryBox}>
            <View style={s.summaryRow}><Text style={s.summaryLabel}>Transfer amount</Text><Text style={s.summaryVal}>₵{amount||"0.00"}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryLabel}>Transaction fee</Text><Text style={{color:C.success,fontSize:13}}>Free</Text></View>
            <View style={[s.summaryRow,{borderTopWidth:1,borderTopColor:C.border,paddingTop:8,marginTop:4}]}>
              <Text style={[s.summaryLabel,{fontWeight:"700",color:C.txt}]}>Total</Text>
              <Text style={[s.summaryVal,{fontWeight:"700"}]}>₵{amount||"0.00"}</Text>
            </View>
          </View>
          <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Transfer")} disabled={loading}>
            {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Send Transfer →</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Bill Payment */}
      {activeTab==="bills" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Pay Bills</Text>
          <View style={{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {BILL_TYPES.map(b => (
              <TouchableOpacity key={b.code} onPress={() => setBillType(b.code)}
                style={[s.billChip, billType===b.code&&s.billChipActive]}>
                <Ionicons name={b.icon as any} size={20} color={billType===b.code ? C.txt : C.txtSub} />
                <Text style={[s.billChipTxt, billType===b.code&&{color:C.txt}]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {billType && (<>
            <Text style={s.lbl}>Account / Reference Number</Text>
            <TextInput style={s.input} placeholder="e.g. Meter number, account ID" placeholderTextColor={C.txtMuted} value={billRef} onChangeText={setBillRef} />
            <Text style={s.lbl}>Amount (GHS)</Text>
            <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Bill Payment")} disabled={loading}>
              {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Pay Bill →</Text>}
            </TouchableOpacity>
          </>)}
        </View>
      )}

      {/* Bank Transfer (All Ghana Banks) */}
      {activeTab==="banks" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Transfer to Bank Account</Text>
          <Text style={s.lbl}>Select Bank</Text>
          <View style={{height: 50, marginBottom: 12}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {BANKS_GH.map(b => (
                <TouchableOpacity key={b} onPress={() => setSelectedBank(b)}
                  style={[s.bankChip, selectedBank===b&&s.bankChipActive]}>
                  <Text style={[s.bankChipTxt, selectedBank===b&&{color:C.txt}]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {selectedBank && (<>
            <Text style={s.selectedBank}>Selected: {selectedBank}</Text>
            <Text style={s.lbl}>Account Number</Text>
            <TextInput style={s.input} placeholder="0123456789" placeholderTextColor={C.txtMuted} value={acctNumber} onChangeText={setAcctNumber} keyboardType="numeric" />
            <Text style={s.lbl}>Account Name</Text>
            <TextInput style={s.input} placeholder="Recipient full name" placeholderTextColor={C.txtMuted} value={recipient} onChangeText={setRecipient} />
            <Text style={s.lbl}>Amount (GHS)</Text>
            <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Text style={s.lbl}>Narration</Text>
            <TextInput style={s.input} placeholder="e.g. Business payment" placeholderTextColor={C.txtMuted} value={note} onChangeText={setNote} />
            <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment(`Bank Transfer to ${selectedBank}`)} disabled={loading}>
              {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Transfer to Bank →</Text>}
            </TouchableOpacity>
          </>)}
        </View>
      )}

      <View style={{height:32}}/>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={s.successOverlay}>
          <View style={s.successCard}>
            <Ionicons name="checkmark-circle-outline" size={60} color={C.success} style={{marginBottom:12}} />
            <Text style={s.successTitle}>Success!</Text>
            <Text style={s.successMsg}>{successMsg}</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    root:          {flex:1,backgroundColor:C.bg},
    content:       {padding:20,paddingTop:60},
    pageTitle:     {color:C.txt,fontSize:24,fontWeight:"800",marginBottom:4},
    pageSub:       {color:C.txtSub,fontSize:13,marginBottom:20},
    providerRow:   {flexDirection:"row",gap:10,marginBottom:16},
    providerCard:  {flex:1,backgroundColor:C.card,borderRadius:16,padding:14,alignItems:"center",borderWidth:1.5,borderColor:C.border},
    providerName:  {color:C.txt,fontSize:12,fontWeight:"700",marginBottom:2,textAlign:"center"},
    providerFee:   {color:C.txtMuted,fontSize:10},
    tabRow:        {marginBottom:14},
    tab:           {flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:14,paddingVertical:10,marginRight:8,borderRadius:20,backgroundColor:C.card,borderWidth:1,borderColor:C.border},
    tabActive:     {backgroundColor:`${C.primary}25`,borderColor:C.primary},
    tabTxt:        {color:C.txtSub,fontSize:13,fontWeight:"600"},
    formCard:      {backgroundColor:C.card,borderRadius:18,padding:20,marginBottom:16,borderWidth:1,borderColor:C.border},
    formTitle:     {color:C.txt,fontSize:17,fontWeight:"700",marginBottom:16},
    phoneRow:      {flexDirection:"row",gap:8,marginBottom:14},
    flag:          {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:10,padding:12,justifyContent:"center"},
    lbl:           {color:C.txtSub,fontSize:13,fontWeight:"600",marginBottom:6},
    input:         {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:11,padding:13,color:C.txt,fontSize:14,marginBottom:14},
    feeInfo:       {color:C.txtMuted,fontSize:12,marginBottom:14,backgroundColor:C.bg,padding:10,borderRadius:8,borderWidth:1,borderColor:C.border},
    btn:           {backgroundColor:C.primary,borderRadius:12,padding:14,alignItems:"center"},
    btnTxt:        {color:"#fff",fontWeight:"700",fontSize:15},
    summaryBox:    {backgroundColor:C.bg,borderRadius:10,padding:14,marginBottom:14,borderWidth:1,borderColor:C.border},
    summaryRow:    {flexDirection:"row",justifyContent:"space-between",marginBottom:6},
    summaryLabel:  {color:C.txtSub,fontSize:13},
    summaryVal:    {color:C.txt,fontSize:13},
    billChip:      {flexDirection:"row",alignItems:"center",gap:6,backgroundColor:C.bg,borderRadius:10,padding:10,borderWidth:1,borderColor:C.border,marginBottom:4},
    billChipActive:{backgroundColor:`${C.primary}20`,borderColor:C.primary},
    billChipTxt:   {color:C.txtSub,fontSize:12,fontWeight:"600"},
    bankChip:      {backgroundColor:C.bg,borderRadius:10,paddingHorizontal:12,paddingVertical:8,marginRight:6,borderWidth:1,borderColor:C.border},
    bankChipActive:{backgroundColor:`${C.primary}20`,borderColor:C.primary},
    bankChipTxt:   {color:C.txtSub,fontSize:12,fontWeight:"600"},
    selectedBank:  {color:C.primary,fontSize:13,fontWeight:"700",marginBottom:14},
    successOverlay:{flex:1,backgroundColor:"#00000090",justifyContent:"center",alignItems:"center"},
    successCard:   {backgroundColor:C.card,borderRadius:24,padding:32,alignItems:"center",borderWidth:1,borderColor:C.border,width:280},
    successTitle:  {color:C.txt,fontSize:22,fontWeight:"800",marginBottom:8},
    successMsg:    {color:C.txtSub,fontSize:14,textAlign:"center",lineHeight:20},
  });
}

