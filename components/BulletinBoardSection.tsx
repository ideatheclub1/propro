import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, FileText, DollarSign } from 'lucide-react-native';
import StickyNoteCard from './StickyNoteCard';
import CurrencyNoteCard from './CurrencyNoteCard';
import ImageViewerModal from './ImageViewerModal';
import AddNoteModal from './AddNoteModal';

interface Note {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
  type: 'sticky' | 'currency';
  amount?: number;
}

interface BulletinBoardSectionProps {
  isCurrentUser: boolean;
}

const STORAGE_KEY = '@bulletin_board_notes';

// Mock notes for initial data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Creative breakthrough moment',
    smallImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    fullImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: 'Jan 15, 2024',
    type: 'sticky',
  },
  {
    id: '2',
    title: 'First major sale',
    smallImage: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    fullImage: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: 'Feb 2, 2024',
    type: 'currency',
    amount: 500,
  },
  {
    id: '3',
    title: 'Gallery exhibition acceptance',
    smallImage: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400',
    fullImage: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: 'Mar 10, 2024',
    type: 'sticky',
  },
];

export default function BulletinBoardSection({ isCurrentUser }: BulletinBoardSectionProps) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        // Initialize with mock data
        setNotes(mockNotes);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotes));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes(mockNotes);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleImagePress = (note: Note) => {
    setSelectedNote(note);
    setShowImageViewer(true);
  };

  const handleAddNote = async (newNote: Omit<Note, 'id' | 'createdAt'>) => {
    const stickyNotes = notes.filter(n => n.type === 'sticky');
    const currencyNotes = notes.filter(n => n.type === 'currency');
    
    if (newNote.type === 'sticky' && stickyNotes.length >= 7) {
      Alert.alert('Limit Reached', 'You can only have up to 7 sticky notes.');
      return;
    }
    
    if (newNote.type === 'currency' && currencyNotes.length >= 1) {
      Alert.alert('Limit Reached', 'You can only have 1 currency note.');
      return;
    }

    const note: Note = {
      ...newNote,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    setShowAddModal(false);
  };

  const renderNote = ({ item, index }: { item: Note; index: number }) => {
    if (item.type === 'currency') {
      return (
        <CurrencyNoteCard
          note={item}
          onImagePress={handleImagePress}
          index={index}
        />
      );
    }
    
    return (
      <StickyNoteCard
        note={item}
        onImagePress={handleImagePress}
        index={index}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FileText size={48} color="#666666" />
      <Text style={[styles.emptyTitle, { fontFamily: 'Inter_400Regular' }]}>
        No notes yet
      </Text>
      <Text style={[styles.emptySubtitle, { fontFamily: 'Inter_400Regular' }]}>
        {isCurrentUser ? 'Pin your first achievement or milestone' : 'This bulletin board is empty'}
      </Text>
    </View>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading bulletin board...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FileText size={24} color="#6C5CE7" />
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Bulletin Board
          </Text>
        </View>
        <Text style={[styles.noteCount, { fontFamily: 'Inter_400Regular' }]}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Notes List */}
      {notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Add Note Button - Only for current user */}
      {isCurrentUser && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={['#6C5CE7', '#5A4FCF']}
            style={styles.addButtonGradient}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={[styles.addButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
              Add Note
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={showImageViewer}
        note={selectedNote}
        onClose={() => setShowImageViewer(false)}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  noteCount: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '400',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
  },
  addButton: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
});