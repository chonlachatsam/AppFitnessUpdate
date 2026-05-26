import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';

const API_KEY = 'AIzaSyAwxpDvt7S2U0WcB1g6eZKWd4KPHpXjB-o';

const hasProfileData = (userData) => Boolean(userData?.weight && userData?.height && userData?.age);
const roundNumber = (value) => Math.round((Number(value) || 0) * 10) / 10;

const MEAL_LABELS = {
  breakfast: 'มื้อเช้า',
  lunch: 'มื้อกลางวัน',
  dinner: 'มื้อเย็น',
  snack: 'ของว่าง',
};

const formatMealLabel = (mealSlot) => MEAL_LABELS[mealSlot] || 'มื้ออาหาร';

const includesAny = (text = '', patterns = []) => {
  const normalized = String(text).toLowerCase();
  return patterns.some((pattern) => normalized.includes(String(pattern).toLowerCase()));
};

const detectMealIntent = (text = '') => {
  if (includesAny(text, ['มื้อเช้า', 'เช้านี้', 'breakfast'])) return 'breakfast';
  if (includesAny(text, ['มื้อกลางวัน', 'มื้อเที่ยง', 'กลางวันนี้', 'เที่ยงนี้', 'lunch'])) return 'lunch';
  if (includesAny(text, ['มื้อเย็น', 'เย็นนี้', 'ค่ำนี้', 'dinner'])) return 'dinner';
  if (includesAny(text, ['ของว่าง', 'snack'])) return 'snack';
  return null;
};

const isTodayFoodListIntent = (text = '') => includesAny(text, [
  'วันนี้กินอะไรไปบ้าง',
  'กินอะไรไปบ้างวันนี้',
  'วันนี้มีอะไรบ้าง',
  'กินอะไรแล้วบ้าง',
]);

const isTodaySummaryIntent = (text = '') => includesAny(text, [
  'สรุปวันนี้',
  'summary',
  'วันนี้ทั้งหมด',
]);

const isProteinGapIntent = (text = '') => includesAny(text, [
  'วันนี้โปรตีนยังขาดอีกเท่าไร',
  'ขาดโปรตีน',
  'โปรตีนเหลืออีก',
  'โปรตีนยังไม่ถึง',
]);

const isCaloriesGapIntent = (text = '') => includesAny(text, [
  'เหลืออีกกี่แคล',
  'เหลือกี่แคล',
  'อีกกี่แคล',
  'แคลอรี่เหลือ',
]);

const buildSummaryText = (summary) => ([
  'สรุปวันนี้',
  `${summary.consumedCalories || 0} / ${summary.targetCalories || 0} kcal`,
  `เหลืออีก ${summary.remainingCalories || 0} kcal`,
  `โปรตีน ${roundNumber(summary.protein)} / ${roundNumber(summary.proteinTarget)} g`,
  `คาร์บ ${roundNumber(summary.carbs)} / ${roundNumber(summary.carbsTarget)} g`,
  `ไขมัน ${roundNumber(summary.fat)} / ${roundNumber(summary.fatTarget)} g`,
  `บันทึกแล้ว ${summary.entries?.length || 0} รายการ`,
].join('\n'));

const buildMealSummaryText = (mealSummary) => {
  if (!mealSummary.entries?.length) {
    return `${formatMealLabel(mealSummary.mealSlot)}วันนี้ยังไม่มีรายการนะ`;
  }

  const lines = mealSummary.entries.map((entry, index) => `${index + 1}. ${entry.name} - ${entry.calories || 0} kcal`);

  return [
    `${formatMealLabel(mealSummary.mealSlot)}วันนี้`,
    ...lines,
    `รวม ${mealSummary.calories || 0} kcal`,
    `โปรตีน ${roundNumber(mealSummary.protein)} g • คาร์บ ${roundNumber(mealSummary.carbs)} g • ไขมัน ${roundNumber(mealSummary.fat)} g`,
  ].join('\n');
};

const buildEntriesListText = (entries = []) => {
  if (!entries.length) return 'วันนี้ยังไม่มีอาหารที่บันทึกไว้';

  return [
    'วันนี้กินไปแล้ว:',
    ...entries.map((entry, index) => `${index + 1}. ${formatMealLabel(entry.mealSlot)} - ${entry.name} (${entry.calories || 0} kcal)`),
  ].join('\n');
};

const buildProteinGapText = (summary) => {
  const gap = roundNumber(summary.proteinTarget - summary.protein);
  if (gap > 0) {
    return `วันนี้คุณยังขาดโปรตีนอีก ${gap} กรัม ตอนนี้ได้ ${roundNumber(summary.protein)} / ${roundNumber(summary.proteinTarget)} กรัม`;
  }
  return `วันนี้โปรตีนถึงเป้าแล้วนะ ตอนนี้ได้ ${roundNumber(summary.protein)} / ${roundNumber(summary.proteinTarget)} กรัม`;
};

const buildCaloriesGapText = (summary) => {
  if (summary.remainingCalories >= 0) {
    return `วันนี้ยังเหลือได้อีก ${summary.remainingCalories} kcal จากเป้า ${summary.targetCalories} kcal`;
  }
  return `วันนี้เกินเป้าไป ${Math.abs(summary.remainingCalories)} kcal จากเป้า ${summary.targetCalories} kcal`;
};

async function askCalAI({ prompt, base64Image, userData, stats, summary, todayEntries, mealBreakdown }) {
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  if (!hasProfileData(userData)) {
    return {
      action: 'need_profile',
      reply: 'กรอกน้ำหนัก ส่วนสูง และอายุก่อนนะ เดี๋ยวน้องแคลจะคำนวณให้แม่นขึ้น',
    };
  }

  const textPrompt = `
คุณคือ "น้องแคล" ผู้ช่วยโภชนาการในแอพฟิตเนส
ตอบเป็นภาษาไทย สุภาพ เป็นกันเอง และกระชับ

ข้อมูลผู้ใช้:
${JSON.stringify(userData)}

สถานะโภชนาการวันนี้:
BMI: ${stats?.bmi || 0}
เป้าแคลอรี่ต่อวัน: ${summary.targetCalories || 0}
กินไปแล้ว: ${summary.consumedCalories || 0}
เหลืออีก: ${summary.remainingCalories || 0}
โปรตีน: ${roundNumber(summary.protein)} / ${roundNumber(summary.proteinTarget)} g
คาร์บ: ${roundNumber(summary.carbs)} / ${roundNumber(summary.carbsTarget)} g
ไขมัน: ${roundNumber(summary.fat)} / ${roundNumber(summary.fatTarget)} g

รายการทั้งหมดวันนี้:
${todayEntries.length ? JSON.stringify(todayEntries) : 'ยังไม่มี'}

สรุปรายมื้อ:
${JSON.stringify(mealBreakdown)}

ให้ตอบเป็น JSON เท่านั้น

กรณีผู้ใช้ส่งอาหารใหม่หรือส่งรูป ให้ตอบ:
{
  "action":"add_food",
  "reply":"ข้อความภาษาไทย",
  "food":{
    "name":"ชื่ออาหาร",
    "mealSlot":"breakfast|lunch|dinner|snack",
    "calories":123,
    "protein":10,
    "carbs":20,
    "fat":5,
    "note":"ใช้ค่าจากฉลาก หรือเป็นค่าประเมินจากภาพ"
  }
}

กรณีผู้ใช้แก้รายการล่าสุด ให้ตอบ:
{
  "action":"correct_last_entry",
  "reply":"ข้อความภาษาไทย",
  "food":{
    "name":"ชื่ออาหารที่แก้ไขแล้ว",
    "mealSlot":"breakfast|lunch|dinner|snack",
    "calories":120,
    "protein":6,
    "carbs":18,
    "fat":2,
    "note":"แก้จากรายการล่าสุด"
  }
}

กรณีผู้ใช้ถามเชิงแนะนำ เช่น มื้อเย็นควรกินอะไรต่อ วันนี้โอเคไหม หรือโปรตีนยังขาด ให้ตอบ:
{
  "action":"coach_reply",
  "reply":"คำตอบภาษาไทยที่อิงจากข้อมูลทั้งวันจริงๆ"
}

ถ้าภาพมีฉลากโภชนาการอ่านได้ ให้ใช้ค่าจากฉลากก่อน
ถ้าอาหารไม่ชัด ให้ตอบ:
{"action":"ask_clarify","reply":"คำถามกลับภาษาไทยที่สั้นและชัดเจน"}

ข้อความผู้ใช้: "${prompt || ''}"
`;

  const parts = [{ text: textPrompt }];
  if (base64Image) {
    parts.unshift({
      inline_data: {
        mime_type: 'image/jpeg',
        data: base64Image,
      },
    });
  }

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      action: 'ask_clarify',
      reply: 'น้องแคลยังวิเคราะห์ไม่จบ ลองส่งรูปให้ชัดขึ้นหรือพิมพ์รายละเอียดเมนูเพิ่มอีกนิดนะ',
    };
  }
}

export default function ChatWithCalScreen({ navigation }) {
  const {
    userData,
    stats,
    nutritionTargets,
    calChatMessages,
    setCalChatMessages,
    addNutritionEntry,
    updateLastNutritionEntry,
    getNutritionSummary,
    getNutritionEntriesForDate,
    getMealSummary,
    syncNutritionTarget,
    getTodayKey,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const todayKey = getTodayKey();
  const summary = getNutritionSummary(todayKey);

  useEffect(() => {
    syncNutritionTarget(todayKey);
  }, [stats?.tdee, userData?.weight, userData?.height, userData?.age, userData?.goal, todayKey, syncNutritionTarget]);

  const appendMessage = (message) => {
    setCalChatMessages((prev) => [...prev, message]);
  };

  const buildDirectReply = (text) => {
    const todayEntries = getNutritionEntriesForDate(todayKey);
    const mealSlot = detectMealIntent(text);

    if (isTodaySummaryIntent(text)) return buildSummaryText(getNutritionSummary(todayKey));
    if (isTodayFoodListIntent(text)) return buildEntriesListText(todayEntries);
    if (mealSlot && includesAny(text, ['คืออะไร', 'กินอะไร', 'มีอะไร', 'สรุป'])) return buildMealSummaryText(getMealSummary(mealSlot, todayKey));
    if (isProteinGapIntent(text)) return buildProteinGapText(getNutritionSummary(todayKey));
    if (isCaloriesGapIntent(text)) return buildCaloriesGapText(getNutritionSummary(todayKey));
    return null;
  };

  const sendMessage = async (text, base64Image = null) => {
    if (!text && !base64Image) return;

    const currentSummary = getNutritionSummary(todayKey);
    const todayEntries = getNutritionEntriesForDate(todayKey);
    const mealBreakdown = {
      breakfast: getMealSummary('breakfast', todayKey),
      lunch: getMealSummary('lunch', todayKey),
      dinner: getMealSummary('dinner', todayKey),
      snack: getMealSummary('snack', todayKey),
    };

    appendMessage({
      id: Date.now(),
      text: text || 'กำลังวิเคราะห์รูปอาหาร...',
      sender: 'user',
    });
    setInputText('');

    if (!base64Image && text) {
      const directReply = buildDirectReply(text);
      if (directReply) {
        appendMessage({ id: Date.now() + 1, text: directReply, sender: 'bot' });
        return;
      }
    }

    setLoading(true);

    try {
      const aiResult = await askCalAI({
        prompt: text,
        base64Image,
        userData,
        stats: { ...stats, ...nutritionTargets },
        summary: currentSummary,
        todayEntries,
        mealBreakdown,
      });

      let replyText = aiResult.reply || 'น้องแคลเช็กให้แล้วนะ';

      if (aiResult.action === 'add_food' && aiResult.food) {
        const food = aiResult.food;
        addNutritionEntry({
          dateKey: todayKey,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          source: base64Image ? 'image' : 'text',
          note: food.note || '',
          mealSlot: food.mealSlot,
        });

        const nextConsumed = (currentSummary.consumedCalories || 0) + (Number(food.calories) || 0);
        const nextProtein = roundNumber((currentSummary.protein || 0) + (Number(food.protein) || 0));
        const nextRemainingCalories = (currentSummary.targetCalories || 0) - nextConsumed;
        const nextProteinRemaining = roundNumber((currentSummary.proteinTarget || 0) - nextProtein);

        replyText = [
          replyText,
          '',
          `บันทึกแล้ว: ${food.name} (${formatMealLabel(food.mealSlot)})`,
          `${Number(food.calories) || 0} kcal • โปรตีน ${roundNumber(food.protein)} g • คาร์บ ${roundNumber(food.carbs)} g • ไขมัน ${roundNumber(food.fat)} g`,
          `วันนี้เหลืออีก ${nextRemainingCalories} kcal`,
          nextProteinRemaining > 0 ? `โปรตีนยังขาดอีก ${nextProteinRemaining} g` : 'โปรตีนถึงเป้าแล้ว',
        ].join('\n');
      } else if (aiResult.action === 'correct_last_entry' && aiResult.food) {
        const lastEntry = todayEntries[todayEntries.length - 1];
        const updated = updateLastNutritionEntry({
          dateKey: todayKey,
          name: aiResult.food.name,
          calories: aiResult.food.calories,
          protein: aiResult.food.protein,
          carbs: aiResult.food.carbs,
          fat: aiResult.food.fat,
          note: aiResult.food.note || '',
          mealSlot: aiResult.food.mealSlot,
        });

        const nextConsumed = (currentSummary.consumedCalories || 0)
          - (Number(lastEntry?.calories) || 0)
          + (Number(aiResult.food.calories) || 0);
        const nextProtein = roundNumber((currentSummary.protein || 0)
          - (Number(lastEntry?.protein) || 0)
          + (Number(aiResult.food.protein) || 0));
        const nextRemainingCalories = (currentSummary.targetCalories || 0) - nextConsumed;
        const nextProteinRemaining = roundNumber((currentSummary.proteinTarget || 0) - nextProtein);

        if (updated) {
          replyText = [
            replyText,
            '',
            `แก้รายการล่าสุดเป็น: ${updated.name} (${formatMealLabel(updated.mealSlot)})`,
            `${updated.calories} kcal • โปรตีน ${roundNumber(updated.protein)} g • คาร์บ ${roundNumber(updated.carbs)} g • ไขมัน ${roundNumber(updated.fat)} g`,
            `วันนี้เหลืออีก ${nextRemainingCalories} kcal`,
            nextProteinRemaining > 0 ? `โปรตีนยังขาดอีก ${nextProteinRemaining} g` : 'โปรตีนถึงเป้าแล้ว',
          ].join('\n');
        }
      }

      appendMessage({ id: Date.now() + 1, text: replyText, sender: 'bot' });
    } catch {
      appendMessage({
        id: Date.now() + 1,
        text: 'มีบางอย่างผิดพลาดตอนวิเคราะห์มื้อนี้ ลองใหม่อีกครั้งนะ',
        sender: 'bot',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert('ส่งรูปให้น้องแคล', 'เลือกวิธีส่งรูป', [
      { text: 'ถ่ายรูป', onPress: () => pickImage('camera') },
      { text: 'เลือกจากคลัง', onPress: () => pickImage('gallery') },
      { text: 'ยกเลิก', style: 'cancel' },
    ]);
  };

  const pickImage = async (source) => {
    let result;

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ยังไม่ได้รับสิทธิ์', 'กรุณาอนุญาตการใช้งานกล้องก่อน');
        return;
      }

      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        base64: true,
        quality: 0.7,
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ยังไม่ได้รับสิทธิ์', 'กรุณาอนุญาตการเข้าถึงรูปภาพก่อน');
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 0.7,
      });
    }

    if (!result.canceled && result.assets?.[0]?.base64) {
      sendMessage(null, result.assets[0].base64);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>น้องแคล (AI Assistant)</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.summaryBar}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryChipLabel}>เป้าทั้งวัน</Text>
          <Text style={styles.summaryChipValue}>{summary.targetCalories || 0} kcal</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryChipLabel}>กินแล้ว</Text>
          <Text style={styles.summaryChipValue}>{summary.consumedCalories || 0} kcal</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryChipLabel}>โปรตีน</Text>
          <Text style={styles.summaryChipValue}>{roundNumber(summary.protein)} / {roundNumber(summary.proteinTarget)} g</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
        >
          {calChatMessages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.chatText}>{msg.text}</Text>
            </View>
          ))}
          {loading && <ActivityIndicator color="#19D32F" style={styles.loader} />}
        </ScrollView>

        <View style={styles.inputWrap}>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={handleImagePicker} style={styles.iconButton}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="พิมพ์ชื่อเมนู ถามสรุป หรือส่งรูปอาหาร..."
              placeholderTextColor="#6F7C90"
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity onPress={() => sendMessage(inputText)} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#243244',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summaryBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: '#182435',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#24384c',
  },
  summaryChipLabel: {
    color: '#7E93AC',
    fontSize: 11,
    marginBottom: 4,
  },
  summaryChipValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  chatArea: { flex: 1, paddingHorizontal: 15 },
  chatContent: { paddingVertical: 12 },
  bubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '86%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#19D32F',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A2535',
    borderBottomLeftRadius: 4,
  },
  chatText: { color: 'white', fontSize: 15, lineHeight: 22 },
  loader: { marginVertical: 10, alignSelf: 'flex-start', marginLeft: 20 },
  inputWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#0F1923',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132033',
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1B2940',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
    backgroundColor: '#0A1524',
    borderRadius: 999,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#19D32F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
