import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';


const getWeatherIcon = (code: number, isDay: boolean): string => {

    if (code === 0) return isDay ? 'sun.max.fill' : 'moon.fill';

    if (code === 1) return isDay ? 'cloud.sun.fill' : 'cloud.moon.fill';
    if (code === 2) return 'cloud.fill';
    if (code === 3) return 'cloud.fill';

    if (code === 45 || code === 48) return 'cloud.fog.fill';

    if (code >= 51 && code <= 55) return 'cloud.drizzle.fill';

    if (code >= 61 && code <= 65) return 'cloud.rain.fill';

    if (code === 66 || code === 67) return 'cloud.sleet.fill';

    if (code >= 71 && code <= 77) return 'snowflake';

    if (code >= 80 && code <= 82) return 'cloud.sun.rain.fill';

    if (code >= 85 && code <= 86) return 'cloud.snow.fill';

    if (code >= 95) return 'cloud.bolt.rain.fill';

    return 'questionmark.circle';
};


const getWeatherDescription = (code: number, lang: string): string => {
    const descriptions: { [key: number]: { [key: string]: string } } = {
        0: { en: 'Clear sky', fr: 'Ciel dégagé', de: 'Klarer Himmel', es: 'Cielo despejado', it: 'Cielo sereno', ru: 'Ясно', zh: '晴朗', ja: '快晴', pt: 'Céu limpo', tr: 'Açık hava' },
        1: { en: 'Mainly clear', fr: 'Partiellement nuageux', de: 'Überwiegend klar', es: 'Mayormente despejado', it: 'Prevalentemente sereno', ru: 'Преимущественно ясно', pt: 'Parcialmente nublado', tr: 'Çoğunlukla açık' },
        2: { en: 'Partly cloudy', fr: 'Nuageux', de: 'Teils bewölkt', es: 'Parcialmente nublado', it: 'Parzialmente nuvoloso', ru: 'Переменная облачность', pt: 'Parcialmente nublado', tr: 'Parçalı bulutlu' },
        3: { en: 'Overcast', fr: 'Couvert', de: 'Bedeckt', es: 'Nublado', it: 'Coperto', ru: 'Пасмурно', pt: 'Encoberto', tr: 'Kapalı' },
        45: { en: 'Fog', fr: 'Brouillard', de: 'Nebel', es: 'Niebla', it: 'Nebbia', ru: 'Туман', pt: 'Nevoeiro', tr: 'Sisli' },
        48: { en: 'Fog', fr: 'Brouillard', de: 'Nebel', es: 'Niebla', it: 'Nebbia', ru: 'Туман', pt: 'Nevoeiro', tr: 'Sisli' },
        51: { en: 'Drizzle', fr: 'Bruine', de: 'Nieselregen', es: 'Llovizna', it: 'Pioviggine', ru: 'Морось', pt: 'Chuvisco', tr: 'Çiseleme' },
        53: { en: 'Drizzle', fr: 'Bruine', de: 'Nieselregen', es: 'Llovizna', it: 'Pioviggine', ru: 'Морось', pt: 'Chuvisco', tr: 'Çiseleme' },
        55: { en: 'Drizzle', fr: 'Bruine', de: 'Nieselregen', es: 'Llovizna', it: 'Pioviggine', ru: 'Морось', pt: 'Chuvisco', tr: 'Çiseleme' },
        61: { en: 'Rain', fr: 'Pluie', de: 'Regen', es: 'Lluvia', it: 'Pioggia', ru: 'Дождь', pt: 'Chuva', tr: 'Yağmur' },
        63: { en: 'Rain', fr: 'Pluie', de: 'Regen', es: 'Lluvia', it: 'Pioggia', ru: 'Дождь', pt: 'Chuva', tr: 'Yağmur' },
        65: { en: 'Rain', fr: 'Pluie', de: 'Regen', es: 'Lluvia', it: 'Pioggia', ru: 'Дождь', pt: 'Chuva', tr: 'Yağmur' },
        71: { en: 'Snow', fr: 'Neige', de: 'Schnee', es: 'Nieve', it: 'Neve', ru: 'Снег', pt: 'Neve', tr: 'Kar' },
        73: { en: 'Snow', fr: 'Neige', de: 'Schnee', es: 'Nieve', it: 'Neve', ru: 'Снег', pt: 'Neve', tr: 'Kar' },
        75: { en: 'Snow', fr: 'Neige', de: 'Schnee', es: 'Nieve', it: 'Neve', ru: 'Снег', pt: 'Neve', tr: 'Kar' },
        80: { en: 'Showers', fr: 'Averses', de: 'Schauer', es: 'Chubascos', it: 'Rovesci', ru: 'Ливень', pt: 'Aguaceiros', tr: 'Sağanak' },
        81: { en: 'Showers', fr: 'Averses', de: 'Schauer', es: 'Chubascos', it: 'Rovesci', ru: 'Ливень', pt: 'Aguaceiros', tr: 'Sağanak' },
        82: { en: 'Showers', fr: 'Averses', de: 'Schauer', es: 'Chubascos', it: 'Rovesci', ru: 'Ливень', pt: 'Aguaceiros', tr: 'Sağanak' },
        95: { en: 'Thunderstorm', fr: 'Orage', de: 'Gewitter', es: 'Tormenta', it: 'Temporale', ru: 'Гроза', pt: 'Trovoada', tr: 'Fırtına' },
    };

    const codeDesc = descriptions[code];

    if (!codeDesc) return 'Unknown';
    return (codeDesc as any)[lang] || (codeDesc as any)['en'] || 'Unknown';
};

export const WeatherWidget = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {

                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=48.5734&longitude=7.7521&current_weather=true'
                );
                const data = await response.json();
                setWeather(data.current_weather);
            } catch (error) {
                console.error('Failed to fetch weather:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
        );
    }

    if (!weather) return null;

    const iconName = getWeatherIcon(weather.weathercode, weather.is_day === 1);
    const description = getWeatherDescription(weather.weathercode, i18n.locale.split('-')[0]);

    return (
        <View style={styles.container}>
            <View style={[
                styles.content,
                {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                }
            ]}>
                <View style={[styles.accentBar, { backgroundColor: theme.tint }]} />

                <View style={styles.weatherLine}>
                    <IconSymbol name={iconName as any} size={24} color={theme.accent} style={{ opacity: 0.9 }} />
                    <Text style={[styles.tempText, { color: theme.text }]}>
                        {Math.round(weather.temperature)}°C
                    </Text>
                </View>

                {/* Adding pseudo-city label since none is provided by current open-meteo response without geocoding */}
                <Text style={[styles.cityLabel, { color: theme.tint }]}>
                    Strasbourg
                </Text>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <Text style={[styles.descText, { color: theme.textSecondary }]}>
                    {description.toUpperCase()}
                </Text>
                <View style={styles.secondaryContainer}>
                    <Text style={[styles.secondaryInfo, { color: theme.textSecondary }]}>
                        WIND: {weather.windspeed} km/h
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginBottom: 8,
    },
    loadingContainer: {
        height: 40,
        justifyContent: 'center',
    },
    content: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
    },
    weatherLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    tempText: {
        fontSize: 38,
        fontWeight: '300',
        letterSpacing: -0.01,
    },
    cityLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.12,
        textTransform: 'uppercase',
        marginTop: 8,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 10,
    },
    descText: {
        fontSize: 13,
        fontWeight: '200',
        letterSpacing: 0.04,
        textTransform: 'uppercase',
    },
    secondaryContainer: {
        marginTop: 4,
    },
    secondaryInfo: {
        fontSize: 11,
        fontWeight: '200',
    },
});
