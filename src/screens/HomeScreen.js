import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSettings } from '../contexts/SettingsContext';

export default function HomeScreen({ navigation }) {
  const { settings } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🥍 Lacrosse</Text>
          <Text style={styles.subtitle}>Face-off Trainer</Text>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Practice')}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle" size={60} color={Colors.textLight} />
          <Text style={styles.startButtonText}>START PRACTICE</Text>
        </TouchableOpacity>

        {/* Quick Settings Display */}
        <View style={styles.settingsPreview}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Current Settings</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
              <Text style={styles.settingsButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Down:</Text>
            <Text style={styles.settingValue}>
              {(settings.downMin || 0).toFixed(0)} - {(settings.downMax || 0).toFixed(0)}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Set:</Text>
            <Text style={styles.settingValue}>
              {(settings.setMin || 0).toFixed(0)} - {(settings.setMax || 0).toFixed(0)}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Rest Between:</Text>
            <Text style={styles.settingValue}>
              {(settings.restBetweenMin || 0).toFixed(0)} - {(settings.restBetweenMax || 0).toFixed(0)}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Number of Reps:</Text>
            <Text style={styles.settingValue}>{settings.numberOfReps || 0}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  startButtonText: {
    color: Colors.textLight,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  settingsPreview: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  settingsButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
