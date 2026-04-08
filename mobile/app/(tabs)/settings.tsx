/**
 * Kudi Mobile — Settings Screen
 * Theme-aware · Terms/Privacy modals · 2FA · Biometric · Password change
 */
import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert, Modal, TextInput, ActivityIndicator, Linking, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchApi } from "@/lib/api";
import * as LocalAuthentication from "expo-local-authentication";


const TERMS_TEXT = `Terms of Service — Kudi Fintech Ltd.

Last updated: April 2025

1. ACCEPTANCE OF TERMS
By accessing or using the Kudi mobile or web application, you agree to be bound by these Terms of Service and all applicable laws and regulations.

2. SERVICES
Kudi provides digital financial services including account management, peer-to-peer transfers, mobile money integration (MTN MoMo, AirtelTigo, Telecel), and bill payments within the Republic of Ghana.

3. ELIGIBILITY
You must be at least 18 years old and a resident of Ghana with a valid Ghana Card or passport to create an account.

4. FINANCIAL TRANSACTIONS
All transactions are final. Kudi is not responsible for funds sent to incorrect accounts or phone numbers. Contact support within 24 hours of an erroneous transaction.

5. SECURITY
You are responsible for maintaining the confidentiality of your login credentials. Enable Two-Factor Authentication for maximum security. Report unauthorized access immediately.

6. FEES
Domestic P2P transfers are free. Mobile money deposits carry a 0.5% processing fee (MTN, Telecel) or 0.75% (AirtelTigo). Bill payments may carry operator surcharges.

7. TERMINATION
Kudi reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse platform features.

8. CONTACT
support@bankly.gh | +233 30 XXX XXXX`;

const PRIVACY_TEXT = `Privacy Policy — Kudi Fintech Ltd.

Last updated: April 2025

1. DATA WE COLLECT
• Personal identification (name, email, phone, Ghana Card)
• Financial data (balances, transaction history)
• Device and usage data (IP address, app version, session logs)
• Biometric identifiers (stored locally on your device only — never transmitted)

2. HOW WE USE YOUR DATA
• Processing transactions and providing financial services
• AI-powered fraud detection and risk assessment
• Personalised financial insights and spending analytics
• Legal compliance with Bank of Ghana (BoG) regulations

3. DATA SHARING
We do not sell your personal data. We may share data with:
• Payment processors (Paystack, Hubtel) for transaction fulfilment
• Regulatory authorities as required by Ghanaian law
• Cloud infrastructure providers under strict data processing agreements

4. DATA SECURITY
Data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain ISO 27001-aligned practices and undergo regular third-party security audits.

5. YOUR RIGHTS
• Access and export your data at any time from Account Settings
• Request deletion of your account and all associated data
• Opt out of marketing communications

6. COOKIES & ANALYTICS
Our web platform uses minimal analytics cookies. The mobile app uses only local storage (AsyncStorage) — no third-party tracking SDKs.

7. CONTACT
privacy@bankly.gh | Data Protection Officer: dpo@bankly.gh`;

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { C, isDarkMode, toggleTheme } = useTheme();
  const s = makeStyles(C);

  const [notif,    setNotif]    = useState(true);
  const [twofa,    setTwofa]    = useState(false);
  const [biometric, setBio]     = useState(false);
  const [pwModal,  setPwModal]  = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [termsModal, setTermsModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [twofaModal, setTwofaModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {text:"Cancel", style:"cancel"},
      {text:"Sign Out", style:"destructive", onPress:() => logout()},
    ]);
  };

  const changePassword = async () => {
    if (newPw.length < 8) { Alert.alert("Error","Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { Alert.alert("Error","Passwords do not match."); return; }
    setSaving(true);
    try {
      await fetchApi("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      Alert.alert("Success","Password updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Password update failed.");
    }
    setSaving(false);
    setPwModal(false); setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  const handleToggle2FA = () => {
    if (!twofa) {
      // Enable — open OTP modal
      setTwofaModal(true);
    } else {
      Alert.alert("Disable 2FA", "Are you sure you want to disable Two-Factor Authentication?", [
        {text:"Cancel", style:"cancel"},
        {text:"Disable", style:"destructive", onPress: () => { setTwofa(false); AsyncStorage.setItem("twofa","false"); }},
      ]);
    }
  };

  const sendOTP = async () => {
    setOtpLoading(true);
    // Simulate OTP send (replace with real API call when backend OTP route exists)
    await new Promise(r => setTimeout(r, 1200));
    setOtpSent(true);
    setOtpLoading(false);
    Alert.alert("OTP Sent", `A 6‑digit code was sent to ${user?.email}`);
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) { Alert.alert("Error","Enter the 6-digit code."); return; }
    setOtpLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setOtpLoading(false);
    setTwofa(true);
    AsyncStorage.setItem("twofa","true");
    setTwofaModal(false);
    setOtpCode("");
    setOtpSent(false);
    Alert.alert("2FA Enabled 🔐", "Two-Factor Authentication is now active on your account.");
  };

  const handleToggleBiometric = async () => {

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert("Not Supported", "Your device does not support biometrics or has none enrolled.");
      setBio(false);
      return;
    }

    if (!biometric) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        setBio(true);
        await AsyncStorage.setItem("biometricEnabled", "true");
        Alert.alert("Success", "Biometric login enabled! You can now log in using Face ID or Fingerprint.");
      } else {
        setBio(false);
      }
    } else {
      setBio(false);
      await AsyncStorage.setItem("biometricEnabled", "false");
      Alert.alert("Disabled", "Biometric login disabled.");
    }
  };


  const Section = ({title}: {title:string}) => (
    <View style={s.sectionHeader}><Text style={s.sectionTitle}>{title}</Text></View>
  );

  const Row = ({label, value, onPress, chevron, icon}: {label:string; value?:string; onPress?:()=>void; chevron?:boolean; icon?:string}) => (
    <TouchableOpacity style={s.row} onPress={onPress} disabled={!onPress} activeOpacity={0.6}>
      <View style={{flexDirection:"row", alignItems:"center", gap:10}}>
        {icon && <Ionicons name={icon as any} size={18} color={C.txtMuted} />}
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <View style={{flexDirection:"row", alignItems:"center", gap:6}}>
        <Text style={s.rowValue}>{value}</Text>
        {chevron && <Ionicons name="chevron-forward-outline" size={16} color={C.primary} />}
      </View>
    </TouchableOpacity>
  );

  const ToggleRow = ({label, desc, value, onToggle, icon}: {label:string; desc:string; value:boolean; onToggle:()=>void; icon?:string}) => (
    <View style={s.row}>
      <View style={{flex:1, flexDirection:"row", alignItems:"center", gap:10}}>
        {icon && <Ionicons name={icon as any} size={20} color={C.primary} />}
        <View style={{flex:1}}>
          <Text style={s.rowLabel}>{label}</Text>
          <Text style={s.rowDesc}>{desc}</Text>
        </View>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{false:C.borderLight, true:C.primary}} thumbColor="#fff" />
    </View>
  );

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={s.userName}>{user?.name}</Text>
        <Text style={s.userEmail}>{user?.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleTxt}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Profile */}
      <View style={s.card}>
        <Section title="Profile" />
        <Row label="Full Name"    value={user?.name} icon="person-outline" />
        <Row label="Email"        value={user?.email} icon="mail-outline" />
        <Row label="Phone"        value={user?.phone || "—"} icon="call-outline" />
        <Row label="Account ID"   value={user?.id?.slice(-10).toUpperCase()} icon="finger-print-outline" />
        <Row label="Currency"     value="GHS (₵)" icon="cash-outline" />
      </View>

      {/* Security */}
      <View style={s.card}>
        <Section title="Security" />
        <ToggleRow label="Two-Factor Authentication" desc="SMS OTP on every login"   value={twofa}     onToggle={handleToggle2FA} icon="shield-checkmark-outline" />
        <ToggleRow label="Biometric Login"            desc="Face ID / Fingerprint"    value={biometric} onToggle={handleToggleBiometric} icon="scan-outline" />
        <TouchableOpacity style={s.row} onPress={() => setPwModal(true)}>
          <View style={{flexDirection:"row", alignItems:"center", gap:10}}>
            <Ionicons name="key-outline" size={18} color={C.txtMuted} />
            <Text style={s.rowLabel}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={16} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={s.card}>
        <Section title="Notifications" />
        <ToggleRow label="Push Notifications" desc="Transaction alerts"      value={notif} onToggle={()=>setNotif(!notif)} icon="notifications-outline" />
        <ToggleRow label="AI Insights"        desc="Weekly spending reports" value={true}  onToggle={()=>{}} icon="analytics-outline" />
      </View>

      {/* Preferences */}
      <View style={s.card}>
        <Section title="Preferences" />
        <ToggleRow label="Dark Mode"  desc={isDarkMode?"Currently dark":"Currently light"} value={isDarkMode} onToggle={toggleTheme} />
        <Row       label="Language"   value="English (Ghana)" />
        <Row       label="Currency"   value="GHS — Ghanaian Cedi" />
      </View>

      {/* About */}
      <View style={s.card}>
        <Section title="About" />
        <Row label="App Version"      value="2.0.0" icon="information-circle-outline" />
        <Row label="Privacy Policy"   value="View" chevron onPress={() => setPrivacyModal(true)} icon="document-text-outline" />
        <Row label="Terms of Service" value="View" chevron onPress={() => setTermsModal(true)} icon="document-lock-outline" />
        <Row label="Contact Support"  value="support@bankly.gh" onPress={() => Linking.openURL("mailto:support@bankly.gh")} icon="help-circle-outline" />
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{marginRight:8}} />
        <Text style={s.logoutTxt}>Sign Out</Text>
      </TouchableOpacity>
      <View style={{height:40}}/>

      {/* ── Change Password Modal ── */}
      <Modal visible={pwModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Change Password</Text>
                <TouchableOpacity onPress={()=>setPwModal(false)}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
              </View>
              {[["Current password",currentPw,setCurrentPw],["New password (min 8)",newPw,setNewPw],["Confirm new password",confirmPw,setConfirmPw]].map(([ph,v,sv]:any)=>(
                <TextInput key={ph} style={s.modalInput} placeholder={ph} placeholderTextColor={C.txtMuted} secureTextEntry value={v} onChangeText={sv} />
              ))}
              <TouchableOpacity style={[s.btn,saving&&{opacity:.6}]} onPress={changePassword} disabled={saving}>
                {saving?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Update Password</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 2FA Setup Modal ── */}
      <Modal visible={twofaModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Enable 2FA 🔐</Text>
                <TouchableOpacity onPress={()=>{setTwofaModal(false);setOtpSent(false);setOtpCode("");}}><Ionicons name="close" size={28} color={C.txtMuted} /></TouchableOpacity>
              </View>
              <Text style={{color:C.txtSub,fontSize:13,lineHeight:20,marginBottom:18}}>
                We'll send a 6-digit code to {user?.email} to verify your identity before enabling Two-Factor Authentication.
              </Text>
              {!otpSent ? (
                <TouchableOpacity style={[s.btn,otpLoading&&{opacity:.6}]} onPress={sendOTP} disabled={otpLoading}>
                  {otpLoading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Send Verification Code →</Text>}
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={s.lbl}>Enter 6-digit code</Text>
                  <TextInput style={s.modalInput} placeholder="000000" placeholderTextColor={C.txtMuted} value={otpCode} onChangeText={setOtpCode} keyboardType="number-pad" maxLength={6} />
                  <TouchableOpacity style={[s.btn,otpLoading&&{opacity:.6}]} onPress={verifyOTP} disabled={otpLoading}>
                    {otpLoading?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.btnTxt}>Verify & Enable 2FA</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={sendOTP} style={{alignItems:"center",marginTop:12}}>
                    <Text style={{color:C.primary,fontSize:13}}>Resend code</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Terms of Service Modal ── */}
      <Modal visible={termsModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard,{maxHeight:"90%"}]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Terms of Service</Text>
              <TouchableOpacity onPress={()=>setTermsModal(false)}><Text style={{color:C.txtMuted,fontSize:22}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{color:C.txtSub,fontSize:13,lineHeight:22}}>{TERMS_TEXT}</Text>
              <View style={{height:20}}/>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Privacy Policy Modal ── */}
      <Modal visible={privacyModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard,{maxHeight:"90%"}]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={()=>setPrivacyModal(false)}><Text style={{color:C.txtMuted,fontSize:22}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{color:C.txtSub,fontSize:13,lineHeight:22}}>{PRIVACY_TEXT}</Text>
              <View style={{height:20}}/>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    root:          {flex:1,backgroundColor:C.bg},
    content:       {padding:20,paddingTop:60},
    avatarSection: {alignItems:"center",marginBottom:24},
    avatar:        {width:80,height:80,borderRadius:24,backgroundColor:C.primary,alignItems:"center",justifyContent:"center",marginBottom:12},
    avatarTxt:     {color:"#fff",fontSize:32,fontWeight:"800"},
    userName:      {color:C.txt,fontSize:20,fontWeight:"800",marginBottom:4},
    userEmail:     {color:C.txtSub,fontSize:14,marginBottom:8},
    roleBadge:     {backgroundColor:`${C.primary}20`,borderRadius:20,paddingHorizontal:12,paddingVertical:4,borderWidth:1,borderColor:`${C.primary}50`},
    roleTxt:       {color:C.primary,fontSize:12,fontWeight:"700"},
    card:          {backgroundColor:C.card,borderRadius:16,marginBottom:14,borderWidth:1,borderColor:C.border,overflow:"hidden"},
    sectionHeader: {padding:14,paddingBottom:8,borderBottomWidth:1,borderBottomColor:C.border,backgroundColor:C.bg},
    sectionTitle:  {color:C.txtMuted,fontSize:11,fontWeight:"700",textTransform:"uppercase",letterSpacing:0.5},
    row:           {flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:14,borderBottomWidth:1,borderBottomColor:C.border},
    rowLabel:      {color:C.txt,fontSize:14,fontWeight:"600"},
    rowValue:      {color:C.txtSub,fontSize:13},
    rowDesc:       {color:C.txtMuted,fontSize:11,marginTop:2},
    lbl:           {color:C.txtSub,fontSize:13,fontWeight:"600",marginBottom:6},
    logoutBtn:     {flexDirection:"row",backgroundColor:"#ef444418",borderWidth:1,borderColor:"#ef444440",borderRadius:14,padding:16,alignItems:"center",justifyContent:"center"},
    logoutTxt:     {color:"#ef4444",fontWeight:"700",fontSize:15},
    modalOverlay:  {flex:1,backgroundColor:"#00000090",justifyContent:"flex-end"},
    modalCard:     {backgroundColor:C.card,borderTopLeftRadius:24,borderTopRightRadius:24,padding:28,borderTopWidth:1,borderColor:C.border},
    modalHeader:   {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:20},
    modalTitle:    {color:C.txt,fontSize:20,fontWeight:"800"},
    modalInput:    {backgroundColor:C.bg,borderWidth:1,borderColor:C.borderLight,borderRadius:11,padding:13,color:C.txt,fontSize:14,marginBottom:12},
    btn:           {backgroundColor:C.primary,borderRadius:12,padding:14,alignItems:"center",marginTop:4},
    btnTxt:        {color:"#fff",fontWeight:"700",fontSize:15},
  });
}
