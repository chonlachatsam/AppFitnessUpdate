import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [secureText, setSecureText] = useState(true); 

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่านครับ");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.replace('Home');
      })
      .catch((error) => {
        Alert.alert("เข้าสู่ระบบไม่สำเร็จ", "อีเมลหรือรหัสผ่านไม่ถูกต้องครับ");
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>💪</Text>
        </View>
        <Text style={styles.title}>ยินดีต้อนรับกลับ</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบบัญชีของคุณ</Text>

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          placeholder="user@email.com"
          placeholderTextColor="#5a7090"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>รหัสผ่าน</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]} 
            placeholder="••••••••"
            placeholderTextColor="#5a7090"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText} 
          />
          <TouchableOpacity 
            onPress={() => setSecureText(!secureText)} 
            style={styles.eyeIcon}
          >
            <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color="#5a7090" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => Alert.alert("แจ้งเตือน", "กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน")}>
          <Text style={styles.forgot}>ลืมรหัสผ่าน?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
          <Text style={styles.btnLoginText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnRegister} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.btnRegisterText}>สร้างบัญชีใหม่</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  logoBox: { width: 72, height: 72, backgroundColor: '#E63946', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoIcon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#5a7090', marginBottom: 32 },
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
  eyeIcon: { paddingHorizontal: 15 },
  forgot: { color: '#E63946', fontSize: 12, textAlign: 'right', marginBottom: 20, alignSelf: 'flex-end' },
  btnLogin: { backgroundColor: '#E63946', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginBottom: 12, width: '100%' },
  btnLoginText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnRegister: { borderWidth: 1.5, borderColor: '#1e2d3d', borderRadius: 25, paddingVertical: 13, alignItems: 'center', width: '100%' },
  btnRegisterText: { color: '#5a7090', fontSize: 14 },
});