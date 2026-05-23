import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'; // เพิ่มการ Import
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 60;
const CHART_HEIGHT = 180;

export default function StatsScreen({ navigation }) {
  const { userData, stats, weightHistory, recordWeight, currentWeek } = useApp();
  const [inputWeight, setInputWeight] = useState('');

  const handleRecord = () => {
    if (!inputWeight || isNaN(parseFloat(inputWeight))) {
      Alert.alert("กรุณากรอกน้ำหนักให้ถูกต้องครับ");
      return;
    }
    recordWeight(inputWeight);
    setInputWeight('');
    Alert.alert("✅ บันทึกสำเร็จ!", `น้ำหนัก ${inputWeight} กก. บันทึกแล้วครับ`);
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return '#60A5FA';
    if (bmi < 23) return '#34D399';
    if (bmi < 25) return '#FBBF24';
    return '#E63946';
  };

  const getBMILabel = (bmi) => {
    if (bmi < 18.5) return 'ผอมเกินไป';
    if (bmi < 23) return 'ปกติ';
    if (bmi < 25) return 'น้ำหนักเกิน';
    return 'อ้วน';
  };

  const renderWeightChart = () => {
    if (weightHistory.length < 2) return null;
    const weights = weightHistory.map(r => r.weight);
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const range = maxW - minW;
    const points = weightHistory.map((r, i) => ({
      x: (i / (weightHistory.length - 1)) * CHART_WIDTH,
      y: CHART_HEIGHT - ((r.weight - minW) / range) * CHART_HEIGHT,
      ...r,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>กราฟน้ำหนัก</Text>
        <View style={{ height: CHART_HEIGHT + 30, position: 'relative' }}>
          {/* เปลี่ยนจาก svg เป็น Svg ตัวใหญ่ */}
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={{ overflow: 'visible' }}>
            <Path d={pathD} stroke="#E63946" strokeWidth="2.5" fill="none" />
            {points.map((p, i) => (
              <G key={i}>
                <Circle cx={p.x} cy={p.y} r="5" fill="#E63946" />
                <SvgText x={p.x} y={p.y - 10} textAnchor="middle" fill="#fff" fontSize="10">{p.weight}</SvgText>
              </G>
            ))}
          </Svg>
          <View style={styles.chartLabels}>
            {weightHistory.map((r, i) => (
              <Text key={i} style={styles.chartLabel}>{r.date}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const weightChange = weightHistory.length >= 2
    ? (weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สถิติและความก้าวหน้า</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>น้ำหนักปัจจุบัน</Text>
            <Text style={styles.statValue}>{userData.weight || '-'}</Text>
            <Text style={styles.statUnit}>กก.</Text>
          </View>
          <View style={[styles.statCard, { borderColor: getBMIColor(stats.bmi) }]}>
            <Text style={styles.statLabel}>BMI</Text>
            <Text style={[styles.statValue, { color: getBMIColor(stats.bmi) }]}>{stats.bmi || '-'}</Text>
            <Text style={[styles.statUnit, { color: getBMIColor(stats.bmi) }]}>{stats.bmi ? getBMILabel(stats.bmi) : ''}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TDEE</Text>
            <Text style={styles.statValue}>{stats.tdee || '-'}</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>
        </View>

        {weightChange !== null && (
          <View style={[styles.changeCard, { borderColor: parseFloat(weightChange) < 0 ? '#34D399' : '#E63946' }]}>
            <Text style={styles.changeLabel}>การเปลี่ยนแปลงน้ำหนักทั้งหมด</Text>
            <Text style={[styles.changeValue, { color: parseFloat(weightChange) < 0 ? '#34D399' : '#E63946' }]}>
              {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} กก.
            </Text>
            <Text style={styles.changeSub}>
              {parseFloat(weightChange) < 0 ? '🎉 ลดได้แล้ว!' : parseFloat(weightChange) > 0 ? '📈 เพิ่มขึ้น' : '➡️ คงที่'}
            </Text>
          </View>
        )}

        {weightHistory.length >= 2 ? renderWeightChart() : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>📊 บันทึกน้ำหนักอย่างน้อย 2 ครั้ง เพื่อดูกราฟครับ</Text>
          </View>
        )}

        <View style={styles.recordCard}>
          <Text style={styles.recordTitle}>⚖️ บันทึกน้ำหนักวันนี้</Text>
          <View style={styles.recordRow}>
            <TextInput
              style={styles.recordInput}
              value={inputWeight}
              onChangeText={setInputWeight}
              placeholder="เช่น 65.5"
              placeholderTextColor="#5a7090"
              keyboardType="numeric"
            />
            <Text style={styles.recordUnit}>กก.</Text>
            <TouchableOpacity style={styles.recordBtn} onPress={handleRecord}>
              <Text style={styles.recordBtnText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>

        {weightHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ประวัติการบันทึก</Text>
            {[...weightHistory].reverse().map((record, index) => (
              <View key={record.id} style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyDate}>{record.date} • สัปดาห์ที่ {record.week}</Text>
                  <View style={styles.historyValues}>
                    <Text style={styles.historyWeight}>{record.weight} กก.</Text>
                    <Text style={[styles.historyBMI, { color: getBMIColor(record.bmi) }]}>BMI {record.bmi}</Text>
                    <Text style={[styles.historyBMILabel, { color: getBMIColor(record.bmi) }]}>{getBMILabel(record.bmi)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.weekCard}>
          <Text style={styles.weekLabel}>สัปดาห์ปัจจุบัน</Text>
          <Text style={styles.weekValue}>สัปดาห์ที่ {currentWeek}</Text>
          <Text style={styles.weekGoal}>เป้าหมาย: {userData.goal || 'ยังไม่ระบุ'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 10, marginBottom: 15 },
  statCard: { flex: 1, backgroundColor: '#1A2535', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3a4a' },
  statLabel: { color: '#5a7090', fontSize: 10, fontWeight: '700', marginBottom: 6 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  statUnit: { color: '#5a7090', fontSize: 11, marginTop: 2 },
  changeCard: { marginHorizontal: 20, backgroundColor: '#1A2535', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, marginBottom: 15 },
  changeLabel: { color: '#5a7090', fontSize: 12, marginBottom: 6 },
  changeValue: { fontSize: 32, fontWeight: '900' },
  changeSub: { color: '#fff', fontSize: 14, marginTop: 4 },
  emptyChart: { marginHorizontal: 20, backgroundColor: '#1A2535', borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 15 },
  emptyChartText: { color: '#5a7090', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  chartContainer: { marginHorizontal: 20, backgroundColor: '#1A2535', borderRadius: 16, padding: 15, marginBottom: 15 },
  chartTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  chartLabel: { color: '#5a7090', fontSize: 9 },
  recordCard: { marginHorizontal: 20, backgroundColor: '#1A2535', borderRadius: 16, padding: 16, marginBottom: 15 },
  recordTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordInput: { flex: 1, backgroundColor: '#0F1923', borderRadius: 12, padding: 12, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: '#2a3a4a' },
  recordUnit: { color: '#5a7090', fontSize: 14 },
  recordBtn: { backgroundColor: '#E63946', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13 },
  recordBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  section: { paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { color: '#5a7090', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2535', borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E63946' },
  historyDate: { color: '#5a7090', fontSize: 11, marginBottom: 4 },
  historyValues: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyWeight: { color: '#fff', fontSize: 15, fontWeight: '800' },
  historyBMI: { fontSize: 13, fontWeight: '700' },
  historyBMILabel: { fontSize: 11 },
  weekCard: { marginHorizontal: 20, backgroundColor: '#1A2535', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a3a4a' },
  weekLabel: { color: '#5a7090', fontSize: 12, fontWeight: '700' },
  weekValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: 5 },
  weekGoal: { color: '#E63946', fontSize: 13, fontWeight: '600' },
});