import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, COLLECTIONS } from '../../src/constants';
import { db } from '../../src/services/firebase';

export default function RatingScreen() {
  const router = useRouter();
  const { jobId, ratedRole } = useLocalSearchParams(); // ratedRole is who is being rated
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    setSubmitting(true);
    try {
      const updateData: any = {};
      
      if (ratedRole === 'customer') {
        updateData.customerRating = rating;
        updateData.customerReview = review;
      } else {
        updateData.workerRating = rating;
        updateData.workerReview = review;
      }
      
      await db.collection(COLLECTIONS.JOBS).doc(jobId as string).update(updateData);
      
      Alert.alert('Success', 'Rating submitted successfully!', [
        { text: 'OK', onPress: () => router.replace('/(worker)/jobs') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(worker)/jobs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rate {ratedRole === 'customer' ? 'Customer' : 'Worker'}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.prompt}>How was your experience?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, star <= rating ? styles.starSelected : styles.starUnselected]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Review (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Write your review here..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          multiline
          numberOfLines={4}
          value={review}
          onChangeText={setReview}
        />
        
        <TouchableOpacity 
          style={[styles.submitBtn, submitting || rating === 0 ? styles.submitBtnDisabled : null]} 
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={submitting}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', textTransform: 'capitalize' },
  content: { padding: 20, flex: 1, alignItems: 'center' },
  prompt: { fontSize: 18, color: '#fff', marginBottom: 30, fontWeight: '600' },
  starsContainer: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  star: { fontSize: 50 },
  starSelected: { color: COLORS.warning },
  starUnselected: { color: 'rgba(255,255,255,0.2)' },
  label: { color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-start', marginBottom: 10, fontSize: 14 },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    width: '100%', 
    borderRadius: 12, 
    padding: 15, 
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 30
  },
  submitBtn: { backgroundColor: COLORS.secondary, width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  skipBtn: { padding: 15 },
  skipBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' }
});
