import { Ionicons } from '@expo/vector-icons'; // เพิ่มไอคอน
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State สำหรับเปิด-ปิดตา (แยกกัน 2 ช่อง)
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);

  const handleRegister = () => {
    if (email === '' || password === '') {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบครับ");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ตรงกันครับ");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("สำเร็จ", "สร้างบัญชีเรียบร้อย!", [{ text: "OK", onPress: () => navigation.goBack() }]);
      })
      .catch((error) => {
        Alert.alert("สมัครไม่สำเร็จ", "รหัสผ่านต้องมี 6 ตัวขึ้นไป หรืออีเมลนี้ถูกใช้ไปแล้ว");
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>สร้างบัญชีใหม่</Text>
        
        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกอีเมลของคุณ"
          placeholderTextColor="#5a7090"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>รหัสผ่าน (6 ตัวขึ้นไป)</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor="#5a7090"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText} // ใช้ state ตัวแรก
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
            <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color="#5a7090" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor="#5a7090"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmText} // ใช้ state ตัวที่สอง
          />
          <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)} style={styles.eyeIcon}>
            <Ionicons name={secureConfirmText ? "eye-off-outline" : "eye-outline"} size={20} color="#5a7090" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnRegister} onPress={handleRegister}>
          <Text style={styles.btnRegisterText}>ยืนยันการสร้างบัญชี</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 25 }}>
          <Text style={{ color: '#5a7090', fontSize: 14 }}>ย้อนกลับไปหน้าเข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  label: { fontSize: 12, color: '#5a7090', marginBottom: 6, alignSelf: 'flex-start' },
  input: { backgroundColor: '#1A2535', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginBottom: 14, width: '100%' },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1A2535', 
    borderRadius: 12, 
    width: '100%',
    marginBottom: 14,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  btnRegister: { backgroundColor: '#E63946', borderRadius: 25, paddingVertical: 14, alignItems: 'center', width: '100%', marginTop: 10 },
  btnRegisterText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});