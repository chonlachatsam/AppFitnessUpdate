import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler';

import { AppProvider } from './src/context/AppContext';

// Import หน้าจอทั้งหมด
import ChatTrainerScreen from './src/screens/ChatTrainerScreen';
import ChatWithCalScreen from './src/screens/ChatWithCalScreen'; // <--- เพิ่มบรรทัดนี้
import ExerciseDetailScreen from './src/screens/ExerciseDetailScreen';
import ExercisePickerScreen from './src/screens/ExercisePickerScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import MuscleMapScreen from './src/screens/MuscleMapScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import StatsScreen from './src/screens/StatsScreen';
import WorkoutSessionScreen from './src/screens/WorkoutSessionScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <AppProvider> 
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: '#0F1923' } 
          }}
        >
          {/* หน้า Login และ Register */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ 
                headerShown: true, 
                title: 'สมัครสมาชิก',
                headerStyle: { backgroundColor: '#0F1923', elevation: 0, shadowOpacity: 0 },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
            }} 
          />

          {/* หน้าอื่นๆ ในแอป */}
          <Stack.Screen name="Home"           component={HomeScreen} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
          <Stack.Screen name="MuscleMap"      component={MuscleMapScreen} />
          <Stack.Screen name="Schedule"       component={ScheduleScreen} />
          <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
          <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
          <Stack.Screen name="Profile"        component={ProfileScreen} />
          <Stack.Screen name="ChatTrainer"    component={ChatTrainerScreen} />
          <Stack.Screen name="Nutrition"      component={NutritionScreen} />
          <Stack.Screen name="Stats"          component={StatsScreen} />
          
          {/* หน้า ChatWithCal ที่เพิ่มเข้ามาใหม่ */}
          <Stack.Screen name="ChatWithCal"    component={ChatWithCalScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

registerRootComponent(App);