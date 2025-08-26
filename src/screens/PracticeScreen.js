import React, { useState, useEffect, useRef } from 'react';
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
import AudioService from '../services/AudioService';

export default function PracticeScreen({ navigation }) {
  const { settings, isLoaded } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [status, setStatus] = useState('ready'); // ready, down, set, whistle, rest, complete
  const [currentPhase, setCurrentPhase] = useState(''); // Current phase description
  const timeoutRefs = useRef([]); // Track all timeouts for cleanup
  const isActiveRef = useRef(false); // Ref to track active state for closures

  // Debug: Log settings when component mounts or settings change
  useEffect(() => {
    console.log('PracticeScreen - Settings loaded:', isLoaded, 'Settings:', settings);
  }, [settings, isLoaded]);

  // Handle navigation away from screen - stop practice if active
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isActive) {
        console.log('Navigation detected - stopping practice');
        // Stop the practice when navigating away
        resetPractice();
      }
    });

    return unsubscribe;
  }, [navigation, isActive]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('PracticeScreen unmounting - cleaning up');
      // Clear timeouts but don't call resetPractice to avoid state updates on unmounted component
      timeoutRefs.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current = [];
      AudioService.stopSpeech();
    };
  }, []);

  const getRandomDelay = (min, max) => {
    return (Math.random() * (max - min) + min) * 1000; // Convert to milliseconds
  };

  const runFaceoffSequence = async (repNumber) => {
    try {
      console.log(`Starting rep ${repNumber} of ${settings.numberOfReps}, isActive:`, isActive);
      
      // Check if we should stop (user navigated away)
      if (!isActiveRef.current) {
        console.log('Practice stopped, exiting sequence');
        return;
      }
      
      // Initialize AudioService with current settings
      await AudioService.initialize(settings);
      
      // Phase 1: "Down" command
      setStatus('down');
      setCurrentPhase('Down!');
      console.log('Playing "Down" command');
      await AudioService.playDown();
      
      if (!isActiveRef.current) return; // Check again after audio
      
      // Wait random time between Down and Set
      const downToSetDelay = getRandomDelay(settings.downMin, settings.downMax);
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, downToSetDelay);
        timeoutRefs.current.push(timeout);
      });
      
      if (!isActiveRef.current) return;
      
      // Phase 2: "Set" command
      setStatus('set');
      setCurrentPhase('Set!');
      console.log('Playing "Set" command');
      await AudioService.playSet();
      
      if (!isActiveRef.current) return;
      
      // Wait random time between Set and Whistle
      const setToWhistleDelay = getRandomDelay(settings.setMin, settings.setMax);
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, setToWhistleDelay);
        timeoutRefs.current.push(timeout);
      });
      
      if (!isActiveRef.current) return;
      
      // Phase 3: Whistle
      setStatus('whistle');
      setCurrentPhase('GO!');
      console.log('Playing whistle');
      await AudioService.playWhistle();
      
      if (!isActiveRef.current) return;
      
      // If not the last rep, add rest period
      if (repNumber < settings.numberOfReps) {
        setStatus('rest');
        setCurrentPhase(`Rest... Next rep in ${Math.ceil(settings.restMin)}s`);
        
        const restDelay = getRandomDelay(settings.restMin, settings.restMax);
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, restDelay);
          timeoutRefs.current.push(timeout);
        });
        
        if (!isActiveRef.current) return;
        
        // Start next rep
        setCurrentRep(repNumber + 1);
        await runFaceoffSequence(repNumber + 1);
      } else {
        // Practice complete
        setStatus('complete');
        setCurrentPhase('Practice Complete!');
        setIsActive(false);
        isActiveRef.current = false;
      }
    } catch (error) {
      console.error('Error in face-off sequence:', error);
      setStatus('ready');
      setIsActive(false);
      isActiveRef.current = false;
    }
  };

  const startPractice = async () => {
    if (!isLoaded) {
      console.log('Settings not loaded yet, waiting...');
      return;
    }
    
    console.log('Starting practice with settings:', settings);
    
    // Clear any existing timeouts first
    timeoutRefs.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutRefs.current = [];
    
    setIsActive(true);
    isActiveRef.current = true;
    setCurrentRep(1);
    setStatus('active');
    setCurrentPhase('Get ready...');
    
    console.log('Set isActive to true, starting timeout');
    
    // Small delay before starting first rep
    const startTimeout = setTimeout(() => {
      console.log('Timeout fired, calling runFaceoffSequence');
      runFaceoffSequence(1);
    }, 1000);
    
    timeoutRefs.current.push(startTimeout);
  };

  const resetPractice = async () => {
    console.log('Resetting practice - stopping all audio and timeouts');
    
    // Clear all timeouts first
    timeoutRefs.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutRefs.current = [];
    
    // Stop any ongoing audio
    await AudioService.stopSpeech();
    
    // Reset state
    setIsActive(false);
    isActiveRef.current = false;
    setCurrentRep(0);
    setStatus('ready');
    setCurrentPhase('');
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return `Ready for ${settings.numberOfReps} reps`;
      case 'active':
      case 'down':
      case 'set':
      case 'whistle':
      case 'rest':
        return currentPhase;
      case 'complete':
        return 'Practice Complete!';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return Colors.ready;
      case 'active':
        return Colors.info;
      case 'down':
        return Colors.warning;
      case 'set':
        return Colors.active;
      case 'whistle':
        return Colors.success;
      case 'rest':
        return Colors.textSecondary;
      case 'complete':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Practice Session</Text>
        </View>

        {/* Status Display */}
        <View style={[styles.statusContainer, { borderColor: getStatusColor() }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Current Settings Display */}
        <View style={styles.settingsDisplay}>
          <Text style={styles.settingsTitle}>Practice Settings</Text>
          <View style={styles.settingsGrid}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Reps</Text>
              <Text style={styles.settingValue}>{settings.numberOfReps}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Down</Text>
              <Text style={styles.settingValue}>{settings.downMin?.toFixed(0)}-{settings.downMax?.toFixed(0)}s</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Set</Text>
              <Text style={styles.settingValue}>{settings.setMin?.toFixed(0)}-{settings.setMax?.toFixed(0)}s</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Rest</Text>
              <Text style={styles.settingValue}>{settings.restBetweenMin?.toFixed(0)}-{settings.restBetweenMax?.toFixed(0)}s</Text>
            </View>
          </View>
        </View>

        {/* Main Action Area */}
        <View style={styles.actionArea}>
          {status === 'ready' && (
            <TouchableOpacity
              style={[styles.startButton, !isLoaded && styles.disabledButton]}
              onPress={startPractice}
              activeOpacity={0.8}
              disabled={!isLoaded}
            >
              <Ionicons name="play" size={40} color={Colors.textLight} />
              <Text style={styles.startButtonText}>
                {isLoaded ? 'START' : 'LOADING...'}
              </Text>
            </TouchableOpacity>
          )}

          {(status === 'active' || status === 'down' || status === 'set' || status === 'whistle' || status === 'rest') && (
            <View style={styles.activeContainer}>
              <Text style={[styles.phaseText, { color: getStatusColor() }]}>
                {currentPhase}
              </Text>
              <View style={styles.pulseContainer}>
                <View style={[styles.pulse, { backgroundColor: getStatusColor() }]} />
              </View>
            </View>
          )}

          {status === 'complete' && (
            <View style={styles.completeContainer}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
              <Text style={styles.completeText}>Great job!</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={resetPractice}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Practice Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Progress Indicator */}
        {status !== 'ready' && status !== 'complete' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Rep {currentRep} of {settings.numberOfReps}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentRep / settings.numberOfReps) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusContainer: {
    marginTop: 40,
    padding: 20,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
  },
  actionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderRadius: 50,
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  activeContainer: {
    alignItems: 'center',
  },
  activeText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  phaseText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  pulseContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.active,
    opacity: 0.6,
  },
  completeContainer: {
    alignItems: 'center',
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.success,
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    paddingVertical: 20,
  },
  progressText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  settingsDisplay: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  settingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  settingItem: {
    alignItems: 'center',
    minWidth: '22%',
  },
  settingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
