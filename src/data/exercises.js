// แก้ไข Path ให้ถอยออกจาก src/data ไปยัง assets/images/gifs
const defaultGif = require('../../assets/images/gifs/c1.gif'); 

export const MUSCLES = [
  { id: 'chest', label: 'หน้าอก', color: '#E63946' },
  { id: 'back', label: 'หลัง', color: '#457B9D' },
  { id: 'arms_front', label: 'หน้าแขน', color: '#FFB703' },
  { id: 'arms_back', label: 'หลังแขน', color: '#8E9AAF' },
  { id: 'legs', label: 'ขา', color: '#2A9D8F' },
  { id: 'abs', label: 'หน้าท้อง', color: '#F4A261' },
  { id: 'shoulders', label: 'ไหล่', color: '#8B5CF6' },
];

export const EXERCISES = {
  chest: [
    { id: 'c1', title: 'Bench Press', sets: 4, reps: 10, muscleDetail: 'อกส่วนกลาง', gif: require('../../assets/images/gifs/bench-press.gif') },
    { id: 'c2', title: 'Dumbbell Press', sets: 3, reps: 12, muscleDetail: 'อกส่วนบน', gif: require('../../assets/images/gifs/Incline-Dumbbell-Press.gif') },
    { id: 'c3', title: 'Dumbbell Fly', sets: 3, reps: 15, muscleDetail: 'อกส่วนกลาง', gif: require('../../assets/images/gifs/Incline-dumbbell-Fly.gif') },
    { id: 'c4', title: 'Dumbbell Pullover', sets: 3, reps: 20, muscleDetail: 'อกโดยรวม', gif: require('../../assets/images/gifs/Dumbbell-Pullover.gif') },
    { id: 'c5', title: 'Chest Dip', sets: 3, reps: 12, muscleDetail: 'อกส่วนล่าง', gif: require('../../assets/images/gifs/Chest-Dips.gif') },
  ],
  back: [
    { id: 'b1', title: 'Bent Over Dumbbell Row', sets: 4, reps: 8, muscleDetail: 'หลังบนและปีก', gif: require('../../assets/images/gifs/Bent-Over-Dumbbell-Row.gif') },
    { id: 'b2', title: 'Lat Pulldown', sets: 4, reps: 12, muscleDetail: 'ปีก', gif: require('../../assets/images/gifs/Lat-Pulldown.gif') },
    { id: 'b3', title: 'Seated Cable Row', sets: 3, reps: 12, muscleDetail: 'หลังส่วนกลาง', gif: require('../../assets/images/gifs/Seated-Cable-Row.gif') },
    { id: 'b4', title: 'Rear-Delt-Machine-Flys', sets: 3, reps: 8, muscleDetail: 'หลังส่วนล่าง', gif: require('../../assets/images/gifs/Rear-Delt-Machine-Flys.gif') },
    { id: 'b5', title: 'Hyperextension', sets: 3, reps: 12, muscleDetail: 'หลังส่วนกลาง', gif: require('../../assets/images/gifs/hyperextension.gif') },
  ],
  arms_front: [
    { id: 'af1', title: 'Z-Bar Curl', sets: 4, reps: 12, muscleDetail: 'หน้าแขน', gif: require('../../assets/images/gifs/Z-Bar-Curl.gif') },
    { id: 'af2', title: 'Seated Incline Dumbbell Curl', sets: 3, reps: 12, muscleDetail: 'หน้าแขนด้านนอก', gif: require('../../assets/images/gifs/Seated-Incline-Dumbbell-Curl.gif') },
    { id: 'af3', title: 'Dumbbell Preacher Curl', sets: 3, reps: 10, muscleDetail: 'หน้าแขนส่วนล่าง', gif: require('../../assets/images/gifs/Dumbbell-Preacher-Curl.gif') },
    { id: 'af4', title: 'Hammer Curl', sets: 3, reps: 12, muscleDetail: 'ยอดหน้าแขน', gif: require('../../assets/images/gifs/Hammer-Curl.gif') },
  ],
  arms_back: [
    { id: 'ab1', title: 'Tricep Dips', sets: 4, reps: 12, muscleDetail: 'หลังแขน', gif: require('../../assets/images/gifs/Triceps-Dips.gif') },
    { id: 'ab2', title: 'Push Down', sets: 3, reps: 10, muscleDetail: 'หลังแขนยาว', gif: require('../../assets/images/gifs/Pushdown.gif') },
    { id: 'ab3', title: 'Dumbbell Kickback', sets: 3, reps: 15, muscleDetail: 'หลังแขนโดยรวม', gif: require('../../assets/images/gifs/Dumbbell-Kickback.gif') },
    { id: 'ab4', title: 'One-Arm Reverse Pushdown', sets: 3, reps: 12, muscleDetail: 'หลังแขนด้านใน', gif: require('../../assets/images/gifs/One-Arm-Reverse-Push-Down.gif') },
  ],
  legs: [
    { id: 'l1', title: 'Dumbbell Bulgarian Split Squat', sets: 4, reps: 12, muscleDetail: 'ขาโดยรวม', gif: require('../../assets/images/gifs/Dumbbell-Bulgarian-Split-Squat.gif') },
    { id: 'l2', title: 'Hack Squat Calf Raise', sets: 4, reps: 10, muscleDetail: 'หน้าขา', gif: require('../../assets/images/gifs/Hack-Squat-Calf-Raise.gif') },
    { id: 'l3', title: 'Leg Extension', sets: 3, reps: 15, muscleDetail: 'หน้าขา', gif: require('../../assets/images/gifs/LEG-EXTENSION.gif') },
    { id: 'l4', title: 'Barbell Squat', sets: 3, reps: 15, muscleDetail: 'หลังขา', gif: require('../../assets/images/gifs/BARBELL-SQUAT.gif') },
    { id: 'l5', title: 'Sumo Deadlift', sets: 4, reps: 20, muscleDetail: 'น่อง', gif: require('../../assets/images/gifs/Barbell-Sumo-Deadlift.gif') },
  ],
  abs: [
    { id: 'as1', title: 'Heel Touch', sets: 4, reps: 20, muscleDetail: 'ท้องส่วนบน', gif: require('../../assets/images/gifs/Heel-Touch.gif') },
    { id: 'as2', title: 'Russian Twist', sets: 4, reps: 15, muscleDetail: 'ท้องส่วนล่าง', gif: require('../../assets/images/gifs/Russian-Twist.gif') },
    { id: 'as3', title: 'Plank Knee To Elbow', sets: 3, reps: 60, muscleDetail: 'แกนกลางลำตัว', gif: require('../../assets/images/gifs/PLANK-KNEE-TO-ELBOW.gif') },
    { id: 'as4', title: 'Bicycle Crunch', sets: 3, reps: 20, muscleDetail: 'ท้องด้านข้าง', gif: require('../../assets/images/gifs/Bicycle-Crunch.gif') },
    { id: 'as5', title: 'Half Wipers', sets: 3, reps: 30, muscleDetail: 'ท้องโดยรวม', gif: require('../../assets/images/gifs/Half-Wipers.gif') },
  ],
  shoulders: [
    { id: 's1', title: 'Arnold Press', sets: 4, reps: 10, muscleDetail: 'ไหล่ส่วนหน้าและไหล่ข้าง', gif: require('../../assets/images/gifs/Arnold-Press.gif') },
    { id: 's2', title: 'Seated Rear Lateral Dumbbell Raise', sets: 4, reps: 12, muscleDetail: 'ไหล่ส่วนหลัง', gif: require('../../assets/images/gifs/Seated-Rear-Lateral-Dumbbell-Raise.gif') },
    { id: 's3', title: 'Standing Dumbbell Overhead Press', sets: 4, reps: 10, muscleDetail: 'ไหล่ส่วนหน้า', gif: require('../../assets/images/gifs/Standing-Dumbbell-Overhead-Press.gif') },
    { id: 's4', title: 'Dumbbell Lateral Raise', sets: 4, reps: 12, muscleDetail: 'ไหล่ส่วนข้าง', gif: require('../../assets/images/gifs/Dumbbell-Lateral-Raise.gif') },
    { id: 's5', title: 'Two-Arm Dumbbell Front Raise', sets: 4, reps: 12, muscleDetail: 'ไหล่ส่วนหน้า', gif: require('../../assets/images/gifs/Two-Arm-Dumbbell-Front-Raise.gif') },
    { id: 's6', title: 'Alternating Dumbbell Front Raise', sets: 4, reps: 12, muscleDetail: 'ไหล่ส่วนหน้า', gif: require('../../assets/images/gifs/Alternating-Dumbbell-Front-Raise.gif') },
    { id: 's7', title: 'Dumbbell 4-Ways Lateral Raise', sets: 3, reps: 10, muscleDetail: 'ไหล่รวมทุกส่วน', gif: require('../../assets/images/gifs/Dumbbell-4-Ways-Lateral-Raise.gif') },
  ],
};

// --- ฟังก์ชันช่วยเหลือที่แอปต้องการ --- 

// ค้นหาข้อมูลกลุ่มกล้ามเนื้อจาก ID
export const getMuscleById = (id) => {
  return MUSCLES.find(m => m.id === id);
};

// ค้นหาท่าฝึกทั้งหมดในกลุ่มกล้ามเนื้อนั้นๆ
export const getExercisesByMuscle = (muscleId) => {
  return EXERCISES[muscleId] || [];
};

// ค้นหาข้อมูลท่าฝึกรายตัวจาก ID (สำคัญมากสำหรับหน้า Schedule และ Detail)
export const getExerciseById = (exId) => {
  for (const muscleGroup in EXERCISES) {
    const found = EXERCISES[muscleGroup].find(e => e.id === exId);
    if (found) return found;
  }
  return null;
};