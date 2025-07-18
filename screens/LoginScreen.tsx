import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Mail, Lock, Eye, EyeOff, Flame, Phone, ArrowRight, Camera, User, Calendar, Shield, Check, X, ChevronDown, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@/contexts/UserContext';

type RegistrationStep = 
  | 'login' 
  | 'join-info' 
  | 'registration-options' 
  | 'phone-entry' 
  | 'email-entry' 
  | 'otp-verification' 
  | 'email-verification'
  | 'google-auth'
  | 'personal-info'
  | 'password-setup'
  | 'gender-dob'
  | 'face-scan'
  | 'success';

interface RegistrationData {
  method: 'phone' | 'email' | 'google' | null;
  phone?: string;
  email?: string;
  fullName?: string;
  profilePicture?: string;
  handle?: string;
  password?: string;
  gender?: string;
  dateOfBirth?: Date;
  faceData?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login: userLogin, isLoading } = useUser();
  const [isSignIn, setIsSignIn] = useState(true);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    method: null,
    phone: '',
    email: '',
    fullName: '',
    handle: '',
    password: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [faceScanning, setFaceScanning] = useState(false);

  const moonGlow = useSharedValue(0);
  const scanAnimation = useSharedValue(0);

  React.useEffect(() => {
    moonGlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
    if (faceScanning) {
      scanAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, []);

  const moonAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(moonGlow.value, [0, 1], [0.3, 0.8]),
      shadowRadius: interpolate(moonGlow.value, [0, 1], [10, 25]),
    };
  });

  const scanAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scanAnimation.value, [0, 1], [0.3, 1]),
      transform: [
        { scale: interpolate(scanAnimation.value, [0, 1], [0.8, 1.2]) }
      ],
    };
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasNumber && hasSpecialChar;
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleLogin = async () => {
    // Input validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const success = await userLogin(email.trim(), password);
      
      if (success) {
        // Safe navigation with proper delay
        setTimeout(() => {
          try {
            router.replace('/(tabs)');
          } catch (navError) {
            console.error('Navigation error:', navError);
            Alert.alert('Error', 'Failed to navigate to home screen');
          }
        }, 500);
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    }
  };

  const handleJoinUpToggle = () => {
    setIsSignIn(false);
    setCurrentStep('join-info');
  };

  const handleSignInToggle = () => {
    setIsSignIn(true);
    setCurrentStep('login');
  };

  const handleStartRegistration = () => {
    setCurrentStep('registration-options');
  };

  const handleRegistrationMethod = (method: 'phone' | 'email' | 'google') => {
    setRegistrationData(prev => ({ ...prev, method }));
    
    switch (method) {
      case 'phone':
        setCurrentStep('phone-entry');
        break;
      case 'email':
        setCurrentStep('email-entry');
        break;
      case 'google':
        setCurrentStep('google-auth');
        break;
    }
  };

  const handlePhoneSubmit = () => {
    if (!registrationData.phone || !validatePhone(registrationData.phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    // Simulate sending OTP
    Alert.alert('OTP Sent', 'We\'ve sent a verification code to your phone number');
    setCurrentStep('otp-verification');
  };

  const handleEmailSubmit = () => {
    if (!registrationData.email || !validateEmail(registrationData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    // Simulate sending verification email
    Alert.alert('Verification Email Sent', 'Please check your email and click the verification link');
    setCurrentStep('email-verification');
  };

  const handleOTPVerification = () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }
    // Simulate OTP verification
    if (otpCode === '123456') {
      setCurrentStep('personal-info');
    } else {
      Alert.alert('Error', 'The OTP you entered is incorrect. Please try again.');
    }
  };

  const handleEmailVerification = () => {
    // Simulate email verification check
    Alert.alert('Email Verified', 'Your email has been verified successfully!');
    setCurrentStep('personal-info');
  };

  const handleGoogleAuth = () => {
    // Simulate Google authentication
    Alert.alert('Google Sign-Up', 'Google authentication would be implemented here');
    setCurrentStep('personal-info');
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setRegistrationData(prev => ({ 
        ...prev, 
        profilePicture: result.assets[0].uri 
      }));
    }
  };

  const handlePersonalInfoSubmit = () => {
    if (!registrationData.fullName?.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!registrationData.handle?.trim()) {
      Alert.alert('Error', 'Please create a unique handle');
      return;
    }
    setCurrentStep('password-setup');
  };

  const handlePasswordSetup = () => {
    if (!registrationData.password || !validatePassword(registrationData.password)) {
      Alert.alert('Error', 'Password must be at least 8 characters with a number and special character');
      return;
    }
    if (registrationData.password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setCurrentStep('gender-dob');
  };

  const handleGenderDOBSubmit = () => {
    if (!selectedGender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }
    if (!birthDate) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }
    
    const dob = new Date(birthDate);
    const age = calculateAge(dob);
    
    if (age < 18) {
      Alert.alert('Error', 'You must be 18 or older to register');
      return;
    }
    
    setRegistrationData(prev => ({ 
      ...prev, 
      gender: selectedGender, 
      dateOfBirth: dob 
    }));
    setCurrentStep('face-scan');
  };

  const handleFaceScan = () => {
    setFaceScanning(true);
    // Simulate face scanning process
    setTimeout(() => {
      setFaceScanning(false);
      setRegistrationData(prev => ({ ...prev, faceData: 'face_scan_complete' }));
      setCurrentStep('success');
    }, 3000);
  };

  const handleRegistrationComplete = () => {
    console.log('Registration Complete:', registrationData);
    // For registration, we'll also need to handle user creation
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'join-info':
        setCurrentStep('login');
        break;
      case 'registration-options':
        setCurrentStep('join-info');
        break;
      case 'phone-entry':
      case 'email-entry':
      case 'google-auth':
        setCurrentStep('registration-options');
        break;
      case 'otp-verification':
        setCurrentStep('phone-entry');
        break;
      case 'email-verification':
        setCurrentStep('email-entry');
        break;
      case 'personal-info':
        if (registrationData.method === 'phone') {
          setCurrentStep('otp-verification');
        } else if (registrationData.method === 'email') {
          setCurrentStep('email-verification');
        } else {
          setCurrentStep('google-auth');
        }
        break;
      case 'password-setup':
        setCurrentStep('personal-info');
        break;
      case 'gender-dob':
        setCurrentStep('password-setup');
        break;
      case 'face-scan':
        setCurrentStep('gender-dob');
        break;
      default:
        setCurrentStep('login');
    }
  };

  const renderLoginScreen = () => (
    <>
      {/* Crescent Moon Logo */}
      <Animated.View style={[styles.moonContainer, moonAnimatedStyle]}>
        <View style={styles.moon}>
          <Text style={styles.moonIcon}>🌙</Text>
        </View>
      </Animated.View>

      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeSubtitle}>Enter the forbidden realm</Text>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isSignIn && styles.activeToggle]}
          onPress={handleSignInToggle}
        >
          <Text style={[styles.toggleText, isSignIn && styles.activeToggleText]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isSignIn && styles.activeToggle]}
          onPress={handleJoinUpToggle}
        >
          <Text style={[styles.toggleText, !isSignIn && styles.activeToggleText]}>
            Join Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Mail size={20} color="#a855f7" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Email Address"
            placeholderTextColor="#a855f7"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Lock size={20} color="#a855f7" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#a855f7"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#a855f7" />
            ) : (
              <Eye size={20} color="#a855f7" />
            )}
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.signInButton, isLoading && styles.disabledButton]} 
          onPress={isSignIn ? handleLogin : handleStartRegistration}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#4A4A4A', '#565656'] : ['#6C5CE7', '#5A4FCF']}
            style={styles.signInButtonGradient}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : (isSignIn ? 'Sign In' : 'Join Up')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerIcon}>❤️</Text>
          <Text style={styles.footerText}>Intimate Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerIcon}>🔒</Text>
          <Text style={styles.footerText}>Private & Secure</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerIcon}>🌙</Text>
          <Text style={styles.footerText}>Night Mode</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderJoinInfo = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.largeIcon}>🌟</Text>
      </View>
      <Text style={styles.stepTitle}>Join The Club</Text>
      <Text style={styles.stepSubtitle}>
        Create your account to access our exclusive community of meaningful connections and conversations.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleStartRegistration}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Start Registration</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderRegistrationOptions = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Registration Method</Text>
      <Text style={styles.stepSubtitle}>
        Select how you'd like to create your account
      </Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={() => handleRegistrationMethod('phone')}
        >
          <Phone size={24} color="#a855f7" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Continue with Phone</Text>
            <Text style={styles.optionDescription}>We'll send you a verification code via SMS</Text>
          </View>
          <ArrowRight size={20} color="#a855f7" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={() => handleRegistrationMethod('email')}
        >
          <Mail size={24} color="#a855f7" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Continue with Email</Text>
            <Text style={styles.optionDescription}>Sign up using your email address</Text>
          </View>
          <ArrowRight size={20} color="#a855f7" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={() => handleRegistrationMethod('google')}
        >
          <Text style={styles.googleIcon}>G</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Continue with Google</Text>
            <Text style={styles.optionDescription}>Quick sign-up with your Google account</Text>
          </View>
          <ArrowRight size={20} color="#a855f7" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhoneEntry = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter Phone Number</Text>
      <Text style={styles.stepSubtitle}>
        We'll send you a verification code to confirm your number
      </Text>
      
      <View style={styles.inputContainer}>
        <Phone size={20} color="#a855f7" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor="#a855f7"
          value={registrationData.phone}
          onChangeText={(text) => setRegistrationData(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handlePhoneSubmit}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Send Verification Code</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderEmailEntry = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter Email Address</Text>
      <Text style={styles.stepSubtitle}>
        We'll send you a verification link to confirm your email
      </Text>
      
      <View style={styles.inputContainer}>
        <Mail size={20} color="#a855f7" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="your.email@example.com"
          placeholderTextColor="#a855f7"
          value={registrationData.email}
          onChangeText={(text) => setRegistrationData(prev => ({ ...prev, email: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleEmailSubmit}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Send Verification Email</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderOTPVerification = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter Verification Code</Text>
      <Text style={styles.stepSubtitle}>
        We sent a 6-digit code to {registrationData.phone}
      </Text>
      
      <View style={styles.otpContainer}>
        <TextInput
          style={styles.otpInput}
          placeholder="123456"
          placeholderTextColor="#a855f7"
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleOTPVerification}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Verify Code</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmailVerification = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Mail size={48} color="#a855f7" />
      </View>
      <Text style={styles.stepTitle}>Check Your Email</Text>
      <Text style={styles.stepSubtitle}>
        We sent a verification link to {registrationData.email}. Click the link to verify your account.
      </Text>
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleEmailVerification}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderGoogleAuth = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.googleIconLarge}>G</Text>
      </View>
      <Text style={styles.stepTitle}>Google Authentication</Text>
      <Text style={styles.stepSubtitle}>
        Sign up quickly and securely with your Google account
      </Text>
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleGoogleAuth}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Continue with Google</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPersonalInfo = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>
        Tell us a bit about yourself
      </Text>
      
      {/* Profile Picture */}
      <View style={styles.profilePictureSection}>
        <TouchableOpacity style={styles.profilePictureButton} onPress={handleImagePicker}>
          {registrationData.profilePicture ? (
            <Image source={{ uri: registrationData.profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Camera size={32} color="#a855f7" />
              <Text style={styles.profilePictureText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Full Name */}
      <View style={styles.inputContainer}>
        <User size={20} color="#a855f7" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Full Name"
          placeholderTextColor="#a855f7"
          value={registrationData.fullName}
          onChangeText={(text) => setRegistrationData(prev => ({ ...prev, fullName: text }))}
        />
      </View>

      {/* Handle */}
      <View style={styles.inputContainer}>
        <Text style={styles.handlePrefix}>#</Text>
        <TextInput
          style={[styles.textInput, styles.handleInput]}
          placeholder="YourHandle"
          placeholderTextColor="#a855f7"
          value={registrationData.handle}
          onChangeText={(text) => setRegistrationData(prev => ({ ...prev, handle: text }))}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handlePersonalInfoSubmit}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPasswordSetup = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Password</Text>
      <Text style={styles.stepSubtitle}>
        Your password must be at least 8 characters with a number and special character
      </Text>
      
      {/* Password */}
      <View style={styles.inputContainer}>
        <Lock size={20} color="#a855f7" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor="#a855f7"
          value={registrationData.password}
          onChangeText={(text) => setRegistrationData(prev => ({ ...prev, password: text }))}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color="#a855f7" />
          ) : (
            <Eye size={20} color="#a855f7" />
          )}
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <Lock size={20} color="#a855f7" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Confirm Password"
          placeholderTextColor="#a855f7"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color="#a855f7" />
          ) : (
            <Eye size={20} color="#a855f7" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordSetup}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderGenderDOB = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>
        We need this information to verify you're 18 or older
      </Text>
      
      {/* Gender Selection */}
      <TouchableOpacity 
        style={styles.dropdownContainer} 
        onPress={() => setShowGenderDropdown(!showGenderDropdown)}
      >
        <User size={20} color="#a855f7" style={styles.inputIcon} />
        <Text style={[styles.dropdownText, !selectedGender && styles.placeholderText]}>
          {selectedGender || 'Select Gender'}
        </Text>
        <ChevronDown size={20} color="#a855f7" />
      </TouchableOpacity>

      {showGenderDropdown && (
        <View style={styles.dropdownOptions}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={styles.dropdownOption}
              onPress={() => {
                setSelectedGender(gender);
                setShowGenderDropdown(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <Calendar size={20} color="#a855f7" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#a855f7"
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleGenderDOBSubmit}>
        <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderFaceScan = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Face Verification</Text>
      <Text style={styles.stepSubtitle}>
        For security purposes, please scan your face to complete registration
      </Text>
      
      <View style={styles.faceScanContainer}>
        <Animated.View style={[styles.faceScanCircle, scanAnimatedStyle]}>
          <Shield size={48} color="#a855f7" />
        </Animated.View>
        
        {faceScanning ? (
          <Text style={styles.scanningText}>Scanning your face...</Text>
        ) : (
          <Text style={styles.scanInstructions}>
            Position your face in the circle and tap to start scanning
          </Text>
        )}
      </View>

      {!faceScanning && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleFaceScan}>
          <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.buttonGradient}>
            <Text style={styles.primaryButtonText}>Start Face Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Check size={48} color="#10b981" />
      </View>
      <Text style={styles.stepTitle}>Welcome to The Club!</Text>
      <Text style={styles.stepSubtitle}>
        Your account has been created successfully. You're now part of our exclusive community.
      </Text>
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleRegistrationComplete}>
        <LinearGradient colors={['#10b981', '#059669']} style={styles.buttonGradient}>
          <Text style={styles.primaryButtonText}>Enter The Club</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login':
        return renderLoginScreen();
      case 'join-info':
        return renderJoinInfo();
      case 'registration-options':
        return renderRegistrationOptions();
      case 'phone-entry':
        return renderPhoneEntry();
      case 'email-entry':
        return renderEmailEntry();
      case 'otp-verification':
        return renderOTPVerification();
      case 'email-verification':
        return renderEmailVerification();
      case 'google-auth':
        return renderGoogleAuth();
      case 'personal-info':
        return renderPersonalInfo();
      case 'password-setup':
        return renderPasswordSetup();
      case 'gender-dob':
        return renderGenderDOB();
      case 'face-scan':
        return renderFaceScan();
      case 'success':
        return renderSuccess();
      default:
        return renderLoginScreen();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2A1A55', '#1E0D36', '#2A1A55']}
        style={styles.background}
      >
        {/* Header with Back Button */}
        {currentStep !== 'login' && (
          <View style={styles.stepHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#a855f7" />
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {renderCurrentStep()}
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  moonContainer: {
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#c77dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  moon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(199, 125, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c77dff',
  },
  moonIcon: {
    fontSize: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: '#6C5CE7',
  },
  toggleText: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  signInButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  signInButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  joinClubButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 12,
  },
  joinClubButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  joinClubButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0aaff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
  },
  footerIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#B0B0B0',
    textAlign: 'center',
    opacity: 0.8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeIcon: {
    fontSize: 48,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.9,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    opacity: 0.8,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C5CE7',
    width: 24,
    textAlign: 'center',
  },
  googleIconLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 8,
    width: 200,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#a855f7',
    textDecorationLine: 'underline',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePicturePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureText: {
    fontSize: 12,
    color: '#a855f7',
    marginTop: 4,
  },
  handlePrefix: {
    fontSize: 20,
    color: '#a855f7',
    fontWeight: 'bold',
    marginRight: 8,
  },
  handleInput: {
    flex: 1,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#a855f7',
  },
  dropdownOptions: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  faceScanContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  faceScanCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 3,
    borderColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scanningText: {
    fontSize: 16,
    color: '#a855f7',
    textAlign: 'center',
    fontWeight: '600',
  },
  scanInstructions: {
    fontSize: 14,
    color: '#a855f7',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
});