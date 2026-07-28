import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from './_layout';
import AnnotatedImage from '../components/AnnotatedImage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../constants/theme';

export default function OrganicFarmingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTamil } = useApp();
  const [currentPage, setCurrentPage] = useState(0);

  // Animation values for page turning effect
  const pageOpacity = useRef(new Animated.Value(1)).current;
  const pageTranslateX = useRef(new Animated.Value(0)).current;

  const animatePageChange = (nextPage: number) => {
    // Determine direction
    const isNext = nextPage > currentPage;
    const exitValue = isNext ? -100 : 100;
    const entryValue = isNext ? 100 : -100;

    Animated.parallel([
      Animated.timing(pageOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pageTranslateX, {
        toValue: exitValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentPage(nextPage);
      pageTranslateX.setValue(entryValue);
      Animated.parallel([
        Animated.timing(pageOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(pageTranslateX, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      animatePageChange(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      animatePageChange(currentPage - 1);
    }
  };

  const pages = [
    {
      title: isTamil ? 'இயற்கை விவசாயத்தின் நன்மைகள்' : 'Intro to Organic Farming',
      badge: isTamil ? 'அறிமுகம்' : 'Introduction',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="eco" size={60} color={COLORS.emerald} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'ரசாயன உரங்களை அதிகம் பயன்படுத்துவதால் நிலம் மலடாகி வருகிறது. இயற்கை விவசாயம் செய்வதன் மூலம் மண்ணின் வளம் பாதுகாக்கப்படுகிறது, மனிதர்களின் ஆரோக்கியம் மேம்படுகிறது, மற்றும் விவசாயிகளுக்கு செலவு குறைகிறது.'
              : 'Excessive use of chemical fertilizers makes the soil barren over time. By switching to organic farming, we protect soil health, improve human health, and drastically reduce farming costs.'}
          </Text>
          <Text style={styles.subHeader}>
            {isTamil ? 'இயற்கை உரங்களின் நன்மைகள்:' : 'Benefits of Organic Fertilizers:'}
          </Text>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.emerald} />
            <Text style={styles.bulletText}>
              {isTamil ? 'மண்புழு மற்றும் நுண்ணுயிர்கள் பெருகும்.' : 'Earthworms and beneficial microbes multiply.'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.emerald} />
            <Text style={styles.bulletText}>
              {isTamil ? 'மண்ணின் ஈரப்பதம் நீண்ட நாட்கள் தக்கவைக்கப்படும்.' : 'Soil retains moisture for much longer periods.'}
            </Text>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'பஞ்சகவ்யா (பகுதி 1)' : 'Panchagavya (Part 1)',
      badge: isTamil ? 'தேவையான பொருட்கள்' : 'Ingredients',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பஞ்சகவ்யா என்பது பசுவிலிருந்து கிடைக்கும் 5 முக்கிய பொருட்களைக் கொண்டு தயாரிக்கப்படும் ஒரு அற்புதமான வளர்ச்சி ஊக்கி ஆகும்.'
              : 'Panchagavya is a miraculous growth promoter made from 5 main products obtained from the cow.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? '20 லிட்டர் தயாரிக்க தேவையானவை:' : 'For making 20 Liters:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'பசுஞ்சாணம் - 5 கிலோ' : 'Fresh Cow Dung - 5 kg'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'கோமியம் (பசு சிறுநீர்) - 3 லிட்டர்' : 'Cow Urine - 3 Liters'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'பசும்பால் - 2 லிட்டர்' : 'Cow Milk - 2 Liters'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'பசுந்தயிர் - 2 லிட்டர்' : 'Cow Curd - 2 Liters'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'பசு நெய் - 1/2 கிலோ' : 'Cow Ghee - 0.5 kg'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>+</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'கரும்புச் சாறு (3 லி), இளநீர் (3 லி), பழுத்த வாழைப்பழம் (12)' : 'Sugarcane juice (3L), Tender coconut (3L), Ripe bananas (12)'}</Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'பஞ்சகவ்யா (பகுதி 2)' : 'Panchagavya (Part 2)',
      badge: isTamil ? 'செய்முறை' : 'Preparation',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/panchagavya_mixing.png')}
            annotations={[
              { id: '1', x: 20, y: 30, label: isTamil ? 'மரக்குச்சி' : 'Wooden Stick', pointerDirection: 'right' },
              { id: '2', x: 50, y: 50, label: isTamil ? 'கலவை' : 'Mixture', pointerDirection: 'up' },
              { id: '3', x: 80, y: 70, label: isTamil ? 'மூலப்பொருட்கள்' : 'Ingredients', pointerDirection: 'left' },
            ]}
          />
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தயாரிக்கும் முறை:' : 'How to prepare:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'முதல் 3 நாட்கள் பசுஞ்சாணம் மற்றும் நெய்யை மட்டும் நன்றாகப் பிசைந்து தினமும் காலையும் மாலையும் கலக்கி விடவும்.' 
                  : 'For the first 3 days, mix only cow dung and ghee thoroughly. Stir morning and evening.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '4-வது நாள் மீதமுள்ள அனைத்துப் பொருட்களையும் சேர்த்து நன்றாக கலக்கவும்.' 
                  : 'On the 4th day, add all remaining ingredients and mix well.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'தொடர்ந்து 15 நாட்கள் தினமும் இருவேளை குச்சியால் கலக்கி வரவும். 15-வது நாள் பஞ்சகவ்யா தயார்.' 
                  : 'Stir twice daily for 15 days. On the 15th day, Panchagavya is ready.'}
              </Text>
            </View>
          </View>
          <Text style={styles.subHeader}>
            {isTamil ? 'பயன்பாடு:' : 'Usage:'}
          </Text>
          <Text style={styles.paragraph}>
            {isTamil 
              ? '10 லிட்டர் தண்ணீரில் 300 மிலி பஞ்சகவ்யா கலந்து செடிகள் மேல் தெளிக்கலாம். இது செடிகளை நன்கு வளரச் செய்து பூச்சித் தாக்குதலைத் தடுக்கும்.'
              : 'Mix 300ml Panchagavya in 10 liters of water and spray on plants. It boosts growth and builds pest resistance.'}
          </Text>
        </>
      )
    },
    {
      title: isTamil ? 'ஜீவாமிர்தம் (பகுதி 1)' : 'Jeevamrutham (Part 1)',
      badge: isTamil ? 'தேவையான பொருட்கள்' : 'Ingredients',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'ஜீவாமிர்தம் மண்ணில் உள்ள நன்மை செய்யும் நுண்ணுயிர்களை கோடிக்கணக்கில் பெருக்கும் ஒரு இயற்கை உரம்.'
              : 'Jeevamrutham is a natural liquid fertilizer that multiplies beneficial soil microbes by the billions.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? '200 லிட்டர் தயாரிக்க தேவையானவை:' : 'For making 200 Liters:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'தண்ணீர் - 200 லிட்டர்' : 'Water - 200 Liters'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'நாட்டுப் பசுஞ்சாணம் - 10 கிலோ' : 'Native Cow Dung - 10 kg'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'கோமியம் - 5 முதல் 10 லிட்டர்' : 'Cow Urine - 5 to 10 Liters'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'நாட்டுச் சர்க்கரை அல்லது வெல்லம் - 2 கிலோ' : 'Jaggery - 2 kg'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'பயறு மாவு (கொண்டைக்கடலை/உளுந்து) - 2 கிலோ' : 'Gram flour (Chickpea/Urad) - 2 kg'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>6</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'ரசாயனம் படாத வளமான மண் - ஒரு கைப்பிடி' : 'Chemical-free fertile soil - one handful'}</Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'ஜீவாமிர்தம் (பகுதி 2)' : 'Jeevamrutham (Part 2)',
      badge: isTamil ? 'செய்முறை' : 'Preparation',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/jeevamrutham_drum.png')}
            annotations={[
              { id: '1', x: 20, y: 20, label: isTamil ? 'மரக்குச்சி' : 'Wooden Stick', pointerDirection: 'right' },
              { id: '2', x: 50, y: 70, label: isTamil ? 'ஜீவாமிர்தம்' : 'Jeevamrutham', pointerDirection: 'up' },
              { id: '3', x: 80, y: 50, label: isTamil ? 'மூலப்பொருட்கள்' : 'Ingredients', pointerDirection: 'left' },
            ]}
          />
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தயாரிக்கும் முறை:' : 'How to prepare:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'ஒரு பிளாஸ்டிக் பேரலில் 200 லிட்டர் தண்ணீரை நிரப்பவும்.' 
                  : 'Fill 200 liters of water in a plastic barrel.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'சாணம், கோமியம், வெல்லம், பயறு மாவு மற்றும் மண்ணை தண்ணீரில் இட்டு நன்றாகக் கலக்கவும்.' 
                  : 'Add dung, urine, jaggery, flour, and soil into the water and mix well.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'காலை, மாலை என இருவேளையும் கடிகார முள் சுற்றும் திசையில் (வலஞ்சுழியாக) 2 நிமிடம் கலக்கி வரவும்.' 
                  : 'Stir clockwise for 2 minutes every morning and evening.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '48 மணி நேரத்தில் (2 நாட்கள்) ஜீவாமிர்தம் தயாராகிவிடும்.' 
                  : 'Jeevamrutham will be ready in 48 hours (2 days).'}
              </Text>
            </View>
          </View>
          <Text style={styles.subHeader}>
            {isTamil ? 'பயன்பாடு:' : 'Usage:'}
          </Text>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பாசன நீரோடு கலந்து ஒரு ஏக்கருக்கு 200 லிட்டர் என்ற அளவில் 15 நாட்களுக்கு ஒருமுறை கொடுக்கலாம்.'
              : 'Mix with irrigation water and apply 200 liters per acre once every 15 days.'}
          </Text>
        </>
      )
    },
    {
      title: isTamil ? 'பீஜாமிர்தம்' : 'Beejamrutham',
      badge: isTamil ? 'விதை நேர்த்தி' : 'Seed Treatment',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="eco" size={60} color={COLORS.emerald} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விதைகளை நடுவதற்கு முன் பீஜாமிர்தத்தில் நனைத்து நட்டால் முளைப்புத்திறன் 100% இருக்கும் மற்றும் வேர் நோய்கள் வராது.'
              : 'Treating seeds with Beejamrutham before sowing gives 100% germination and prevents root diseases.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தயாரிக்கும் முறை (5 கிலோ விதைக்கு):' : 'Preparation (for 5kg seeds):'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '5 லிட்டர் தண்ணீர், 1 கிலோ சாணம், 1 லிட்டர் கோமியம், 1 கைப்பிடி மண், 10 கிராம் சுட்ட சுண்ணாம்பு ஆகியவற்றை கலந்து ஒரு நாள் புளிக்க வைக்கவும்.' 
                  : 'Mix 5L water, 1kg dung, 1L urine, 1 handful soil, 10g lime. Let it ferment for a day.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'இந்தக் கரைசலை விதைகளின் மேல் தெளித்து நன்றாகப் பிசறவும்.' 
                  : 'Sprinkle this solution on the seeds and mix thoroughly.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'நிழலில் உலர்த்தி பின் விதைக்கவும்.' 
                  : 'Dry the seeds in the shade and then sow.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மீன் அமிலம் (பகுதி 1)' : 'Fish Amino Acid (Part 1)',
      badge: isTamil ? 'வளர்ச்சி ஊக்கி' : 'Growth Promoter',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'மீன் அமிலம் (Fish Amino Acid) பயிர்களின் அசுர வளர்ச்சிக்கு உதவும் மிகச் சிறந்த இயற்கை உரம் மற்றும் பூச்சி விரட்டி.'
              : 'Fish Amino Acid is an excellent natural fertilizer and pest repellent that promotes monstrous growth in crops.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தேவையான பொருட்கள்:' : 'Ingredients:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'மீன் கழிவுகள் - 1 கிலோ (முள், குடல், செதில் போன்றவை)' : 'Fish waste - 1 kg (bones, guts, scales)'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'நாட்டுச் சர்க்கரை அல்லது வெல்லம் - 1 கிலோ' : 'Jaggery - 1 kg'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'பிளாஸ்டிக் அல்லது கண்ணாடி பாட்டில்/கேன்' : 'Plastic or glass bottle/can'}</Text>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <View style={styles.quoteGoldBorder} />
            <Text style={styles.quoteText}>
              {isTamil
                ? 'குறிப்பு: மீன் மற்றும் வெல்லம் இரண்டும் சம அளவில் இருக்க வேண்டும்.'
                : 'Note: Fish waste and jaggery must be in equal proportion (1:1 ratio).'}
            </Text>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மீன் அமிலம் (பகுதி 2)' : 'Fish Amino Acid (Part 2)',
      badge: isTamil ? 'செய்முறை' : 'Preparation',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/fish_amino_acid.png')}
            annotations={[
              { id: '1', x: 50, y: 20, label: isTamil ? 'துணி' : 'Cloth Cover', pointerDirection: 'up' },
              { id: '2', x: 50, y: 70, label: isTamil ? 'மீன் + வெல்லம்' : 'Fish + Jaggery', pointerDirection: 'right' },
            ]}
          />
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தயாரிக்கும் முறை:' : 'How to prepare:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'கேன் உள்ளே ஒரு அடுக்கு மீன் கழிவு, அதன் மேல் ஒரு அடுக்கு வெல்லம் என மாற்றி மாற்றி போடவும்.' 
                  : 'In the can, add a layer of fish waste, then a layer of jaggery, alternating them.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'கேனின் வாய்ப்பகுதியை ஒரு காட்டன் துணியால் கட்டி நிழலான இடத்தில் வைக்கவும்.' 
                  : 'Tie the mouth of the can with a cotton cloth and keep it in a shady place.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '30 முதல் 40 நாட்கள் கழித்து பார்த்தால், தேன் போன்ற வாசனையுடன் மீன் அமிலம் தயாராகி இருக்கும் (துர்நாற்றம் இருக்காது).' 
                  : 'After 30-40 days, Fish Amino Acid is ready. It will smell sweet like honey (no bad odor).'}
              </Text>
            </View>
          </View>
          <Text style={styles.subHeader}>
            {isTamil ? 'பயன்பாடு:' : 'Usage:'}
          </Text>
          <Text style={styles.paragraph}>
            {isTamil 
              ? '10 லிட்டர் தண்ணீருக்கு 50 மில்லி மீன் அமிலம் கலந்து செடிகளின் இலைகளில் தெளிக்கலாம்.'
              : 'Mix 50ml of Fish Amino Acid in 10 liters of water and spray it on the leaves.'}
          </Text>
        </>
      )
    },
    {
      title: isTamil ? 'முட்டை ரசம் (பகுதி 1)' : 'Egg Amino Acid (Part 1)',
      badge: isTamil ? 'பூப்பூக்கும் தருணம்' : 'Flowering Stage',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பூக்கும் தருணத்தில் பயிர்களுக்குக் கொடுத்தால் பூக்கள் உதிர்வதைத் தடுத்து, காய் பிடிப்பதை பல மடங்கு அதிகரிக்கும் உரம் தான் முட்டை ரசம் (Muttai Rasam).'
              : 'Egg Amino Acid prevents flower dropping and drastically increases fruit setting when applied during the flowering stage.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தேவையான பொருட்கள்:' : 'Ingredients:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'கோழி முட்டை - 10 (பச்சையாக)' : 'Raw Eggs - 10'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'எலுமிச்சை பழச்சாறு - முட்டைகள் மூழ்கும் அளவு' : 'Lemon juice - enough to submerge eggs'}</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>{isTamil ? 'நாட்டுச் சர்க்கரை அல்லது வெல்லம் - சம அளவு' : 'Jaggery - equal weight'}</Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'முட்டை ரசம் (பகுதி 2)' : 'Egg Amino Acid (Part 2)',
      badge: isTamil ? 'செய்முறை' : 'Preparation',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/egg_amino_acid.png')}
            annotations={[
              { id: '1', x: 40, y: 50, label: isTamil ? 'முட்டை' : 'Eggs', pointerDirection: 'right' },
              { id: '2', x: 60, y: 70, label: isTamil ? 'வெல்லம்' : 'Jaggery', pointerDirection: 'left' },
            ]}
          />
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'தயாரிக்கும் முறை:' : 'How to prepare:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'ஒரு கண்ணாடி அல்லது பிளாஸ்டிக் பாட்டிலில் முட்டைகளை உடையாமல் வைக்கவும். முட்டைகள் மூழ்கும் வரை எலுமிச்சை சாறு ஊற்றவும்.' 
                  : 'Place eggs unbroken in a jar. Pour lemon juice until the eggs are fully submerged.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'காற்றுப்புகாமல் மூடி 10 நாட்கள் வைக்கவும். (எலுமிச்சை சாறு முட்டை ஓட்டினை கரைத்துவிடும்).' 
                  : 'Seal airtight for 10 days. (The lemon juice will dissolve the eggshells).'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '10 நாள் கழித்து முட்டைகளை பிசைந்து விட்டு, அதே அளவு வெல்லம் சேர்த்து மீண்டும் 10 நாட்கள் வைக்கவும். முட்டை ரசம் தயார்.' 
                  : 'After 10 days, mash the eggs, add an equal amount of jaggery, and wait 10 more days. It is now ready.'}
              </Text>
            </View>
          </View>
          <Text style={styles.subHeader}>
            {isTamil ? 'பயன்பாடு:' : 'Usage:'}
          </Text>
          <Text style={styles.paragraph}>
            {isTamil 
              ? '10 லிட்டர் தண்ணீருக்கு 50 முதல் 100 மில்லி கலந்து பூக்கும் பருவத்தில் இலைகளில் தெளிக்கவும்.'
              : 'Mix 50-100ml in 10 liters of water and spray during the flowering stage.'}
          </Text>
        </>
      )
    },
    {
      title: isTamil ? 'இ.எம் (EM) கரைசல்' : 'EM Solution',
      badge: isTamil ? 'நுண்ணுயிர்கள்' : 'Microbes',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="science" size={60} color={COLORS.emerald} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'EM (Effective Microorganisms) என்பது நன்மை செய்யும் நுண்ணுயிர்களின் கலவை. இதை கடைகளில் வாங்கி பெருக்கி நிலத்தில் விடலாம்.'
              : 'EM (Effective Microorganisms) is a mixture of beneficial bacteria. You can buy the starter culture and multiply it.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'பெருக்கும் முறை:' : 'Multiplication Process:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'ஒரு பேரலில் 20 லிட்டர் தண்ணீர், 1 கிலோ வெல்லம், 1 லிட்டர் EM பாட்டில் (கடையில் வாங்கியது) ஆகியவற்றை கலக்கவும்.' 
                  : 'In a barrel mix 20L water, 1kg jaggery, and 1L of original EM liquid (bought from store).'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'காற்றோட்டம் இல்லாமல் இறுக மூடி 7 நாட்கள் வைக்கவும்.' 
                  : 'Seal it airtight and leave it for 7 days.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'இப்போது 20 லிட்டர் ஆக்டிவேட்டட் EM தயார். இதில் 1 லிட்டர் எடுத்து மீண்டும் 20 லிட்டராக பெருக்கிக் கொண்டே இருக்கலாம்.' 
                  : 'Now 20L of activated EM is ready. You can take 1L from this and multiply it again into 20L continuously.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மண்புழு உரம் (பகுதி 1)' : 'Vermicompost (Part 1)',
      badge: isTamil ? 'கருப்பு தங்கம்' : 'Black Gold',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விவசாயக் கழிவுகள் மற்றும் மாட்டுச் சாணத்தை மண்புழுக்களைக் கொண்டு மட்கச் செய்து தயாரிக்கப்படும் உயர்ந்த உரம் மண்புழு உரம்.'
              : 'Vermicompost is a high-grade organic fertilizer created by earthworms breaking down farm waste and cow dung.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'படுக்கை அமைத்தல்:' : 'Setting up the bed:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'குளிர்ச்சியான நிழலான இடத்தைத் தேர்வு செய்து 10 அடி நீளம், 3 அடி அகலம், 2 அடி உயரத்தில் படுக்கை அமைக்கவும்.' 
                  : 'Choose a cool, shady place and build a bed 10ft long, 3ft wide, and 2ft high.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'அடியில் காய்ந்த இலை தழைகள், தென்னை நார்க்கழிவு போடவும். அதன் மேல் 15 நாட்கள் பழைய சாணம் மற்றும் விவசாயக் கழிவுகளைப் போடவும்.' 
                  : 'Put dry leaves/coir pith at the bottom. Add 15-day-old cow dung and farm waste on top.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'எய்சினியா ஃபோடிடா (Eisenia fetida) என்ற வகை மண்புழுக்களை 1 கிலோ அளவில் விடவும்.' 
                  : 'Release 1 kg of Eisenia fetida species of earthworms into the bed.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மண்புழு உரம் (பகுதி 2)' : 'Vermicompost (Part 2)',
      badge: isTamil ? 'பராமரிப்பு' : 'Maintenance',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/vermicompost_bed.png')}
            annotations={[
              { id: '1', x: 20, y: 70, label: isTamil ? 'காய்ந்த சருகு' : 'Dry Leaves', pointerDirection: 'right' },
              { id: '2', x: 50, y: 50, label: isTamil ? 'சாணம்' : 'Dung Layer', pointerDirection: 'down' },
              { id: '3', x: 80, y: 30, label: isTamil ? 'மண்புழு' : 'Earthworms', pointerDirection: 'left' },
            ]}
          />
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'பராமரிப்பு மற்றும் அறுவடை:' : 'Maintenance & Harvest:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'தினமும் தண்ணீர் தெளித்து 40-50% ஈரப்பதம் இருக்குமாறு பார்த்துக்கொள்ள வேண்டும்.' 
                  : 'Sprinkle water daily to maintain 40-50% moisture.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '45 முதல் 60 நாட்களில் சாணம் முழுவதும் தேயிலைத்தூள் போன்று மாறிவிடும். இதுவே மண்புழு உரம்.' 
                  : 'In 45-60 days, the dung turns into a tea-dust-like substance. This is vermicompost.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'தண்ணீர் தெளிப்பதை 2 நாள் நிறுத்தினால் புழுக்கள் அடியில் சென்றுவிடும். மேலுள்ள உரத்தை வழித்து எடுக்கலாம்.' 
                  : 'Stop watering for 2 days; worms will go to the bottom. Scrape off the compost from the top.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'தசகவ்யா' : 'Dashagavya',
      badge: isTamil ? '10 பொருட்கள்' : '10 Ingredients',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="local-florist" size={60} color={COLORS.emerald} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பஞ்சகவ்யாவில் உள்ள 5 பொருட்களுடன், 5 வகையான இலைச் சாறுகளைச் சேர்த்துத் தயாரிப்பது தசகவ்யா (10 பொருட்கள்).'
              : 'Dashagavya adds 5 types of leaf extracts to the 5 ingredients of Panchagavya, making it a 10-ingredient super mix.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'கூடுதல் 5 இலைகள்:' : 'The 5 Additional Leaves:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'எருக்கிலை, வேப்பிலை, நொச்சி, ஆடாதொடா, பப்பாளி (அல்லது ஊமத்தை)' 
                  : 'Crown flower, Neem, Vitex negundo, Malabar nut, Papaya (or Datura)'}
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பயன்பாடு: இது சிறந்த வளர்ச்சி ஊக்கியாகவும், பூஞ்சை நோய்களை (Fungal diseases) கட்டுப்படுத்தும் மருந்தாகவும் செயல்படுகிறது.'
              : 'Usage: It acts as an excellent growth promoter and a potent fungicide to control plant diseases.'}
          </Text>
        </>
      )
    },
    {
      title: isTamil ? 'இஞ்சி-பூண்டு-பச்சைமிளகாய் கரைசல்' : '3G Extract (Insect Repellent)',
      badge: isTamil ? 'பூச்சி விரட்டி' : 'Pest Repellent',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="pest-control" size={60} color={COLORS.emerald} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'அனைத்து விதமான புழுக்கள் மற்றும் பூச்சிகளை விரட்ட மிகச் சிறந்த காரமான இயற்கை கரைசல்.'
              : 'A highly pungent natural extract that acts as a broad-spectrum repellent for all kinds of worms and insects.'}
          </Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'செய்முறை:' : 'Preparation:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'இஞ்சி 1/2 கிலோ, பூண்டு 1/2 கிலோ, காரமான பச்சை மிளகாய் 1/2 கிலோ - இவற்றை தனித்தனியாக அரைத்து விழுது ஆக்கவும்.' 
                  : 'Take 0.5kg ginger, 0.5kg garlic, and 0.5kg spicy green chillies. Grind them separately into pastes.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? 'அனைத்தையும் ஒரு பானையில் போட்டு அதனுடன் 5 லிட்டர் கோமியம் சேர்த்து நன்றாக கலக்கவும்.' 
                  : 'Mix all the pastes together in a pot with 5 liters of cow urine.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil 
                  ? '3 நாட்கள் ஊறவைத்த பின் வடிகட்டவும். 10 லிட்டர் தண்ணீருக்கு 50 மிலி கரைசல் கலந்து தெளிக்கலாம்.' 
                  : 'Soak for 3 days and filter. Mix 50ml extract in 10 liters of water and spray.'}
              </Text>
            </View>
          </View>
        </>
      )
    }
  ];

  return (
    <LinearGradient
      colors={GRADIENTS.darkBg}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="leaf-sharp" size={24} color={COLORS.emerald} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isTamil ? 'இயற்கை உரங்கள் தயாரிப்பு' : 'Organic Fertilizer Guide'}
        </Text>
        <View style={styles.bookIconContainer}>
          <MaterialIcons name="eco" size={22} color={COLORS.emerald} />
        </View>
      </View>

      {/* Book Container */}
      <View style={styles.bookWrapper}>
        <View style={styles.bookSpine} />

        <Animated.View style={[styles.bookPage, { opacity: pageOpacity, transform: [{ translateX: pageTranslateX }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pageScrollContent}
            bounces={false}
          >
            <View style={styles.pageHeader}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{pages[currentPage].badge}</Text>
              </View>
              <Text style={styles.pageTitle}>{pages[currentPage].title}</Text>
            </View>

            {pages[currentPage].content()}
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>

      {/* Navigation Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.navBtn, currentPage === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentPage === 0}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chevron-left" size={28} color={currentPage === 0 ? COLORS.textSecondary : COLORS.emerald} />
          <Text style={[styles.navText, currentPage === 0 && { color: COLORS.textSecondary }]}>
            {isTamil ? 'முந்தைய' : 'Prev'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {pages.length}
        </Text>

        <TouchableOpacity
          style={[styles.navBtn, currentPage === pages.length - 1 && styles.navBtnDisabled]}
          onPress={handleNext}
          disabled={currentPage === pages.length - 1}
          activeOpacity={0.7}
        >
          <Text style={[styles.navText, currentPage === pages.length - 1 && { color: COLORS.textSecondary }]}>
            {isTamil ? 'அடுத்த' : 'Next'}
          </Text>
          <MaterialIcons name="chevron-right" size={28} color={currentPage === pages.length - 1 ? COLORS.textSecondary : COLORS.emerald} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4,106,56,0.15)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(4,106,56,0.1)',
    borderRadius: RADIUS.pill,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bookIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(4,106,56,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FAF9F6', // Off-white paper color
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  bookSpine: {
    width: 24,
    backgroundColor: '#EAE6DF',
    borderRightWidth: 1,
    borderRightColor: '#D5CEC4',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  bookPage: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  pageScrollContent: {
    padding: 24,
  },
  pageHeader: {
    marginBottom: 24,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(4, 106, 56, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 106, 56, 0.2)',
  },
  badgeText: {
    color: '#046A38',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 34,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333333',
    marginBottom: 20,
  },
  quoteBox: {
    flexDirection: 'row',
    backgroundColor: '#F3E5AB', // Soft cream/gold
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  quoteGoldBorder: {
    width: 4,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    marginRight: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#5C4033',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 16,
  },
  bulletText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#046A38',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1,
    borderTopColor: '#EAE6DF',
    marginHorizontal: 8,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(4,106,56,0.1)',
    borderRadius: RADIUS.pill,
  },
  navBtnDisabled: {
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.emerald,
    marginHorizontal: 4,
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
