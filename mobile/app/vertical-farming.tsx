import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from './_layout';
import AnnotatedImage from '../components/AnnotatedImage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../constants/theme';

export default function VerticalFarmingScreen() {
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
      title: isTamil ? 'செங்குத்து விவசாயம் என்றால் என்ன?' : 'What is Vertical Farming?',
      badge: isTamil ? 'அறிமுகம்' : 'Introduction',
      content: () => (
        <>
          <Image source={require('../assets/images/vertical_farming_hero.png')} style={styles.heroImage} />
          
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'செங்குத்து விவசாயம் என்பது நிலத்தில் சாதாரணமாக பயிர் செய்யாமல், அடுக்கு மாடி அலமாரிகள் போல செங்குத்தாக அடுக்கு அடுக்குகளாக விவசாயம் செய்வதாகும். இதில் சுவாரசியமான விஷயம் என்னவென்றால், இதற்கு மண்ணே தேவையில்லை! இதனால் வெயில், பெருமழை, பூச்சிகள் போன்ற கவலைகள் எதுவும் இதில் கிடையாது.'
              : 'Vertical farming is growing crops stacked in vertical layers (like shelves in a cupboard) instead of spread out over a flat field. The best part? It doesn\'t need soil at all! You don\'t have to worry about storms, soil pests, or scorching heat.'}
          </Text>

          <View style={styles.quoteBox}>
            <View style={styles.quoteGoldBorder} />
            <Text style={styles.quoteText}>
              {isTamil
                ? 'உங்கள் வீட்டின் மொட்டை மாடி அல்லது பால்கனியிலேயே ஒரு ஏக்கர் விவசாய உற்பத்தியை செய்ய முடியும்!'
                : 'You can produce an entire acre\'s worth of crops on a simple home balcony or terrace!'}
            </Text>
          </View>

          <Text style={styles.subHeader}>
            {isTamil ? 'இதன் முக்கிய நன்மைகள்:' : 'Key Advantages:'}
          </Text>

          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'மண்ணே தேவையில்லை - களிமண், மணல் என எந்த கவலையும் இல்லை.' 
                : 'No soil needed - zero worries about soil fertility or weeds.'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? '90% குறைவான தண்ணீர் மட்டுமே போதும்.' 
                : 'Uses 90% less water than normal fields.'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'ஆண்டு முழுவதும் தடையின்றி பயிர் வளர்க்கலாம்.' 
                : 'Grow food 365 days a year without relying on seasons.'}
            </Text>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'எளிய பால்கனி / மாடித் தோட்டம் (PVC குழாய்கள்)' : 'Simple Balcony Setup (PVC Pipes)',
      badge: isTamil ? 'வீட்டுத் தோட்டம்' : 'DIY Setup',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/vertical_farming_balcony.png')}
            annotations={[
              { id: '1', x: 30, y: 40, label: isTamil ? 'செடிகள்' : 'Plants', pointerDirection: 'right' },
              { id: '2', x: 60, y: 60, label: isTamil ? 'பிவிசி குழாய்' : 'PVC Pipe', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'மிகவும் எளிதாக நமது வீட்டு பால்கனியிலோ அல்லது மொட்டை மாடியிலோ பிவிசி (PVC) குழாய்களைப் பயன்படுத்தி செங்குத்து அமைப்பை உருவாக்கலாம். இதற்கு மண் தேவையில்லை, சிறிய தேங்காய் நார்க் கழிவு மட்டுமே போதும்.'
              : 'You can easily build a vertical garden on your terrace or balcony using PVC pipes. No soil is needed; we use coconut fiber (coco-peat) to hold the plants.'}
          </Text>

          <AnnotatedImage 
            source={require('../assets/images/pvc_vertical_farm.png')}
            annotations={[
              { id: '1', x: 20, y: 30, label: isTamil ? 'செடிகள்' : 'Plants', pointerDirection: 'right' },
              { id: '2', x: 50, y: 85, label: isTamil ? 'தண்ணீர் தொட்டி' : 'Water Tank', pointerDirection: 'up' },
            ]}
          />

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'உருவாக்கும் எளிய வழிமுறை:' : 'DIY Setup Steps:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? '4-இன்ச் தடிமனுள்ள PVC குழாய்களை வாங்கி, 8-இன்ச் இடைவெளியில் வட்டத் துளைகள் போடுங்கள்.'
                  : 'Get 4-inch PVC pipes and drill 3-inch wide holes along it, spaced 8 inches apart.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'துளைகளில் துளையிட்ட சிறிய நெட்-கப்களை (net cups) வைத்து அதில் தேங்காய் நார் கழிவை நிரப்பி செடியை நடவும்.'
                  : 'Place plants in small plastic net cups filled with coco-peat, and drop them in the PVC holes.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'குழாய்களின் வழியே சத்துள்ள நீரை மெதுவாக பாயவிடவும். ஒரு சிறிய மோட்டார் தண்ணீரை மேலே கொண்டு செல்லும்.'
                  : 'Use a small ₹300 water pump to circulate nutrient-mixed water through the pipes from a bottom bucket.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'வகை 1: ஹைட்ரோபோனிக்ஸ் (Hydroponics)' : 'Type 1: Hydroponics (Water Farming)',
      badge: isTamil ? 'வகை 1' : 'Type 1',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/hydroponic_diagram_base.png')}
            annotations={[
              { id: '1', x: 50, y: 15, label: isTamil ? 'LED விளக்கு' : 'LED Light', pointerDirection: 'right' },
              { id: '2', x: 20, y: 40, label: isTamil ? 'வளரும் குழாய்' : 'Growth Pipe', pointerDirection: 'right' },
              { id: '3', x: 75, y: 65, label: isTamil ? 'தண்ணீர் பம்ப்' : 'Water Pump', pointerDirection: 'left' },
              { id: '4', x: 50, y: 85, label: isTamil ? 'ஊட்டச்சத்து தொட்டி' : 'Nutrient Tank', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'ஹைட்ரோபோனிக்ஸ் என்பது "தண்ணீரில் விவசாயம்" செய்வதாகும். செடிகளின் வேர்கள் நேரடியாக ஓடும் நீரில் தொங்கும்படி வைக்கப்படும். தண்ணீரில் தாவரத்திற்கு தேவையான 16 வகையான சத்துக்கள் (Nutrients) கலக்கப்படும். செடி நேரடியாக சத்துநீரைக் குடித்து வளரும்.'
              : 'Hydroponics means water farming. Plant roots sit in a shallow stream of water. Plant food (nutrients) is dissolved into the water tank. The plants drink this liquid nutrient soup directly.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'விவசாயி புரிந்து கொள்ள வேண்டியவை:' : 'What you need to know:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>•</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'மண்ணில் போடும் உரம் தண்ணீரில் அடித்துச் செல்லப்பட்டு வீணாகும். ஆனால் இங்கு நீர் மறுசுழற்சி செய்யப்படுவதால் 100% உரம் செடிகளுக்கே போய்ச் சேரும்.'
                  : 'Unlike open soil where nutrients wash away, here the water is recirculated, so crops absorb 100% of the nutrients.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>•</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'சூரிய ஒளி இல்லாத வீட்டுக்குள்ளும் வளர்க்கலாம். அதற்கு மேலே LED விளக்கு அமைத்தால் போதும்.'
                  : 'You can grow crops indoors under special LED grow lights which mimic sunlight.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'வகை 2: ஏரோபோனிக்ஸ் (Aeroponics)' : 'Type 2: Aeroponics (Air Farming)',
      badge: isTamil ? 'வகை 2' : 'Type 2',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/aeroponics_roots.png')}
            annotations={[
              { id: '1', x: 50, y: 30, label: isTamil ? 'அந்தரத்தில் வேர்கள்' : 'Hanging Roots', pointerDirection: 'left' },
              { id: '2', x: 75, y: 60, label: isTamil ? 'நீர் தெளிப்பான்' : 'Misting Nozzle', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'ஏரோபோனிக்ஸ் என்பது "காற்றில் விவசாயம்" செய்வதாகும். இதில் வேர்கள் நீரிலும் இருக்காது, மண்ணிலும் இருக்காது. அவை ஒரு இருண்ட பெட்டிக்குள் காற்றில் தொங்கும். ஒரு சிறிய தெளிப்பான் (spray nozzle) மூலம் சில நிமிடங்களுக்கு ஒருமுறை வேர்கள் மீது சத்து நீர் பனித்துளி போல தெளிக்கப்படும்.'
              : 'Aeroponics means air farming. Plant roots hang in mid-air inside a dark chamber. Small misting sprayers spray a fine mist of nutrient water onto the roots every few minutes.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'இதன் சிறப்பம்சம் என்ன?' : 'Why is this special?' }
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வேர்களுக்கு அதிக ஆக்சிஜன் காற்று கிடைப்பதால் செடிகள் வழக்கமான விவசாயத்தை விட 3 மடங்கு வேகமாக வளரும்.'
                  : 'Roots get 100% access to oxygen, making crops grow up to 3 times faster than normal soil.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'மிகக் குறைந்த அளவே தண்ணீர் செலவாகும். கீரைகள், முட்டைக்கோஸ், தக்காளி, உருளைக்கிழங்குக்கு இது மிகவும் உகந்தது.'
                  : 'Uses the absolute lowest amount of water. Ideal for leafy greens, cabbage, tomatoes, and potatoes.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'வகை 3: அக்வாபோனிக்ஸ் (Aquaponics)' : 'Type 3: Aquaponics (Fish + Plant)',
      badge: isTamil ? 'வகை 3' : 'Type 3',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/vertical_farming_fish.png')}
            annotations={[
              { id: '1', x: 50, y: 30, label: isTamil ? 'செடியின் வேர்கள்' : 'Plant Roots', pointerDirection: 'left' },
              { id: '2', x: 50, y: 70, label: isTamil ? 'மீன் தொட்டி' : 'Fish Tank', pointerDirection: 'up' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'அக்வாபோனிக்ஸ் என்பது மீன் வளர்ப்பையும் தாவர விவசாயத்தையும் இணைப்பதாகும். மீன் தொட்டியின் அடியில் சேரும் கழிவுகள் தாவரங்களுக்கு உரமாக மாறுகின்றன. தாவரங்கள் அந்த கழிவுகளை உறிஞ்சி நீரை சுத்தப்படுத்தி, மீண்டும் மீன்களுக்கு அனுப்புகிறது.'
              : 'Aquaponics combines fish farming with plant farming. The fish produce waste water, which is pumped up to feed the plants as organic fertilizer. The plants clean the water, which flows back down to the fish tank.'}
          </Text>

          <View style={styles.quoteBox}>
            <View style={styles.quoteGoldBorder} />
            <Text style={styles.quoteText}>
              {isTamil
                ? 'இதற்கு இரசாயன உரமே தேவையில்லை. 100% இயற்கை முறையில் காய்கறிகளையும், அதே நேரத்தில் மீன்களையும் உற்பத்தி செய்யலாம்!'
                : 'Zero chemical fertilizers needed! You get 100% organic vegetables and fresh fish to sell together!'}
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'இயற்கை சுழற்சி முறை:' : 'The Organic Circle:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'கீழே உள்ள தொட்டியில் மீன்களுக்கு உணவளிக்கிறோம். மீன்கள் அமோனியா நிறைந்த கழிவை வெளியிடுகின்றன.'
                  : 'Feed the fish in the bottom tank. The fish release nutrient-rich natural waste.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'இந்த நீர் மேலே உள்ள செடிகளுக்குப் பாய்கிறது. செடியின் வேர்கள் அதைத் தங்களுக்குத் தேவையான சத்தாக எடுத்துக்கொண்டு வளர்கின்றன.'
                  : 'Pump dirty water to plant beds. Bacteria convert waste into food, and plants absorb it.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'சுத்தமான தண்ணீர் மீண்டும் மீன் தொட்டிக்கு வருகிறது. இதனால் மீன்கள் ஆரோக்கியமாக வளரும்.'
                  : 'Clean water drips back down to the fish. Fish stay healthy, plants grow lush!'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'நுண்கீரைகள் (Microgreens)' : 'Microgreens Business',
      badge: isTamil ? 'லாபம்' : 'Profit',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/microgreens_setup.png')}
            annotations={[
              { id: '1', x: 50, y: 30, label: isTamil ? 'எல்.இ.டி விளக்கு' : 'LED Grow Lights', pointerDirection: 'up' },
              { id: '2', x: 20, y: 60, label: isTamil ? 'பிளாஸ்டிக் தட்டு' : 'Shallow Trays', pointerDirection: 'right' },
              { id: '3', x: 80, y: 70, label: isTamil ? 'கொக்கோ பீட்' : 'Coco Peat', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'நுண்கீரைகள் (Microgreens) என்பது விதைகள் முளைத்து வரும் சிறு தளிர்கள். இவற்றில் சாதாரண காய்கறிகளை விட 40 மடங்கு அதிக சத்து உள்ளது. இதை ஒரு சிறிய அறையிலேயே வளர்த்து நல்ல லாபம் பார்க்கலாம்.'
              : 'Microgreens are tiny sprouts from seeds, packed with 40 times more nutrients than regular vegetables. You can grow them in a small room and make a huge profit.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'நுண்கீரை வளர்ப்பது எப்படி?' : 'How to grow Microgreens:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'கடுகு, வெந்தயம், முள்ளங்கி விதைகளை 12 மணி நேரம் தண்ணீரில் ஊறவைக்கவும்.'
                  : 'Soak mustard, fenugreek, or radish seeds in water for 12 hours.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'ஒரு சிறிய பிளாஸ்டிக் தட்டில் 1 அங்குலத்திற்கு கொக்கோ பீட் (Coco Peat) பரப்பி விதைகளை தூவவும்.'
                  : 'Spread 1 inch of coco peat in a shallow plastic tray and sprinkle the seeds.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? '7 முதல் 14 நாட்களில் கீரை முளைத்துவிடும். இதை உணவகங்கள் (Restaurants) மற்றும் சூப்பர் மார்க்கெட்களில் அதிக விலைக்கு விற்கலாம்.'
                  : 'In 7 to 14 days, the greens are ready to harvest. Sell them to high-end restaurants and supermarkets at a premium price.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'மாடித் தோட்டம்' : 'Terrace Kitchen Garden',
      badge: isTamil ? 'நகர்ப்புறம்' : 'Urban',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/terrace_garden.png')}
            annotations={[
              { id: '1', x: 30, y: 20, label: isTamil ? 'நிழல் வலை' : 'Shade Net', pointerDirection: 'down' },
              { id: '2', x: 20, y: 70, label: isTamil ? 'க்ரோ பேக்' : 'Grow Bags', pointerDirection: 'right' },
              { id: '3', x: 80, y: 60, label: isTamil ? 'பக்கவாட்டு கொடி' : 'Trellis Net', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'இடம் இல்லையா? பரவாயில்லை! உங்கள் வீட்டு மொட்டை மாடியிலேயே குடும்பத்திற்குத் தேவையான காய்கறிகளை நஞ்சில்லாமல் வளர்க்கலாம்.'
              : 'No land? No problem! You can grow enough poison-free vegetables for your entire family right on your house terrace.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'மாடித் தோட்டம் அமைக்கக் குறிப்புகள்:' : 'Terrace Garden Tips:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'எடை குறைவான மண்: மாடியில் அதிக பாரம் ஏற்றக்கூடாது. எனவே செம்மண் 30%, மண்புழு உரம் 30%, கொக்கோ பீட் 40% கலந்த கலவையைப் பயன்படுத்தவும்.'
                  : 'Lightweight Soil Mix: Do not overload the roof. Use a mix of 30% red soil, 30% vermicompost, and 40% coco peat.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'சரியான பைகள்: க்ரோ பேக்குகள் (Grow Bags) மலிவானவை மற்றும் இடத்தை மிச்சப்படுத்தும். கீரைக்கு அகலமான பையும், தக்காளிக்கு ஆழமான பையும் வாங்குங்கள்.'
                  : 'Right Bags: Grow bags are cheap and save space. Buy wide bags for greens and deep bags for tomatoes.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'பராமரிப்பு: காலை மற்றும் மாலை நேரங்களில் மட்டும் தண்ணீர் ஊற்றுங்கள். வெயில் காலத்தில் நிழல் வலை (Shade net) அமைப்பது அவசியம்.'
                  : 'Maintenance: Water only in the morning and evening. Setting up a green shade net is essential during summer.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'செங்குத்து விவசாயத்தில் வருமானம்' : 'Economics & ROI',
      badge: isTamil ? 'பொருளாதாரம்' : 'Finance',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="monetization-on" size={60} color={COLORS.gold} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'செங்குத்து விவசாயத்தில் (Vertical Farming) ஆரம்ப முதலீடு அதிகம், ஆனால் தினசரி மகசூல் கிடைப்பதால் லாபமும் அதிகம். ஒரு ஏக்கரில் வரும் வருமானத்தை 1000 சதுர அடியிலேயே எடுக்கலாம்.'
              : 'Vertical farming has a high initial setup cost, but since you get daily harvests, the profits are huge. You can make an acre\'s profit from just 1000 sq.ft.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'லாபக் கணக்கீடு (எடுத்துக்காட்டு):' : 'Profit Calculation (Example):'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'கட்டமைப்புச் செலவு: பாலிஹவுஸ், பைப்லைன்கள், மோட்டார் என 1000 சதுர அடிக்கு ₹3 முதல் ₹5 லட்சம் வரை முதலீடு தேவைப்படும்.'
                  : 'Setup Cost: Polyhouse, pipelines, and pumps for 1000 sq.ft will cost between ₹3 to ₹5 Lakhs initially.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'மகசூல்: சாதரணமாக 45 நாட்களில் வளரும் கீரைகள் இதில் 25 நாட்களிலேயே வளர்ந்துவிடும். 1000 சதுர அடியில் மாதம் 300-500 கிலோ விளைச்சல் எடுக்கலாம்.'
                  : 'Yield: Greens that take 45 days in soil grow in 25 days here. Expect 300-500 kg per month from 1000 sq.ft.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'வருமானம்: ஒரு கிலோ கீரை ₹100-க்கு விற்றாலும், மாதம் ₹30,000 முதல் ₹50,000 வரை வருமானம் கிடைக்கும். முதலீட்டை 1-2 ஆண்டுகளில் எடுத்துவிடலாம்.'
                  : 'Income: Even selling at ₹100/kg, you earn ₹30,000 - ₹50,000 monthly. Break-even happens in 1-2 years.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'விற்பனை மற்றும் சந்தைப்படுத்துதல்' : 'Marketing & Sales',
      badge: isTamil ? 'சந்தை' : 'Market',
      content: () => (
        <>
          <View style={{height: 150, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
            <MaterialIcons name="storefront" size={60} color={COLORS.gold} />
          </View>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விளைவிப்பது மட்டும் போதாது, அதைச் சரியான வாடிக்கையாளர்களுக்கு கொண்டு சேர்க்க வேண்டும். ஹைட்ரோபோனிக்ஸ் காய்கறிகள் சுத்தமானவை, நஞ்சில்லாதவை என்பதால் இதற்கு தனி மவுசு உண்டு.'
              : 'Growing is only half the job; you must reach the right customers. Since hydroponic vegetables are clean and pesticide-free, they have a premium demand.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'சிறந்த விற்பனை உத்திகள்:' : 'Best Marketing Strategies:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'சூப்பர் மார்க்கெட்டுகள்: உங்கள் காய்கறிகளை அழகாக பேக் செய்து, உங்கள் பிராண்ட் ஸ்டிக்கர் ஒட்டி நேரடியாக பல்பொருள் அங்காடிகளுக்கு சப்ளை செய்யலாம்.'
                  : 'Supermarkets: Pack your veggies neatly in boxes with your brand sticker and supply directly to premium supermarkets.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'ஆன்லைன் விற்பனை (WhatsApp): உங்கள் பகுதியில் உள்ள அடுக்குமாடி குடியிருப்புகளில் (Apartments) வாட்ஸ்அப் குரூப் மூலம் நேரடி விற்பனை செய்யலாம்.'
                  : 'Online Sales (WhatsApp): Target apartments in your city. Take weekly subscriptions and deliver fresh produce directly.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'உணவகங்கள் (Restaurants): ஃபாஸ்ட் புட் கடைகள் மற்றும் உணவகங்களுக்குத் தேவையான லெட்டூஸ், செர்ரி தக்காளி போன்றவற்றை தினசரி சப்ளை செய்யலாம்.'
                  : 'Restaurants: Partner with high-end cafes and fast-food chains to supply daily fresh lettuce, basil, and cherry tomatoes.'}
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
          {isTamil ? 'செங்குத்து விவசாய வழிகாட்டி' : 'Vertical Farming Guide'}
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
