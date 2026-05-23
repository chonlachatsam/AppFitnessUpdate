import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MainBottomNav({ navigation, activeRoute }) {
  const menuItems = [
    { name: 'Home', label: 'หน้าหลัก', icon: 'home', iconType: 'Ionicons' },
    { name: 'ExercisePicker', label: 'ออกกำลัง', icon: 'dumbbell', iconType: 'MaterialCommunityIcons' },
    { name: 'Schedule', label: 'ตาราง', icon: 'calendar', iconType: 'Ionicons' },
    { name: 'Profile', label: 'โปรไฟล์', icon: 'person', iconType: 'Ionicons' },
  ];

  return (
    <View style={styles.bnav}>
      {menuItems.map((item) => {
        const isActive = activeRoute === item.name;
        const IconComponent = item.iconType === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

        return (
          <TouchableOpacity 
            key={item.name}
            style={styles.bnavitem} 
            onPress={() => navigation.navigate(item.name)}
          >
            <IconComponent 
              name={isActive ? item.icon : `${item.icon}-outline`} 
              size={24} 
              color={isActive ? "#E63946" : "#5a7090"} 
            />
            <Text style={[styles.bnavtext, isActive && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bnav: { 
    flexDirection: 'row', 
    height: 85, 
    backgroundColor: '#0F1923', 
    borderTopWidth: 1, 
    borderTopColor: '#1A2535', 
    alignItems: 'center', 
    paddingBottom: 20 
  },
  bnavitem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bnavtext: { fontSize: 10, color: '#5a7090', marginTop: 4, fontWeight: '600' },
  activeText: { color: '#E63946', fontWeight: '800' }
});