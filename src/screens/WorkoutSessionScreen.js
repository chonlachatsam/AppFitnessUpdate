import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { getExerciseById } from '../data/exercises';

export default function WorkoutSessionScreen({ route, navigation }) {
  const { day, exercises } = route.params;
  const { setDoneExercises } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(60);

  const currentEx = getExerciseById(exercises[currentIndex]?.exId);

  // ระบบนับถอยหลังเวลาพัก
  useEffect(() => {
    let interval;
    if (isResting && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setIsResting(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [isResting, timer]);

  // ฟังก์ชันเมื่อเล่นจบ 1 เซต
  const handleSetDone = () => {
    if (currentSet < currentEx.sets) {
      setIsResting(true); // พักระหว่างเซต
      setCurrentSet(prev => prev + 1);
    } else {
      handleNextExercise(); // จบท่านี้แล้ว ไปท่าต่อไป
    }
  };

  // ฟังก์ชันไปท่าต่อไป หรือ จบโปรแกรม
  const handleNextExercise = () => {
    // บันทึกว่าท่านี้เล่นเสร็จแล้ว
    setDoneExercises(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [currentEx.id]: true
      }
    }));

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimer(60);
    } else {
      // จบครบทุกท่าในวันนี้
      alert('ยินดีด้วย! คุณออกกำลังกายครบตามเป้าหมายแล้ว 🏆');
      navigation.goBack();
    }
  };

  if (!currentEx) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>✕ ยกเลิก</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>ท่าที่ {currentIndex + 1} / {exercises.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* GIF ท่าฝึก */}
        <View style={styles.imageContainer}>
          <Image source={currentEx.gif} style={styles.gif} resizeMode="contain" />
        </View>

        {/* รายละเอียดท่า */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{currentEx.title}</Text>
          <Text style={styles.target}>🎯 {currentEx.muscleDetail}</Text>
          
          <View style={styles.setsIndicator}>
             {[...Array(currentEx.sets)].map((_, i) => (
               <View 
                key={i} 
                style={[
                  styles.dot, 
                  i + 1 < currentSet && styles.dotDone,
                  i + 1 === currentSet && styles.dotActive 
                ]} 
               />
             ))}
          </View>
        </View>

        {/* หน้าจอพัก (Overlay) */}
        {isResting ? (
          <View style={styles.restCard}>
            <Text style={styles.restLabel}>พักผ่อนให้พร้อมเซตต่อไป</Text>
            <Text style={styles.timerText}>{timer} วินาที</Text>
            <TouchableOpacity style={styles.skipBtn} onPress={() => setIsResting(false)}>
              <Text style={styles.skipText}>ข้ามเวลาพัก</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>เซตปัจจุบัน</Text>
                <Text style={styles.statValue}>{currentSet} / {currentEx.sets}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>จำนวนครั้ง</Text>
                <Text style={styles.statValue}>{currentEx.reps}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={handleSetDone}>
              <Text style={styles.doneBtnText}>
                {currentSet < currentEx.sets ? '✅ จบเซตนี้' : '🔥 จบท่านี้'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backBtn: { color: '#5a7090', fontSize: 16, fontWeight: 'bold' },
  progressText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scrollContent: { paddingBottom: 40 },
  imageContainer: { width: '90%', height: 300, backgroundColor: '#fff', alignSelf: 'center', borderRadius: 25, overflow: 'hidden', elevation: 10 },
  gif: { width: '100%', height: '100%' },
  infoSection: { alignItems: 'center', marginTop: 25 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff' },
  target: { fontSize: 16, color: '#E63946', marginTop: 5, fontWeight: '700' },
  setsIndicator: { flexDirection: 'row', gap: 8, marginTop: 15 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1A2535', borderWidth: 1, borderColor: '#2a3a4a' },
  dotActive: { backgroundColor: '#E63946', transform: [{ scale: 1.2 }] },
  dotDone: { backgroundColor: '#16a34a' },
  restCard: { margin: 20, padding: 30, backgroundColor: '#1A2535', borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#16a34a' },
  restLabel: { color: '#16a34a', fontSize: 16, fontWeight: 'bold' },
  timerText: { color: '#fff', fontSize: 60, fontWeight: '900', marginVertical: 10 },
  skipBtn: { marginTop: 10, padding: 10 },
  skipText: { color: '#5a7090', fontWeight: 'bold' },
  actionCard: { margin: 20, padding: 25, backgroundColor: '#1A2535', borderRadius: 25, borderWidth: 1, borderColor: '#2a3a4a' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25 },
  statItem: { alignItems: 'center' },
  statLabel: { color: '#5a7090', fontSize: 14, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  doneBtn: { backgroundColor: '#E63946', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 5 },
  doneBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});