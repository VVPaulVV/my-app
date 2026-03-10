import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function GuideContent({ onClose }: { onClose?: () => void }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();

    const GuideSection = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
                <IconSymbol name={icon as any} size={22} color={theme.primary} style={{ marginRight: 10 }} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
            </View>
            {children}
        </View>
    );

    const BulletPoint = ({ text }: { text: string }) => (
        <View style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
            <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{text}</Text>
        </View>
    );

    return (
        <View style={[styles.sheetContainer, { backgroundColor: theme.background }]}>
            { }
            <View style={styles.handleWrapper}>
                <View style={[styles.handle, { backgroundColor: theme.border }]} />
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={[styles.title, { color: theme.text }]}>{i18n.t('guideTitle')}</Text>
                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.cardBackground }]}>
                            <IconSymbol name="xmark" size={20} color={theme.text} />
                        </TouchableOpacity>
                    )}
                </View>

                <GuideSection title={i18n.t('whereToBuy')} icon="house.fill">
                    <View style={styles.horizontalRow}>
                        <View style={[styles.sideIconWrapper, { backgroundColor: theme.cardBackground, shadowColor: theme.primary }]}>
                            <Image
                                source={require('@/assets/images/transport/ticket-machine.png')}
                                style={styles.sideMachineIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
                                {i18n.t('ticketMachines')}
                            </Text>
                            <View style={styles.hintRow}>
                                <IconSymbol name="arrow.left" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                                <Text style={[styles.subtleHint, { color: theme.textSecondary }]}>
                                    {i18n.t('lookForMachine')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <BulletPoint text={i18n.t('ctsApp')} />
                    <BulletPoint text={i18n.t('onboardBus')} />
                    <BulletPoint text={i18n.t('partnerStores')} />
                </GuideSection>

                <GuideSection title={i18n.t('howToValidate')} icon="paperplane.fill">
                    <View style={styles.horizontalRow}>
                        <View style={[styles.sideIconWrapper, { backgroundColor: theme.cardBackground, shadowColor: theme.primary }]}>
                            <Image
                                source={require('@/assets/images/transport/validation-machine.png')}
                                style={styles.sideValidationIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
                                {i18n.t('validatePlatform')}
                            </Text>
                            <View style={styles.hintRow}>
                                <IconSymbol name="arrow.left" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                                <Text style={[styles.subtleHint, { color: theme.textSecondary }]}>
                                    {i18n.t('lookForValidator')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[styles.note, { color: theme.textSecondary }]}>
                        {i18n.t('validationMandatoryNote')}
                    </Text>
                    <BulletPoint text={i18n.t('busValidation')} />
                    <BulletPoint text={i18n.t('contactlessValidation')} />
                </GuideSection>

                <GuideSection title={i18n.t('mainTicketTypes')} icon="tram.fill">
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>{i18n.t('singleTicket')}</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>1.90 €</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>{i18n.t('dayIndividual')}</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>4.60 €</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>{i18n.t('dayTrio')}</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>10.20 €</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>{i18n.t('threeDayIndividual')}</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>10.20 €</Text>
                    </View>
                    <Text style={[styles.priceNote, { color: theme.textSecondary }]}>
                        {i18n.t('ticketFeeDetailed')}
                    </Text>
                </GuideSection>

                <GuideSection title={i18n.t('travelTips')} icon="lightbulb.fill">
                    <View style={styles.horizontalRow}>
                        <View style={[styles.sideIconWrapper, { backgroundColor: theme.cardBackground, shadowColor: theme.primary }]}>
                            <IconSymbol name="airplane" size={32} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
                            <Text style={[styles.bulletText, { color: theme.text, fontWeight: 'bold' }]}>
                                {i18n.t('airportConnection')}
                            </Text>
                            <Text style={[styles.subtleHint, { color: theme.textSecondary, fontStyle: 'normal' }]}>
                                {i18n.t('airportConnectionDesc')}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.horizontalRow, { marginBottom: 0 }]}>
                        <View style={[styles.sideIconWrapper, { backgroundColor: theme.cardBackground, shadowColor: theme.primary }]}>
                            <IconSymbol name="person.3.fill" size={32} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
                            <Text style={[styles.bulletText, { color: theme.text, fontWeight: 'bold' }]}>
                                {i18n.t('familyTicketTip')}
                            </Text>
                            <Text style={[styles.subtleHint, { color: theme.textSecondary, fontStyle: 'normal' }]}>
                                {i18n.t('familyTicketDesc')}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 16 }}>
                        <BulletPoint text={i18n.t('freeTravel') + ': ' + i18n.t('freeTravelDesc')} />
                    </View>
                </GuideSection>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        flex: 1,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
    },
    handleWrapper: {
        width: '100%',
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 60,
    },
    header: {
        paddingVertical: 12,
        paddingLeft: 8,
        paddingRight: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '300',
        fontFamily: 'CormorantGaramond_300Light',
    },
    section: {
        marginVertical: 8,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '300',
        fontFamily: 'Outfit_300Light',
        letterSpacing: 0.04,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
        marginRight: 10,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '300',
    },
    note: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    priceLabel: {
        fontSize: 15,
        fontWeight: '300',
    },
    priceValue: {
        fontSize: 15,
        fontWeight: '300',
    },
    priceNote: {
        marginTop: 10,
        fontSize: 12,
        fontStyle: 'italic',
    },
    guideImage: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        marginBottom: 16,
        resizeMode: 'cover',
    },
    imageWrapper: {
        width: '100%',
        height: 140,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    horizontalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 20,
    },
    sideIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideMachineIcon: {
        width: 48,
        height: 48,
    },
    sideValidationIcon: {
        width: 24,
        height: 48,
    },
    machineIcon: {
        width: 100,
        height: 100,
    },
    validationIcon: {
        width: 60,
        height: 120,
    },
    subtleHint: {
        fontSize: 13,
        fontStyle: 'italic',
        opacity: 0.8,
        flex: 1,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
        marginLeft: 0,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    }
});
