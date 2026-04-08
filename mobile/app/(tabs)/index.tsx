import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, ActivityIndicator, Clipboard,
  ImageBackground, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, Keyboard } from "react-native";

const { width } = Dimensions.get("window");

// Static dark colors for StyleSheet.create (compile-time) — dynamic theme applied at render via useTheme()
const _dark = {
  bg: "#060614", card: "#0d0b1f", border: "#1e1b3a", borderLight: "#2d2a5e",
  primary: "#6366f1", success: "#10b981", danger: "#ef4444", txt: "#f1f5f9",
  txtSub: "#94a3b8", txtMuted: "#475569",
};

const CAT_ICONS: Record<string, string> = {
  Shopping: "cart-outline", Investment: "trending-up-outline", Rent: "home-outline", Entertainment: "film-outline",
  Health: "medkit-outline", Salary: "briefcase-outline", "Food & Drink": "fast-food-outline", Travel: "airplane-outline",
  Utilities: "flash-outline", Transfer: "swap-horizontal-outline", Deposit: "arrow-down-outline", Withdraw: "arrow-up-outline", Other: "cube-outline",
};

export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const { C } = useTheme();
  const router = useRouter();
  const [txns, setTxns] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"Accounts" | "Cards" | "Savings">("Accounts");

  // Modals state
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendDone, setSendDone] = useState(false);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [payOpen, setPayOpen] = useState(false);
  const [payRef, setPayRef] = useState("");
  const [payAmt, setPayAmt] = useState("");
  const [payType, setPayType] = useState("Electricity");
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);

  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const loadTxns = async () => {
    if (user) {
      try {
        const res = await fetchApi("/transactions?limit=15");
        const data = Array.isArray(res) ? res : (res.transactions || []);
        setTxns(data);
      } catch (e) { console.error("Dashboard loadTxns:", e); }
    }
  };


  useEffect(() => { loadTxns(); }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await loadTxns();
    setRefreshing(false);
  };

  const handleSend = async () => {
    if (!sendTo.trim() || !sendAmt || parseFloat(sendAmt) <= 0) return;
    setSendLoading(true);
    try {
      await fetchApi("/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(sendAmt), recipientPhone: sendTo.trim(), note: "Mobile" })
      });
      await refreshUser();
      await loadTxns();
      setSendDone(true);
      setTimeout(() => { setSendOpen(false); setSendDone(false); setSendTo(""); setSendAmt(""); }, 2000);
    } catch (e) {
      console.error(e);
      // @ts-ignore
      alert(e.message || "Transfer failed.");
    }
    setSendLoading(false);
  };

  const handlePay = async () => {
    if (!payRef.trim() || !payAmt || parseFloat(payAmt) <= 0) return;
    setPayLoading(true);
    try {
      await fetchApi("/transactions/bill-pay", {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(payAmt), billType: payType, reference: payRef.trim(), provider: payType })
      });
      await refreshUser();
      await loadTxns();
      setPayDone(true);
      setTimeout(() => { setPayOpen(false); setPayDone(false); setPayRef(""); setPayAmt(""); }, 2000);
    } catch (e) { console.error(e); }
    setPayLoading(false);
  };

  const handleCopy = () => {
    Clipboard.setString(user?.phone || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const income = txns.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount as number), 0);
  const expense = txns.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount as number), 0);
  const topCat = txns.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount as number);
    return acc;
  }, {});
  const topCatSorted = Object.entries(topCat).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const renderIcon = (name: string, size: number = 24, color: string = "#fff") => (
    <Ionicons name={name as any} size={size} color={color} />
  );

  return (
    <View style={{flex:1, backgroundColor:C.bg}}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {greeting} <Ionicons name="sunny-outline" size={14} color={C.txtSub} /></Text>
          <Text style={styles.name}>{user?.name?.split(" ")[0] || "User"}</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(tabs)/settings")}>
          <Text style={styles.avatarTxt}>{user?.name?.[0]?.toUpperCase() || "K"}</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Control (The "tabs" under welcome message) */}
      <View style={styles.segmentContainer}>
        {(["Accounts", "Cards", "Savings"] as const).map((seg) => (
          <TouchableOpacity
            key={seg}
            style={[styles.segmentBtn, activeSegment === seg && styles.segmentBtnActive]}
            onPress={() => {
              setActiveSegment(seg);
              if (seg === "Cards") router.push("/(tabs)/cards");
            }}
          >
            <Text style={[styles.segmentTxt, activeSegment === seg && styles.segmentTxtActive]}>{seg}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Balance Card with Background */}
      <ImageBackground
        source={require("../../assets/images/kudi_hero_bg.png")}
        style={styles.balanceCard}
        imageStyle={{ borderRadius: 24, opacity: 0.15 }}
      >
        <View style={styles.balanceOverlay}>
          <Text style={styles.balLabel}>{activeSegment} Balance</Text>
          <Text style={styles.balAmount}>
            ₵{(user?.balance || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.balAcct}>Account #{user?.id?.slice(-8).toUpperCase() || "00000000"}</Text>

          <View style={styles.quickActions}>
            {[
              ["send-outline", "Send", () => setSendOpen(true)],
              ["download-outline", "Receive", () => setReceiveOpen(true)],
              ["card-outline", "Pay", () => setPayOpen(true)],
              ["bar-chart-outline", "Summary", () => setAnalyticsOpen(true)],
            ].map(([icon, label, action]: any) => (
              <TouchableOpacity key={label} style={styles.qaBtn} onPress={action} activeOpacity={0.75}>
                {renderIcon(icon, 20)}
                <Text style={styles.qaLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>

      {/* AI Security Alert */}
      <View style={styles.aiAlert}>
        <Ionicons name="shield-checkmark-outline" size={24} color={C.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.aiAlertTitle}>AI Security Shield Active</Text>
          <Text style={styles.aiAlertMsg}>
            Transactions are monitored in real-time. Your account is 100% encrypted.
          </Text>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
            <Text style={styles.seeAll}>See more →</Text>
          </TouchableOpacity>
        </View>

        {txns.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cash-outline" size={40} color={C.txtMuted} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTxt}>No recent activity found.</Text>
            <Text style={styles.emptyMuted}>Start by adding funds or making a transfer.</Text>
          </View>
        ) : (
          txns.slice(0, 6).map((tx) => (
            <View key={tx._id} style={styles.txRow}>
              <View style={styles.txIcon}>
                {renderIcon(CAT_ICONS[tx.category] || "cube-outline", 18, C.txtSub)}
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                <Text style={styles.txMeta}>{tx.category} · {new Date(tx.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.txAmt, { color: tx.type === "income" ? C.success : C.txt }]}>
                  {tx.type === "income" ? "+" : "-"}₵{Math.abs(tx.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.txStatus}>Success</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ── Transfer Modal ── */}
      <Modal visible={sendOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {sendDone ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Ionicons name="checkmark-circle-outline" size={60} color={C.success} style={{ marginBottom: 14 }} />
                  <Text style={styles.modalTitle}>Transfer Success!</Text>
                  <Text style={styles.modalSub}>₵{sendAmt} sent successfully.</Text>
                </View>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Send Funds</Text>
                    <TouchableOpacity onPress={() => setSendOpen(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
                  </View>
                  <Text style={styles.modalLabel}>Recipient Phone Number</Text>
                  <TextInput style={styles.modalInput} placeholder="024 XXX XXXX" placeholderTextColor={C.txtMuted} value={sendTo} onChangeText={setSendTo} keyboardType="phone-pad" />
                  <Text style={styles.modalLabel}>Amount (GHS)</Text>
                  <TextInput style={styles.modalInput} placeholder="0.00" placeholderTextColor={C.txtMuted} value={sendAmt} onChangeText={setSendAmt} keyboardType="decimal-pad" />
                  <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={sendLoading}>
                    {sendLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnTxt}>Confirm Transfer →</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Receive Modal ── */}
      <Modal visible={receiveOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deposit Details</Text>
              <TouchableOpacity onPress={() => setReceiveOpen(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Share your Kudi Phone Number to receive money instantly.</Text>
            <View style={styles.idBox}>
              <Text style={styles.idLabel}>Kudi Account (Phone)</Text>
              <Text style={styles.idVal}>{user?.phone || "N/A"}</Text>
            </View>
            <TouchableOpacity style={[styles.btn, copied && { backgroundColor: C.success }]} onPress={handleCopy}>
              <Text style={styles.btnTxt}>{copied ? "✓ Copied to Clipboard" : "Copy Phone"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Pay Bills Modal ── */}
      <Modal visible={payOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {payDone ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Ionicons name="checkmark-done-circle-outline" size={60} color={C.success} style={{ marginBottom: 14 }} />
                  <Text style={styles.modalTitle}>Payment Sent!</Text>
                  <Text style={styles.modalSub}>₵{payAmt} for {payType} processed.</Text>
                </View>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Bill Payment</Text>
                    <TouchableOpacity onPress={() => setPayOpen(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
                  </View>
                  <View style={styles.billGrid}>
                    {["Electricity", "Water", "Internet", "TV"].map(t => (
                      <TouchableOpacity key={t} style={[styles.billChip, payType === t && styles.billChipActive]} onPress={() => setPayType(t)}>
                        <Text style={[styles.billChipTxt, payType === t && { color: "#fff" }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Reference Number</Text>
                  <TextInput style={styles.modalInput} placeholder="123456789" placeholderTextColor={C.txtMuted} value={payRef} onChangeText={setPayRef} keyboardType="numeric" />
                  <Text style={styles.modalLabel}>Amount (GHS)</Text>
                  <TextInput style={styles.modalInput} placeholder="0.00" placeholderTextColor={C.txtMuted} value={payAmt} onChangeText={setPayAmt} keyboardType="decimal-pad" />
                  <TouchableOpacity style={styles.btn} onPress={handlePay} disabled={payLoading}>
                    {payLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnTxt}>Pay Bill →</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Analytics Modal ── */}
      <Modal visible={analyticsOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Monthly Insights</Text>
              <TouchableOpacity onPress={() => setAnalyticsOpen(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>INCOME</Text>
                <Text style={[styles.statVal, { color: C.success }]}>₵{income.toFixed(2)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>EXPENSE</Text>
                <Text style={[styles.statVal, { color: C.danger }]}>₵{expense.toFixed(2)}</Text>
              </View>
            </View>
            <Text style={styles.modalLabel}>Spending by Category</Text>
            {topCatSorted.map(([c, a]) => (
              <View key={c} style={styles.catRow}>
                <Text style={styles.catTxt}>{renderIcon(CAT_ICONS[c] || "cube-outline", 16, C.txtSub)} {c}</Text>
                <Text style={styles.catAmt}>₵{(a as number).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: "transparent" },
  content:        { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting:       { color: _dark.txtSub, fontSize: 13, fontWeight: "500" },
  name:           { color: _dark.txt, fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  avatar:         { width: 44, height: 44, borderRadius: 15, backgroundColor: _dark.primary, alignItems: "center", justifyContent: "center" },
  avatarTxt:      { color: "#fff", fontWeight: "800", fontSize: 18 },
  segmentContainer:{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 4, marginBottom: 20 },
  segmentBtn:     { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  segmentBtnActive:{ backgroundColor: _dark.card, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4 },
  segmentTxt:     { color: _dark.txtMuted, fontSize: 13, fontWeight: "600" },
  segmentTxtActive:{ color: _dark.txt },
  balanceCard:    { borderRadius: 24, overflow: "hidden", backgroundColor: "#1e1b4b", marginBottom: 20 },
  balanceOverlay: { padding: 24, backgroundColor: "rgba(0,0,0,0.1)" },
  balLabel:       { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  balAmount:      { color: "#fff", fontSize: 38, fontWeight: "800", letterSpacing: -1.5, marginBottom: 4 },
  balAcct:        { color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 24 },
  quickActions:   { flexDirection: "row", gap: 10 },
  qaBtn:          { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 12, alignItems: "center" },
  qaIcon:         { fontSize: 22, marginBottom: 6 },
  qaLabel:        { color: "#fff", fontSize: 11, fontWeight: "700" },
  aiAlert:        { flexDirection: "row", gap: 12, backgroundColor: `${_dark.primary}10`, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: `${_dark.primary}30`, marginBottom: 24 },
  aiAlertIcon:    { fontSize: 24 },
  aiAlertTitle:   { color: _dark.primary, fontSize: 13, fontWeight: "700", marginBottom: 2 },
  aiAlertMsg:     { color: _dark.txtSub, fontSize: 12, lineHeight: 18 },
  section:        { backgroundColor: _dark.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: _dark.border },
  sectionHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  sectionTitle:   { color: _dark.txt, fontSize: 17, fontWeight: "700" },
  seeAll:         { color: _dark.primary, fontSize: 13, fontWeight: "600" },
  txRow:          { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: _dark.border },
  txIcon:         { width: 40, height: 40, backgroundColor: _dark.border, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txDesc:         { color: _dark.txt, fontSize: 14, fontWeight: "600" },
  txMeta:         { color: _dark.txtMuted, fontSize: 11, marginTop: 2 },
  txAmt:          { fontSize: 15, fontWeight: "700" },
  txStatus:       { color: _dark.success, fontSize: 10, marginTop: 2, fontWeight: "600" },
  emptyBox:       { alignItems: "center", paddingVertical: 40 },
  emptyTxt:       { color: _dark.txtSub, fontWeight: "600", fontSize: 14 },
  emptyMuted:     { color: _dark.txtMuted, fontSize: 12, marginTop: 4 },
  modalOverlay:   { flex: 1, backgroundColor: "#000000B0", justifyContent: "flex-end" },
  modalCard:      { backgroundColor: _dark.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle:     { color: _dark.txt, fontSize: 22, fontWeight: "800" },
  modalSub:       { color: _dark.txtSub, fontSize: 14, marginBottom: 24 },
  modalLabel:     { color: _dark.txtSub, fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  modalInput:     { backgroundColor: _dark.bg, borderWidth: 1, borderColor: _dark.borderLight, borderRadius: 14, padding: 14, color: _dark.txt, fontSize: 16 },
  btn:            { backgroundColor: _dark.primary, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 24 },
  btnTxt:         { color: "#fff", fontWeight: "800", fontSize: 16 },
  idBox:          { backgroundColor: _dark.bg, borderRadius: 14, padding: 16, marginBottom: 20 },
  idLabel:        { color: _dark.txtMuted, fontSize: 11, fontWeight: "700", marginBottom: 4 },
  idVal:          { color: _dark.txt, fontSize: 16, fontWeight: "600" },
  billGrid:       { flexDirection: "row", gap: 10, marginBottom: 10 },
  billChip:       { flex: 1, backgroundColor: _dark.bg, padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: _dark.borderLight },
  billChipActive: { backgroundColor: _dark.primary, borderColor: _dark.primary },
  billChipTxt:    { color: _dark.txtSub, fontSize: 12, fontWeight: "700" },
  statsRow:       { flexDirection: "row", gap: 12, marginBottom: 24 },
  statBox:        { flex: 1, backgroundColor: _dark.bg, padding: 16, borderRadius: 16, alignItems: "center" },
  statLabel:      { color: _dark.txtMuted, fontSize: 11, fontWeight: "700", marginBottom: 4 },
  statVal:        { fontSize: 20, fontWeight: "800" },
  catRow:         { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: _dark.bg },
  catTxt:         { color: _dark.txt, fontSize: 14 },
  catAmt:         { color: _dark.primary, fontWeight: "700", fontSize: 14 },
});


