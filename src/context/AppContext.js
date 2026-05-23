import React, { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [doneExercises, setDoneExercises] = useState({});
  const [schedule, setSchedule] = useState({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
  });

  const [userData, setUserData] = useState({
    name: 'Gym User',
    age: '',
    weight: '',
    height: '',
    goal: 'ลดน้ำหนัก',
  });

  const [weightHistory, setWeightHistory] = useState([]);

  const [chatMessages, setChatMessages] = useState([{
    _id: 1,
    text: 'สวัสดีครับ! ผมคือ AT 🤖\nเทรนเนอร์ AI ส่วนตัวของคุณ\n\n📷 ส่งรูปร่างกาย\nผมวิเคราะห์และแนะนำโปรแกรมที่เหมาะกับคุณ\n\n🗓️ เลือกโปรแกรมออกกำลังกาย\nผมบันทึกลงตารางให้อัตโนมัติเลย ไม่ต้องเพิ่มเอง\n\n📝 แจ้งข้อมูล นํ้าหนัก ส่วนสูง อายุ\nผมบันทึกลงโปรไฟล์ให้อัตโนมัติ\n\n💬 ถามเรื่องออกกำลังกายและโภชนาการ\nผมพร้อมให้คำแนะนำตลอด 24 ชั่วโมงครับ\n\nเริ่มได้เลยครับ! 💪',
    createdAt: new Date(),
    user: { _id: 2, name: 'AI Trainer' },
  }]);

  const stats = useMemo(() => {
    const w = parseFloat(userData.weight);
    const h = parseFloat(userData.height) / 100;
    const a = parseInt(userData.age);
    let bmi = 0, bmr = 0, tdee = 0;
    if (w && h) bmi = (w / (h * h)).toFixed(1);
    if (w && h && a) {
      bmr = (10 * w) + (6.25 * (h * 100)) - (5 * a) - 161;
      tdee = Math.round(bmr * 1.2);
      if (userData.goal === 'ลดน้ำหนัก') tdee -= 300;
      else if (userData.goal === 'เพิ่มกล้ามเนื้อ') tdee += 300;
    }
    return { bmi, tdee: tdee || 0, bmr };
  }, [userData]);

  const recordWeight = (weight) => {
    const wNum = parseFloat(weight);
    const hNum = parseFloat(userData.height) / 100;
    const bmi = hNum > 0 ? (wNum / (hNum * hNum)).toFixed(1) : 0;
    
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      week: currentWeek,
      weight: wNum,
      bmi: parseFloat(bmi),
    };
    
    setWeightHistory(prev => [...prev, newRecord]);
    setUserData(prev => ({ ...prev, weight: weight.toString() })); // อัปเดตน้ำหนักในโปรไฟล์หลักด้วย
  };

  const addToSchedule = (day, exercise) => {
    setSchedule(prev => ({ ...prev, [day]: [...(prev[day] || []), exercise] }));
  };

  const removeFromSchedule = (day, exId) => {
    setSchedule(prev => ({ ...prev, [day]: prev[day].filter(item => item.exId !== exId) }));
  };

  const resetWeek = () => {
    setDoneExercises({});
    setCurrentWeek(prev => prev + 1);
  };

  return (
    <AppContext.Provider value={{
      schedule, setSchedule, addToSchedule, removeFromSchedule,
      currentWeek, doneExercises, setDoneExercises, resetWeek,
      userData, setUserData,
      chatMessages, setChatMessages,
      stats,
      weightHistory, setWeightHistory, recordWeight,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);