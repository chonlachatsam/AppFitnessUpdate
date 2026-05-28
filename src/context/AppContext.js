import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext();

const GOALS = {
  LOSE_WEIGHT: 'ลดน้ำหนัก',
  GAIN_MUSCLE: 'เพิ่มกล้ามเนื้อ',
  HEALTHY: 'ออกกำลังกายเพื่อสุขภาพ',
  GAIN_WEIGHT: 'เพิ่มน้ำหนัก',
};

const formatDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => {
  if (!dateKey) return new Date();
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const formatThaiDate = (dateKey) => {
  try {
    return parseDateKey(dateKey).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateKey;
  }
};

const roundNumber = (value) => Math.round((Number(value) || 0) * 10) / 10;

const getDefaultMealSlotByHour = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 19) return 'dinner';
  return 'snack';
};

const buildDailyNutrition = ({ dateKey, targetCalories = 0, userData, stats, nutritionTargets }) => ({
  date: dateKey,
  targetCalories: Number(targetCalories) || 0,
  consumedCalories: 0,
  remainingCalories: Number(targetCalories) || 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  entries: [],
  profileSnapshot: {
    weight: userData?.weight || '',
    height: userData?.height || '',
    age: userData?.age || '',
    goal: userData?.goal || '',
    bmi: stats?.bmi || 0,
    tdee: stats?.tdee || 0,
    proteinTarget: nutritionTargets?.proteinTarget || 0,
    carbsTarget: nutritionTargets?.carbsTarget || 0,
    fatTarget: nutritionTargets?.fatTarget || 0,
  },
  closedAt: null,
  lastUpdatedAt: new Date().toISOString(),
});

const hydrateDailyNutrition = (baseDay, userData, stats, nutritionTargets) => {
  const entries = [...(baseDay?.entries || [])];
  const consumedCalories = entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const protein = entries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const carbs = entries.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
  const fat = entries.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);
  const targetCalories = Number(baseDay?.targetCalories) || 0;

  return {
    ...baseDay,
    entries,
    targetCalories,
    consumedCalories,
    remainingCalories: targetCalories - consumedCalories,
    protein,
    carbs,
    fat,
    profileSnapshot: baseDay?.profileSnapshot || {
      weight: userData?.weight || '',
      height: userData?.height || '',
      age: userData?.age || '',
      goal: userData?.goal || '',
      bmi: stats?.bmi || 0,
      tdee: stats?.tdee || 0,
      proteinTarget: nutritionTargets?.proteinTarget || 0,
      carbsTarget: nutritionTargets?.carbsTarget || 0,
      fatTarget: nutritionTargets?.fatTarget || 0,
    },
    lastUpdatedAt: baseDay?.lastUpdatedAt || new Date().toISOString(),
  };
};

const finalizeDailyNutrition = (day, userData, stats, nutritionTargets) => {
  const hydrated = hydrateDailyNutrition(day, userData, stats, nutritionTargets);
  return {
    ...hydrated,
    closedAt: hydrated.closedAt || new Date().toISOString(),
    calorieBalance: hydrated.targetCalories - hydrated.consumedCalories,
  };
};

export const AppProvider = ({ children }) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [doneExercises, setDoneExercises] = useState({});
  const [schedule, setSchedule] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });

  const [userData, setUserData] = useState({
    name: 'Gym User',
    age: '',
    weight: '',
    height: '',
    goal: GOALS.LOSE_WEIGHT,
  });

  const [weightHistory, setWeightHistory] = useState([]);

  const [chatMessages, setChatMessages] = useState([{
    _id: 1,
    text: 'สวัสดีครับ ผมคือ AT AI Traine ส่วนตัวของคุณ\n\nแต่ก่อนอื่นรบกวนส่งข้อมูล นํ้าหนัก ส่วนสูง อายุ\n\nส่งรูปร่างมาให้วิเคราะห์ วางโปรแกรม และช่วยดูข้อมูลสุขภาพได้เลยครับ',
    createdAt: new Date(),
    user: { _id: 2, name: 'AI Trainer' },
  }]);

  const [calChatMessages, setCalChatMessages] = useState([{
    id: 1,
    text: 'สวัสดีค่า น้องแคลพร้อมช่วยจดแคลอรี่แล้ว ส่งรูปอาหารหรือพิมพ์ชื่อเมนูมาได้เลยนะ',
    sender: 'bot',
  }]);

  const [nutritionLog, setNutritionLog] = useState({});

  const stats = useMemo(() => {
    const w = parseFloat(userData.weight);
    const h = parseFloat(userData.height) / 100;
    const a = parseInt(userData.age, 10);
    let bmi = 0;
    let bmr = 0;
    let tdee = 0;

    if (w && h) bmi = Number((w / (h * h)).toFixed(1));

    if (w && h && a) {
      bmr = (10 * w) + (6.25 * (h * 100)) - (5 * a) - 161;
      tdee = Math.round(bmr * 1.2);

      if (userData.goal === GOALS.LOSE_WEIGHT) tdee -= 300;
      else if (userData.goal === GOALS.GAIN_MUSCLE) tdee += 300;
      else if (userData.goal === GOALS.GAIN_WEIGHT) tdee += 250;
    }

    return { bmi, tdee: tdee || 0, bmr: Math.round(bmr || 0) };
  }, [userData]);

  const nutritionTargets = useMemo(() => {
    const weight = parseFloat(userData.weight) || 0;
    const tdee = stats.tdee || 0;

    let proteinFactor = 1.6;
    if (userData.goal === GOALS.LOSE_WEIGHT) proteinFactor = 1.8;
    else if (userData.goal === GOALS.GAIN_MUSCLE) proteinFactor = 2.0;
    else if (userData.goal === GOALS.GAIN_WEIGHT) proteinFactor = 1.8;

    const proteinTarget = weight ? roundNumber(weight * proteinFactor) : 0;
    const fatTarget = weight ? roundNumber(weight * 0.8) : 0;
    const carbsTarget = tdee
      ? Math.max(roundNumber((tdee - (proteinTarget * 4) - (fatTarget * 9)) / 4), 0)
      : 0;

    return { proteinTarget, fatTarget, carbsTarget };
  }, [stats.tdee, userData.goal, userData.weight]);

  const buildProfileSnapshot = useCallback(() => ({
    weight: userData?.weight || '',
    height: userData?.height || '',
    age: userData?.age || '',
    goal: userData?.goal || '',
    bmi: stats?.bmi || 0,
    tdee: stats?.tdee || 0,
    proteinTarget: nutritionTargets?.proteinTarget || 0,
    carbsTarget: nutritionTargets?.carbsTarget || 0,
    fatTarget: nutritionTargets?.fatTarget || 0,
  }), [nutritionTargets, stats, userData]);

  const ensureNutritionDay = useCallback((dateKey, targetCalories = stats.tdee || 0, sourceLog = {}) => {
    const existing = sourceLog[dateKey];
    if (existing) {
      return hydrateDailyNutrition(existing, userData, stats, nutritionTargets);
    }

    return buildDailyNutrition({ dateKey, targetCalories, userData, stats, nutritionTargets });
  }, [nutritionTargets, stats, userData]);

  const syncNutritionTarget = useCallback((dateKey = formatDateKey()) => {
    setNutritionLog((prev) => {
      const currentDay = ensureNutritionDay(dateKey, stats.tdee || 0, prev);
      const targetCalories = stats.tdee || currentDay.targetCalories || 0;
      return {
        ...prev,
        [dateKey]: {
          ...currentDay,
          targetCalories,
          remainingCalories: targetCalories - (currentDay.consumedCalories || 0),
          profileSnapshot: buildProfileSnapshot(),
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
  }, [buildProfileSnapshot, ensureNutritionDay, stats.tdee]);

  useEffect(() => {
    const todayKey = formatDateKey();

    setNutritionLog((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach((dateKey) => {
        if (dateKey !== todayKey && next[dateKey] && !next[dateKey].closedAt) {
          next[dateKey] = finalizeDailyNutrition(next[dateKey], userData, stats, nutritionTargets);
          changed = true;
        }
      });

      const todayDay = ensureNutritionDay(todayKey, stats.tdee || 0, next);
      const targetCalories = stats.tdee || todayDay.targetCalories || 0;
      const nextToday = {
        ...todayDay,
        targetCalories,
        remainingCalories: targetCalories - (todayDay.consumedCalories || 0),
        profileSnapshot: buildProfileSnapshot(),
        closedAt: null,
        lastUpdatedAt: new Date().toISOString(),
      };

      const prevToday = prev[todayKey];
      const sameToday =
        prevToday &&
        prevToday.targetCalories === nextToday.targetCalories &&
        prevToday.remainingCalories === nextToday.remainingCalories &&
        prevToday.consumedCalories === nextToday.consumedCalories &&
        prevToday.protein === nextToday.protein &&
        prevToday.carbs === nextToday.carbs &&
        prevToday.fat === nextToday.fat &&
        prevToday.closedAt === nextToday.closedAt &&
        JSON.stringify(prevToday.profileSnapshot) === JSON.stringify(nextToday.profileSnapshot) &&
        JSON.stringify(prevToday.entries || []) === JSON.stringify(nextToday.entries || []);

      if (!sameToday) {
        next[todayKey] = nextToday;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [
    buildProfileSnapshot,
    ensureNutritionDay,
    nutritionTargets.carbsTarget,
    nutritionTargets.fatTarget,
    nutritionTargets.proteinTarget,
    stats.bmi,
    stats.tdee,
    userData.age,
    userData.goal,
    userData.height,
    userData.weight,
  ]);

  const recordWeight = (weight) => {
    const wNum = parseFloat(weight);
    const hNum = parseFloat(userData.height) / 100;
    const bmi = hNum > 0 ? (wNum / (hNum * hNum)).toFixed(1) : 0;

    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      week: currentWeek,
      weight: wNum,
      bmi: parseFloat(bmi),
    };

    setWeightHistory((prev) => [...prev, newRecord]);
    setUserData((prev) => ({ ...prev, weight: weight.toString() }));
  };

  const addToSchedule = (day, exercise) => {
    setSchedule((prev) => ({ ...prev, [day]: [...(prev[day] || []), exercise] }));
  };

  const removeFromSchedule = (day, exId) => {
    setSchedule((prev) => ({ ...prev, [day]: prev[day].filter((item) => item.exId !== exId) }));
  };

  const resetWeek = () => {
    setDoneExercises({});
    setCurrentWeek((prev) => prev + 1);
  };

  const addNutritionEntry = ({
    dateKey = formatDateKey(),
    name,
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    source = 'text',
    note = '',
    mealSlot,
  }) => {
    const entry = {
      id: Date.now().toString(),
      name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      source,
      note,
      mealSlot: mealSlot || getDefaultMealSlotByHour(new Date()),
      createdAt: new Date().toISOString(),
    };

    setNutritionLog((prev) => {
      const base = ensureNutritionDay(dateKey, stats.tdee || 0, prev);
      const entries = [...(base.entries || []), entry];
      const consumedCalories = entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      const totalProtein = entries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
      const totalCarbs = entries.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
      const totalFat = entries.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);
      const targetCalories = dateKey === formatDateKey() ? (stats.tdee || base.targetCalories || 0) : (base.targetCalories || 0);

      return {
        ...prev,
        [dateKey]: {
          ...base,
          date: dateKey,
          targetCalories,
          consumedCalories,
          remainingCalories: targetCalories - consumedCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          entries,
          profileSnapshot: buildProfileSnapshot(),
          closedAt: dateKey === formatDateKey() ? null : base.closedAt,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });

    return entry;
  };

  const updateLastNutritionEntry = ({
    dateKey = formatDateKey(),
    name,
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    note = '',
    mealSlot,
  }) => {
    let updatedEntry = null;

    setNutritionLog((prev) => {
      const base = ensureNutritionDay(dateKey, stats.tdee || 0, prev);
      const entries = [...(base.entries || [])];
      if (!entries.length) return prev;

      const lastEntry = entries[entries.length - 1];
      updatedEntry = {
        ...lastEntry,
        name: name || lastEntry.name,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        note: note || lastEntry.note || '',
        mealSlot: mealSlot || lastEntry.mealSlot || getDefaultMealSlotByHour(new Date()),
        updatedAt: new Date().toISOString(),
      };
      entries[entries.length - 1] = updatedEntry;

      const consumedCalories = entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      const totalProtein = entries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
      const totalCarbs = entries.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
      const totalFat = entries.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);
      const targetCalories = dateKey === formatDateKey() ? (stats.tdee || base.targetCalories || 0) : (base.targetCalories || 0);

      return {
        ...prev,
        [dateKey]: {
          ...base,
          date: dateKey,
          targetCalories,
          consumedCalories,
          remainingCalories: targetCalories - consumedCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          entries,
          profileSnapshot: buildProfileSnapshot(),
          closedAt: dateKey === formatDateKey() ? null : base.closedAt,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });

    return updatedEntry;
  };

  const getNutritionSummary = useCallback((dateKey = formatDateKey()) => {
    const base = ensureNutritionDay(dateKey, stats.tdee || 0, nutritionLog);
    const targetCalories = dateKey === formatDateKey() ? (stats.tdee || base.targetCalories || 0) : (base.targetCalories || 0);
    const proteinTarget = dateKey === formatDateKey() ? (nutritionTargets.proteinTarget || 0) : (base.profileSnapshot?.proteinTarget || 0);
    const carbsTarget = dateKey === formatDateKey() ? (nutritionTargets.carbsTarget || 0) : (base.profileSnapshot?.carbsTarget || 0);
    const fatTarget = dateKey === formatDateKey() ? (nutritionTargets.fatTarget || 0) : (base.profileSnapshot?.fatTarget || 0);

    return {
      ...base,
      date: dateKey,
      targetCalories,
      remainingCalories: targetCalories - (base.consumedCalories || 0),
      calorieBalance: targetCalories - (base.consumedCalories || 0),
      proteinTarget,
      carbsTarget,
      fatTarget,
      proteinRemaining: proteinTarget - (base.protein || 0),
      carbsRemaining: carbsTarget - (base.carbs || 0),
      fatRemaining: fatTarget - (base.fat || 0),
    };
  }, [ensureNutritionDay, nutritionLog, nutritionTargets, stats.tdee]);

  const getNutritionEntriesForDate = useCallback((dateKey = formatDateKey()) => {
    return [...(getNutritionSummary(dateKey).entries || [])];
  }, [getNutritionSummary]);

  const getMealSummary = useCallback((mealSlot, dateKey = formatDateKey()) => {
    const daySummary = getNutritionSummary(dateKey);
    const mealEntries = (daySummary.entries || []).filter((entry) => entry.mealSlot === mealSlot);
    const calories = mealEntries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const protein = mealEntries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    const carbs = mealEntries.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
    const fat = mealEntries.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

    return {
      mealSlot,
      date: dateKey,
      calories,
      protein: roundNumber(protein),
      carbs: roundNumber(carbs),
      fat: roundNumber(fat),
      entries: mealEntries,
    };
  }, [getNutritionSummary]);

  const nutritionHistory = useMemo(() => (
    Object.keys(nutritionLog)
      .sort((a, b) => b.localeCompare(a))
      .map((dateKey) => {
        const day = getNutritionSummary(dateKey);
        return {
          date: dateKey,
          displayDate: formatThaiDate(dateKey),
          targetCalories: day.targetCalories || 0,
          consumedCalories: day.consumedCalories || 0,
          calorieBalance: (day.targetCalories || 0) - (day.consumedCalories || 0),
          protein: roundNumber(day.protein),
          carbs: roundNumber(day.carbs),
          fat: roundNumber(day.fat),
          proteinTarget: day.proteinTarget || 0,
          carbsTarget: day.carbsTarget || 0,
          fatTarget: day.fatTarget || 0,
          entryCount: day.entries?.length || 0,
          profileSnapshot: day.profileSnapshot || null,
          closedAt: day.closedAt || null,
        };
      })
  ), [getNutritionSummary, nutritionLog]);

  const summarizeNutritionRange = useCallback((startDateKey, endDateKey) => {
    const rows = nutritionHistory.filter((item) => item.date >= startDateKey && item.date <= endDateKey);
    return rows.reduce((acc, item) => ({
      days: acc.days + 1,
      targetCalories: acc.targetCalories + (item.targetCalories || 0),
      consumedCalories: acc.consumedCalories + (item.consumedCalories || 0),
      calorieBalance: acc.calorieBalance + (item.calorieBalance || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
      entryCount: acc.entryCount + (item.entryCount || 0),
    }), {
      days: 0,
      targetCalories: 0,
      consumedCalories: 0,
      calorieBalance: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      entryCount: 0,
    });
  }, [nutritionHistory]);

  return (
    <AppContext.Provider value={{
      schedule, setSchedule, addToSchedule, removeFromSchedule,
      currentWeek, doneExercises, setDoneExercises, resetWeek,
      userData, setUserData,
      chatMessages, setChatMessages,
      calChatMessages, setCalChatMessages,
      stats,
      nutritionTargets,
      weightHistory, setWeightHistory, recordWeight,
      nutritionLog, setNutritionLog,
      nutritionHistory,
      addNutritionEntry,
      updateLastNutritionEntry,
      getNutritionSummary,
      getNutritionEntriesForDate,
      getMealSummary,
      syncNutritionTarget,
      summarizeNutritionRange,
      getTodayKey: formatDateKey,
      GOALS,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);