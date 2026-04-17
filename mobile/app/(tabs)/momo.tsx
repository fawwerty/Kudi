import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Modal, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { fetchApi } from "@/lib/api";
import * as WebBrowser from "expo-web-browser";

const PROVIDERS = [
  {id:"mtn",       name:"MTN MoMo",     icon:"radio-button-on-outline",color:"#f59e0b",fee:"0.5%",  desc:"Mobile Money"},
  {id:"airteltigo",name:"AirtelTigo",   icon:"radio-button-on-outline",color:"#ef4444",fee:"0.75%", desc:"Money"},
  {id:"telecel",   name:"Telecel Cash", icon:"radio-button-on-outline",color:"#10b981",fee:"0.5%",  desc:"Cash"},
];

const BILL_TYPES = [
  {icon:"flash-outline",label:"ECG (Electricity)",   code:"ecg"},
  {icon:"water-outline",label:"GWCL (Water)",        code:"gwcl"},
  {icon:"tv-outline",label:"DStv / GOtv",         code:"dstv"},
  {icon:"phone-portrait-outline",label:"MTN Airtime",         code:"mtn_air"},
  {icon:"phone-portrait-outline",label:"AirtelTigo Airtime",  code:"at_air"},
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
  const [bankList, setBankList] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [bankQuery, setBankQuery] = useState("");
  const [acctNumber, setAcctNumber]     = useState("");
  const [acctName, setAcctName]         = useState("");
  const [billType, setBillType]         = useState("");
  const [billRef, setBillRef]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  const activeProvider = PROVIDERS.find(p => p.id === provider)!;

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const banks = await fetchApi("/transactions/banks");
        setBankList(banks);
      } catch (err) {
        console.error("Failed to load banks");
      }
    };
    if (activeTab === "banks") loadBanks();
  }, [activeTab]);

  const processPayment = async (actionLabel: string) => {
    if (!amount || parseFloat(amount) <= 0) { Alert.alert("Error", "Enter a valid amount."); return; }
    
    setLoading(true);
    try {
      let endpoint = "";
      let body: any = { amount: parseFloat(amount) };

      if (activeTab === "deposit") {
        endpoint = "/transactions/deposit";
        body.description = `${actionLabel} via ${activeProvider.name}`;
      } else if (activeTab === "withdraw") {
        endpoint = "/transactions/withdraw"; // backend uses paystack
        body.bankCode = "mtn"; // Simple fallback for MoMo
        body.accountNumber = phone;
        body.accountName = "MoMo User";
      } else if (activeTab === "banks") {
        endpoint = "/transactions/withdraw";
        body.bankCode = selectedBank?.code;
        body.accountNumber = acctNumber;
        body.accountName = acctName;
      }

      const res = await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (res.checkoutUrl) {
        // Handle Deposit Redirect
        const result = await WebBrowser.openBrowserAsync(res.checkoutUrl);
        if (result.type === "cancel") {
          Alert.alert("Interrupted", "Payment window was closed.");
        } else {
          setSuccessMsg(`Deposit request initiated! Your balance will update once confirmed.`);
          setSuccessModal(true);
        }
      } else {
        setSuccessMsg(`${actionLabel} of ₵${amount} initiated successfully!`);
        setSuccessModal(true);
      }

      setAmount(""); setPhone(""); setRecipient(""); setNote(""); setBillRef(""); setAcctNumber(""); setAcctName("");
      setTimeout(() => setSuccessModal(false), 5000);
    } catch (err: any) {
      Alert.alert("Transaction Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBanks = bankList.filter(b => b.name.toLowerCase().includes(bankQuery.toLowerCase())).slice(0, 5);

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
      <Text style={s.pageTitle}><Ionicons name="phone-portrait-outline" size={24} color={C.txt} /> Mobile Money & Banks</Text>
      <Text style={s.pageSub}>Secure Real-time Transactions via Paystack</Text>

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
          <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Deposit")} disabled={loading}>
            {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Secure Paystack Deposit →</Text>}
          </TouchableOpacity>
        </div>
      )}

      {/* Withdraw */}
      {activeTab==="withdraw" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Withdraw to {activeProvider.name}</Text>
          <Text style={s.lbl}>Mobile Money Number</Text>
          <View style={s.phoneRow}>
            <View style={s.flag}><Text style={{color:C.txtSub,fontSize:13}}>🇬🇭 +233</Text></View>
            <TextInput style={[s.input,{flex:1}]} placeholder="024 XXX XXXX" placeholderTextColor={C.txtMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <Text style={s.lbl}>Amount (GHS)</Text>
          <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Withdrawal")} disabled={loading}>
            {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Withdraw to MoMo Wallet →</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Bank Transfer */}
      {activeTab==="banks" && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>Real-time Bank Transfer</Text>
          <Text style={s.lbl}>Select Bank</Text>
          <TextInput 
            style={s.input} 
            placeholder="Search bank name..." 
            placeholderTextColor={C.txtMuted} 
            value={bankQuery} 
            onChangeText={(t) => {setBankQuery(t); setSelectedBank(null);}} 
          />
          {bankQuery && !selectedBank && (
            <View style={s.bankList}>
              {filteredBanks.map(b => (
                <TouchableOpacity key={b.code} style={s.bankItem} onPress={()=>{setSelectedBank(b); setBankQuery(b.name);}}>
                  <Text style={{color:C.txt,fontSize:13}}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedBank && (
            <>
              <Text style={s.lbl}>Account Number</Text>
              <TextInput style={s.input} placeholder="0123456789" placeholderTextColor={C.txtMuted} value={acctNumber} onChangeText={setAcctNumber} keyboardType="numeric" />
              <Text style={s.lbl}>Account Name</Text>
              <TextInput style={s.input} placeholder="Recipient's Name" placeholderTextColor={C.txtMuted} value={acctName} onChangeText={setAcctName} />
              <Text style={s.lbl}>Amount (GHS)</Text>
              <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
              <TouchableOpacity style={[s.btn,loading&&{opacity:.6}]} onPress={()=>processPayment("Bank Transfer")} disabled={loading}>
                {loading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Initiate Real-time Transfer →</Text>}
              </TouchableOpacity>
            </>
          )}
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
    pageTitle:     {color:C.txt,fontSize:20,fontWeight:"800",marginBottom:4},
    pageSub:       {color:C.txtSub,fontSize:12,marginBottom:20},
    providerRow:   {flexDirection:"row",gap:10,marginBottom:16},
    providerCard:  {flex:1,backgroundColor:C.card,borderRadius:16,padding:14,alignItems:"center",borderWidth:1.5,borderColor:C.border},
    providerName:  {color:C.txt,fontSize:11,fontWeight:"700",marginBottom:2,textAlign:"center"},
    providerFee:   {color:C.txtMuted,fontSize:9},
    tabRow:        {marginBottom:14},
    tab:           {flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:14,paddingVertical:10,marginRight:8,borderRadius:20,backgroundColor:C.card,borderWidth:1,borderColor:C.border},
    tabActive:     {backgroundColor:`${C.primary}25`,borderColor:C.primary},
    tabTxt:        {color:C.txtSub,fontSize:12,fontWeight:"600"},
    formCard:      {backgroundColor:C.card,borderRadius:18,padding:20,marginBottom:16,borderWidth:1,borderColor:C.border},
    formTitle:     {color:C.txt,fontSize:16,fontWeight:"700",marginBottom:16},
    phoneRow:      {flexDirection:"row",gap:8,marginBottom:14},
    flag:          {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:10,padding:12,justifyContent:"center"},
    lbl:           {color:C.txtSub,fontSize:12,fontWeight:"600",marginBottom:6},
    input:         {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:11,padding:13,color:C.txt,fontSize:14,marginBottom:14},
    btn:           {backgroundColor:C.primary,borderRadius:12,padding:14,alignItems:"center"},
    btnTxt:        {color:"#fff",fontWeight:"700",fontSize:14},
    bankList:      {backgroundColor:C.bg,borderRadius:12,marginBottom:14,borderWidth:1,borderColor:C.border},
    bankItem:      {padding:12,borderBottomWidth:1,borderBottomColor:C.border},
    successOverlay:{flex:1,backgroundColor:"#00000090",justifyContent:"center",alignItems:"center"},
    successCard:   {backgroundColor:C.card,borderRadius:24,padding:32,alignItems:"center",borderWidth:1,borderColor:C.border,width:280},
    successTitle:  {color:C.txt,fontSize:22,fontWeight:"800",marginBottom:8},
    successMsg:    {color:C.txtSub,fontSize:14,textAlign:"center",lineHeight:20},
  });
}

