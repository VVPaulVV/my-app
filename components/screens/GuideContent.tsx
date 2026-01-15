import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function GuideContent({ onClose }: { onClose?: () => void }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

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
            {/* Handle Bar */}
            <View style={styles.handleWrapper}>
                <View style={[styles.handle, { backgroundColor: theme.border }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={[styles.title, { color: theme.text }]}>{i18n.t('guideTitle')}</Text>
                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.cardBackground }]}>
                            <IconSymbol name="xmark" size={20} color={theme.text} />
                        </TouchableOpacity>
                    )}
                </View>

                <GuideSection title="Where to Buy" icon="house.fill">
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
                                Ticket Machines: At all tram stops and major bus stops.
                            </Text>
                            <View style={styles.hintRow}>
                                <IconSymbol name="arrow.left" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                                <Text style={[styles.subtleHint, { color: theme.textSecondary }]}>
                                    look for this, in the middle of the platform
                                </Text>
                            </View>
                        </View>
                    </View>
                    <BulletPoint text="CTS Mobile App: Purchase via smartphone (NFC compatible)." />
                    <BulletPoint text="Onboard the Bus: Emergency tickets available from the driver (€2.50)." />
                    <BulletPoint text="Partner Stores: Newsagents and tobacco shops displaying the CTS sign." />
                </GuideSection>

                <GuideSection title="How to Validate" icon="paperplane.fill">
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
                                Trams & BRT (G/H): Validate on the platform machine BEFORE boarding.
                            </Text>
                            <View style={styles.hintRow}>
                                <IconSymbol name="arrow.left" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                                <Text style={[styles.subtleHint, { color: theme.textSecondary }]}>
                                    look for these, usually on the sides of the platform and one next to the ticket machine
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[styles.note, { color: theme.textSecondary }]}>
                        Validation is mandatory for every journey, including transfers.
                    </Text>
                    <BulletPoint text="Regular Buses: Validate inside the bus using the red machines." />
                    <BulletPoint text="Contactless: Hold your card or phone against the yellow area until it beeps." />
                </GuideSection>

                <GuideSection title="Main Ticket Types" icon="tram.fill">
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>Single Ticket</Text>
                        <Text style={styles.priceValue}>1.90 €</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>24h Individual</Text>
                        <Text style={styles.priceValue}>4.60 €</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>24h Trio (2-3 people)</Text>
                        <Text style={styles.priceValue}>10.20 €</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>72h Individual</Text>
                        <Text style={styles.priceValue}>10.20 €</Text>
                    </View>
                    <Text style={[styles.priceNote, { color: theme.textSecondary }]}>
                        * +0.20 € fee for the first paper ticket purchase.
                    </Text>
                </GuideSection>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
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
        paddingLeft: 8, // Reduced since container already has padding
        paddingRight: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    section: {
        marginVertical: 8,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
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
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F68002',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    }
});
