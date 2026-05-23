import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

const quickActions = [
  {
    key: 'trainer',
    label: 'ปรึกษา AI Trainer',
    icon: <Ionicons name="chatbubble-ellipses" size={22} color={colors.white} />,
    borderColor: colors.primary,
    onPress: 'ChatTrainer',
  },
  {
    key: 'nutrition',
    label: 'แผนโภชนาการ AI',
    icon: <Ionicons name="nutrition" size={22} color={colors.white} />,
    borderColor: colors.teal,
    onPress: 'Nutrition',
  },
  {
    key: 'stats',
    label: 'สถิติและความก้าวหน้า',
    icon: <Ionicons name="stats-chart" size={22} color={colors.white} />,
    borderColor: colors.purple,
    onPress: 'Stats',
  },
  {
    key: 'cal',
    label: 'แชทกับน้องแคล (AI)',
    icon: <MaterialCommunityIcons name="face-woman" size={22} color={colors.white} />,
    borderColor: '#FF85A1',
    onPress: 'ChatWithCal',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AT TRAINING</Text>
          </View>

          <Text style={styles.welcomeText}>ยินดีต้อนรับ</Text>
          <Text style={styles.subText}>พร้อมสำหรับการฝึกวันนี้แล้วหรือยัง?</Text>

          <TouchableOpacity
            style={styles.bigButton}
            onPress={() => navigation.navigate('ExercisePicker')}
            activeOpacity={0.9}
          >
            <View style={styles.bigButtonIcon}>
              <MaterialCommunityIcons name="dumbbell" size={18} color={colors.white} />
            </View>
            <Text style={styles.bigButtonText}>ไปที่หน้าออกกำลังกาย</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>เครื่องมือแนะนำ</Text>
          <Text style={styles.sectionSubtext}>เลือกใช้งานได้ทันที</Text>
        </View>

        <View style={styles.actionsList}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.actionButton, { borderColor: item.borderColor }]}
              onPress={() => navigation.navigate(item.onPress)}
              activeOpacity={0.88}
            >
              <View style={[styles.actionIconWrap, { borderColor: item.borderColor }]}>
                {item.icon}
              </View>
              <Text style={styles.actionButtonText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  heroGlowTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(230,57,70,0.10)',
  },

  heroGlowBottom: {
    position: 'absolute',
    bottom: 140,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(16,185,129,0.07)',
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 14,
  },

  heroSection: {
    paddingTop: 22,
    paddingBottom: 28,
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: '#142131',
    borderWidth: 1,
    borderColor: '#243244',
    marginBottom: 24,
  },

  badgeText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  welcomeText: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
  },

  subText: {
    fontSize: 15,
    color: colors.textGray,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },

  bigButton: {
    marginTop: 28,
    minHeight: 58,
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  bigButtonIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  bigButtonText: {
    color: colors.white,
    fontSize: fonts.large,
    fontWeight: '800',
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtext: {
    color: colors.textGray,
    fontSize: 13,
    marginTop: 4,
  },

  actionsList: {
    gap: 14,
  },

  actionButton: {
    minHeight: 68,
    backgroundColor: '#182334',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#223148',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  actionButtonText: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  bnav: {
    flexDirection: 'row',
    backgroundColor: colors.navBg,
    height: 85,
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  bnavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bnavLabel: {
    fontSize: 10,
    color: colors.textGray,
    fontWeight: '700',
    marginTop: 4,
  },

  bnavLabelActive: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '800',
    marginTop: 4,
  },
});