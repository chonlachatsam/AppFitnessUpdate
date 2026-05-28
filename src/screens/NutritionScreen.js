import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';


const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function getNutritionPlan(userData, calculatedTdee) {
  if (!API_KEY) return null;

  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const promptText = `คุณคือนักโภชนาการ AI จัดเมนูอาหารให้ได้พลังงานรวม ${calculatedTdee} kcal (ห้ามเกินห้ามขาดมากเกินไป)
เป้าหมายผู้ใช้: ${userData.goal}
น้ำหนัก: ${userData.weight} กก.
ตอบเป็น JSON เท่านั้น:
{
  "calories": "${calculatedTdee}",
  "protein": "กรัม",
  "carbs": "กรัม",
  "fat": "กรัม",
  "meals": [
    { "name": "มื้อเช้า", "time": "07:00", "calories": "แคล", "menu": ["เมนู1", "เมนู2"], "tips": "" },
    { "name": "มื้อกลางวัน", "time": "12:00", "calories": "แคล", "menu": ["เมนู"], "tips": "" },
    { "name": "มื้อเย็น", "time": "18:00", "calories": "แคล", "menu": ["เมนู"], "tips": "" },
    { "name": "ของว่าง", "time": "15:00", "calories": "แคล", "menu": ["เมนู"], "tips": "" }
  ],
  "water": "ลิตร",
  "tips": ["คำแนะนำสำคัญ"]
}`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });
    const data = await response.json();
    const cleanText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) { return null; }
}

export default function NutritionScreen({ navigation }) {
  const { userData, stats } = useApp();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [userData.weight, userData.height, userData.goal]);

  const loadPlan = async () => {
    if (!stats.tdee || stats.tdee <= 0) return;
    setLoading(true);
    const result = await getNutritionPlan(userData, stats.tdee);
    setPlan(result);
    setLoading(false);
  };

  const mealColors = ['#E63946', '#457B9D', '#2A9D8F', '#F4A261'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>โภชนาการประจำวัน</Text>
        <TouchableOpacity onPress={loadPlan}><Ionicons name="refresh" size={24} color="#E63946" /></TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator size="large" color="#E63946" /><Text style={styles.loadingText}>กำลังคำนวณแผนอาหารจาก TDEE ${stats.tdee}...</Text></View>
      ) : plan ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.macroCard}>
            <Text style={styles.macroTitle}>เป้าหมายวันนี้ ({userData.goal})</Text>
            <Text style={styles.macroCalories}>{plan.calories} kcal</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}><Text style={styles.macroValue}>{plan.protein}</Text><Text style={styles.macroLabel}>โปรตีน</Text></View>
              <View style={styles.macroItem}><Text style={styles.macroValue}>{plan.carbs}</Text><Text style={styles.macroLabel}>คาร์บ</Text></View>
              <View style={styles.macroItem}><Text style={styles.macroValue}>{plan.fat}</Text><Text style={styles.macroLabel}>ไขมัน</Text></View>
            </View>
          </View>

          {plan.meals?.map((meal, index) => (
            <View key={index} style={[styles.mealCard, { borderLeftColor: mealColors[index % 4] }]}>
              <Text style={styles.mealName}>{meal.name} - {meal.time}</Text>
              <Text style={styles.mealTime}>{meal.calories} kcal</Text>
              {meal.menu?.map((m, i) => <Text key={i} style={styles.menuItem}>• {m}</Text>)}
            </View>
          ))}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
  macroCard: { margin: 20, backgroundColor: '#1A2535', borderRadius: 20, padding: 20 },
  macroTitle: { color: '#5a7090', textAlign: 'center' },
  macroCalories: { color: '#fff', fontSize: 42, fontWeight: '900', textAlign: 'center', marginVertical: 10 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  macroItem: { alignItems: 'center' },
  macroValue: { color: '#fff', fontWeight: '800' },
  macroLabel: { color: '#5a7090', fontSize: 11 },
  mealCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#1A2535', borderRadius: 16, padding: 15, borderLeftWidth: 4 },
  mealName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  mealTime: { color: '#5a7090', fontSize: 12 },
  menuItem: { color: '#ccc', fontSize: 13, marginTop: 4 },
});
