import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { useApp } from '../context/AppContext';

const API_KEY = "AIzaSyAwxpDvt7S2U0WcB1g6eZKWd4KPHpXjB-o";

// ท่าทั้งหมดในแอพ ส่งให้ AI เลือก
const ALL_EXERCISES = {
  chest:      { c1:'Bench Press', c2:'Dumbbell Press', c3:'Dumbbell Fly', c4:'Dumbbell Pullover', c5:'Chest Dip' },
  back:       { b1:'Bent Over Row', b2:'Lat Pulldown', b3:'Seated Cable Row', b4:'Rear Delt Fly', b5:'Hyperextension' },
  arms_front: { af1:'Z-Bar Curl', af2:'Incline Dumbbell Curl', af3:'Preacher Curl', af4:'Hammer Curl' },
  arms_back:  { ab1:'Tricep Dips', ab2:'Push Down', ab3:'Dumbbell Kickback', ab4:'Reverse Pushdown' },
  legs:       { l1:'Bulgarian Split Squat', l2:'Hack Squat', l3:'Leg Extension', l4:'Barbell Squat', l5:'Sumo Deadlift' },
  abs:        { as1:'Heel Touch', as2:'Russian Twist', as3:'Plank', as4:'Bicycle Crunch', as5:'Half Wipers' },
  shoulders:  { s1:'Arnold Press', s2:'Rear Lateral Raise', s3:'Overhead Press', s4:'Lateral Raise', s5:'Front Raise', s6:'Alternating Front Raise', s7:'4-Ways Lateral Raise' },
};

const exerciseListText = Object.entries(ALL_EXERCISES)
  .map(([muscle, exs]) => `${muscle}: ${Object.entries(exs).map(([id, name]) => `${id}=${name}`).join(', ')}`)
  .join('\n');

// เช็คว่ามีข้อมูลครบไหม
const hasUserData = (userData) => {
  return userData?.weight && userData?.height && userData?.age;
};

async function askGemini(prompt, userData, stats) {
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const userDataComplete = hasUserData(userData);
  
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `คุณคือ AT Personal Trainer ตอบเป็นภาษาไทย เป็นกันเอง กระชับ

ข้อมูลผู้ใช้: ${JSON.stringify(userData)}
BMI: ${stats?.bmi || 'ยังไม่มีข้อมูล'}, TDEE: ${stats?.tdee || 'ยังไม่มีข้อมูล'} kcal
ข้อมูลครบหรือไม่: ${userDataComplete ? 'ครบแล้ว' : 'ยังไม่ครบ (ยังไม่มี น้ำหนัก/ส่วนสูง/อายุ)'}

ท่าออกกำลังกายที่มีในแอพ:
${exerciseListText}

== กฎสำคัญ ==
${!userDataComplete ? `
⚠️ ผู้ใช้ยังไม่ได้กรอกข้อมูลส่วนตัว
กฎเหล็ก: ไม่ว่าผู้ใช้จะถามอะไร ให้ตอบสั้นๆ แล้วบอกว่าต้องกรอกข้อมูลก่อนเสมอ
ตัวอย่าง: "ก่อนแนะนำได้ ขอทราบข้อมูลคุณก่อนนะครับ บอกได้เลยว่า น้ำหนัก ส่วนสูง อายุ และเป้าหมายของคุณคืออะไรครับ?"
และแนบ [NEED_INFO] ท้ายเสมอ` : `
ข้อมูลครบแล้ว สามารถแนะนำได้เต็มที่`}

กฎการตอบ:
1. ถ้าผู้ใช้บอกข้อมูลร่างกาย (น้ำหนัก/ส่วนสูง/อายุ/เป้าหมาย) ให้แนบ [UPDATE_USER:{"weight":"xx","height":"xx","age":"xx","goal":"xx"}]
2. ถ้าผู้ใช้บอกเป้าหมายการฝึก หรืออยากได้โปรแกรม หรือบอกว่าอยากฝึกส่วนไหน เช่น "อยากอกใหญ่" "อยากไหล่กว้าง" "ขอโปรแกรม" ให้แนบ [GENERATE_PROGRAM:"สิ่งที่ผู้ใช้ต้องการ"]
3. ถ้าผู้ใช้เลือกคุมอาหาร ให้แนบ [GO_TO_NUTRITION]
4. ถ้าผู้ใช้อยากยกเลิกโปรแกรม ให้แนบ [REMOVE_PROGRAM]
5. ถ้าผู้ใช้ปวด/เจ็บ ให้วิเคราะห์และแนะนำยืดเหยียด ห้ามแนะนำให้ฝืนเล่น

ข้อความ: "${prompt}"` }] }]
      })
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content) return data.candidates[0].content.parts[0].text;
    return "ขออภัยครับ ลองใหม่นะครับ";
  } catch (e) { return "เชื่อมต่อไม่ได้ครับ"; }
}

// AI คิดโปรแกรมใหม่ตามที่ผู้ใช้ต้องการ
async function generateAIProgram(userRequest, userData) {
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `คุณคือ AI Personal Trainer ผู้เชี่ยวชาญ

ข้อมูลผู้ใช้: น้ำหนัก ${userData.weight} กก. สูง ${userData.height} ซม. อายุ ${userData.age} ปี เป้าหมาย: ${userData.goal || 'ไม่ระบุ'}
ความต้องการ: "${userRequest}"

ท่าที่มีในแอพ (ใช้ได้แค่ ID เหล่านี้):
${exerciseListText}

คิดโปรแกรมออกกำลังกาย 1 สัปดาห์ที่เหมาะสมที่สุดตามความต้องการ
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นเด็ดขาด:
{
  "name": "ชื่อโปรแกรม",
  "desc": "คำอธิบายสั้นๆ",
  "reason": "เหตุผลที่เหมาะกับผู้ใช้คนนี้",
  "days": {
    "1": [{"exId": "c1", "muscleId": "chest"}, {"exId": "s1", "muscleId": "shoulders"}],
    "2": "rest",
    "3": [{"exId": "b1", "muscleId": "back"}],
    "4": [{"exId": "l1", "muscleId": "legs"}],
    "5": [{"exId": "af1", "muscleId": "arms_front"}],
    "6": "rest",
    "7": "rest"
  }
}` }] }]
      })
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content) {
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    }
    return null;
  } catch (e) { return null; }
}

async function analyzeBodyImage(base64Image, userData, stats) {
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: "image/jpeg", data: base64Image } },
          { text: `วิเคราะห์รูปร่างของคนในภาพ ข้อมูลผู้ใช้: ${JSON.stringify(userData)}, BMI: ${stats?.bmi}
                    วิเคราะห์สภาพร่างกาย แนะนำจุดที่ควรพัฒนา แล้วแนบ [GENERATE_PROGRAM:"วิเคราะห์จากรูป: (บอกสิ่งที่เห็นจากรูป)"] ท้ายเสมอ
                    ตอบเป็นภาษาไทย กระชับ` }
        ] }]
      })
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content) return data.candidates[0].content.parts[0].text;
    return "วิเคราะห์รูปไม่ได้ครับ";
  } catch (e) { return "เชื่อมต่อไม่ได้ครับ"; }
}

export default function ChatTrainerScreen({ navigation }) {
  const { userData, setUserData, setSchedule, chatMessages, setChatMessages, stats } = useApp();
  const [isTyping, setIsTyping] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [loadingProgram, setLoadingProgram] = useState(false);

  const extractAndUpdateUserData = (responseText) => {
    const match = responseText.match(/\[UPDATE_USER:(.*?)\]/);
    if (match) {
      try {
        const newData = JSON.parse(match[1]);
        setUserData(prev => ({
          ...prev,
          ...Object.fromEntries(Object.entries(newData).filter(([_, v]) => v && v !== 'xx'))
        }));
        return responseText.replace(/\[UPDATE_USER:.*?\]/, '').trim();
      } catch (e) {}
    }
    return responseText;
  };

  const handleGenerateProgram = async (userRequest) => {
    setLoadingProgram(true);
    setShowProgramModal(true);
    const program = await generateAIProgram(userRequest, userData);
    setGeneratedProgram(program);
    setLoadingProgram(false);
  };

  const handleConfirmProgram = () => {
    if (!generatedProgram) return;
    setSchedule(generatedProgram.days);
    setShowProgramModal(false);
    setChatMessages(prev => GiftedChat.append(prev, [{
      _id: Math.random().toString(),
      text: `✅ บันทึกโปรแกรม "${generatedProgram.name}" ลงตารางแล้วครับ! 🗓️\n\n${generatedProgram.reason}`,
      createdAt: new Date(),
      user: { _id: 2, name: 'AI Trainer' },
    }]));
    Alert.alert("บันทึกสำเร็จ! 🎉", `"${generatedProgram.name}"`, [
      { text: "ดูตาราง", onPress: () => navigation.navigate('Schedule') },
      { text: "คุยต่อ", style: "cancel" }
    ]);
  };

  const onSend = useCallback(async (newMessages = []) => {
    setChatMessages(prev => GiftedChat.append(prev, newMessages));
    setIsTyping(true);
    try {
      const rawResponse = await askGemini(newMessages[0].text, userData, stats);
      let cleanText = extractAndUpdateUserData(rawResponse);

      const programMatch = cleanText.match(/\[GENERATE_PROGRAM:"(.+?)"\]/);
      const hasNutrition = cleanText.includes('[GO_TO_NUTRITION]');
      const hasRemove = cleanText.includes('[REMOVE_PROGRAM]');

      cleanText = cleanText
        .replace(/\[GENERATE_PROGRAM:"(.+?)"\]/, '')
        .replace('[GO_TO_NUTRITION]', '')
        .replace('[REMOVE_PROGRAM]', '')
        .replace('[NEED_INFO]', '')
        .trim();

      setChatMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: cleanText,
        createdAt: new Date(),
        user: { _id: 2, name: 'AI Trainer' },
      }]));

      if (programMatch) setTimeout(() => handleGenerateProgram(programMatch[1]), 600);
      if (hasRemove) setSchedule({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });
      if (hasNutrition) {
        setTimeout(() => Alert.alert("ไปดูแผนอาหาร?", "", [
          { text: "ไปเลย", onPress: () => navigation.navigate('Nutrition') },
          { text: "ทีหลัง" }
        ]), 1000);
      }
    } catch (e) { console.error(e); }
    finally { setIsTyping(false); }
  }, [userData, stats]);

  const handleImagePicker = () => {
    Alert.alert("วิเคราะห์รูปร่าง", "เลือกวิธีส่งรูปครับ", [
      { text: "ถ่ายรูป", onPress: () => pickImage('camera') },
      { text: "เลือกจากคลัง", onPress: () => pickImage('gallery') },
      { text: "ยกเลิก", style: "cancel" }
    ]);
  };

  const pickImage = async (source) => {
    let result;
    if (source === 'camera') {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) return;
      result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    } else {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) return;
      result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    }
    if (!result.canceled && result.assets[0].base64) {
      setChatMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        image: result.assets[0].uri,
        createdAt: new Date(),
        user: { _id: 1 },
      }]));
      setIsTyping(true);
      try {
        const rawRes = await analyzeBodyImage(result.assets[0].base64, userData, stats);
        const programMatch = rawRes.match(/\[GENERATE_PROGRAM:"(.+?)"\]/);
        const cleanText = rawRes.replace(/\[GENERATE_PROGRAM:"(.+?)"\]/, '').trim();
        setChatMessages(prev => GiftedChat.append(prev, [{
          _id: Math.random().toString(),
          text: cleanText,
          createdAt: new Date(),
          user: { _id: 2, name: 'AI Trainer' },
        }]));
        if (programMatch) setTimeout(() => handleGenerateProgram(programMatch[1]), 600);
      } catch (e) { console.error(e); }
      finally { setIsTyping(false); }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Personal Trainer</Text>
          <View style={{ width: 28 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GiftedChat
          messages={chatMessages}
          onSend={onSend}
          user={{ _id: 1 }}
          isTyping={isTyping}
          alwaysShowSend
          scrollToBottom
          renderInputToolbar={props => (
            <InputToolbar
              {...props}
              containerStyle={styles.inputToolbar}
              primaryStyle={styles.inputPrimary}
            />
          )}
          renderComposer={props => (
            <Composer
              {...props}
              textInputStyle={styles.composerStyle}
              placeholder="พิมพ์ข้อความ..."
              placeholderTextColor="#7C8AA5"
            />
          )}
          renderActions={() => (
            <TouchableOpacity style={styles.actionButton} onPress={handleImagePicker}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          renderSend={props => (
            <Send
              {...props}
              alwaysShowSend
              disabled={false}
              containerStyle={styles.sendContainer}
            >
              <View style={styles.sendIconCircle}>
                <Ionicons name="send" size={18} color="white" />
              </View>
            </Send>
          )}
          renderBubble={props => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: { backgroundColor: '#E63946', borderRadius: 15 },
                left: { backgroundColor: '#1A2535', borderRadius: 15 }
              }}
              textStyle={{ left: { color: '#fff' } }}
            />
          )}
        />
      </KeyboardAvoidingView>

      {/* Modal Logic คงเดิม */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F1A' },
  headerSafeArea: { backgroundColor: '#161E2E' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  inputToolbar: {
    backgroundColor: '#161E2E',
    borderTopWidth: 0,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 8,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 999,
  },

  inputPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },

  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
    marginLeft: 4,
  },

  composerStyle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    marginHorizontal: 6,
    minHeight: 40,
  },

  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 4,
    opacity: 1,
  },

  sendIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00C853',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#0F1923', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  closeModalBtn: { marginTop: 5, padding: 16, borderRadius: 16, backgroundColor: '#1A2535', alignItems: 'center' },
  closeModalText: { color: '#5a7090', fontWeight: '700' },
});