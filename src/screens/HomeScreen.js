import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { getExerciseById } from '../data/exercises';
import { colors, fonts, radius } from '../theme';

const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

const quickActions = [
  {
    key: 'trainer',
    label: 'ปรึกษา AI Trainer',
    subtitle: 'จัดโปรแกรมและถามเรื่องการฝึกได้ทันที',
    icon: 'chatbubble-ellipses',
    iconSet: 'ion',
    borderColor: colors.primary,
    screen: 'ChatTrainer',
  },
  {
    key: 'nutrition',
    label: 'คำนวณแผนโภชนาการ',
    subtitle: 'วางแผนอาหารและคุมแคลอรี่ให้เหมาะกับเป้าหมาย',
    icon: 'nutrition',
    iconSet: 'ion',
    borderColor: colors.teal,
    screen: 'Nutrition',
  },
  {
    key: 'stats',
    label: 'สถิติและความก้าวหน้า',
    subtitle: 'ติดตามน้ำหนัก วินัยการฝึก และผลลัพธ์ของคุณ',
    icon: 'stats-chart',
    iconSet: 'ion',
    borderColor: colors.purple,
    screen: 'Stats',
  },
  {
    key: 'cal',
    label: 'แชทกับน้องแคล',
    subtitle: 'ส่งรูปอาหารเพื่อประเมินแคลอรี่และสารอาหาร',
    icon: 'face-woman',
    iconSet: 'material',
    borderColor: '#FF85A1',
    screen: 'ChatWithCal',
  },
];

const getCurrentDayNumber = () => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const getGoalLabel = (goal) => {
  if (!goal) return 'ยังไม่ได้ตั้งเป้าหมาย';
  return goal;
};

export default function HomeScreen({ navigation }) {
  const { schedule, doneExercises, currentWeek, userData, stats, weightHistory } = useApp();

  const todayNumber = getCurrentDayNumber();
  const todaySchedule = schedule?.[todayNumber];
  const todayExercises = Array.isArray(todaySchedule) ? todaySchedule : [];
  const isRestDay = todaySchedule === 'rest';

  const nonRestDays = [1, 2, 3, 4, 5, 6, 7].filter((day) => Array.isArray(schedule?.[day]) && schedule[day].length > 0);
  const doneDays = nonRestDays.filter((day) => schedule[day].every((item) => doneExercises?.[day]?.[item.exId]));
  const weekPct = nonRestDays.length > 0 ? Math.round((doneDays.length / nonRestDays.length) * 100) : 0;

  const completedToday = todayExercises.filter((item) => doneExercises?.[todayNumber]?.[item.exId]).length;
  const todayProgress = todayExercises.length > 0 ? Math.round((completedToday / todayExercises.length) * 100) : 0;

  const todayPreview = todayExercises
    .slice(0, 3)
    .map((item) => getExerciseById(item.exId)?.title)
    .filter(Boolean);

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const heroName = userData?.name && userData.name !== 'Gym User' ? userData.name : 'นักสู้ฟิตเนส';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>WEEK {currentWeek}</Text>
          </View>

          <Text style={styles.greeting}>สวัสดี {heroName}</Text>
          <Text style={styles.welcomeText}>วันนี้พร้อมลุยต่อแล้ว</Text>
          <Text style={styles.subText}>
            {isRestDay
              ? `วันนี้วัน${dayNames[new Date().getDay()]} เป็นวันพัก ฟื้นตัวให้เต็มที่แล้วค่อยกลับมาลุยต่อ`
              : todayExercises.length > 0
                ? `วันนี้วัน${dayNames[new Date().getDay()]} มีโปรแกรม ${todayExercises.length} ท่า รอคุณอยู่`
                : `วันนี้วัน${dayNames[new Date().getDay()]} ยังไม่ได้วางโปรแกรม เพิ่มแผนฝึกได้เลย`}
          </Text>

          <TouchableOpacity
            style={styles.bigButton}
            onPress={() => navigation.navigate(todayExercises.length > 0 || isRestDay ? 'Schedule' : 'ExercisePicker')}
            activeOpacity={0.9}
          >
            <View style={styles.bigButtonIcon}>
              <MaterialCommunityIcons
                name={todayExercises.length > 0 || isRestDay ? 'calendar-check' : 'dumbbell'}
                size={18}
                color={colors.white}
              />
            </View>
            <Text style={styles.bigButtonText}>
              {todayExercises.length > 0 || isRestDay ? 'ดูโปรแกรมวันนี้' : 'เริ่มวางแผนการฝึก'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryCardWide]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryEyebrow}>TODAY</Text>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>Day {todayNumber}</Text>
              </View>
            </View>

            <Text style={styles.summaryTitle}>โปรแกรมวันนี้</Text>

            {isRestDay ? (
              <Text style={styles.summaryBody}>วันนี้เป็นวันพักของคุณ พักให้ดีแล้วค่อยกลับมาทำต่อในวันถัดไป</Text>
            ) : todayExercises.length > 0 ? (
              <>
                <Text style={styles.summaryBody}>ทำแล้ว {completedToday}/{todayExercises.length} ท่า</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${todayProgress}%` }]} />
                </View>
                <Text style={styles.summaryList}>
                  {todayPreview.join(' • ')}
                  {todayExercises.length > 3 ? ' • ...' : ''}
                </Text>
              </>
            ) : (
              <Text style={styles.summaryBody}>ยังไม่มีตารางฝึกสำหรับวันนี้ ลองให้ AI ช่วยจัดโปรแกรมหรือเพิ่มเองก็ได้</Text>
            )}
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>BMI</Text>
              <Text style={styles.metricValue}>{stats?.bmi || '--'}</Text>
              <Text style={styles.metricHint}>สมดุลร่างกาย</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TDEE</Text>
              <Text style={styles.metricValue}>{stats?.tdee || '--'}</Text>
              <Text style={styles.metricHint}>kcal / วัน</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.metricCard, styles.progressCard]}>
              <Text style={styles.metricLabel}>Progress</Text>
              <Text style={styles.metricValue}>{weekPct}%</Text>
              <Text style={styles.metricHint}>สำเร็จ {doneDays.length}/{nonRestDays.length || 0} วัน</Text>
            </View>

            <View style={[styles.metricCard, styles.weightCard]}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>{latestWeight ? `${latestWeight.weight}` : userData?.weight || '--'}</Text>
              <Text style={styles.metricHint}>{latestWeight ? latestWeight.date : 'ยังไม่มีประวัติ'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalIconWrap}>
            <Ionicons name="flame" size={18} color={colors.white} />
          </View>
          <View style={styles.goalTextWrap}>
            <Text style={styles.goalLabel}>เป้าหมายตอนนี้</Text>
            <Text style={styles.goalValue}>{getGoalLabel(userData?.goal)}</Text>
          </View>
          <TouchableOpacity style={styles.goalAction} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.goalActionText}>แก้ไข</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>เครื่องมือแนะนำ</Text>
          <Text style={styles.sectionSubtext}>เลือกเครื่องมือที่เหมาะกับการดูแลตัวเองวันนี้</Text>
        </View>

        <View style={styles.actionsList}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.actionButton}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.88}
            >
              <View style={[styles.actionAccent, { backgroundColor: item.borderColor }]} />
              <View style={[styles.actionIconWrap, { borderColor: item.borderColor }]}>
                {item.iconSet === 'material' ? (
                  <MaterialCommunityIcons name={item.icon} size={22} color={colors.white} />
                ) : (
                  <Ionicons name={item.icon} size={22} color={colors.white} />
                )}
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionButtonText}>{item.label}</Text>
                <Text style={styles.actionButtonSubtext}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bnav}>
        <TouchableOpacity style={styles.bnavItem}>
          <Ionicons name="home" size={24} color={colors.primary} />
          <Text style={styles.bnavLabelActive}>หน้าหลัก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnavItem} onPress={() => navigation.navigate('ExercisePicker')}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={colors.textGray} />
          <Text style={styles.bnavLabel}>ออกกำลัง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnavItem} onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="calendar-outline" size={24} color={colors.textGray} />
          <Text style={styles.bnavLabel}>ตาราง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bnavItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color={colors.textGray} />
          <Text style={styles.bnavLabel}>โปรไฟล์</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroGlowTop: { position: 'absolute', top: -90, right: -50, width: 220, height: 220, borderRadius: 220, backgroundColor: 'rgba(230,57,70,0.11)' },
  heroGlowBottom: { position: 'absolute', top: 230, left: -70, width: 200, height: 200, borderRadius: 200, backgroundColor: 'rgba(16,185,129,0.09)' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 108 },
  heroCard: {
    backgroundColor: '#121E2D', borderRadius: 30, borderWidth: 1, borderColor: '#243244', padding: 22, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 7,
  },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.round, backgroundColor: '#1B2A3E', borderWidth: 1, borderColor: '#2D4058', marginBottom: 18 },
  heroBadgeText: { color: colors.textLight, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  greeting: { color: '#9CB0C8', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  welcomeText: { fontSize: 31, lineHeight: 36, fontWeight: '800', color: colors.white },
  subText: { fontSize: 14, color: colors.textGray, marginTop: 10, lineHeight: 22 },
  bigButton: { marginTop: 24, minHeight: 56, backgroundColor: colors.primary, borderRadius: radius.round, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bigButtonIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  bigButtonText: { color: colors.white, fontSize: fonts.large, fontWeight: '800' },
  summaryGrid: { gap: 12, marginBottom: 16 },
  summaryCard: { backgroundColor: '#172233', borderRadius: 24, borderWidth: 1, borderColor: '#233247', padding: 18 },
  summaryCardWide: { minHeight: 154 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  summaryEyebrow: { color: '#7E93AC', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  summaryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.round, backgroundColor: '#101925' },
  summaryBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  summaryTitle: { color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  summaryBody: { color: '#AAB8CB', fontSize: 14, lineHeight: 21 },
  progressTrack: { marginTop: 12, marginBottom: 12, height: 9, borderRadius: 9, backgroundColor: '#0E1621', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 9, backgroundColor: colors.greenLight },
  summaryList: { color: colors.white, fontSize: 13, lineHeight: 20 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  metricCard: { flex: 1, backgroundColor: '#172233', borderRadius: 22, borderWidth: 1, borderColor: '#233247', padding: 16, minHeight: 110 },
  progressCard: { borderColor: 'rgba(34,197,94,0.28)' },
  weightCard: { borderColor: 'rgba(230,57,70,0.28)' },
  metricLabel: { color: '#7E93AC', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  metricValue: { color: colors.white, fontSize: 28, fontWeight: '800' },
  metricHint: { color: colors.textGray, fontSize: 12, marginTop: 6 },
  goalCard: { backgroundColor: '#1A2535', borderRadius: 24, borderWidth: 1, borderColor: '#243244', padding: 16, marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  goalIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  goalTextWrap: { flex: 1 },
  goalLabel: { color: colors.textGray, fontSize: 12, marginBottom: 4 },
  goalValue: { color: colors.white, fontSize: 16, fontWeight: '800' },
  goalAction: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.round, backgroundColor: '#101925' },
  goalActionText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  sectionSubtext: { color: colors.textGray, fontSize: 13, marginTop: 4 },
  actionsList: { gap: 14 },
  actionButton: {
    minHeight: 94, backgroundColor: '#182435', borderRadius: 28, borderWidth: 1, borderColor: '#24384c', paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.16,
    shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5,
  },
  actionAccent: { position: 'absolute', left: 0, top: 16, bottom: 16, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  actionIconWrap: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#223148', borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  actionTextWrap: { flex: 1, paddingRight: 12 },
  actionButtonText: { color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  actionButtonSubtext: { color: '#8da0b8', fontSize: 12, lineHeight: 18 },
  bnav: { flexDirection: 'row', backgroundColor: colors.navBg, height: 82, alignItems: 'center', justifyContent: 'space-around', position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 8, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.border },
  bnavItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bnavLabel: { fontSize: 10, color: colors.textGray, fontWeight: '700', marginTop: 4 },
  bnavLabelActive: { fontSize: 10, color: colors.primary, fontWeight: '800', marginTop: 4 },
});
