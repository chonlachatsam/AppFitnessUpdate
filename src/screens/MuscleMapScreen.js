import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MUSCLES } from '../data/exercises';

export default function MuscleMapScreen({ route, navigation }) {
  const { muscleId = 'chest' } = route.params || {};
  const primaryMuscle = MUSCLES.find(m => m.id === muscleId);
  const secondaryMuscle = MUSCLES.find(m => m.id === 'shoulders');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ กลับ</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>แผนที่กล้ามเนื้อ</Text>
          <Text style={styles.subtitle}>วันนี้: {primaryMuscle?.label} + ไหล่</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Body figure */}
        <View style={styles.bodyCard}>
          <View style={styles.bodyFigure}>
            {/* Head */}
            <View style={styles.head} />
            {/* Shoulders */}
            <View style={styles.shoulderRow}>
              <View style={[styles.shoulder, { backgroundColor: '#FF8C42' }]} />
              <View style={styles.neck} />
              <View style={[styles.shoulder, { backgroundColor: '#FF8C42' }]} />
            </View>
            {/* Chest */}
            <View style={styles.torsoRow}>
              <View style={[styles.pec, { backgroundColor: primaryMuscle?.color || '#E63946' }]} />
              <View style={[styles.pec, { backgroundColor: primaryMuscle?.color || '#E63946' }]} />
            </View>
            {/* Abs */}
            <View style={styles.absRow}>
              {[1,2,3].map(i => (
                <View key={i} style={styles.absCol}>
                  <View style={styles.absBlock} />
                  <View style={styles.absBlock} />
                </View>
              ))}
            </View>
            {/* Arms */}
            <View style={styles.armsWrapper}>
              <View style={styles.arm} />
              <View style={styles.core} />
              <View style={styles.arm} />
            </View>
            {/* Legs */}
            <View style={styles.legsRow}>
              <View style={styles.leg} />
              <View style={{ width: 12 }} />
              <View style={styles.leg} />
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: primaryMuscle?.color || '#E63946' }]} />
              <Text style={styles.legendText}>กล้ามหลัก</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF8C42' }]} />
              <Text style={styles.legendText}>กล้ามรอง</Text>
            </View>
          </View>
        </View>

        {/* Muscle cards */}
        <Text style={styles.sectionTitle}>ที่ออกกำลังวันนี้</Text>
        {primaryMuscle && (
          <View style={styles.muscleCard}>
            <View style={styles.muscleCardLeft}>
              <View style={[styles.muscleBar, { backgroundColor: primaryMuscle.color }]} />
              <View>
                <Text style={styles.muscleName}>กล้าม{primaryMuscle.label}</Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: '80%', backgroundColor: primaryMuscle.color }]} />
                </View>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: primaryMuscle.color + '20' }]}>
              <Text style={[styles.badgeText, { color: primaryMuscle.color }]}>หลัก</Text>
            </View>
          </View>
        )}
        <View style={styles.muscleCard}>
          <View style={styles.muscleCardLeft}>
            <View style={[styles.muscleBar, { backgroundColor: '#FF8C42' }]} />
            <View>
              <Text style={styles.muscleName}>กล้ามไหล่</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: '50%', backgroundColor: '#FF8C42' }]} />
              </View>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: '#FF8C4220' }]}>
            <Text style={[styles.badgeText, { color: '#FF8C42' }]}>รอง</Text>
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  back: { color: '#E63946', fontSize: 18 },
  title: { fontSize: 15, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 11, color: '#5a7090', marginTop: 2 },
  scroll: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 16, padding: 18 },
  bodyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16, elevation: 2 },
  bodyFigure: { alignItems: 'center', paddingVertical: 10 },
  head: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ccc', marginBottom: 4 },
  neck: { width: 16, height: 14, backgroundColor: '#ddd' },
  shoulderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  shoulder: { width: 32, height: 40, borderRadius: 16 },
  torsoRow: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  pec: { width: 44, height: 36, borderRadius: 8, opacity: 0.9 },
  absRow: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  absCol: { gap: 3 },
  absBlock: { width: 24, height: 16, backgroundColor: '#D4A96A', borderRadius: 4 },
  armsWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  arm: { width: 20, height: 52, backgroundColor: '#C49060', borderRadius: 10, marginHorizontal: 4 },
  core: { width: 52, height: 28, backgroundColor: '#C49060', borderRadius: 8 },
  legsRow: { flexDirection: 'row', marginTop: 2 },
  leg: { width: 36, height: 70, backgroundColor: '#C49060', borderRadius: 12 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11, color: '#333' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  muscleCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, elevation: 2 },
  muscleCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  muscleBar: { width: 4, height: 36, borderRadius: 2 },
  muscleName: { fontSize: 12, fontWeight: '600', color: '#1a1a2e' },
  progressBg: { backgroundColor: '#eee', borderRadius: 4, height: 4, width: 100, marginTop: 4 },
  progressFill: { borderRadius: 4, height: 4 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
});
