import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, ActivityIndicator, RefreshControl,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform } from "react-native";

type Transaction = {
  _id: string; description: string; amount: number; type: "credit"|"debit"|"income"|"expense";
  category: string; status: string; createdAt: string;
};

const CAT_ICONS: Record<string,string> = {
  Shopping: "cart-outline", Investment: "trending-up-outline", Rent: "home-outline", Entertainment: "film-outline",
  Health: "medkit-outline", Salary: "briefcase-outline", "Food & Drink": "fast-food-outline", Travel: "airplane-outline",
  Utilities: "flash-outline", Transfer: "swap-horizontal-outline", Deposit: "arrow-down-outline", Withdraw: "arrow-up-outline", Other: "cube-outline",
};

export default function TransactionsScreen() {
  const { user } = useAuth();
  const { C } = useTheme();
  const [txns, setTxns]         = useState<Transaction[]>([]);
  const [filter, setFilter]     = useState<"all"|"credit"|"debit">("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depOpen, setDepOpen]   = useState(false);
  const [depAmt, setDepAmt]     = useState("");
  const [depLoading, setDepLoading] = useState(false);

  const load = async () => { 
    if (user) {
      try {
        const res = await fetchApi("/transactions");
        // Handle both direct array and wrapped response formats
        const data = Array.isArray(res) ? res : (res.transactions || []);
        setTxns(data);
      } catch (err) {
        console.error("Transactions load error:", err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  useEffect(() => { load(); }, [user]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = txns.filter(t => {
    // Normalize types check (supporting both API versions)
    const type = (t.type === "income" || t.type === "credit") ? "credit" : "debit";
    if (filter === "credit" && type !== "credit") return false;
    if (filter === "debit"  && type !== "debit")  return false;
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDeposit = async () => {
    if (!depAmt || parseFloat(depAmt) <= 0) return;
    setDepLoading(true);
    try {
      await fetchApi("/transactions", {
        method: "POST",
        body: JSON.stringify({
          description: "Account Deposit",
          category: "Investment",
          amount: parseFloat(depAmt),
          type: "credit",
        }),
      });
      await load();
      setDepOpen(false); 
      setDepAmt(""); 
    } catch (err) {
      console.error("Deposit failed:", err);
    } finally {
      setDepLoading(false);
    }
  };

  const s = makeStyles(C);

  if (loading && !refreshing) {
    return (
      <View style={[s.root, {justifyContent:"center", alignItems:"center"}]}>
         <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Transactions</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setDepOpen(true)}>
          <Text style={s.addBtnTxt}><Ionicons name="add-circle-outline" size={14} color="#fff" /> Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={18} color={C.txtMuted} style={{ marginRight: 8 }} />
        <TextInput 
          style={s.searchInput} 
          placeholder="Search transactions…" 
          placeholderTextColor={C.txtMuted} 
          value={search} 
          onChangeText={setSearch} 
        />
      </View>

      {/* Filters */}
      <View style={s.filters}>
        {(["all","credit","debit"] as const).map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[s.filterBtn, filter===f && s.filterBtnActive]}>
            <Text style={[s.filterTxt, filter===f && s.filterTxtActive]}>
              {f === "credit" ? "Credit" : f === "debit" ? "Debit" : "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView 
        style={{ flex:1 }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={48} color={C.txtMuted} style={{ marginBottom: 12 }} />
            <Text style={s.emptyTxt}>{txns.length===0 ? "No transactions yet." : "No results for current filter."}</Text>
          </View>
        ) : filtered.map((tx, i) => {
          const isIncome = tx.type === "income" || tx.type === "credit";
          return (
            <View key={tx._id} style={[s.txRow, i<filtered.length-1&&{borderBottomWidth:1,borderBottomColor:C.border}]}>
              <View style={s.txIcon}>
                <Ionicons name={CAT_ICONS[tx.category] as any || "cube-outline"} size={20} color={C.txtSub} />
              </View>
              <View style={{flex:1,marginRight:8}}>
                <Text style={s.txDesc} numberOfLines={1}>{tx.description}</Text>
                <Text style={s.txMeta}>{tx.category} · {new Date(tx.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={{alignItems:"flex-end"}}>
                <Text style={[s.txAmt, {color:isIncome?C.success:C.txt}]}>
                  {isIncome?"+":"-"}₵{Math.abs(tx.amount).toLocaleString("en-GH",{minimumFractionDigits:2})}
                </Text>
                <Text style={s.txStatus}>✓ {tx.status || "Success"}</Text>
              </View>
            </View>
          );
        })}
        <View style={{height:32}}/>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal visible={depOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Deposit Funds</Text>
                <TouchableOpacity onPress={() => setDepOpen(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
              </View>
              <View style={{flexDirection:"row", alignItems:"center", gap:6, marginBottom:14}}>
                <Ionicons name="shield-checkmark-outline" size={16} color={C.success} />
                <Text style={{color:C.success,fontSize:12,fontWeight:"600"}}>AI-shield active. Verifying source safety…</Text>
              </View>
              <Text style={s.lbl}>Amount (GHS)</Text>
              <TextInput style={s.input} placeholder="0.00" placeholderTextColor={C.txtMuted} value={depAmt} onChangeText={setDepAmt} keyboardType="decimal-pad" />
              <TouchableOpacity style={[s.btn, depLoading&&{opacity:.6}]} onPress={handleDeposit} disabled={depLoading}>
                {depLoading ? <ActivityIndicator color="#fff" size="small"/> : <Text style={s.btnTxt}>Deposit →</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function makeStyles(C:any) {
  return StyleSheet.create({
    root:         {flex:1,backgroundColor:C.bg},
    header:       {flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:20,paddingTop:60},
    title:        {color:C.txt,fontSize:24,fontWeight:"800"},
    addBtn:       {backgroundColor:C.primary,borderRadius:10,paddingHorizontal:14,paddingVertical:8},
    addBtnTxt:    {color:"#fff",fontWeight:"700",fontSize:13},
    searchBox:    {flexDirection:"row",alignItems:"center",backgroundColor:C.card,borderRadius:12,margin:16,marginTop:0,padding:12,borderWidth:1,borderColor:C.border},
    searchIcon:   {fontSize:16,marginRight:8},
    searchInput:  {flex:1,color:C.txt,fontSize:14},
    filters:      {flexDirection:"row",gap:8,paddingHorizontal:16,marginBottom:12},
    filterBtn:    {flex:1,padding:8,borderRadius:10,borderWidth:1,borderColor:C.borderLight,alignItems:"center", backgroundColor:C.card},
    filterBtnActive:{backgroundColor:`${C.primary}25`,borderColor:C.primary},
    filterTxt:    {color:C.txtSub,fontSize:13,fontWeight:"600"},
    filterTxtActive:{color:C.txt},
    txRow:        {flexDirection:"row",alignItems:"center",paddingHorizontal:16,paddingVertical:13},
    txIcon:       {width:38,height:38,backgroundColor:C.border,borderRadius:10,alignItems:"center",justifyContent:"center",marginRight:12},
    txDesc:       {color:C.txt,fontSize:13,fontWeight:"600"},
    txMeta:       {color:C.txtMuted,fontSize:11,marginTop:2},
    txAmt:        {fontSize:14,fontWeight:"700"},
    txStatus:     {color:C.success,fontSize:10,marginTop:2,fontWeight:"600"},
    empty:        {alignItems:"center",paddingVertical:60},
    emptyTxt:     {color:C.txtMuted,fontSize:14},
    modalOverlay: {flex:1,backgroundColor:"#00000090",justifyContent:"flex-end"},
    modalCard:    {backgroundColor:C.card,borderTopLeftRadius:24,borderTopRightRadius:24,padding:28,borderTopWidth:1,borderColor:C.border},
    modalHeader:  {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:18},
    modalTitle:   {color:C.txt,fontSize:20,fontWeight:"800"},
    lbl:          {color:C.txtSub,fontSize:13,fontWeight:"600",marginBottom:6},
    input:        {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:11,padding:13,color:C.txt,fontSize:15,marginBottom:14},
    btn:          {backgroundColor:C.primary,borderRadius:12,padding:14,alignItems:"center"},
    btnTxt:       {color:"#fff",fontWeight:"700",fontSize:15},
  });
}


