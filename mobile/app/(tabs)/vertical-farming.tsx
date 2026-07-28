import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../_layout';
import AgriBackground from '../../components/AgriBackground';
import GlassCard from '../../components/GlassCard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function VerticalFarmingScreen() {
    const { isTamil } = useApp();
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, []);

    const ChecklistItem = ({ icon, text }: any) => (
        <View style={styles.checklistItem}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.checklistText}>{text}</Text>
        </View>
    );

    const StepItem = ({ num, text }: any) => (
        <View style={styles.stepBox}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{num}</Text></View>
            <Text style={styles.stepText}>{text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <AgriBackground />
            <TouchableOpacity onPress={() => router.back()} style={styles.floatingBackBtn}>
                <Ionicons name="leaf-sharp" size={24} color={COLORS.gold} />
            </TouchableOpacity>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.title}>{isTamil ? 'நவீன விவசாய முறைகள்' : 'Modern Farming Guide'}</Text>
                    <Text style={styles.subtitle}>
                        {isTamil ? 'அதிக மகசூல் மற்றும் குறைந்த தண்ணீர் செலவில் சிறந்த தொழில்நுட்பங்கள்.' : 'High-yield, water-efficient farming technologies for the future.'}
                    </Text>

                    {/* Smart Irrigation Section */}
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'நுண்ணீர் பாசனம் & நீர் மேலாண்மை' : 'Smart Irrigation & Water Saving'}</Text>
                        
                        <View style={styles.diagram}>
                            <View style={[styles.growTray, { borderColor: '#3B82F6', height: 40 }]}>
                                <View style={styles.plantRow}>
                                    <Ionicons name="leaf" size={28} color="#10B981" />
                                    <Ionicons name="leaf" size={28} color="#10B981" />
                                    <Ionicons name="leaf" size={28} color="#10B981" />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                                    <Ionicons name="water" size={16} color="#3B82F6" />
                                    <Ionicons name="water" size={16} color="#3B82F6" />
                                    <Ionicons name="water" size={16} color="#3B82F6" />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'பரிந்துரைகள் (Water-Saving Advice):' : 'Water-Saving Advice:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "சொட்டு நீர் பாசனம் (Drip Irrigation) அமைப்பதன் மூலம் 70% நீரை மிச்சப்படுத்தலாம். வேர்களுக்கு நேரடியாக நீர் செல்வதால் களைகள் குறையும்." : "Use Drip Irrigation to save up to 70% water. Direct delivery to roots reduces weeds."} />
                            <StepItem num="2" text={isTamil ? "மண் ஈரப்பத சென்சார்கள் (Soil Moisture Sensors) மூலம் தேவையான போது மட்டும் பாசனம் செய்யவும்." : "Install Soil Moisture Sensors to water crops only when the soil is genuinely dry."} />
                            <StepItem num="3" text={isTamil ? "பயிர்களுக்கு இடையில் மூடாக்கு (Mulching) அமைத்தால் நீர் ஆவியாவது தடுக்கப்படும்." : "Use Mulching between crops to prevent rapid water evaporation from the sun."} />
                            <StepItem num="4" text={isTamil ? "மழைநீர் சேகரிப்பு குட்டைகளை (Farm Ponds) அமைத்து கோடையில் நீர்ப்பாசனத்திற்கு பயன்படுத்தலாம்." : "Build Farm Ponds to collect rainwater during monsoons for dry summer months."} />
                        </View>
                    </GlassCard>

                    {/* Hydroponics Section */}
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'ஹைட்ரோபோனிக்ஸ் (Hydroponics)' : 'Hydroponics Setup'}</Text>
                        
                        <View style={styles.diagram}>
                            <View style={styles.growTray}>
                                <View style={styles.plantRow}>
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                </View>
                                <View style={styles.waterLine} />
                            </View>
                            <View style={styles.plumbing}>
                                <Ionicons name="water" size={24} color="#3B82F6" />
                                <View style={styles.pipe} />
                                <FontAwesome5 name="fan" size={24} color="#F59E0B" />
                            </View>
                            <View style={styles.reservoir}>
                                <Text style={styles.label}>{isTamil ? 'ஊட்டச்சத்து தொட்டி' : 'Nutrient Reservoir'}</Text>
                            </View>
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'தேவையான பொருட்கள்:' : 'What you need:'}</Text>
                        <View style={styles.checklistGrid}>
                            <ChecklistItem icon="beaker-outline" text={isTamil ? "பிவிசி குழாய்கள் (PVC Pipes)" : "PVC Pipes & Fittings"} />
                            <ChecklistItem icon="water-outline" text={isTamil ? "நீரேற்று மோட்டார் (Water Pump)" : "Submersible Water Pump"} />
                            <ChecklistItem icon="basket-outline" text={isTamil ? "வலைக் கூடைகள் (Net Pots)" : "Net Pots"} />
                            <ChecklistItem icon="flask-outline" text={isTamil ? "ஹைட்ரோபோனிக்ஸ் ஊட்டச்சத்து" : "Hydroponic Nutrients"} />
                            <ChecklistItem icon="sunny-outline" text={isTamil ? "வளர்ப்பு விளக்குகள் (Grow Lights)" : "LED Grow Lights (Indoor)"} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'எப்படி அமைப்பது:' : 'How to Build:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "பிவிசி குழாய்களில் செடிகள் வைப்பதற்கான துளைகளை இடுங்கள்." : "Drill holes in the PVC pipes spaced evenly for the net pots."} />
                            <StepItem num="2" text={isTamil ? "குழாய்களை சாய்வாக அமைத்து தண்ணீர் சீராக பாயும் படி அமைக்கவும்." : "Mount the pipes on a slight incline to allow gravity to drain the water."} />
                            <StepItem num="3" text={isTamil ? "மோட்டார் மூலம் ஊட்டச்சத்து கலந்த நீரை குழாயில் ஏற்றவும்." : "Place the pump in the reservoir to pump nutrient water to the top pipe."} />
                            <StepItem num="4" text={isTamil ? "நாற்றுகளை வலைக் கூடைகளில் வைத்து குழாயில் செருகவும்." : "Place seedlings in net pots and insert them into the drilled holes."} />
                            <StepItem num="5" text={isTamil ? "நீர் தொடர்ந்து சுழற்சி ஆவதை கண்காணிக்கவும்." : "Monitor the continuous flow of water and check pH levels regularly."} />
                        </View>
                    </GlassCard>

                    {/* Aeroponics Section */}
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'ஏரோபோனிக்ஸ் (Aeroponics)' : 'Aeroponics System'}</Text>
                        
                        <View style={styles.diagram}>
                            <View style={[styles.growTray, { borderColor: '#A78BFA' }]}>
                                <View style={styles.plantRow}>
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                </View>
                                <View style={styles.mistRow}>
                                    <Ionicons name="cloud-outline" size={24} color="#A78BFA" />
                                    <Ionicons name="cloud-outline" size={24} color="#A78BFA" />
                                </View>
                            </View>
                            <View style={styles.plumbing}>
                                <Ionicons name="water" size={24} color="#A78BFA" />
                            </View>
                            <View style={[styles.reservoir, { backgroundColor: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)' }]}>
                                <Text style={[styles.label, { color: '#C4B5FD' }]}>{isTamil ? 'நீர்த்திவலை தொட்டி' : 'Mist Chamber'}</Text>
                            </View>
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'தேவையான பொருட்கள்:' : 'What you need:'}</Text>
                        <View style={styles.checklistGrid}>
                            <ChecklistItem icon="cube-outline" text={isTamil ? "வளர்ப்பு தொட்டி (Grow Chamber)" : "Opaque Grow Chamber"} />
                            <ChecklistItem icon="cloud-circle-outline" text={isTamil ? "ஸ்ப்ரேயர்கள் (Mist Nozzles)" : "High-Pressure Mist Nozzles"} />
                            <ChecklistItem icon="timer-outline" text={isTamil ? "டைமர் சுவிட்ச் (Cycle Timer)" : "Cycle Timer Switch"} />
                            <ChecklistItem icon="flash-outline" text={isTamil ? "அதிக அழுத்த மோட்டார்" : "High-Pressure Pump"} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'எப்படி அமைப்பது:' : 'How to Build:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "செடிகளின் வேர்கள் காற்றில் தொங்கும் வகையில் தொட்டியில் அமைக்கவும்." : "Suspend plant roots inside the opaque chamber so they hang in the air."} />
                            <StepItem num="2" text={isTamil ? "தொட்டியின் உள்ளே ஸ்ப்ரேயர்களை பொறுத்தவும்." : "Install mist nozzles at the bottom or sides of the chamber facing the roots."} />
                            <StepItem num="3" text={isTamil ? "டைமரை பயன்படுத்தி குறிப்பிட்ட நேரத்திற்கு ஒருமுறை ஸ்ப்ரே செய்யும்படி அமைக்கவும்." : "Set the timer to spray nutrient mist for 5 seconds every 5 minutes."} />
                            <StepItem num="4" text={isTamil ? "வேர்களுக்கு 100% ஆக்சிஜன் கிடைப்பதால் செடிகள் மிக வேகமாக வளரும்." : "Roots receive 100% oxygen, leading to incredibly fast growth rates."} />
                        </View>
                    </GlassCard>
                    
                    {/* Aquaponics Section */}
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'அக்வாபோனிக்ஸ் (Aquaponics)' : 'Aquaponics Integration'}</Text>
                        
                        <View style={styles.diagram}>
                            <View style={[styles.growTray, { borderColor: '#34D399' }]}>
                                <View style={styles.plantRow}>
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                    <Ionicons name="leaf" size={32} color="#10B981" />
                                </View>
                            </View>
                            <View style={styles.plumbing}>
                                <Ionicons name="water" size={24} color="#3B82F6" />
                            </View>
                            <View style={[styles.reservoir, { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.4)', flexDirection: 'row', justifyContent: 'center', gap: 10 }]}>
                                <Ionicons name="fish" size={28} color="#60A5FA" />
                                <Ionicons name="fish" size={28} color="#60A5FA" />
                                <Text style={[styles.label, { color: '#93C5FD', marginLeft: 10 }]}>{isTamil ? 'மீன் தொட்டி' : 'Fish Tank'}</Text>
                            </View>
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'எப்படி வேலை செய்கிறது:' : 'How it works:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "மீன்களின் கழிவுகள் தண்ணீரில் அம்மோனியாவாக மாறுகின்றன." : "Fish waste produces ammonia in the water."} />
                            <StepItem num="2" text={isTamil ? "நுண்ணுயிரிகள் (Bacteria) இந்த அம்மோனியாவை செடிகளுக்கு தேவையான நைட்ரேட் உரமாக மாற்றுகின்றன." : "Beneficial bacteria convert this ammonia into nitrates (fertilizer)."} />
                            <StepItem num="3" text={isTamil ? "செடிகள் நைட்ரேட்டை உறிஞ்சி தண்ணீரை சுத்தப்படுத்தி மீண்டும் மீன் தொட்டிக்கு அனுப்புகின்றன." : "Plants absorb the nitrates, thereby filtering the water, which flows back to the fish."} />
                        </View>
                    </GlassCard>
                    
                    {/* Drone Tech Section */}
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'ட்ரோன் தொழில்நுட்பம்' : 'Agricultural Drones'}</Text>
                        
                        <View style={styles.diagram}>
                            <Ionicons name="airplane" size={48} color="#FBBF24" style={{ alignSelf: 'center', marginVertical: 10 }} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'பயன்பாடுகள்:' : 'Applications:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "மருந்து மற்றும் உரம் தெளித்தல் (10 நிமிடத்தில் 1 ஏக்கர்)." : "Spraying fertilizers and pesticides (1 acre in 10 minutes)."} />
                            <StepItem num="2" text={isTamil ? "பயிர்களின் ஆரோக்கியத்தை கேமரா மூலம் கண்காணித்தல்." : "Monitoring crop health using multispectral cameras."} />
                            <StepItem num="3" text={isTamil ? "பயிர்களுக்கு தேவையான தண்ணீர் மற்றும் உரத்தின் அளவை துல்லியமாக கணக்கிடுதல்." : "Precision mapping to determine exactly where water or nutrients are lacking."} />
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'சொட்டு பாசனம் (Drip Irrigation)' : 'Drip Irrigation'}</Text>
                        <Text style={styles.subHeading}>{isTamil ? 'இது என்ன?' : 'What is it?'}</Text>
                        <Text style={styles.stepText}>{isTamil ? 'வேர்களுக்கு நேரடியாக நீரை வழங்கும் ஒரு நீர் சேமிப்பு பாசன முறை.' : 'A water-saving irrigation method where water is supplied directly to the roots.'}</Text>
                        
                        <Text style={styles.subHeading}>{isTamil ? 'சிறந்த பயிர்கள்:' : 'Best Crops:'}</Text>
                        <View style={styles.checklistGrid}>
                            <ChecklistItem icon="leaf-outline" text={isTamil ? "தக்காளி (Tomato)" : "Tomato"} />
                            <ChecklistItem icon="leaf-outline" text={isTamil ? "மிளகாய் (Chilli)" : "Chilli"} />
                            <ChecklistItem icon="leaf-outline" text={isTamil ? "தென்னை (Coconut)" : "Coconut"} />
                            <ChecklistItem icon="leaf-outline" text={isTamil ? "வாழை (Banana)" : "Banana"} />
                            <ChecklistItem icon="leaf-outline" text={isTamil ? "திராட்சை (Grapes)" : "Grapes"} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'நன்மைகள்:' : 'Benefits:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "50-70% நீரை சேமிக்கிறது." : "Saves 50–70% water."} />
                            <StepItem num="2" text={isTamil ? "களைகள் குறைவாக வளரும்." : "Less weeds."} />
                            <StepItem num="3" text={isTamil ? "அதிக மகசூல் கிடைக்கும்." : "Higher crop yield."} />
                            <StepItem num="4" text={isTamil ? "உர விரயம் குறையும்." : "Reduces fertilizer wastage."} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'அமைக்கும் முறை:' : 'Installation Steps:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "பிரதான குழாயை (main pipeline) அமைக்கவும்." : "Install main pipeline."} />
                            <StepItem num="2" text={isTamil ? "கிளை குழாய்களை (lateral pipes) இணைக்கவும்." : "Connect lateral pipes."} />
                            <StepItem num="3" text={isTamil ? "சொட்டுப்பான்களை (drippers) பொருத்தவும்." : "Fix drippers."} />
                            <StepItem num="4" text={isTamil ? "நீர் தொட்டியுடன் இணைக்கவும்." : "Connect water tank."} />
                            <StepItem num="5" text={isTamil ? "நீரோட்டத்தை சோதிக்கவும்." : "Test water flow."} />
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'மழைநீர் சேகரிப்பு (Rainwater Harvesting)' : 'Rainwater Harvesting'}</Text>
                        
                        <Text style={styles.subHeading}>{isTamil ? 'விவசாயிகளுக்கான வழிகாட்டுதல்:' : 'Teach Farmers:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "பண்ணைக் குட்டைகளை அமைக்கவும்." : "Build farm ponds."} />
                            <StepItem num="2" text={isTamil ? "பருவமழையை சேமிக்கவும்." : "Store monsoon rain."} />
                            <StepItem num="3" text={isTamil ? "நிலத்தடி நீரை செறிவூட்டவும்." : "Recharge groundwater."} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'நன்மைகள்:' : 'Benefits:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "கோடை காலத்தில் தண்ணீர் தட்டுப்பாடு இருக்காது." : "Water available during summer."} />
                            <StepItem num="2" text={isTamil ? "பாசன செலவு குறையும்." : "Reduces irrigation cost."} />
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'துல்லிய விவசாயம் (Precision Farming)' : 'Precision Farming'}</Text>
                        <Text style={styles.subHeading}>{isTamil ? 'இது என்ன?' : 'What is it?'}</Text>
                        <Text style={styles.stepText}>{isTamil ? 'மண், உரம் மற்றும் நீரின் தேவையை துல்லியமாக கண்காணித்து பயிரிடும் முறை.' : 'Growing crops by monitoring soil, fertilizer, and water requirements accurately.'}</Text>
                        
                        <Text style={styles.subHeading}>{isTamil ? 'விவசாயிகள் செய்ய வேண்டியவை:' : 'Farmers should:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "மண் பரிசோதனை செய்யவும்." : "Test soil."} />
                            <StepItem num="2" text={isTamil ? "தேவையான இடத்தில் மட்டும் உரம் இடவும்." : "Apply fertilizers only where needed."} />
                            <StepItem num="3" text={isTamil ? "ஈரப்பத சென்சார்களை பயன்படுத்தவும்." : "Use moisture sensors."} />
                            <StepItem num="4" text={isTamil ? "பயிர்களின் ஆரோக்கியத்தை கண்காணிக்கவும்." : "Monitor crop health."} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'நன்மைகள்:' : 'Advantages:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "அதிக மகசூல்." : "Higher yield."} />
                            <StepItem num="2" text={isTamil ? "குறைந்த செலவு." : "Lower expenses."} />
                            <StepItem num="3" text={isTamil ? "அதிக லாபம்." : "Better profit."} />
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>{isTamil ? 'ஒருங்கிணைந்த பண்ணையம் (Integrated Farming)' : 'Integrated Farming System'}</Text>
                        
                        <Text style={styles.subHeading}>{isTamil ? 'ஒரு பண்ணையில் உள்ளவை:' : 'One Farm Includes:'}</Text>
                        <View style={styles.checklistGrid}>
                            <ChecklistItem icon="leaf" text={isTamil ? "பயிர்கள் (Crops)" : "Crops"} />
                            <ChecklistItem icon="scan-outline" text={isTamil ? "மாடுகள் (Cow)" : "Cow"} />
                            <ChecklistItem icon="scan-outline" text={isTamil ? "ஆடுகள் (Goat)" : "Goat"} />
                            <ChecklistItem icon="scan-outline" text={isTamil ? "கோழிகள் (Poultry)" : "Poultry"} />
                            <ChecklistItem icon="water" text={isTamil ? "மீன்கள் (Fish)" : "Fish"} />
                            <ChecklistItem icon="bug" text={isTamil ? "மண்புழு உரம் (Vermicompost)" : "Vermicompost"} />
                        </View>

                        <Text style={styles.subHeading}>{isTamil ? 'நன்மைகள்:' : 'Advantages:'}</Text>
                        <View style={styles.processSteps}>
                            <StepItem num="1" text={isTamil ? "பல வகையான வருமானம்." : "Multiple income sources."} />
                            <StepItem num="2" text={isTamil ? "கழிவுகள் குறைவு." : "Less waste."} />
                            <StepItem num="3" text={isTamil ? "நீடித்த விவசாயம்." : "Sustainable farming."} />
                        </View>
                    </GlassCard>

                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBg },
    content: { padding: SPACING.lg, paddingBottom: 100, maxWidth: 800, alignSelf: 'center', width: '100%', paddingTop: 80 },
    floatingBackBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: SPACING.md, zIndex: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
    title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xl },
    card: { padding: SPACING.xl, marginBottom: SPACING.lg },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.gold, marginBottom: SPACING.lg },
    subHeading: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.xl },
    
    /* Checklist */
    checklistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    checklistItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: RADIUS.md, minWidth: 200, flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    iconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    checklistText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },

    /* Process Steps */
    processSteps: { gap: 16 },
    stepBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    stepNumText: { color: COLORS.darkBg, fontWeight: 'bold', fontSize: 14 },
    stepText: { flex: 1, color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },

    /* Diagrams */
    diagram: { alignItems: 'center', marginVertical: SPACING.lg, padding: SPACING.lg, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    growTray: { width: '100%', height: 80, borderWidth: 2, borderColor: '#10B981', borderRadius: RADIUS.md, backgroundColor: 'rgba(16,185,129,0.1)', overflow: 'hidden' },
    plantRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 60, paddingHorizontal: 20 },
    mistRow: { flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', bottom: 10, width: '100%' },
    waterLine: { position: 'absolute', bottom: 0, width: '100%', height: 20, backgroundColor: 'rgba(59,130,246,0.3)' },
    plumbing: { alignItems: 'center', marginVertical: -5 },
    pipe: { width: 10, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
    reservoir: { width: 160, height: 60, borderRadius: RADIUS.md, borderWidth: 2, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center' },
    label: { color: '#60A5FA', fontWeight: 'bold', fontSize: 14 },
});
