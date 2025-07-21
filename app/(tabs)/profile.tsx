import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LocationEdit as Edit3 } from 'lucide-react-native';
import ProfileScreen from '../../screens/ProfileScreen';

export default function ProfileTab() {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  return (
    <>
      <ProfileScreen />
      <TouchableOpacity 
        style={styles.editFab} 
        onPress={handleEditProfile}
      >
        <Edit3 size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  editFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});