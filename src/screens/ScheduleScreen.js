import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // เพิ่มไอคอนเพื่อความสวยงาม
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { EXERCISES, getExerciseById, getMuscleById, MUSCLES } from '../data/exercises';

const { width } = Dimensions.get('window');

export default function ScheduleScreen({ navigation }) {
  const { schedule, setSchedule, addToSchedule, currentWeek, doneExercises, resetWeek } = useApp();
  const [activeDay, setActiveDay] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMuscle, setPickerMuscle] = useState('chest');
  const [pickerSelected, setPickerSelected] = useState(new Set());

  const dayData = schedule[activeDay];
  const isRest = dayData === 'rest';
  const exList = Array.isArray(dayData) ? dayData : [];

  const nonRestDays = [1,2,3,4,5,6,7].filter(d => Array.isArray(schedule[d]) && schedule[d].length > 0);
  const doneDays = nonRestDays.filter(d => schedule[d].every(x => doneExercises[d]?.[x.exId]));
  const weekPct = nonRestDays.length > 0 ? Math.round((doneDays.length / nonRestDays.length) * 100) : 0;
  const isWeekComplete = nonRestDays.length > 0 && doneDays.length === nonRestDays.length;

  const removeEx = (exId, day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(item => item.exId !== exId)
    }));
  };

  const handleSetRestDay = (day) => {
    setSchedule(prev => ({ ...prev, [day]: 'rest' }));
  };

  const togglePickerEx = (exId) => {
    const s = new Set(pickerSelected);
    s.has(exId) ? s.delete(exId) : s.add(exId);
    setPickerSelected(s);
  };

  const confirmPicker = () => {
    pickerSelected.forEach(exId => {
      if (!exList.some(x => x.exId === exId)) {
        addToSchedule(activeDay, { exId, muscleId: pickerMuscle });
      }
    });
    setShowPicker(false);
    setPickerSelected(new Set());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>จัดการตารางฝึก </Text>
          <Text style={styles.subtitle}>สัปดาห์ที่ {currentWeek} • สำเร็จ {doneDays.length}/{nonRestDays.length} วัน</Text>
        </View>
        <View style={styles.weekBadge}>
           <Text style={styles.weekBadgeSub}>WEEKS</Text>
           <Text style={styles.weekBadgeNum}>{currentWeek}</Text>
        </View>
      </View>

      <View style={styles.dayRow}>
        {[1,2,3,4,5,6,7].map(d => {
          const data = schedule[d];
          const isDayDone = Array.isArray(data) && data.length > 0 && data.every(x => doneExercises[d]?.[x.exId]);
          const hasData = data === 'rest' || (Array.isArray(data) && data.length > 0);
          return (
            <TouchableOpacity key={d} style={styles.dayPill} onPress={() => setActiveDay(d)}>
              <Text style={styles.dayPillLabel}>Day</Text>
              <View style={[
                styles.dayPillNum,
                d === activeDay && { backgroundColor: '#E63946' },
                hasData && d !== activeDay && { borderWidth: 2, borderColor: '#E63946' },
                isDayDone && d !== activeDay && { backgroundColor: '#16a34a', borderWidth: 0 },
                data === 'rest' && d !== activeDay && { borderColor: '#5a7090', borderWidth: 1 }
              ]}>
                <Text style={[styles.dayPillText, (d === activeDay || isDayDone) && { color: '#fff' }]}>
                  {isDayDone && d !== activeDay ? '✓' : (data === 'rest' ? '💤' : d)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.weekBanner, isWeekComplete && { borderColor: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.05)' }]}>
          <View style={styles.weekBannerRow}>
            <View>
              <Text style={styles.weekBannerTitle}>ความก้าวหน้าโดยรวม</Text>
              <Text style={styles.weekBannerSub}>{isWeekComplete ? 'จบสัปดาห์นี้แล้ว!' : `อีก ${nonRestDays.length - doneDays.length} วันจะจบสัปดาห์`}</Text>
            </View>
            <View style={[styles.pctBadge, isWeekComplete && { backgroundColor: '#16a34a' }]}>
              <Text style={styles.pctText}>{isWeekComplete ? '🏆' : `${weekPct}%`}</Text>
            </View>
          </View>
          <View style={styles.weekProgressBg}>
            <View style={[styles.weekProgressFill, { width: `${weekPct}%`, backgroundColor: isWeekComplete ? '#16a34a' : '#E63946' }]} />
          </View>
          {isWeekComplete && (
            <TouchableOpacity style={styles.nextWeekBtn} onPress={() => { resetWeek(); setActiveDay(1); }}>
              <Text style={styles.nextWeekBtnText}>เริ่มต้นสัปดาห์ถัดไป</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>รายการฝึกของวันที่ {activeDay}</Text>

        {isRest ? (
          <View style={styles.restCard}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>😴</Text>
            <Text style={styles.restText}>วันนี้คือวันพักผ่อนของคุณ</Text>
            <TouchableOpacity onPress={() => setSchedule(prev => ({ ...prev, [activeDay]: [] }))}>
              <Text style={styles.restCancel}>เปลี่ยนเป็นวันฝึก? คลิกที่นี่</Text>
            </TouchableOpacity>
          </View>
        ) : exList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>ยังไม่ได้วางแผนท่าออกกำลังกาย</Text>
            <TouchableOpacity style={styles.addBtnSmall} onPress={() => setShowPicker(true)}>
                <Text style={styles.addBtnText}>+ เพิ่มท่าฝึกเลย</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.setRestDayBtn} onPress={() => handleSetRestDay(activeDay)}>
              <Text style={styles.setRestDayText}>💤 ตั้งเป็นวันหยุดพัก</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.exGroupCard}>
            {exList.map((item) => {
              const ex = getExerciseById(item.exId);
              const m = getMuscleById(item.muscleId);
              const isDone = doneExercises[activeDay]?.[item.exId];
              return ex ? (
                <View key={item.exId} style={[styles.exRow, isDone && { opacity: 0.4 }]}>
                  <View style={[styles.exDot, { backgroundColor: m?.color || '#E63946' }]} />
                  <Text style={styles.exName}>{ex.title}</Text>
                  <Text style={styles.exSets}>{ex.sets}×{ex.reps}</Text>
                  <TouchableOpacity onPress={() => removeEx(item.exId, activeDay)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null;
            })}
          </View>
        )}

        {!isRest && (
          <View style={{ gap: 10, marginTop: 20, marginBottom: 150 }}>
            {exList.length > 0 && (
              <TouchableOpacity 
                style={styles.playBtn} 
                onPress={() => navigation.navigate('WorkoutSession', { day: activeDay, exercises: exList })}
              >
                <Text style={styles.playBtnText}>เริ่มออกกำลังกาย</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
              <Text style={styles.addBtnText}>+ เพิ่มท่าลงในวันที่ {activeDay}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL PICKER - แก้ไขจาก <div> เป็น <View> เรียบร้อยแล้ว */}
      <Modal visible={showPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.closeBtn}>ปิด</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>เลือกท่าที่ต้องการ</Text>
                  <View style={{ width: 40 }} /> 
              </View>

              <View style={{ height: 50, marginBottom: 15 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {MUSCLES.map(m => (
                    <TouchableOpacity 
                      key={m.id} 
                      style={[styles.miniTab, pickerMuscle === m.id && { backgroundColor: m.color }]}
                      onPress={() => setPickerMuscle(m.id)}
                    >
                      <Text style={[styles.miniTabText, pickerMuscle === m.id && { color: '#fff' }]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FlatList 
                data={EXERCISES[pickerMuscle]} 
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.pickerExCard, pickerSelected.has(item.id) && styles.pickerExCardActive]} 
                    onPress={() => togglePickerEx(item.id)}
                  >
                    <Image source={item.gif} style={styles.pickerGif} />
                    <View style={styles.pickerInfo}>
                      <Text style={styles.pickerTitle}>{item.title}</Text>
                      <Text style={styles.pickerSub}>{item.sets} เซต × {item.reps} ครั้ง</Text>
                    </View>
                    <View style={[styles.checkbox, pickerSelected.has(item.id) && styles.checkboxActive]}>
                      {pickerSelected.has(item.id) && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                )} 
              />

              <TouchableOpacity style={styles.confirmBtn} onPress={confirmPicker}>
                <Text style={styles.confirmBtnText}>เพิ่ม {pickerSelected.size} ท่าที่เลือก</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>

      {/* BOTTOM NAV - ปรับปรุงเป็น Vector Icons เพื่อความสวยงามพรีเมียม */}
      <View style={styles.bnav}>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home-outline" size={24} color="#5a7090" />
            <Text style={styles.bnavtext}>หน้าหลัก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('ExercisePicker')}>
            <MaterialCommunityIcons name="dumbbell" size={24} color="#5a7090" />
            <Text style={styles.bnavtext}>ออกกำลัง</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnavitem}>
            <Ionicons name="calendar" size={24} color="#E63946" />
            <Text style={[styles.bnavtext, { color: '#E63946' }]}>ตาราง</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#5a7090" />
            <Text style={styles.bnavtext}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#5a7090', marginTop: 4 },
  weekBadge: { backgroundColor: '#E63946', borderRadius: 12, padding: 10, alignItems: 'center' },
  weekBadgeSub: { fontSize: 8, color: '#fff', fontWeight: '800' },
  weekBadgeNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  dayRow: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 15, gap: 5 },
  dayPill: { flex: 1, alignItems: 'center' },
  dayPillLabel: { fontSize: 9, color: '#5a7090', marginBottom: 4 },
  dayPillNum: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#1A2535', alignItems: 'center', justifyContent: 'center' },
  dayPillText: { fontSize: 14, fontWeight: '700', color: '#5a7090' },
  scroll: { flex: 1, backgroundColor: '#111b27', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  weekBanner: { backgroundColor: '#1A2535', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2a3a4a' },
  weekBannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  weekBannerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  weekBannerSub: { fontSize: 12, color: '#5a7090' },
  pctBadge: { backgroundColor: '#0F1923', borderRadius: 10, padding: 8 },
  pctText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  weekProgressBg: { backgroundColor: '#0F1923', borderRadius: 10, height: 8, overflow: 'hidden' },
  weekProgressFill: { height: '100%', borderRadius: 10 },
  nextWeekBtn: { backgroundColor: '#16a34a', marginTop: 15, padding: 15, borderRadius: 12, alignItems: 'center' },
  nextWeekBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 15 },
  restCard: { backgroundColor: 'rgba(22, 163, 74, 0.05)', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#16a34a' },
  restText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  restCancel: { color: '#E63946', fontSize: 12, marginTop: 20, fontWeight: '700' },
  emptyCard: { backgroundColor: '#1A2535', borderRadius: 15, padding: 30, alignItems: 'center' },
  emptyText: { color: '#5a7090', fontWeight: '700', marginBottom: 15 },
  addBtnSmall: { backgroundColor: '#E63946', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  setRestDayBtn: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#5a7090' },
  setRestDayText: { color: '#5a7090', fontSize: 12, fontWeight: '700' },
  exGroupCard: { backgroundColor: '#1A2535', borderRadius: 18, padding: 15 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a3a4a' },
  exDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  exName: { flex: 1, fontSize: 14, color: '#fff' },
  exSets: { fontSize: 12, color: '#5a7090' },
  removeBtn: { color: '#E63946', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 },
  addBtn: { backgroundColor: 'rgba(230, 57, 70, 0.1)', borderRadius: 15, padding: 16, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#E63946' },
  addBtnText: { color: '#fff', fontWeight: '800' },
  playBtn: { backgroundColor: '#16a34a', borderRadius: 15, padding: 18, alignItems: 'center' },
  playBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  bnav: { flexDirection: 'row', height: 85, borderTopWidth: 1, borderTopColor: '#1A2535', justifyContent: 'space-around', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F1923', paddingBottom: 10 },
  bnavitem: { alignItems: 'center', justifyContent: 'center' },
  bnavicon: { fontSize: 20, marginBottom: 4 },
  bnavtext: { fontSize: 10, color: '#5a7090', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#0F1923', height: '85%', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  closeBtn: { color: '#E63946', fontWeight: 'bold', fontSize: 16 },
  miniTab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1A2535', marginRight: 10, height: 35 },
  miniTabText: { color: '#5a7090', fontSize: 12, fontWeight: '700' },
  pickerExCard: { flexDirection: 'row', backgroundColor: '#1A2535', borderRadius: 20, padding: 12, marginBottom: 12, alignItems: 'center' },
  pickerExCardActive: { borderColor: '#E63946', borderWidth: 1 },
  pickerGif: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#fff' },
  pickerInfo: { flex: 1, marginLeft: 15 },
  pickerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pickerSub: { color: '#5a7090', fontSize: 12, marginTop: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#2a3a4a', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#E63946', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});