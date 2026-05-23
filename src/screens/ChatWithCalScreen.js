import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_KEY = "AIzaSyAwxpDvt7S2U0WcB1g6eZKWd4KPHpXjB-o";

export default function ChatWithCalScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "สวัสดีค่า! น้องแคลพร้อมช่วยจดแคลอรี่แล้ว วันนี้ทานอะไรไป ส่งรูปหรือบอกน้องได้เลยนะ ✨", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const sendMessage = async (text, base64Image = null) => {
    if (!text && !base64Image) return;

    const newUserMsg = { id: Date.now(), text: text || "ส่งรูปภาพให้วิเคราะห์...", sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setLoading(true);

    try {
      const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      const body = {
        contents: [{
          parts: [
            { text: text || "ช่วยวิเคราะห์แคลอรี่จากรูปนี้หน่อยจ้า ตอบแบบเป็นกันเองเหมือนคุยในไลน์" },
            ...(base64Image ? [{ inline_data: { mime_type: "image/jpeg", data: base64Image } }] : [])
          ]
        }]
      };

      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'bot' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "ขอโทษทีจ้า น้องแคลมึนหัวนิดหน่อย ลองพิมพ์ใหม่นะ!", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      sendMessage(null, result.assets[0].base64);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>น้องแคล (AI Assistant)</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.chatText}>{msg.text}</Text>
            </View>
          ))}
          {loading && <ActivityIndicator color="#19D32F" style={styles.loader} />}
        </ScrollView>

        <View style={styles.inputWrap}>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="พิมพ์ข้อความ..."
              placeholderTextColor="#6F7C90"
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity onPress={() => sendMessage(inputText)} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1923' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#243244',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  chatArea: { flex: 1, paddingHorizontal: 15 },
  chatContent: { paddingVertical: 12 },

  bubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#19D32F',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A2535',
    borderBottomLeftRadius: 4,
  },
  chatText: { color: 'white', fontSize: 15 },
  loader: { marginVertical: 10, alignSelf: 'flex-start', marginLeft: 20 },

  inputWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#0F1923',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132033',
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1B2940',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
    backgroundColor: '#0A1524',
    borderRadius: 999,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#19D32F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});