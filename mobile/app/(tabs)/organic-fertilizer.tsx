import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../_layout';
import AgriBackground from '../../components/AgriBackground';
import GlassCard from '../../components/GlassCard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrganicFertilizerScreen() {
    const { isTamil } = useApp();
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, []);

    const RecipeCard = ({ title, icon, ingredients, steps, englishTitle, englishIngredients, englishSteps, benefits, englishBenefits }: any) => (
        <GlassCard style={styles.card}>
            <View style={styles.headerRow}>
                <MaterialCommunityIcons name={icon} size={32} color="#10B981" />
                <Text style={styles.sectionTitle}>{isTamil ? title : englishTitle}</Text>
            </View>
            
            <Text style={styles.subHeading}>{isTamil ? 'தேவையான பொருட்கள்:' : 'Ingredients:'}</Text>
            <View style={styles.grid}>
                {(isTamil ? ingredients : englishIngredients).map((item: any, i: number) => (
                    <View key={i} style={styles.gridItem}>
                        <Text style={styles.gridEmoji}>{item.emoji}</Text>
                        <Text style={styles.gridText}>{item.text}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.subHeading}>{isTamil ? 'செய்முறை:' : 'Preparation Method:'}</Text>
            <View style={styles.processSteps}>
                {(isTamil ? steps : englishSteps).map((step: string, i: number) => (
                    <View key={i} style={styles.stepBox}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                        <Text style={styles.stepText}>{step}</Text>
                    </View>
                ))}
            </View>

            {benefits && (
                <>
                    <Text style={[styles.subHeading, { color: COLORS.gold, marginTop: SPACING.xl }]}>
                        {isTamil ? 'பயன்பாடு மற்றும் நன்மைகள்:' : 'Usage & Benefits:'}
                    </Text>
                    <View style={styles.benefitsContainer}>
                        {(isTamil ? benefits : englishBenefits).map((benefit: any, i: number) => (
                            <View key={i} style={styles.benefitItem}>
                                <Ionicons name={benefit.icon} size={28} color={COLORS.gold} style={{ marginBottom: 12 }} />
                                <Text style={styles.benefitText}>{benefit.text}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </GlassCard>
    );

    return (
        <View style={styles.container}>
            <AgriBackground />
            <TouchableOpacity onPress={() => router.back()} style={styles.floatingBackBtn}>
                <Ionicons name="leaf-sharp" size={24} color={COLORS.gold} />
            </TouchableOpacity>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.title}>{isTamil ? 'இயற்கை உரம் தயாரிப்பு' : 'Organic Fertilizer Guide'}</Text>
                    <Text style={styles.subtitle}>
                        {isTamil ? 'நிலத்தின் வளத்தை பெருக்கும் நமது பாரம்பரிய மற்றும் நவீன இயற்கை உரங்கள்.' : 'Boost soil fertility with traditional and modern organic fertilizers.'}
                    </Text>

                    <RecipeCard 
                        title="ஜீவாமிர்தம் (மண்ணின் அமிர்தம்)" englishTitle="Jeevamrutham (Elixir for Soil)" icon="sprout"
                        ingredients={[
                            { emoji: '🐄', text: '10 கிலோ சாணம்' },
                            { emoji: '💧', text: '10 லிட்டர் கோமியம்' },
                            { emoji: '🌾', text: '1 கிலோ வெல்லம்' },
                            { emoji: '🫘', text: '1 கிலோ பயறு மாவு' },
                            { emoji: '🌱', text: '1 பிடி வயல் மண்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🐄', text: '10kg Cow Dung' },
                            { emoji: '💧', text: '10L Cow Urine' },
                            { emoji: '🌾', text: '1kg Jaggery' },
                            { emoji: '🫘', text: '1kg Gram Flour' },
                            { emoji: '🌱', text: 'Handful of Soil' }
                        ]}
                        steps={[
                            '200 லிட்டர் தண்ணீரில் சாணம் மற்றும் கோமியத்தை சேர்க்கவும்.',
                            'வெல்லம், பயறு மாவு மற்றும் ஒரு பிடி மண்ணை சேர்த்து நன்றாக கலக்கவும்.',
                            'நிழலான இடத்தில் 48 மணி நேரம் வைக்கவும்.',
                            'தினமும் காலை மற்றும் மாலை என இரு வேளை குச்சியால் கலக்கி விடவும்.'
                        ]}
                        englishSteps={[
                            'Add cow dung and urine into 200 liters of water.',
                            'Mix in jaggery, flour, and a handful of farm soil.',
                            'Keep in shade for 48 hours for fermentation.',
                            'Stir the mixture twice a day (morning & evening).'
                        ]}
                        benefits={[
                            { icon: 'bug', text: 'மண்ணில் உள்ள நன்மை செய்யும் பாக்டீரியாக்களை பன்மடங்கு பெருக்கும்.' },
                            { icon: 'leaf', text: 'பயிர்களின் வளர்ச்சியை துரிதப்படுத்தும், இலைகள் பச்சையாக இருக்கும்.' },
                            { icon: 'water', text: 'பாசன நீருடன் கலந்து விட்டால் வேர்கள் வலுவாக வளரும்.' }
                        ]}
                        englishBenefits={[
                            { icon: 'bug', text: 'Multiplies beneficial microorganisms in the soil.' },
                            { icon: 'leaf', text: 'Promotes rapid growth and lush green foliage.' },
                            { icon: 'water', text: 'Can be mixed with irrigation water to strengthen roots.' }
                        ]}
                    />

                    <RecipeCard 
                        title="பஞ்சகவ்யா" englishTitle="Panchagavya" icon="cow"
                        ingredients={[
                            { emoji: '🐄', text: '5 கிலோ சாணம்' },
                            { emoji: '💧', text: '3 லிட்டர் கோமியம்' },
                            { emoji: '🥛', text: '2 லிட்டர் பால்' },
                            { emoji: '🧈', text: '2 லிட்டர் தயிர்' },
                            { emoji: '🪔', text: '1 லிட்டர் நெய்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🐄', text: '5kg Cow Dung' },
                            { emoji: '💧', text: '3L Cow Urine' },
                            { emoji: '🥛', text: '2L Cow Milk' },
                            { emoji: '🧈', text: '2L Curd' },
                            { emoji: '🪔', text: '1L Ghee' }
                        ]}
                        steps={[
                            'சாணம் மற்றும் நெய்யை கலந்து 3 நாட்கள் வைக்கவும்.',
                            '4-ஆம் நாள் கோமியம், பால், தயிர் ஆகியவற்றை சேர்த்து கலக்கவும்.',
                            'தேவைப்பட்டால் வாழைப்பழம், தேங்காய் தண்ணீர் சேர்க்கலாம்.',
                            'நிழலில் 21 நாட்கள் ஊற வைக்கவும். தினமும் காலை, மாலை கலக்க வேண்டும்.'
                        ]}
                        englishSteps={[
                            'Mix cow dung and ghee, keep aside for 3 days.',
                            'On the 4th day, add urine, milk, and curd.',
                            'Optionally add ripe bananas or coconut water.',
                            'Ferment in the shade for 21 days, stirring twice daily.'
                        ]}
                        benefits={[
                            { icon: 'shield-checkmark', text: 'பயிர்களின் நோய் எதிர்ப்பு சக்தியை அதிகரிக்கிறது.' },
                            { icon: 'flower', text: 'பூக்கள் உதிர்வதை தடுத்து அதிக மகசூல் கொடுக்கும்.' },
                            { icon: 'timer', text: '3% கரைசலை இலைகளில் நேரடியாக ஸ்ப்ரே செய்யலாம்.' }
                        ]}
                        englishBenefits={[
                            { icon: 'shield-checkmark', text: 'Boosts plant immunity against diseases and pests.' },
                            { icon: 'flower', text: 'Prevents flower drop and increases crop yield.' },
                            { icon: 'timer', text: 'Can be used as a 3% foliar spray directly on leaves.' }
                        ]}
                    />

                    <RecipeCard 
                        title="மீன் அமிலம்" englishTitle="Fish Amino Acid" icon="fish"
                        ingredients={[
                            { emoji: '🐟', text: '1 கிலோ மீன் கழிவு' },
                            { emoji: '🌾', text: '1 கிலோ நாட்டுச் சர்க்கரை' },
                            { emoji: '🏺', text: 'பிளாஸ்டிக் டிரம்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🐟', text: '1kg Fish Waste' },
                            { emoji: '🌾', text: '1kg Jaggery / Brown Sugar' },
                            { emoji: '🏺', text: 'Air-tight Plastic Drum' }
                        ]}
                        steps={[
                            'மீன் கழிவுகளையும் நாட்டுச் சர்க்கரையையும் சம அளவில் ஒரு பிளாஸ்டிக் வாளியில் போடவும்.',
                            'நன்றாக பிசைந்து காற்று புகாதவாறு மூடி வைக்கவும்.',
                            '30-40 நாட்கள் நிழலில் வைக்க வேண்டும். தேன் போன்ற வாசனை வரும்.',
                            '3-5 மி.லி மீன் அமிலத்தை 1 லிட்டர் தண்ணீரில் கலந்து தெளிக்கலாம்.'
                        ]}
                        englishSteps={[
                            'Mix equal parts of fish waste and jaggery in a plastic bucket.',
                            'Mash them well and seal the bucket airtight.',
                            'Keep in shade for 30-40 days until it smells sweet like honey.',
                            'Dilute 3-5ml per liter of water for foliar application.'
                        ]}
                        benefits={[
                            { icon: 'flask', text: 'நைட்ரஜன் மற்றும் அமினோ அமிலங்கள் நிறைந்தது.' },
                            { icon: 'leaf', text: 'பயிர்களின் வளர்ச்சி மற்றும் தளிர் விடுவதை தூண்டுகிறது.' }
                        ]}
                        englishBenefits={[
                            { icon: 'flask', text: 'Rich source of nitrogen and essential amino acids.' },
                            { icon: 'leaf', text: 'Highly stimulates vegetative growth and new shoots.' }
                        ]}
                    />

                    <RecipeCard 
                        title="மண்புழு உரம்" englishTitle="Vermicompost" icon="worm"
                        ingredients={[
                            { emoji: '🍂', text: 'காய்ந்த இலைகள்' },
                            { emoji: '🐄', text: 'மாட்டு சாணம்' },
                            { emoji: '🪱', text: 'மண்புழுக்கள்' },
                            { emoji: '💧', text: 'தண்ணீர்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🍂', text: 'Dry Leaves & Biomass' },
                            { emoji: '🐄', text: 'Cow Dung' },
                            { emoji: '🪱', text: 'Earthworms' },
                            { emoji: '💧', text: 'Water' }
                        ]}
                        steps={[
                            'நிழலான இடத்தில் ஒரு குழியோ அல்லது தொட்டியோ அமைக்கவும்.',
                            'அடியில் காய்ந்த இலைகள், வைக்கோல் பரப்பி அதன் மேல் சாணம் போடவும்.',
                            'மண்புழுக்களை விட்டு, ஈரப்பதம் 40-50% இருக்கும்படி தண்ணீர் தெளிக்கவும்.',
                            '45-60 நாட்களில் தேயிலை தூள் போன்ற தரமான உரம் தயாராகிவிடும்.'
                        ]}
                        englishSteps={[
                            'Set up a pit or bin in a shaded, cool area.',
                            'Layer dry biomass at the bottom, followed by cow dung.',
                            'Introduce earthworms and sprinkle water to maintain 40-50% moisture.',
                            'High-quality compost resembling tea dust is ready in 45-60 days.'
                        ]}
                        benefits={[
                            { icon: 'water', text: 'மண்ணின் ஈரப்பதம் மற்றும் காற்றோட்டத்தை அதிகரிக்கிறது.' },
                            { icon: 'nutrition', text: 'தழை, மணி, சாம்பல் சத்துக்கள் (NPK) சீராக கிடைக்கும்.' }
                        ]}
                        englishBenefits={[
                            { icon: 'water', text: 'Significantly improves soil aeration and water retention.' },
                            { icon: 'nutrition', text: 'Provides a balanced slow-release of NPK nutrients.' }
                        ]}
                    />
                    
                    <RecipeCard 
                        title="முட்டை அமிலம்" englishTitle="Egg Amino Acid" icon="egg"
                        ingredients={[
                            { emoji: '🥚', text: '10 முட்டைகள்' },
                            { emoji: '🍋', text: '10 எலுமிச்சை பழம்' },
                            { emoji: '🌾', text: '250 கிராம் வெல்லம்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🥚', text: '10 Eggs' },
                            { emoji: '🍋', text: '10 Lemons (Juice)' },
                            { emoji: '🌾', text: '250g Jaggery' }
                        ]}
                        steps={[
                            'முட்டைகளை உடைக்காமல் ஒரு ஜாடியில் போடவும்.',
                            'எலுமிச்சை சாற்றை முட்டைகள் மூழ்கும் அளவு ஊற்றவும். 10 நாட்கள் ஊற வைக்கவும்.',
                            'முட்டை ஓடு கரைந்த பின், வெல்லத்தை சேர்த்து நன்றாக பிசையவும்.',
                            'மேலும் 10 நாட்கள் ஊற வைத்து வடிகட்டினால் முட்டை அமிலம் தயார்.'
                        ]}
                        englishSteps={[
                            'Place unbroken whole eggs in a glass or plastic jar.',
                            'Pour enough lemon juice to submerge the eggs completely and leave for 10 days.',
                            'Once the shells dissolve, add jaggery and mash the contents.',
                            'Leave for another 10 days, filter it, and the amino acid is ready.'
                        ]}
                        benefits={[
                            { icon: 'flower', text: 'கால்சியம் சத்து நிறைந்தது, பூ பூக்கும் தருணத்தில் தெளிக்கலாம்.' },
                            { icon: 'leaf', text: 'காய்கள் திரட்சியாகவும் சுவையாகவும் வளர உதவும்.' }
                        ]}
                        englishBenefits={[
                            { icon: 'flower', text: 'Rich in calcium; ideal to spray during the flowering stage.' },
                            { icon: 'leaf', text: 'Helps in the formation of large and tasty fruits.' }
                        ]}
                    />

                    <RecipeCard 
                        title="முட்டை ஓடு கால்சியம்" englishTitle="Eggshell Calcium Solution" icon="egg"
                        ingredients={[
                            { emoji: '🥚', text: 'முட்டை ஓடுகள்' },
                            { emoji: '🍶', text: 'வினிகர்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🥚', text: 'Egg shells' },
                            { emoji: '🍶', text: 'Vinegar' }
                        ]}
                        steps={[
                            'முட்டை ஓடுகளை நன்றாக காயவைக்கவும்.',
                            'காய்ந்த ஓடுகளை தூளாக அரைக்கவும்.',
                            'வினிகருடன் முட்டை ஓட்டு தூளை கலக்கவும்.',
                            'ஒரு வாரம் அப்படியே வைக்கவும்.'
                        ]}
                        englishSteps={[
                            'Dry the egg shells.',
                            'Powder them well.',
                            'Mix the powder with vinegar.',
                            'Leave it undisturbed for one week.'
                        ]}
                        benefits={[
                            { icon: 'shield-checkmark', text: 'தாவரங்களின் பூக்கள் அழுகுவதை தடுக்கிறது.' },
                            { icon: 'leaf', text: 'தண்டுகளை வலுவாக்குகிறது மற்றும் காய்களின் தரத்தை உயர்த்துகிறது.' }
                        ]}
                        englishBenefits={[
                            { icon: 'shield-checkmark', text: 'Prevents blossom-end rot.' },
                            { icon: 'leaf', text: 'Promotes strong stems and better fruit quality.' }
                        ]}
                    />

                    <RecipeCard 
                        title="வேப்பம் புண்ணாக்கு உரம்" englishTitle="Neem Cake Fertilizer" icon="leaf"
                        ingredients={[
                            { emoji: '🌿', text: 'வேப்பம் புண்ணாக்கு' }
                        ]}
                        englishIngredients={[
                            { emoji: '🌿', text: 'Neem seed cake' }
                        ]}
                        steps={[
                            'வேப்பம் புண்ணாக்கை நேரடியாக மண்ணில் கலந்து விடவும் அல்லது தண்ணீரில் ஊற வைத்து செடிகளுக்கு ஊற்றவும்.'
                        ]}
                        englishSteps={[
                            'Mix neem seed cake directly into the soil or soak it in water and apply it to the plants.'
                        ]}
                        benefits={[
                            { icon: 'shield-checkmark', text: 'மண்ணில் உள்ள பூச்சிகள் மற்றும் நூற்புழுக்களை கட்டுப்படுத்துகிறது.' },
                            { icon: 'nutrition', text: 'நீண்ட காலம் நிலைத்து நிற்கும் நைட்ரஜன் சத்தை வழங்குகிறது.' }
                        ]}
                        englishBenefits={[
                            { icon: 'shield-checkmark', text: 'Controls soil pests and reduces nematodes.' },
                            { icon: 'nutrition', text: 'Provides organic, long-lasting nitrogen nutrition.' }
                        ]}
                    />

                    <RecipeCard 
                        title="காய்கறி கழிவு உரம்" englishTitle="Vegetable Waste Compost" icon="trash-can-outline"
                        ingredients={[
                            { emoji: '🥕', text: 'காய்கறி தோல்கள், பழக் கழிவுகள்' },
                            { emoji: '🍂', text: 'காய்ந்த இலைகள்' },
                            { emoji: '🐄', text: 'மாட்டு சாணம்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🥕', text: 'Vegetable peels, fruit waste' },
                            { emoji: '🍂', text: 'Dry leaves' },
                            { emoji: '🐄', text: 'Cow dung' }
                        ]}
                        steps={[
                            'காய்கறி கழிவுகள், காய்ந்த இலைகள் மற்றும் மாட்டு சாணத்தை அடுக்குகளாக தொட்டியில் போடவும்.',
                            'ஈரப்பதம் குறையாமல் தொடர்ந்து தண்ணீர் தெளித்து வரவும்.',
                            '45-60 நாட்களில் கழிவுகள் மக்கி சிறந்த உரமாக மாறும்.'
                        ]}
                        englishSteps={[
                            'Layer vegetable waste, dry leaves, and cow dung in a compost bin.',
                            'Sprinkle water regularly to maintain moisture.',
                            'Compost will be ready in 45-60 days.'
                        ]}
                        benefits={[
                            { icon: 'sync', text: 'வீட்டு கழிவுகளை சிறந்த உரமாக மாற்றுகிறது.' },
                            { icon: 'water', text: 'மண்ணின் வளத்தை பெரிதும் மேம்படுத்துகிறது.' }
                        ]}
                        englishBenefits={[
                            { icon: 'sync', text: 'Converts household waste into valuable fertilizer.' },
                            { icon: 'water', text: 'Significantly improves soil fertility.' }
                        ]}
                    />

                    <RecipeCard 
                        title="தொழு உரம் (Compost Pit)" englishTitle="Compost Pit" icon="sprout"
                        ingredients={[
                            { emoji: '🍂', text: 'காய்ந்த இலைகள்' },
                            { emoji: '🌾', text: 'பயிர் கழிவுகள்' },
                            { emoji: '🥕', text: 'சமையலறை கழிவுகள்' },
                            { emoji: '🐄', text: 'சாணக் கரைசல்' }
                        ]}
                        englishIngredients={[
                            { emoji: '🍂', text: 'Dry leaves' },
                            { emoji: '🌾', text: 'Crop waste' },
                            { emoji: '🥕', text: 'Kitchen waste' },
                            { emoji: '🐄', text: 'Cow dung slurry' }
                        ]}
                        steps={[
                            'ஒரு குழியை தோண்டி அதில் கழிவுகளை அடுக்குகளாகப் பரப்பவும்.',
                            'ஒவ்வொரு அடுக்கிலும் சாணக் கரைசலை ஊற்றவும்.',
                            '2-3 மாதங்களுக்கு மட்க விடவும்.'
                        ]}
                        englishSteps={[
                            'Layer the dry materials, crop waste, and kitchen waste in a pit.',
                            'Pour cow dung slurry over each layer.',
                            'Allow them to decompose for 2–3 months.'
                        ]}
                        benefits={[
                            { icon: 'cash-outline', text: 'இலவசமாக தயாரிக்கக்கூடிய எளிய உரம்.' },
                            { icon: 'leaf', text: 'கழிவுகளை குறைக்கிறது மற்றும் மண்ணின் அமைப்பை மேம்படுத்துகிறது.' }
                        ]}
                        englishBenefits={[
                            { icon: 'cash-outline', text: 'A completely free and simplest fertilizer.' },
                            { icon: 'leaf', text: 'Reduces waste and significantly improves soil texture.' }
                        ]}
                    />

                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBg },
    content: { padding: SPACING.lg, paddingBottom: 100, maxWidth: 800, alignSelf: 'center', width: '100%', paddingTop: 80 },
    floatingBackBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: SPACING.md, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
    title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 24 },
    card: { padding: SPACING.xl, marginBottom: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: 12 },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.gold, flexShrink: 1 },
    subHeading: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.md },
    
    /* Ingredients Grid */
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.xl },
    gridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: RADIUS.md, minWidth: '45%', flexGrow: 1 },
    gridEmoji: { fontSize: 20, marginRight: 10 },
    gridText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },

    /* Steps */
    processSteps: { gap: 16 },
    stepBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    stepNumText: { color: COLORS.darkBg, fontWeight: 'bold', fontSize: 14 },
    stepText: { flex: 1, color: COLORS.textSecondary, fontSize: 15, lineHeight: 24 },

    /* Benefits */
    benefitsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    benefitItem: { flex: 1, minWidth: 200, backgroundColor: 'rgba(212,175,55,0.05)', padding: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
    benefitText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22, fontWeight: '500' }
});
