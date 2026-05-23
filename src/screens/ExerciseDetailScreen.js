import React, { useState } from 'react';
import { Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { getExerciseById, getMuscleById } from '../data/exercises';
/* ส่วนแสดง GIF ท่าฝึก */ /* ส่วนแสดง GIF ท่าฝึก */ /* ส่วนแสดง GIF ท่าฝึก */ /* ส่วนแสดง GIF ท่าฝึก */

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exId, muscleId } = route.params;
  const { addToSchedule } = useApp(); // ดึงฟังก์ชันเพิ่มลงตารางมาจาก Context
  const [modalVisible, setModalVisible] = useState(false);

  const exercise = getExerciseById(exId);
  const muscle = getMuscleById(muscleId);

  if (!exercise) return null;

  const handleAddToDay = (day) => {
    addToSchedule(day, { exId, muscleId });
    setModalVisible(false);
    Alert.alert('สำเร็จ!', `เพิ่ม ${exercise.title} ลงในวันที่ ${day} เรียบร้อยแล้ว`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* ส่วนแสดง GIF ท่าฝึก */}
        <View style={styles.imageContainer}>
          <Image source={exercise.gif} style={styles.gif} resizeMode="contain" />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{exercise.title}</Text>
            <View style={[styles.tag, { backgroundColor: muscle?.color }]}>
              <Text style={styles.tagText}>{muscle?.label}</Text>
            </View>
          </View>

          <Text style={styles.targetText}>🎯 เน้น: {exercise.muscleDetail}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>เซต</Text>
              <Text style={styles.infoValue}>{exercise.sets}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>ครั้ง</Text>
              <Text style={styles.infoValue}>{exercise.reps}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>พัก (วินาที)</Text>
              <Text style={styles.infoValue}>60-90</Text>
            </View>
          </View>

          {/* ปุ่มหลักสำหรับเปิด Modal เลือกวัน */}
          <TouchableOpacity 
            style={styles.addPlaylistBtn} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addPlaylistText}>+ เพิ่มลงตารางฝึก (Playlist)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* หน้าต่างเลือกวัน (Modal) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เลือกวันที่ต้องการฝึก</Text>
            <View style={styles.daysGrid}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <TouchableOpacity 
                  key={day} 
                  style={styles.dayCircle} 
                  onPress={() => handleAddToDay(day)}
                >
                  <Text style={styles.dayText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  imageContainer: { width: '100%', height: 300, backgroundColor: '#fff', position: 'relative' },
  gif: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  tagText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  targetText: { color: '#5a7090', fontSize: 16, marginBottom: 20 },
  infoGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  infoBox: { flex: 1, backgroundColor: '#1A2535', padding: 15, borderRadius: 15, alignItems: 'center' },
  infoLabel: { color: '#5a7090', fontSize: 12, marginBottom: 5 },
  infoValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addPlaylistBtn: { backgroundColor: '#E63946', padding: 18, borderRadius: 15, alignItems: 'center' },
  addPlaylistText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1A2535', width: '80%', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 25 },
  dayCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E63946', alignItems: 'center', justifyContent: 'center' },
  dayText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { marginTop: 10 },
  closeBtnText: { color: '#5a7090', fontSize: 14 }
});