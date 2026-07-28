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

export default function ModernFarmingScreen() {
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
      title: isTamil ? 'நவீன விவசாயம் என்றால் என்ன?' : 'What is Modern Farming?',
      badge: isTamil ? 'அறிமுகம்' : 'Introduction',
      content: () => (
        <>
          <Image source={require('../assets/images/modern_farming_hero.png')} style={styles.heroImage} />
          
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'நவீன விவசாயம் என்பது விவசாயத்தில் புதிய எளிய தொழில்நுட்பங்களையும் கருவிகளையும் பயன்படுத்துவதாகும். பழைய காலத்தில் நாம் வானிலையையும் யூகங்களையும் மட்டுமே நம்பியிருந்தோம். இப்போது நாம் துல்லியமான கருவிகளைப் பயன்படுத்தி விவசாயம் செய்கிறோம்.'
              : 'Modern farming is about using simple new tools and technologies in agriculture. In the old days, we relied only on weather and guesswork. Today, we use simple tools to know exactly what is happening.'}
          </Text>
          
          <View style={styles.quoteBox}>
            <View style={styles.quoteGoldBorder} />
            <Text style={styles.quoteText}>
              {isTamil
                ? 'ஒரே ஒரு எளிய மாற்றத்தால் உங்கள் உழைப்பையும் நேரத்தையும் 50% மிச்சப்படுத்த முடியும்!'
                : 'A single simple change can save 50% of your labor and time!'}
            </Text>
          </View>

          <Text style={styles.subHeader}>
            {isTamil ? 'ஏன் நாம் நவீன விவசாயத்திற்கு மாற வேண்டும்?' : 'Why change to Modern Farming?'}
          </Text>

          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'தண்ணீர் வீணாவதை தடுக்கிறது.' 
                : 'Saves water from being wasted.'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'உரம் மற்றும் பூச்சிக்கொல்லி செலவை பாதியாக குறைக்கிறது.' 
                : 'Cuts fertilizer and pesticide cost in half.'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'மண்ணின் வளத்தை நீண்ட காலத்திற்கு பாதுகாக்கிறது.' 
                : 'Protects the soil health for a long time.'}
            </Text>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'கைபேசியில் ஜிபிஎஸ் (GPS) பயன்பாடு' : 'Using GPS on Your Mobile',
      badge: isTamil ? 'தொழில்நுட்பம்' : 'Technology',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/modern_farming_gps.png')}
            annotations={[
              { id: '1', x: 50, y: 30, label: isTamil ? 'பச்சை: நல்ல மண்' : 'Green: Good Soil', pointerDirection: 'left' },
              { id: '2', x: 50, y: 70, label: isTamil ? 'மஞ்சள்: உரம் தேவை' : 'Yellow: Needs Fertilizer', pointerDirection: 'right' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'இப்போது எல்லோர் கையிலும் ஸ்மார்ட்போன் உள்ளது. அதில் உள்ள ஜிபிஎஸ் (GPS) வசதியை இலவச மொபைல் செயலிகள் மூலம் பயன்படுத்தி உங்கள் வயலின் அளவை சரியாக அளக்கலாம். எந்த இடத்தில் பயிர்கள் பலவீனமாக உள்ளன என்பதைப் படமாக பார்க்கலாம்.'
              : 'Everyone has a smartphone today. You can use free GPS apps to measure the exact size of your land and see satellite photos showing which parts of your crops are weak.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'யதார்த்தத்தில் செய்வது எப்படி?' : 'How to do it in real life:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'உங்கள் போனில் "GPS Fields Area Measure" என்ற இலவச செயலியை பதிவிறக்கம் செய்யவும்.'
                  : 'Download the free app "GPS Fields Area Measure" on your smartphone.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'உங்கள் வயலின் எல்லையைச் சுற்றி நடந்து செல்லவும், அது உங்கள் நிலத்தின் பரப்பளவை காட்டும்.'
                  : 'Walk along the borders of your land with the phone; it will calculate the exact area.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'இதன் மூலம் உரம் மற்றும் விதைகளை சரியான அளவில் மட்டுமே வாங்க முடியும்.'
                  : 'Buy only the exact amount of seeds and fertilizer needed for this size.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'துல்லியமான உரம் கலவை இயந்திரம்' : 'Precision Fertilizer Mixing',
      badge: isTamil ? 'இயந்திரம்' : 'Machinery',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/modern_farming_mixing.png')}
            annotations={[
              { id: '1', x: 50, y: 40, label: isTamil ? 'சரியான அளவு உரம்' : 'Correct Fertilizer Amount', pointerDirection: 'left' },
              { id: '2', x: 50, y: 70, label: isTamil ? 'கலவை இயந்திரம்' : 'Mixing Tank', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பழைய முறையில் கைகளால் உரத்தை அள்ளி வீசுவோம். இதனால் சில செடிகளுக்கு அதிகமாகவும், சிலவற்றிற்கு குறைவாகவும் உரம் கிடைக்கும். நவீன உரம் கலக்கும் பம்புகள் மற்றும் வென்சூரி குழாய்கள் பயிருக்கு எவ்வளவு உரம் தேவையோ அதை மட்டும் சரியாக அளந்து தண்ணீருடன் கலந்து வேருக்கே அனுப்புகிறது.'
              : 'In the old way, we threw fertilizer by hand, wasting it. Modern fertilizer mixers and Venturi injectors measure the exact dosage and mix it with water, sending it directly to the roots.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'விவசாயி செய்ய வேண்டியவை:' : 'How a farmer can apply this:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? '₹800 முதல் ₹1500 மதிப்பிலான ஒரு "வென்சூரி இன்ஜெக்டர்" (Venturi Injector) குழாயை வாங்கி உங்கள் பாசனக் குழாயில் இணைக்கவும்.'
                  : 'Buy a simple plastic Venturi Injector (costs ₹800 - ₹1500) and connect it to your main irrigation pipe.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'ஒரு பெரிய டிரம் தண்ணீரில் உரத்தை கரைத்து, வென்சூரியின் உறிஞ்சும் குழாயை அதில் போடவும்.'
                  : 'Dissolve your fertilizer in a plastic drum of water, and put the Venturi suction pipe in it.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'தண்ணீர் பாயும்போது உரம் தானாகவே சரியான அளவில் உறிஞ்சப்பட்டு பயிர்களுக்குச் செல்லும். உழைப்பு மிச்சமாகும்!'
                  : 'As water flows, it will suck the liquid fertilizer and feed crops evenly without extra work.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மண் பரிசோதனை கருவிகள்' : 'Easy Soil Testing Tools',
      badge: isTamil ? 'மண் வளம்' : 'Soil Health',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/soil_testing.png')}
            annotations={[
              { id: '1', x: 50, y: 50, label: isTamil ? 'மண் மாதிரி' : 'Soil Sample', pointerDirection: 'right' },
              { id: '2', x: 30, y: 20, label: isTamil ? 'சோதனை கருவி' : 'Testing Tool', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'டாக்டரிடம் சென்று ரத்தம் பரிசோதிப்பது போல, உங்கள் மண்ணையும் பரிசோதிக்க வேண்டும். மண் அமிலமாக (sour) உள்ளதா அல்லது காரமாக (bitter) உள்ளதா என்பதைப் பொறுத்துதான் செடிகள் சத்தை உறிஞ்சும். இதற்கான சிறிய பேனா வடிவ கருவிகள் இப்போது கிடைக்கின்றன.'
              : 'Just like testing blood at a hospital, we must test soil. Soil pH controls how plants eat food. Small pocket-sized testing pens are now cheap and easily available.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'மண்ணை பரிசோதிக்கும் எளிய வழி:' : 'How to test soil yourself:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'விவசாயக் கடைகளிலோ அல்லது ஆன்லைனிலோ ₹400 மதிப்பிலான "Soil pH Meter" வாங்குங்கள் (இதற்கு பேட்டரி தேவையில்லை).'
                  : 'Buy a digital "Soil pH Meter" (costs around ₹400 online, no battery needed).'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வயலின் 4-5 இடங்களில் மண்ணை நனைத்து, இந்த கருவியின் கம்பியை மண்ணில் 6 இன்ச் ஆழத்திற்கு நுழைக்கவும்.'
                  : 'Wet the soil in 4-5 different spots of your field, and push the metal probe 6 inches deep.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'pH 6.5 முதல் 7 வரை இருந்தால் மண் நலம். 6-க்கு கீழ் இருந்தால் சுண்ணாம்பு (lime) போடுங்கள். 7.5-க்கு மேல் இருந்தால் ஜிப்சம் (gypsum) போடுங்கள்.'
                  : 'If pH is 6.5 to 7, soil is great. Below 6, add lime. Above 7.5, add gypsum to balance it.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'சொட்டு நீர் பாசன அமைப்பு' : 'Drip Irrigation Setup',
      badge: isTamil ? 'நீர் மேலாண்மை' : 'Water Control',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/drip_irrigation.png')}
            annotations={[
              { id: '1', x: 40, y: 60, label: isTamil ? 'சொட்டு நீர் குழாய்' : 'Drip Pipe', pointerDirection: 'up' },
              { id: '2', x: 45, y: 80, label: isTamil ? 'தண்ணீர் சொட்டு' : 'Water Drop', pointerDirection: 'up' },
              { id: '3', x: 20, y: 30, label: isTamil ? 'பயிர்' : 'Crop', pointerDirection: 'right' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'வயல் முழுவதும் தண்ணீரை பாய்ச்சி சேறாக்குவதற்கு பதிலாக, கறுப்பு பிளாஸ்டிக் குழாய்கள் மூலம் செடியின் வேர்களுக்கு மட்டும் சொட்டு சொட்டாக தண்ணீர் அளிப்பதுதான் சொட்டு நீர் பாசனம். இதனால் செடிகளுக்கு தாகம் தணிவதுடன் வீணான இடங்களுக்கு தண்ணீர் போகாது.'
              : 'Instead of flooding the entire field, black plastic pipes drip water slowly directly at the roots of each plant. This keeps the root zone moist and prevents wasting water on open spaces.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'ஏன் இது மிக முக்கியம்?' : 'Key practical benefits:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? '50% வரை தண்ணீர் சேமிக்கப்படும் - கிணற்றில் நீர் குறைந்தாலும் விவசாயம் செய்யலாம்.'
                  : 'Saves 50% water - you can cultivate even with low well water.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'தண்ணீர் இல்லாத இடங்களில் களைகள் வளராது - களை எடுக்கும் செலவு மிச்சம்!'
                  : 'Weeds do not grow in dry dry lanes - saves high weeding labor costs.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'அரசு மானியங்கள்: சொட்டு நீர் பாசனம் அமைக்க அரசு 75% முதல் 100% வரை மானியம் வழங்குகிறது.'
                  : 'Government Subsidy: Governments offer 75% to 100% subsidy for setting this up.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'நவீன ஸ்மார்ட் டிராக்டர் கருவிகள்' : 'Modern Tractor Attachments',
      badge: isTamil ? 'இயந்திரம்' : 'Machines',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/smart_tractor_diagram_base.png')}
            annotations={[
              { id: '1', x: 45, y: 15, label: isTamil ? 'வழி காட்டும் ஆண்டெனா' : 'Guidance Antenna', pointerDirection: 'right' },
              { id: '2', x: 80, y: 55, label: isTamil ? 'கேமரா' : 'Camera Sensor', pointerDirection: 'right' },
              { id: '3', x: 20, y: 70, label: isTamil ? 'தானியங்கி தெளிப்பான்' : 'Automatic Sprayer', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'புது டிராக்டர் வாங்க வேண்டியதில்லை. உங்கள் பழைய டிராக்டரிலேயே சில புதிய தானியங்கி கருவிகளை இணைத்து வேலைகளை எளிதாக்கலாம். உதாரணமாக, விதை போடும் கருவி (Seed Drill) மற்றும் விசிறி தெளிப்பான்கள் (Boom Sprayer) ஆகியவை நேரத்தை மிச்சப்படுத்தும்.'
              : 'You do not need to buy a new tractor. You can attach smart implements to your existing tractor to make work fast. Seed drills plant seeds at equal depth, and boom sprayers cover wide areas quickly.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'அன்றாட வாழ்வில் எப்படிப் பயன்படுத்துவது?' : 'How to use these implements:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'விதைக்கும்போது "டிராக்டர் சீட் ட்ரில்" (Seed Drill) கருவியை வாடகைக்கு அமர்த்தவும். இது ஒரே நாளில் ஏக்கர் கணக்கில் சம இடைவெளியில் விதைகளை நட்டுவிடும்.'
                  : 'Rent a "Seed Drill" attachment. It digs, drops seed at exact depth, and covers it with soil in one go.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'பூச்சி மருந்து அடிக்க பெரிய இறக்கைகள் கொண்ட "பூம் ஸ்ப்ரேயர்" (Boom Sprayer) பயன்படுத்துங்கள். ஒரே சீராக மருந்து தெளிக்கப்படும்.'
                  : 'Use a "Boom Sprayer" attachment with multiple nozzles. It sprays a wide path, ensuring no spot is missed.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மழைநீர் சேகரிப்பு குட்டை' : 'Rainwater Harvesting Pond',
      badge: isTamil ? 'நீர் மேலாண்மை' : 'Water Control',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/rainwater_harvesting.png')}
            annotations={[
              { id: '1', x: 20, y: 30, label: isTamil ? 'நீர் வரத்து' : 'Inlet Channel', pointerDirection: 'right' },
              { id: '2', x: 50, y: 80, label: isTamil ? 'பிளாஸ்டிக் விரிப்பு' : 'Plastic Lining', pointerDirection: 'up' },
              { id: '3', x: 80, y: 40, label: isTamil ? 'பம்ப் செட்' : 'Water Pump', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'மழை பெய்யும்போது பல லட்சம் லிட்டர் தண்ணீர் வீணாக ஓடிவிடுகிறது. வயலின் தாழ்வான பகுதியில் ஒரு சிறிய பண்ணைக்குட்டை (Farm Pond) அமைத்தால், வறட்சி காலங்களில் அந்த நீரை விவசாயத்திற்கு பயன்படுத்தலாம்.'
              : 'Millions of liters of water run off during rains. If you dig a small farm pond in the lowest part of your field, you can save this water and use it during droughts.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'பண்ணைக்குட்டை அமைப்பது எப்படி?' : 'How to build a farm pond:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வயலின் சரிவான பகுதியில் 100 அடி நீளம், 100 அடி அகலம், 10 அடி ஆழத்தில் குழி வெட்டவும்.'
                  : 'Dig a pit 100x100x10 feet in the sloped area of your field.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'தண்ணீர் மண்ணில் உறிஞ்சப்படாமல் இருக்க 500 மைக்ரான் HDPE பிளாஸ்டிக் தார்பாலின் விரிக்கவும்.'
                  : 'Lay a 500 micron HDPE plastic tarpaulin to prevent water from soaking into the soil.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'இது குறைந்தது 5 லட்சம் லிட்டர் தண்ணீரை சேமிக்கும். அரசு மானியம் (100% வரை) உழவர் துறை மூலம் கிடைக்கும்!'
                  : 'This stores 5 lakh liters of water. Ask your local agriculture office for a 100% government subsidy!'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'இயற்கை பூச்சிக் கட்டுப்பாடு (IPM)' : 'Natural Pest Control (IPM)',
      badge: isTamil ? 'பயிர் பாதுகாப்பு' : 'Crop Protection',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/natural_pest_control.png')}
            annotations={[
              { id: '1', x: 20, y: 50, label: isTamil ? 'வேப்ப எண்ணெய்' : 'Neem Spray', pointerDirection: 'right' },
              { id: '2', x: 50, y: 20, label: isTamil ? 'நன்மை செய்யும் பூச்சி' : 'Friendly Bug', pointerDirection: 'down' },
              { id: '3', x: 80, y: 50, label: isTamil ? 'பொறிப் பயிர்' : 'Trap Crop', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'ரசாயன மருந்துகள் அடிப்பதனால் பூச்சிகளுக்கு எதிர்ப்பு சக்தி அதிகரித்து மருந்து வேலை செய்யாமல் போகிறது. இயற்கை முறையில் ஒருங்கிணைந்த பூச்சி மேலாண்மை (Integrated Pest Management) செய்தால், செலவும் இல்லை நஞ்சும் இல்லை.'
              : 'Chemical sprays make pests resistant over time. Integrated Pest Management (IPM) uses natural ways to control pests at a fraction of the cost, without poison.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'இயற்கை முறையில் பூச்சிகளைத் தடுக்க:' : 'How to prevent pests naturally:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'பொறிப் பயிர்: வயலைச் சுற்றி செண்டுமல்லி (Marigold) நட்டால், பூச்சிகள் செண்டுமல்லியைத் தேடி சென்றுவிடும். மெயின் பயிர் தப்பிக்கும்.'
                  : 'Trap crops: Plant Marigold around your field. Pests will attack the marigold and leave your main crop alone.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'மஞ்சள் ஒட்டும் அட்டை (Yellow Sticky Trap): ஏக்கருக்கு 10 அட்டைகளை வைத்தால், பறக்கும் பூச்சிகள் எல்லாம் அதில் ஒட்டிக்கொள்ளும்.'
                  : 'Yellow Sticky Traps: Place 10 boards per acre. Flying pests are attracted to yellow and get stuck.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வேப்ப எண்ணெய் கரைசல்: 300 PPM வேப்ப எண்ணெயை சோப்பு தண்ணீருடன் கலந்து அடித்தால், பூச்சிகளின் முட்டைகள் அழிந்துவிடும்.'
                  : 'Neem Oil Spray: Mix 300 PPM Neem oil with soapy water. It destroys pest eggs naturally.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'சோலார் பம்ப் செட்' : 'Solar Power for Farms',
      badge: isTamil ? 'சக்தி' : 'Energy',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/solar_pump_farm.png')}
            annotations={[
              { id: '1', x: 30, y: 40, label: isTamil ? 'சோலார் பேனல்' : 'Solar Panels', pointerDirection: 'right' },
              { id: '2', x: 70, y: 70, label: isTamil ? 'பம்பு மோட்டார்' : 'Pump Motor', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விவசாய மின்சாரம் எப்போது வரும், எப்போது போகும் எனத் தெரியாது. சூரிய ஒளி மூலம் இயங்கும் சோலார் மோட்டார்களைப் பயன்படுத்தினால் பகல் நேரத்தில் தடையில்லா தண்ணீர் பெறலாம்.'
              : 'Farm electricity is unpredictable. Using a solar-powered water pump means you get uninterrupted water supply during the day, every day.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'சோலார் அமைக்கத் தேவையானவை:' : 'How to set up a Solar Pump:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'PM-KUSUM திட்டம்: மத்திய மற்றும் மாநில அரசுகள் சோலார் பம்ப் அமைக்க 70% முதல் 90% வரை மானியம் வழங்குகின்றன.'
                  : 'PM-KUSUM Scheme: The government provides a 70% to 90% subsidy for farmers to buy solar pumps.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'திறன்: ஒரு 5 HP (குதிரைத்திறன்) மோட்டார் இயக்க சுமார் 15 சோலார் பேனல்கள் தேவைப்படும்.'
                  : 'Capacity: A 5 HP motor requires about 15 solar panels.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'பராமரிப்பு: பேட்டரி தேவை இல்லை. மோட்டார் நேரடியாக ஓடும். பேனல்களை வாரம் ஒருமுறை தண்ணீரால் கழுவினால் போதும்.'
                  : 'Maintenance: No batteries are needed. Just wash the panels with water once a week.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'விவசாய ட்ரோன்கள் (Drones)' : 'Agriculture Drones',
      badge: isTamil ? 'தொழில்நுட்பம்' : 'Technology',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/drone_farming.png')}
            annotations={[
              { id: '1', x: 50, y: 20, label: isTamil ? 'விவசாய ட்ரோன்' : 'Agri Drone', pointerDirection: 'right' },
              { id: '2', x: 50, y: 60, label: isTamil ? 'நுண் தெளிப்பு' : 'Mist Spray', pointerDirection: 'down' },
              { id: '3', x: 20, y: 80, label: isTamil ? 'ரிமோட் கண்ட்ரோல்' : 'Remote Control', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'ஒரு ஏக்கருக்கு மருந்து அடிக்க ஒரு ஆள் நாள் முழுவதும் ஆகுமா? ஒரு விவசாய ட்ரோன் மூலம் வெறும் 7 நிமிடங்களில் ஒரு ஏக்கருக்கு மருந்து அடித்து விடலாம்!'
              : 'Does it take a whole day to spray one acre manually? An agriculture drone can perfectly spray an entire acre in just 7 minutes!'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'ட்ரோன்களின் நன்மைகள்:' : 'Advantages of Drones:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'மருந்து சேமிப்பு: ட்ரோன்கள் மருந்தை புகையாக (Mist) தெளிப்பதால் 30% மருந்து மிச்சமாகும்.'
                  : 'Chemical savings: Drones spray in a fine mist, saving up to 30% of the pesticide.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'உடல்நலம் பாதுகாப்பு: விவசாயி மருந்தை சுவாசிக்க வேண்டியதில்லை. தூரத்தில் நின்றுகொண்டே இயக்கலாம்.'
                  : 'Health safety: You stand far away with a remote; no need to breathe toxic chemicals.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வாடகை: ட்ரோன்களை லட்சக்கணக்கில் கொடுத்து வாங்க வேண்டாம். ஒரு ஏக்கருக்கு ₹400-₹600 கொடுத்து வாடகைக்கு எடுக்கலாம்.'
                  : 'Rentals: Do not buy a drone. You can rent a drone spraying service for ₹400-₹600 per acre.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'காலநிலை மாற்றத்தை எதிர்கொள்ளுதல்' : 'Climate Change Adaptation',
      badge: isTamil ? 'சுற்றுச்சூழல்' : 'Environment',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பருவமழை மாறிப் பெய்வதும், அதிக வெயிலும் விவசாயத்திற்கு பெரும் சவாலாக உள்ளன. பழைய முறைகளை மட்டும் நம்பியிருக்காமல், காலநிலைக்கு ஏற்றவாறு நம்மை மாற்றிக்கொள்ள வேண்டும்.'
              : 'Unpredictable rains and extreme heat are major threats today. We cannot just rely on old methods; we must adapt to the changing climate.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'காலநிலை மாற்றத்தை தாங்கும் வழிகள்:' : 'Ways to survive climate changes:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வறட்சியைத் தாங்கும் ரகங்கள்: அதிக தண்ணீர் தேவைப்படும் பழைய ரகங்களுக்கு பதிலாக, வறட்சியைத் தாங்கும் புதிய ரக விதைகளை (எ.கா: கோ-51 நெல்) பயன்படுத்துங்கள்.'
                  : 'Drought-resistant varieties: Use modern seed varieties developed to grow well even with less water.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'நிலப்போர்வை (Mulching): செடிகளின் வேர்ப் பகுதியில் காய்ந்த சருகுகள் அல்லது பிளாஸ்டிக் ஷீட் கொண்டு மூடினால், மண் ஈரம் ஆவியாகாது.'
                  : 'Mulching: Cover the soil around the plants with dry leaves or plastic sheets. This stops moisture from evaporating in the sun.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'நிழல் வலைக் குடில் (Shade Net): அதிக வெயிலில் கருகும் காய்கறிகளை, பச்சை நிற நிழல் வலை அமைத்து வளர்த்தால் நல்ல மகசூல் கிடைக்கும்.'
                  : 'Shade Nets: For vegetables that burn in extreme summer heat, setting up a green shade net provides a cool micro-climate.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'அரசுத் திட்டங்கள் மற்றும் மானியங்கள்' : 'Government Schemes & Subsidies',
      badge: isTamil ? 'நிதி உதவி' : 'Financial Aid',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விவசாயிகளுக்காக எண்ணற்ற அரசு திட்டங்கள் உள்ளன. ஆனால் பலருக்கும் அது தெரிவதில்லை. அதிகாரிகளை நேரில் அணுகி இவற்றை பெற்றுப் பயன்பெறுங்கள்.'
              : 'There are numerous government schemes for farmers, but many don\'t know about them. Approach the agriculture office and take advantage.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'முக்கியமான திட்டங்கள்:' : 'Important Schemes to know:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'PM-KISAN: விவசாயிகளுக்கு ஆண்டுக்கு ₹6000 நிதியுதவி வழங்கப்படும் திட்டம். சிட்டா, அடங்கல் கொண்டு இ-சேவை மையத்தில் பதியலாம்.'
                  : 'PM-KISAN: Direct cash transfer of ₹6000 per year to farmers. Register at your local E-Seva center.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'சொட்டு நீர் பாசன மானியம்: சிறு, குறு விவசாயிகளுக்கு 100% மானியத்திலும், இதர விவசாயிகளுக்கு 75% மானியத்திலும் வழங்கப்படுகிறது.'
                  : 'Drip Irrigation Subsidy: 100% subsidy for small/marginal farmers, 75% for others to install drip systems.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'KCC (Kisan Credit Card): வங்கிகள் மூலம் மிகக் குறைந்த வட்டியில் (4%) விவசாயக் கடன் பெறலாம்.'
                  : 'Kisan Credit Card (KCC): Get farm loans from banks at very low interest rates (around 4%).'}
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
          <Ionicons name="leaf-sharp" size={24} color={COLORS.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isTamil ? 'நவீன விவசாய வழிகாட்டி' : 'Modern Farming Guide'}
        </Text>
        <View style={styles.bookIconContainer}>
          <MaterialIcons name="menu-book" size={22} color={COLORS.gold} />
        </View>
      </View>

      {/* Book Container */}
      <View style={styles.bookWrapper}>
        {/* Left spine of the book to give 3D feel */}
        <View style={styles.bookSpine} />

        <Animated.View 
          style={[
            styles.bookPage, 
            { 
              opacity: pageOpacity,
              transform: [{ translateX: pageTranslateX }]
            }
          ]}
        >
          {/* Header metadata inside book page */}
          <View style={styles.pageHeaderMeta}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{pages[currentPage].badge}</Text>
            </View>
            <Text style={styles.pageNumberText}>
              {isTamil ? `பக்கம் ${currentPage + 1}` : `Page ${currentPage + 1}`}
            </Text>
          </View>

          <ScrollView 
            style={styles.pageScrollView} 
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>{pages[currentPage].title}</Text>
            <View style={styles.titleDivider} />
            {pages[currentPage].content()}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Book Pagination Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]} 
          onPress={handlePrev}
          disabled={currentPage === 0}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="arrow-back-ios" 
            size={18} 
            color={currentPage === 0 ? "rgba(212,175,55,0.2)" : COLORS.gold} 
          />
          <Text style={[styles.navButtonText, currentPage === 0 && styles.navButtonTextDisabled]}>
            {isTamil ? 'முந்தைய' : 'Back'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${((currentPage + 1) / pages.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.pageIndicatorText}>
            {currentPage + 1} / {pages.length}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.navButton, currentPage === pages.length - 1 && styles.navButtonDisabled]} 
          onPress={handleNext}
          disabled={currentPage === pages.length - 1}
          activeOpacity={0.8}
        >
          <Text style={[styles.navButtonText, currentPage === pages.length - 1 && styles.navButtonTextDisabled]}>
            {isTamil ? 'அடுத்த' : 'Next'}
          </Text>
          <MaterialIcons 
            name="arrow-forward-ios" 
            size={18} 
            color={currentPage === pages.length - 1 ? "rgba(212,175,55,0.2)" : COLORS.gold} 
          />
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(4,106,56,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  bookIconContainer: {
    padding: SPACING.sm,
  },
  
  // Book Spacing
  bookWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    ...SHADOWS.card,
  },
  bookSpine: {
    width: 14,
    backgroundColor: '#01150B',
    borderRightWidth: 1,
    borderRightColor: 'rgba(212,175,55,0.3)',
  },
  bookPage: {
    flex: 1,
    backgroundColor: COLORS.glassCard,
    padding: SPACING.md,
  },
  pageHeaderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.1)',
    paddingBottom: SPACING.sm,
  },
  badgeContainer: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 0.5,
    borderColor: COLORS.goldBorderSoft,
  },
  badgeText: {
    color: COLORS.textGold,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pageNumberText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  pageScrollView: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginTop: SPACING.sm,
  },
  titleDivider: {
    height: 2,
    width: 80,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'justify',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
    gap: SPACING.xs,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Quote Callout
  quoteBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(4,106,56,0.25)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  quoteGoldBorder: {
    width: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textGold,
    lineHeight: 20,
    fontWeight: '600',
  },

  // Steps style
  stepContainer: {
    backgroundColor: 'rgba(2,26,14,0.4)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.goldBorderSoft,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Pagination Footer
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    backgroundColor: 'transparent',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(4,106,56,0.3)',
    borderRadius: RADIUS.md,
    borderWidth: 0.5,
    borderColor: COLORS.goldBorderSoft,
    gap: SPACING.xs,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textGold,
  },
  navButtonTextDisabled: {
    color: 'rgba(212,175,55,0.4)',
  },
  progressContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  progressBarBg: {
    width: 70,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  pageIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
});
