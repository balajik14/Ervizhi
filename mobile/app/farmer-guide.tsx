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

export default function FarmerGuideScreen() {
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
      title: isTamil ? 'பண மேலாண்மை மற்றும் கடன்' : 'Smart Money Management',
      badge: isTamil ? 'பொருளாதாரம்' : 'Finance',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விவசாயம் என்பது ஒரு வியாபாரம். உங்கள் வரவு மற்றும் செலவுகளை ஒரு நோட்டில் எழுதப் பழகிக் கொள்ளுங்கள். எவ்வளவு செலவாகிறது, எவ்வளவு லாபம் வருகிறது என்பதை தெரிந்துகொண்டால் மட்டுமே உ সাংগঠনিক விவசாயத்தில் வெற்றிபெற முடியும்.'
              : 'Farming is a business. Get into the habit of writing down your income and expenses in a notebook. You can only succeed if you know exactly how much you spend and how much you earn.'}
          </Text>
          
          <View style={styles.quoteBox}>
            <View style={styles.quoteGoldBorder} />
            <Text style={styles.quoteText}>
              {isTamil
                ? 'கடன் வாங்குவது தவறல்ல, ஆனால் எதற்காக கடன் வாங்குகிறோம் என்பது முக்கியம். விதைகள், உரம் போன்ற உற்பத்திக்கு கடன் வாங்கலாம்; சொந்த செலவுகளுக்கு வாங்கக்கூடாது.'
                : 'Taking a loan is not wrong, but what you use it for is important. Borrow for production (seeds, fertilizers); do not borrow for personal expenses.'}
            </Text>
          </View>

          <Text style={styles.subHeader}>
            {isTamil ? 'சிறந்த பண மேலாண்மை குறிப்புகள்:' : 'Best Money Management Tips:'}
          </Text>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'ஒரே பயிரில் முழுப் பணத்தையும் முதலீடு செய்யாதீர்கள் (ஊடுபயிர் சாகுபடி செய்யுங்கள்).' 
                : 'Do not invest all your money in a single crop (practice intercropping).'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'வருமானத்தின் ஒரு பகுதியை அடுத்த போகத்திற்கான சேமிப்பாக வையுங்கள்.' 
                : 'Save a portion of your income for the next cropping season.'}
            </Text>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'பயிர் இழப்பிலிருந்து மீளுதல்' : 'Recovering from Crop Failure',
      badge: isTamil ? 'தீர்வு' : 'Solution',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'மழை, வறட்சி, பூச்சித் தாக்குதல் போன்றவற்றால் பயிர் இழப்பு ஏற்படுவது விவசாயத்தில் சகஜம். இதனால் மனமுடைந்து விடக்கூடாது. இதை எதிர்கொள்ள சில முன்னெச்சரிக்கை நடவடிக்கைகளை நாம் எடுக்க வேண்டும்.'
              : 'Crop failure due to rain, drought, or pest attacks is common in farming. Do not lose heart. We must take some preventive steps to handle this.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'பாதுகாப்பு வழிமுறைகள்:' : 'Safety Measures:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'பயிர் காப்பீடு (Crop Insurance - PMFBY) மிகவும் முக்கியம். விதைக்கும் போதே காப்பீடு செய்துவிடுங்கள்.'
                  : 'Crop Insurance (PMFBY) is very important. Insure your crop during the sowing stage itself.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'மாற்றுப் பயிர்களைத் தயார் நிலையில் வையுங்கள் (எ.கா: குறுகிய கால தானியங்கள், காய்கறிகள்).'
                  : 'Keep alternative crops ready (e.g., short-term millets, vegetables).'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'கால்நடை வளர்ப்பு, கோழி வளர்ப்பு போன்ற கூடுதல் வருமான வழிகளை உருவாக்குங்கள்.'
                  : 'Create extra income sources like cattle rearing and poultry farming.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'சந்தை நிலவரம் அறிதல்' : 'Market Intelligence',
      badge: isTamil ? 'சந்தை' : 'Market',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'பயிரை விளைவிப்பதை விட, அதை சரியான விலைக்கு விற்பதுதான் கடினம். வியாபாரிகளிடம் குறைந்த விலைக்கு விற்காமல், சந்தை நிலவரத்தை முன்கூட்டியே அறிந்து செயல்பட வேண்டும்.'
              : 'Selling the crop at the right price is harder than growing it. Instead of selling to traders for a low price, you must understand market conditions in advance.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'அதிக லாபம் பெற சில வழிகள்:' : 'Ways to get higher profit:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'விளைச்சலை அறுவடை செய்தவுடன் விற்காமல், சேமிப்புக் கிடங்குகளில் (Cold Storage) வைத்து விலை ஏறும்போது விற்கலாம்.'
                  : 'Instead of selling immediately after harvest, store it in cold storage and sell when prices rise.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'இடைத்தரகர்களைத் தவிர்த்து, உழவர் சந்தைகள் அல்லது WhatsApp மூலம் நேரடியாக வாடிக்கையாளர்களுக்கு விற்கப் பழகுங்கள்.'
                  : 'Avoid middlemen; try to sell directly to consumers through farmer markets or WhatsApp.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>✓</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'விளைபொருட்களை அப்படியே விற்காமல், மதிப்பு கூட்டி (உதா: தக்காளிக்கு பதில் தக்காளி சாஸ், பழங்களுக்கு பதில் ஜாம்) விற்கலாம்.'
                  : 'Add value to your produce (e.g., tomato sauce instead of tomatoes) instead of selling raw crops.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'உழவர் உற்பத்தியாளர் நிறுவனம் (FPO)' : 'Cooperative Farming (FPO)',
      badge: isTamil ? 'கூட்டுறவு' : 'Cooperative',
      content: () => (
        <>
          <AnnotatedImage 
            source={require('../assets/images/fpo_cooperative.png')}
            annotations={[
              { id: '1', x: 50, y: 30, label: isTamil ? 'FPO மையம்' : 'FPO Hub', pointerDirection: 'up' },
              { id: '2', x: 20, y: 70, label: isTamil ? 'விவசாயிகள்' : 'Farmers', pointerDirection: 'right' },
              { id: '3', x: 80, y: 70, label: isTamil ? 'நேரடி விற்பனை' : 'Direct Market', pointerDirection: 'left' },
            ]}
          />
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'தனியாக விவசாயம் செய்து லாபம் ஈட்டுவது கடினம். 100 அல்லது 1000 விவசாயிகள் ஒன்று சேர்ந்து ஒரு நிறுவனமாக (Farmer Producer Organization) மாறினால் பெரிய நிறுவனங்களுக்கு இணையாக பேரம் பேசி விற்கலாம்.'
              : 'Farming alone and making a profit is hard. If 100 or 1000 farmers join together to form a Farmer Producer Organization (FPO), you can bargain and sell like a big corporate company.'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'FPO-வின் நன்மைகள்:' : 'Benefits of an FPO:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'விதைகள், உரங்களை மொத்தமாக வாங்குவதால் விலை மிகவும் குறையும்.'
                  : 'Buying seeds and fertilizers in bulk reduces the cost significantly.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'அரசு மானியங்கள் மற்றும் வங்கிக் கடன்கள் சுலபமாக கிடைக்கும்.'
                  : 'Government subsidies and bank loans are easily available for groups.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'டிராக்டர், அறுவடை இயந்திரங்களை குழுவாக வாங்கி பயன்படுத்தலாம்.'
                  : 'You can buy and share tractors and harvesting machines as a group.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'இயற்கை விவசாயச் சான்றிதழ் பெறுதல்' : 'Organic Certification',
      badge: isTamil ? 'இயற்கை' : 'Organic',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'இயற்கை முறையில் விளைவிக்கப்படும் பொருட்களுக்கு சந்தையில் அதிக விலை கிடைக்கிறது. ஆனால், உங்கள் பொருள் இயற்கை முறையில் விளைந்தது என்பதை நிரூபிக்க "Organic Certification" தேவை.'
              : 'Organically grown products get higher prices in the market. But to prove your product is organic, you need "Organic Certification".'}
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isTamil ? 'சான்றிதழ் பெறும் முறை:' : 'How to get certified:'}
            </Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'குறைந்தபட்சம் 3 ஆண்டுகள் உங்கள் நிலத்தில் ரசாயன உரம், பூச்சிக்கொல்லிகளைப் பயன்படுத்துவதை நிறுத்த வேண்டும்.'
                  : 'Stop using chemical fertilizers and pesticides on your land for at least 3 years.'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'தமிழ்நாடு அரசு இயற்கை வேளாண்மைத் துறை மூலம் சான்றிதழுக்கு விண்ணப்பிக்கலாம். (NPOP தரநிலைகள்)'
                  : 'Apply for certification through the State Organic Certification Department (NPOP standards).'}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>
                {isTamil
                  ? 'அதிகாரிகள் நிலத்தை ஆய்வு செய்து சான்றிதழ் வழங்குவார்கள். அதன்பின் உங்கள் பொருட்களை "இயற்கை" என்ற லேபிளுடன் அதிக விலைக்கு விற்கலாம்.'
                  : 'Officials will inspect the land and issue the certificate. Then you can sell with an "Organic" label at premium prices.'}
              </Text>
            </View>
          </View>
        </>
      )
    },
    {
      title: isTamil ? 'எதிர்காலத் தொழில்நுட்பங்கள்' : 'Next-Gen Tech',
      badge: isTamil ? 'தொழில்நுட்பம்' : 'Technology',
      content: () => (
        <>
          <Text style={styles.paragraph}>
            {isTamil 
              ? 'விவசாயம் வேகமாக மாறி வருகிறது. புதிய தொழில்நுட்பங்களைத் தெரிந்துகொள்வது வருங்காலத்தில் உங்களை வெற்றி பெறச் செய்யும்.'
              : 'Agriculture is changing fast. Knowing new technologies will make you successful in the future.'}
          </Text>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'IOT சென்சார்கள் (IoT Sensors) மூலம் மண்ணின் ஈரம், தட்பவெப்பம் போன்றவற்றை செல்போனிலேயே அறியலாம்.' 
                : 'IoT Sensors let you check soil moisture and weather right from your phone.'}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="done" size={20} color={COLORS.gold} />
            <Text style={styles.bulletText}>
              {isTamil 
                ? 'பிளாக்செயின் (Blockchain) தொழில்நுட்பம் மூலம் விளைபொருளின் பயணத்தைக் கண்காணித்து நியாயமான விலை பெறலாம்.' 
                : 'Blockchain technology tracks produce journey ensuring you get fair pricing.'}
            </Text>
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
          {isTamil ? 'விவசாயியின் பாதுகாப்புக் கையேடு' : 'Farmer\'s Survival Guide'}
        </Text>
        <View style={styles.bookIconContainer}>
          <MaterialIcons name="shield" size={22} color={COLORS.gold} />
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
          <MaterialIcons name="chevron-left" size={28} color={currentPage === 0 ? COLORS.textSecondary : COLORS.gold} />
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
          <MaterialIcons name="chevron-right" size={28} color={currentPage === pages.length - 1 ? COLORS.textSecondary : COLORS.gold} />
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
    borderBottomColor: 'rgba(212,175,55,0.15)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(212,175,55,0.1)',
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
    backgroundColor: 'rgba(212,175,55,0.15)',
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
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: RADIUS.pill,
  },
  navBtnDisabled: {
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gold,
    marginHorizontal: 4,
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
