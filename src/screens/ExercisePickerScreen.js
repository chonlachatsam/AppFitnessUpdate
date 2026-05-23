import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // เพิ่มการ Import ไอคอน
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { MUSCLES, getExercisesByMuscle } from '../data/exercises';
import { colors } from '../theme';

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
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />
      <View style={{ flex: 1 }}>
        <View style={styles.headerWrap}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>WORKOUT LIBRARY</Text>
          </View>
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
  container: { flex: 1, backgroundColor: '#071a28' },
  heroGlowTop: {
    position: 'absolute',
    top: -110,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(230,57,70,0.10)',
  },
  heroGlowBottom: {
    position: 'absolute',
    top: 180,
    left: -80,
    width: 210,
    height: 210,
    borderRadius: 210,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  headerWrap: { paddingHorizontal: 20, paddingTop: 8 },
  headerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#162638',
    borderWidth: 1,
    borderColor: '#29415a',
    marginTop: 8,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.white, marginTop: 6, letterSpacing: 0.2 },
  headerSub: { fontSize: 14, color: colors.textGray, marginBottom: 18, lineHeight: 20, maxWidth: '92%' },
  muscleList: { paddingVertical: 5, gap: 10 },
  muscleTab: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#172638',
    borderWidth: 1,
    borderColor: '#2b3d52'
  },
  muscleTabText: { color: colors.textLight, fontWeight: '700' },
  cardContainer: { width: width, alignItems: 'center', justifyContent: 'center' },
  mainCard: {
    backgroundColor: '#1a293b',
    width: CARD_WIDTH,
    height: height * 0.7,
    minHeight: 560,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2b3d52',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardInnerContent: { padding: 20, paddingBottom: 28 },
  gifWrapper: { width: '100%', aspectRatio: 1.2, backgroundColor: '#fff', borderRadius: 24, marginBottom: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#dbe4ee' },
  imageGif: { width: '100%', height: '100%' },
  titleText: { color: colors.white, fontSize: 28, fontWeight: '800', letterSpacing: 0.2 },
  muscleSubText: { color: '#93a7bf', fontSize: 16, marginTop: 6, lineHeight: 22 },
  statsGrid: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  statBox: {
    flex: 1,
    minHeight: 96,
    backgroundColor: '#091a29',
    padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#153149'
  },
  statLabel: { color: colors.textGray, fontSize: 12, marginBottom: 6 },
  statValue: { color: colors.white, fontSize: 24, fontWeight: '800' },
  sectionTitle: { color: colors.white, fontSize: 17, fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  daysGrid: { gap: 12 },
  daysRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#091a29',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#26415d',
    position: 'relative'
  },
  dayCircleSelected: { borderColor: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)' },
  dayText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  checkBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#16a34a', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkIcon: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  bnav: { 
    flexDirection: 'row', 
    backgroundColor: colors.navBg, 
    height: 82, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 14,
  },
  bnavitem: { alignItems: 'center', justifyContent: 'center' },
  bnavlabel: { fontSize: 10, color: colors.textGray, fontWeight: '700', marginTop: 4 },
});
