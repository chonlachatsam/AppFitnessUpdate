import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import 'react-native-gesture-handler';

import ChatTrainerScreen from '../src/screens/ChatTrainerScreen';
import ExerciseDetailScreen from '../src/screens/ExerciseDetailScreen';
import ExercisePickerScreen from '../src/screens/ExercisePickerScreen';
import HomeScreen from '../src/screens/HomeScreen';
import LoginScreen from '../src/screens/LoginScreen';
import MuscleMapScreen from '../src/screens/MuscleMapScreen';
import ProfileScreen from '../src/screens/ProfileScreen';
import ScheduleScreen from '../src/screens/ScheduleScreen';
import WorkoutSessionScreen from '../src/screens/WorkoutSessionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >

      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Home"           component={HomeScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="MuscleMap"      component={MuscleMapScreen} />
      <Stack.Screen name="Schedule"       component={ScheduleScreen} />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
      <Stack.Screen name="Profile"        component={ProfileScreen} />
      
      {/* หน้าจอ AI Trainer ที่เราเพิ่มเข้าไปใหม่ */}
      <Stack.Screen name="ChatTrainer"    component={ChatTrainerScreen} />
    </Stack.Navigator>
  );
}