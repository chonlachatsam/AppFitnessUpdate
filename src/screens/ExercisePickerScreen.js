import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // เพิ่มการ Import ไอคอน
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { MUSCLES, getExercisesByMuscle } from '../data/exercises';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88; 

export default function ExercisePickerScreen({ navigation }) {
  const [selectedMuscle, setSelectedMuscle] = useState('chest');
  const { addToSchedule, removeFromSchedule, schedule } = useApp();
  const flatListRef = useRef(null);
  
  const exercises = getExercisesByMuscle(selectedMuscle);

  useEffect(() => {
    if (exercises.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedMuscle]);

  const checkIfAdded = (day, exId) => {
    const dayData = schedule[day];
    return Array.isArray(dayData) && dayData.some(item => item.exId === exId);
  };

  const handleToggleDay = (day, exId) => {
    if (checkIfAdded(day, exId)) {
      removeFromSchedule(day, exId);
    } else {
      addToSchedule(day, { exId: exId, muscleId: selectedMuscle });
    }
  };

  const renderDayCircle = (day, exId) => {
    const dayData = schedule[day];
    const isAdded = checkIfAdded(day, exId);
    const isRest = dayData === 'rest';

    return (
      <TouchableOpacity 
        key={day} 
        style={[
          styles.dayCircle, 
          isAdded && styles.dayCircleSelected,
          isRest && { borderColor: '#5a7090', opacity: 0.6 }
        ]} 
        onPress={() => handleToggleDay(day, exId)}
      >
        <Text style={[
          styles.dayText, 
          isAdded && { color: '#16a34a' },
          isRest && { color: '#5a7090' }
        ]}>
          {isRest ? '💤' : day}
        </Text>
        {isAdded && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderExerciseCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.mainCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardInnerContent}>
          <View style={styles.gifWrapper}>
            <Image source={item.gif} style={styles.imageGif} resizeMode="cover" />
          </View>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.muscleSubText}>เน้นส่วน: {item.muscleDetail}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>เซต</Text>
              <Text style={styles.statValue}>{item.sets}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ครั้ง</Text>
              <Text style={styles.statValue}>{item.reps}</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>เลือกวันที่ต้องการเพิ่มลงตาราง:</Text>
          <View style={styles.daysGrid}>
            <View style={styles.daysRow}>{[1, 2, 3, 4].map(d => renderDayCircle(d, item.id))}</View>
            <View style={styles.daysRow}>{[5, 6, 7].map(d => renderDayCircle(d, item.id))}</View>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.headerTitle}>ค้นหาท่าฝึก </Text>
          <Text style={styles.headerSub}>เลือกกลุ่มกล้ามเนื้อแล้วปัดซ้าย-ขวาเพื่อดูท่าอื่น</Text>
          <View style={{ height: 60, marginBottom: 10 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={MUSCLES}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.muscleList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.muscleTab, 
                    selectedMuscle === item.id && { backgroundColor: item.color, borderColor: item.color }
                  ]}
                  onPress={() => setSelectedMuscle(item.id)}
                >
                  <Text style={[styles.muscleTabText, selectedMuscle === item.id && { color: '#fff' }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          snapToInterval={width}
          decelerationRate="fast"
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>

      {/* Bottom Navigation - ปรับปรุงใหม่ */}
      <View style={styles.bnav}>
        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#5a7090" />
          <Text style={styles.bnavlabel}>หน้าหลัก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnavitem}>
          <MaterialCommunityIcons name="dumbbell" size={26} color="#E63946" />
          <Text style={[styles.bnavlabel, { color: '#E63946', fontWeight: '800' }]}>ออกกำลัง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="calendar-outline" size={24} color="#5a7090" />
          <Text style={styles.bnavlabel}>ตาราง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnavitem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="#5a7090" />
          <Text style={styles.bnavlabel}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  headerSub: { fontSize: 13, color: '#5a7090', marginBottom: 15 },
  muscleList: { paddingVertical: 5, gap: 10 },
  muscleTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1A2535', borderWidth: 1, borderColor: '#2a3a4a' },
  muscleTabText: { color: '#5a7090', fontWeight: 'bold' },
  cardContainer: { width: width, alignItems: 'center', justifyContent: 'center' },
  mainCard: { backgroundColor: '#1A2535', width: CARD_WIDTH, height: height * 0.7, borderRadius: 30, borderWidth: 1, borderColor: '#2a3a4a', overflow: 'hidden' },
  cardInnerContent: { padding: 20 },
  gifWrapper: { width: '100%', aspectRatio: 1.2, backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden' },
  imageGif: { width: '100%', height: '100%' },
  titleText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  muscleSubText: { color: '#5a7090', fontSize: 16, marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  statBox: { flex: 1, backgroundColor: '#0F1923', padding: 15, borderRadius: 15, alignItems: 'center' },
  statLabel: { color: '#5a7090', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  daysGrid: { gap: 12 },
  daysRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  dayCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0F1923', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2a3a4a', position: 'relative' },
  dayCircleSelected: { borderColor: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)' },
  dayText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#16a34a', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkIcon: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  bnav: { 
    flexDirection: 'row', 
    backgroundColor: '#0F1923', 
    height: 85, 
    borderTopWidth: 1, 
    borderTopColor: '#1A2535', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: 20 
  },
  bnavitem: { alignItems: 'center', justifyContent: 'center' },
  bnavlabel: { fontSize: 10, color: '#5a7090', fontWeight: '700', marginTop: 4 },
});