import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { auth } from '../firebaseConfig';
import { colors } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { currentWeek, userData, setUserData } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData.name || 'Gym User');
  const [age, setAge] = useState(userData.age || '');
  const [weight, setWeight] = useState(userData.weight || '');
  const [height, setHeight] = useState(userData.height || '');
  const [goal, setGoal] = useState(userData.goal || '');

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'ยืนยันการออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: () => {
            signOut(auth)
              .then(() => {
                navigation.replace('Login');
              })
              .catch(() => {
                Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้');
              });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSave = () => {
    setUserData({ name, age, weight, height, goal });
    setIsEditing(false);
  };

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  const getBMIStatus = (bmiValue) => {
    if (!bmiValue) return null;
    if (bmiValue < 18.5) return { label: 'ผอมเกินไป', color: '#60A5FA' };
    if (bmiValue < 23) return { label: 'ปกติ', color: '#34D399' };
    if (bmiValue < 25) return { label: 'น้ำหนักเกินเล็กน้อย', color: '#FBBF24' };
    return { label: 'อ้วน', color: colors.primary };
  };

  const bmiStatus = getBMIStatus(bmi);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={50} color={colors.primary} />
              <TouchableOpacity style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            ) : (
              <Text style={styles.userName}>{name || 'Gym User'}</Text>
            )}

            <Text style={styles.userSub}>สมาชิกสัปดาห์ที่ {currentWeek}</Text>

            {bmi && bmiStatus ? (
              <View style={[styles.bmiBadge, { borderColor: bmiStatus.color }]}>
                <Text style={styles.bmiLabel}>BMI</Text>
                <Text style={[styles.bmiValue, { color: bmiStatus.color }]}>{bmi}</Text>
                <Text style={[styles.bmiStatus, { color: bmiStatus.color }]}>{bmiStatus.label}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ข้อมูลสุขภาพ</Text>
              <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
                <Text style={styles.editBtnText}>{isEditing ? 'บันทึก' : 'แก้ไข'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              {[
                { label: 'อายุ', value: age, setter: setAge, unit: 'ปี', keyboard: 'numeric' },
                { label: 'น้ำหนัก', value: weight, setter: setWeight, unit: 'กก.', keyboard: 'numeric' },
                { label: 'ส่วนสูง', value: height, setter: setHeight, unit: 'ซม.', keyboard: 'numeric' },
              ].map((item, index, arr) => (
                <View key={item.label} style={[styles.infoRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.infoValue}
                      value={item.value}
                      onChangeText={item.setter}
                      keyboardType={item.keyboard}
                      editable={isEditing}
                      placeholder="ยังไม่ได้ระบุ"
                      placeholderTextColor={colors.textGray}
                    />
                    {item.value ? <Text style={styles.unitText}>{item.unit}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เป้าหมาย</Text>
            <View style={styles.goalCard}>
              {['ลดน้ำหนัก', 'เพิ่มกล้ามเนื้อ', 'ออกกำลังกายเพื่อสุขภาพ', 'เพิ่มน้ำหนัก'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalBtn, goal === g && styles.goalBtnActive]}
                  onPress={() => isEditing && setGoal(g)}
                >
                  <Text style={[styles.goalBtnText, goal === g && styles.goalBtnTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>การตั้งค่า</Text>
            <View style={styles.infoCard}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>การแจ้งเตือน</Text>
                  <Text style={styles.switchSub}>รับแจ้งเตือนเมื่อถึงเวลาฝึก</Text>
                </View>
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ false: '#223248', true: colors.primary }}
                />
              </View>
              <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.switchLabel}>เสียงและสั่น</Text>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: '#223248', true: colors.primary }}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bnav}>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color={colors.textGray} />
          <Text style={styles.bnavlabel}>หน้าหลัก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('ExercisePicker')}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={colors.textGray} />
          <Text style={styles.bnavlabel}>ออกกำลัง</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="calendar-outline" size={24} color={colors.textGray} />
          <Text style={styles.bnavlabel}>ตาราง</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnavitem}>
          <Ionicons name="person" size={26} color={colors.primary} />
          <Text style={[styles.bnavlabel, styles.bnavlabelActive]}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071a28' },
  heroGlowTop: { position: 'absolute', top: -110, right: -40, width: 220, height: 220, borderRadius: 220, backgroundColor: 'rgba(230,57,70,0.10)' },
  heroGlowBottom: { position: 'absolute', top: 260, left: -90, width: 220, height: 220, borderRadius: 220, backgroundColor: 'rgba(16,185,129,0.07)' },
  scrollContent: { paddingBottom: 108 },
  headerSection: { alignItems: 'center', marginVertical: 30 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#162638',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#071a28',
  },
  userName: { color: colors.white, fontSize: 28, fontWeight: '800', marginTop: 15, letterSpacing: 0.2 },
  nameInput: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    minWidth: 150,
    textAlign: 'center',
  },
  userSub: { color: colors.textGray, fontSize: 14, marginTop: 6 },
  bmiBadge: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: '#1a293b',
    flexDirection: 'row',
    gap: 10,
  },
  bmiLabel: { color: colors.textGray, fontSize: 13, fontWeight: '700' },
  bmiValue: { fontSize: 20, fontWeight: '800' },
  bmiStatus: { fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.textGray, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  editBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  infoCard: {
    backgroundColor: '#1a293b',
    borderRadius: 26,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#24384c',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 74,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2b3d52',
  },
  infoLabel: { color: colors.textGray, fontSize: 14 },
  inputWithUnit: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  infoValue: { color: colors.white, fontSize: 14, textAlign: 'right', marginLeft: 20 },
  unitText: { color: colors.textGray, fontSize: 13, marginLeft: 5 },
  goalCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalBtn: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1a293b',
    borderWidth: 1,
    borderColor: '#2b3d52',
    justifyContent: 'center',
  },
  goalBtnActive: { backgroundColor: 'rgba(230,57,70,0.14)', borderColor: colors.primary },
  goalBtnText: { color: colors.textLight, fontSize: 13, fontWeight: '600' },
  goalBtnTextActive: { color: colors.primary },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 74,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2b3d52',
  },
  switchLabel: { color: colors.white, fontSize: 15, fontWeight: '600' },
  switchSub: { color: colors.textGray, fontSize: 12, marginTop: 2 },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 57, 70, 0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.25)',
  },
  logoutText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  bnav: {
    flexDirection: 'row',
    height: 82,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.navBg,
    paddingTop: 8,
    paddingBottom: 14,
  },
  bnavitem: { alignItems: 'center', justifyContent: 'center' },
  bnavlabel: { fontSize: 10, color: colors.textGray, fontWeight: '700', marginTop: 4 },
  bnavlabelActive: { color: colors.primary, fontWeight: '800' },
});
