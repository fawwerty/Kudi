import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ImageBackground, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const _dark = {
  bg: "#060614", card: "#0d0b1f", border: "#1e1b3a", borderLight: "#2d2a5e",
  primary: "#6366f1", success: "#10b981", danger: "#ef4444", warning: "#f59e0b",
  txt: "#f1f5f9", txtSub: "#94a3b8", txtMuted: "#475569",
};

export default function CardsScreen() {
  const { user } = useAuth();
  const { C } = useTheme();
  const [isFrozen, setIsFrozen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFreeze = () => {
    setIsFrozen(!isFrozen);
    Alert.alert(isFrozen ? "Card Unfrozen" : "Card Frozen", isFrozen ? "Your card is now active." : "Your card has been temporary disabled.");
  };

  const handleAddCard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowAddModal(false);
      Alert.alert("Success", "Your new Kudi Virtual Platinum card has been issued.");
    }, 1500);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Virtual Cards</Text>
      <Text style={styles.pageSub}>Secure online payments with Kudi Virtual Cards</Text>

      {/* Card Display */}
      <View style={styles.cardContainer}>
        <ImageBackground
          source={require("../../assets/images/kudi_hero_bg.png")}
          style={[styles.debitCard, isFrozen && { opacity: 0.6 }]}
          imageStyle={{ borderRadius: 20, opacity: 0.4 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardBrand}>KUDI PLATINUM</Text>
            <View style={styles.chip} />
          </View>
          
          <Text style={styles.cardNumber}>****  ****  ****  4092</Text>
          
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardVal}>{user?.name?.toUpperCase() || "NAT"}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardVal}>12/28</Text>
            </View>
          </View>
          {isFrozen && <View style={styles.frozenBadge}><Text style={styles.frozenTxt}>FROZEN</Text></View>}
        </ImageBackground>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleFreeze}>
          <Ionicons name={isFrozen ? "lock-open-outline" : "snow-outline"} size={24} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.actionLabel}>{isFrozen ? "Unfreeze" : "Freeze"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Card Details", "CVV: 492\nBilling Address: ACCRA, GH")}>
          <Ionicons name="eye-outline" size={24} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.actionLabel}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Limits", "Daily Limit: ₵5,000\nMonthly Limit: ₵50,000")}>
          <Ionicons name="settings-outline" size={24} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.actionLabel}>Limits</Text>
        </TouchableOpacity>
      </View>

      {/* Linked Accounts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked Accounts</Text>
        <View style={styles.linkedRow}>
          <View style={styles.linkedIcon}>
            <Ionicons name="business-outline" size={20} color={_dark.txtSub} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkedName}>Kudi Primary Checking</Text>
            <Text style={styles.linkedMeta}>Acct: ***69d1 · Default</Text>
          </View>
          <Text style={styles.linkedAmt}>₵{(user?.balance || 0).toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.addLinkBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addLinkTxt}>+ Link Bank Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addLinkBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addLinkTxt}>+ Link Mobile Money</Text>
        </TouchableOpacity>
      </View>

      {/* Security Info */}
      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={24} color={_dark.primary} />
        <View style={{ flex:1 }}>
          <Text style={styles.infoTitle}>Secure Spending</Text>
          <Text style={styles.infoMsg}>Your Kudi cards are protected by 3D Secure and AI-driven fraud detection.</Text>
        </View>
      </View>

      {/* Add Card Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request New Card</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Get a virtual Visa or Mastercard for safe online shopping.</Text>
              
              <View style={styles.cardTypeRow}>
                <TouchableOpacity style={styles.cardTypeActive}><Text style={styles.cardTypeTxt}>Virtual Platinum</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cardType}><Text style={styles.cardTypeTxtInactive}>Business Gold</Text></TouchableOpacity>
              </View>

              <Text style={styles.lbl}>Initial Load Amount (GHS)</Text>
              <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={C.txtMuted} keyboardType="decimal-pad" />
              
              <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleAddCard} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnTxt}>Create Virtual Card →</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: _dark.bg },
  content:        { padding: 20, paddingTop: 60 },
  pageTitle:      { color: _dark.txt, fontSize: 24, fontWeight: "800", marginBottom: 4 },
  pageSub:        { color: _dark.txtSub, fontSize: 13, marginBottom: 24 },
  cardContainer:  { marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  debitCard:      { height: 200, backgroundColor: "#1e1b4b", borderRadius: 20, padding: 24, justifyContent: "space-between", overflow: "hidden" },
  cardHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBrand:      { color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  chip:           { width: 45, height: 32, backgroundColor: "#fde047", borderRadius: 6, opacity: 0.8 },
  cardNumber:     { color: "#fff", fontSize: 20, fontWeight: "700", letterSpacing: 2, textAlign: "center" },
  cardFooter:     { flexDirection: "row", justifyContent: "space-between" },
  cardLabel:      { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "600", marginBottom: 2 },
  cardVal:        { color: "#fff", fontSize: 14, fontWeight: "700" },
  frozenBadge:    { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.7)", alignItems: "center", justifyContent: "center" },
  frozenTxt:      { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 4 },
  actionsRow:     { flexDirection: "row", gap: 12, marginBottom: 32 },
  actionBtn:      { flex: 1, backgroundColor: _dark.card, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: _dark.border },
  actionIcon:     { fontSize: 24, marginBottom: 8 },
  actionLabel:    { color: _dark.txt, fontSize: 13, fontWeight: "600" },
  section:        { backgroundColor: _dark.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: _dark.border, marginBottom: 20 },
  sectionTitle:   { color: _dark.txt, fontSize: 16, fontWeight: "700", marginBottom: 16 },
  linkedRow:      { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  linkedIcon:     { width: 40, height: 40, backgroundColor: _dark.border, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  linkedName:     { color: _dark.txt, fontSize: 14, fontWeight: "600" },
  linkedMeta:     { color: _dark.txtMuted, fontSize: 12 },
  linkedAmt:      { color: _dark.txt, fontSize: 15, fontWeight: "700" },
  addLinkBtn:     { paddingVertical: 14, borderTopWidth: 1, borderTopColor: _dark.border },
  addLinkTxt:     { color: _dark.primary, fontSize: 14, fontWeight: "600" },
  infoBox:        { flexDirection: "row", gap: 12, backgroundColor: `${_dark.primary}10`, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: `${_dark.primary}30`, marginBottom: 40 },
  infoIcon:       { fontSize: 24 },
  infoTitle:      { color: _dark.primary, fontWeight: "700", fontSize: 14, marginBottom: 2 },
  infoMsg:        { color: _dark.txtSub, fontSize: 12, lineHeight: 18 },
  modalOverlay:   { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  modalCard:      { backgroundColor: _dark.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: _dark.border },
  modalHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  modalTitle:     { color: _dark.txt, fontSize: 20, fontWeight: "800" },
  modalSub:       { color: _dark.txtSub, fontSize: 14, marginBottom: 20 },
  cardTypeRow:    { flexDirection: "row", gap: 10, marginBottom: 20 },
  cardTypeActive: { flex: 1, backgroundColor: _dark.primary, padding: 12, borderRadius: 12, alignItems: "center" },
  cardType:       { flex: 1, backgroundColor: _dark.bg, padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: _dark.borderLight },
  cardTypeTxt:    { color: "#fff", fontWeight: "700", fontSize: 13 },
  cardTypeTxtInactive: { color: _dark.txtMuted, fontWeight: "600", fontSize: 13 },
  lbl:            { color: _dark.txtSub, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input:          { backgroundColor: _dark.bg, borderWidth: 1, borderColor: _dark.borderLight, borderRadius: 11, padding: 13, color: _dark.txt, fontSize: 15, marginBottom: 14 },
  btn:            { backgroundColor: _dark.primary, borderRadius: 12, padding: 14, alignItems: "center" },
  btnTxt:         { color: "#fff", fontWeight: "700", fontSize: 15 },
});

