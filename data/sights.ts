export type Sight = {
    id: string;
    name: string;
    shortDescription: string;
    description?: string;
    image: any; // URL or require
    category: 'sights' | 'nature' | 'modern' | 'mustSee' | 'museums' | 'restaurants' | 'activities' | 'sights';
    location: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    reservationUrl?: string;
    phoneNumber?: string;
    tags?: string[];
    translations?: {
        [key: string]: {
            name: string;
            shortDescription: string;
            description?: string;
            location?: string;
        } | undefined;
    };
};

export const SIGHTS: Sight[] = [
    // Primary Sights
    {
        id: 'cathedral',
        name: 'Cathédrale Notre-Dame',
        shortDescription: 'The stunning masterpiece of Gothic art.',
        description: 'Strasbourg Cathedral is a masterpiece of Gothic art. The 142 m spire was the highest in Christendom until the 19th century.',
        image: require('@/assets/images/sights/cathedral.jpg'),
        category: 'sights',
        // Updated
        location: 'Pl. de la Cathédrale',
        coordinates: { latitude: 48.58180755516249, longitude: 7.750911815075193 },
        translations: {
            tr: {
                name: 'Strazburg Notre-Dame Katedrali',
                shortDescription: 'Gotik sanatın büyüleyici şaheseri.',
                description: 'Strazburg Katedrali, Gotik sanatın bir başyapıtıdır. 142 metrelik kulesi, 19. yüzyıla kadar Hristiyan dünyasının en yükseğiydi.',
                location: 'Katedral Meydanı (Place de la Cathédrale)'
            },
            fr: {
                name: 'Cathédrale Notre-Dame',
                shortDescription: 'Le chef-d\'œuvre absolu de l\'art gothique.',
                description: 'La Cathédrale de Strasbourg est un chef-d\'œuvre de l\'art gothique. Sa flèche de 142 m était la plus haute de la chrétienté jusqu\'au 19ème siècle.',
                location: 'Pl. de la Cathédrale'
            },
            de: {
                name: 'Liebfrauenmünster zu Straßburg',
                shortDescription: 'Das atemberaubende Meisterwerk der Gotik.',
                description: 'Das Straßburger Münster ist ein Meisterwerk der gotischen Kunst. Der 142 m hohe Turm war bis zum 19. Jahrhundert der höchste der Christenheit.',
                location: 'Münsterplatz'
            },
            es: {
                name: 'Catedral de Notre-Dame',
                shortDescription: 'La impresionante obra maestra del arte gótico.',
                description: 'La Catedral de Estrasburgo es una obra maestra del arte gótico. Su aguja de 142 m fue la más alta de la cristiandad hasta el siglo XIX.',
                location: 'Pl. de la Cathédrale'
            },
            it: {
                name: 'Cattedrale di Nostra Signora',
                shortDescription: 'Il meraviglioso capolavoro dell\'arte gotica.',
                description: 'La Cattedrale di Strasburgo è un capolavoro dell\'arte gotica. La sua guglia di 142 m è stata la più alta della cristianità fino al XIX secolo.',
                location: 'Pl. de la Cathédrale'
            },
            ru: {
                name: 'Страсбургский собор',
                shortDescription: 'Потрясающий шедевр готического искусства.',
                description: 'Страсбургский собор — шедевр готического искусства. Его шпиль высотой 142 м был самым высоким в христианском мире до XIX века.',
                location: 'Pl. de la Cathédrale'
            },
            zh: {
                name: '斯特拉斯堡大教堂',
                shortDescription: '哥特式艺术的惊世杰作。',
                description: '斯特拉斯堡大教堂是哥特式艺术的杰作。142 米高的尖顶在 19 世纪之前一直是基督教世界最高的建筑。',
                location: '大教堂广场'
            },
            ja: {
                name: 'ストラスブール大聖堂',
                shortDescription: 'ゴシック美術の見事な傑作。',
                description: 'ストラスブール大聖堂はゴシック美術の傑作です。142mの尖塔は、19世紀までキリスト教圏で最も高いものでした。',
                location: 'カテドラル広場'
            },
            ko: {
                name: '스트라스부르 대성당',
                shortDescription: '고딕 예술의 놀라운 걸작.',
                description: '스트라스부르 대성당은 고딕 예술의 걸작입니다. 142m 높이의 첨탑은 19세기까지 기독교 세계에서 가장 높았습니다.',
                location: '대성당 광장'
            },
            ar: {
                name: 'كاتدرائية ستراسبورغ',
                shortDescription: 'تحفة مذهلة من الفن القوطي.',
                description: 'تعد كاتدرائية ستراسبورغ تحفة فنية قوطية. كان ارتفاع برجها 142 متراً هو الأعلى في العالم المسيحي حتى القرن التاسع عشر.',
                location: 'ميدان الكاتدرائية'
            },
            pl: {
                name: 'Katedra Najświętszej Marii Panny',
                shortDescription: 'Oszałamiające arcydzieło sztuki gotyckiej.',
                description: 'Katedra w Strasburgu to arcydzieło sztuki gotyckiej. Jej 142-metrowa iglica była najwyższą w świecie chrześcijańskim do XIX wieku.',
                location: 'Pl. de la Cathédrale'
            },
            pt: {
                name: 'Catedral de Estrasburgo',
                shortDescription: 'A obra-prima deslumbrante da arte gótica.',
                description: 'A Catedral de Estrasburgo é uma obra-prima da arte gótica. Sua agulha de 142 m foi a mais alta da cristandade até o século XIX.',
                location: 'Pl. de la Cathédrale'
            },
            nl: {
                name: 'Onze-Lieve-Vrouwekathedraal van Straatsburg',
                shortDescription: 'Het verbluffende meesterwerk van gotische kunst.',
                description: 'De kathedraal van Straatsburg is een meesterwerk van gotische kunst. De spits van 142 m was tot de 19e eeuw de hoogste in de christenheid.',
                location: 'Pl. de la Cathédrale'
            },
            az: {
                name: 'Strasburq kafedralı',
                shortDescription: 'Qotik sənətin möhtəşəm şah əsəri.',
                description: 'Strasburq kafedralı qotik sənətin şah əsəridir. Onun 142 metrlik qülləsi 19-cu əsrə qədər xristian dünyasında ən yüksəyi idi.',
                location: 'Kafedral Meydanı'
            },
            sv: {
                name: 'Vårfrukyrkan i Strasbourg',
                shortDescription: 'Det fantastiska mästerverket i gotisk konst.',
                description: 'Strasbourgs katedral är ett mästerverk i gotisk konst. Dess 142 meter höga spira var den högsta i kristenheten fram till 1800-talet.',
                location: 'Pl. de la Cathédrale'
            },
            no: {
                name: 'Vår Frue-katedralen i Strasbourg',
                shortDescription: 'Det fantastiske mesterverket innen gotisk kunst.',
                description: 'Strasbourg-katedralen er et mesterverk innen gotisk kunst. Det 142 meter høye spiret var det høyeste i kristenheten frem til 1800-tallet.',
                location: 'Pl. de la Cathédrale'
            },
            el: {
                name: 'Καθεδρικός Ναός της Παναγίας του Στρασβούργου',
                shortDescription: 'Το εκπληκτικό αριστούργημα της γοτθικής τέχνης.',
                description: 'Ο Καθεδρικός Ναός του Στρασβούργου είναι ένα αριστούργημα της γοτθικής τέχνης. Το καμπαναριό των 142 μέτρων ήταν το υψηλότερο στον χριστιανικό κόσμο μέχρι τον 19ο αιώνα.',
                location: 'Pl. de la Cathédrale'
            }
        }
    },
    {
        id: 'petite-france',
        name: 'La Petite France',
        shortDescription: 'The most picturesque district of old Strasbourg.',
        description: 'Fishermen, millers and tanners once lived and worked in this part of town where the streets have been built on the level of the waterways.',
        image: require('@/assets/images/sights/petite-france.jpg'),
        category: 'sights',
        // Updated
        location: '1 Rue du Pont Saint-Martin',
        coordinates: { latitude: 48.58009767451487, longitude: 7.743200116368558 },
        translations: {
            tr: {
                name: 'La Petite France (Küçük Fransa)',
                shortDescription: 'Eski Strazburg\'un en pitoresk bölgesi.',
                description: 'Balıkçıların, değirmencilerin ve tabakçıların bir zamanlar yaşadığı ve çalıştığı, sokakların su yolları seviyesinde inşa edildiği şehrin bu bölümüdür.',
                location: '1 Rue du Pont Saint-Martin, Strazburg'
            },
            fr: {
                name: 'La Petite France',
                shortDescription: 'Le quartier le plus pittoresque du vieux Strasbourg.',
                description: 'Pêcheurs, meuniers et tanneurs vivaient et travaillaient autrefois dans ce quartier dont les rues ont été construites au niveau des voies navigables.',
                location: '1 Rue du Pont Saint-Martin'
            },
            de: {
                name: 'La Petite France',
                shortDescription: 'Das malerischste Viertel des alten Straßburg.',
                description: 'Fischer, Müller und Gerber lebten und arbeiteten einst in diesem Stadtteil, dessen Straßen in Höhe der Wasserwege gebaut wurden.',
                location: '1 Rue du Pont Saint-Martin'
            },
            es: {
                name: 'La Petite France',
                shortDescription: 'El barrio más pintoresco del viejo Estrasburgo.',
                description: 'Pescadores, molineros y curtidores vivieron y trabajaron alguna vez en esta parte de la ciudad donde las calles se han construido al nivel de las vías fluviales.',
                location: '1 Rue du Pont Saint-Martin'
            },
            it: {
                name: 'La Petite France',
                shortDescription: 'Il quartiere più pittoresco della vecchia Strasburgo.',
                description: 'Pescatori, mugnai e conciatori un tempo vivevano e lavoravano in questa parte della città dove le strade sono state costruite al livello dei corsi d\'acqua.',
                location: '1 Rue du Pont Saint-Martin'
            },
            ru: {
                name: 'Маленькая Франция',
                shortDescription: 'Самый живописный район старого Страсбурга.',
                description: 'В этом районе города, где улицы построены на уровне водных путей, когда-то жили и работали рыбаки, мельники и кожевники.',
                location: '1 Rue du Pont Saint-Martin'
            },
            zh: {
                name: '小法兰西',
                shortDescription: '旧斯特拉斯堡最迷人的地区。',
                description: '渔民、磨坊主和制革工曾在这个街道建在水道平面的城市区域生活和工作。',
                location: '1 Rue du Pont Saint-Martin'
            },
            ja: {
                name: 'プティット・フランス',
                shortDescription: '旧ストラスブールで最も絵になる地区。',
                description: 'かつて漁師や製粉業者、皮なめし職人が住み、働いていた場所です。',
                location: '1 Rue du Pont Saint-Martin'
            },
            ko: {
                name: '쁘띠 프랑스',
                shortDescription: '구 스트라스부르에서 가장 그림 같은 지역.',
                description: '어부, 방앗간 주인, 가죽 가공업자들이 살고 일했던 곳으로, 수로 높이에 맞춰 거리가 조성되어 있습니다.',
                location: '1 Rue du Pont Saint-Martin'
            },
            ar: {
                name: 'فرنسا الصغيرة',
                shortDescription: 'المنطقة الأكثر جمالاً في ستراسبورغ القديمة.',
                description: 'فرنسا الصغيرة هي المنطقة الأكثر جمالاً في ستراسبورغ القديمة. كان الصيادون والطحانون والدباغون يعيشون ويعملون في هذا الحي.',
                location: 'الحي التاريخي'
            },
            nl: {
                name: 'La Petite France',
                shortDescription: 'De meest schilderachtige wijk van oud Straatsburg.',
                description: 'Vissers, molenaars en looiers woonden en werkten ooit in dit deel van de stad.',
                location: '1 Rue du Pont Saint-Martin'
            },
            pl: {
                name: 'La Petite France',
                shortDescription: 'Najbardziej malownicza dzielnica starego Strasburga.',
                description: 'Wędkarze, młynarze i garbarze mieszkali i pracowali kiedyś w tej części miasta.',
                location: '1 Rue du Pont Saint-Martin'
            },
            cs: {
                name: 'La Petite France',
                shortDescription: 'Nejmalebnější čtvrť starého Štrasburku.',
                description: 'Rybáři, mlynáři a koželuzi kdysi žili a pracovali v této části města.',
                location: '1 Rue du Pont Saint-Martin'
            },
            ro: {
                name: 'La Petite France',
                shortDescription: 'Cel mai pitoresc cartier al vechiului Strasbourg.',
                description: 'Pescarii, morarii și tăbăcarii au locuit și lucrat cândva în această parte a orașului.',
                location: '1 Rue du Pont Saint-Martin'
            },
            pt: {
                name: 'Petite France',
                shortDescription: 'O bairro mais pitoresco da antiga Estrasburgo.',
                description: 'Petite France é o bairro mais pitoresco da antiga Estrasburgo. Pescadores, moleiros e curtidores viveram e trabalharam outrora neste bairro.',
                location: 'Bairro Histórico'
            }
        }
    },
    {
        id: 'rohan-palace',
        name: 'Palais Rohan',
        shortDescription: 'Former residence of the prince-bishops.',
        description: 'This 18th-century palace is a masterpiece of French Baroque architecture and now houses three museums.',
        image: require('@/assets/images/sights/palais-rohan.jpg'),
        category: 'sights',
        // Updated
        location: '2 Pl. du Château',
        coordinates: { latitude: 48.581059628550705, longitude: 7.752234701598285 },
        translations: {
            tr: {
                name: 'Rohan Sarayı (Palais Rohan)',
                shortDescription: 'Prens-piskoposların eski ikametgahı.',
                description: 'Bu 18. yüzyıl sarayı, Fransız Barok mimarisinin bir şaheseridir ve şu anda üç müzeye ev sahipliği yapmaktadır.',
                location: '2 Place du Château, Strazburg'
            },
            fr: {
                name: 'Palais Rohan',
                shortDescription: 'Ancienne résidence des princes-évêques.',
                description: 'Ce palais du 18ème siècle est un chef-d\'œuvre de l\'architecture baroque française et abrite aujourd\'hui trois musées.',
                location: '2 Pl. du Château'
            },
            de: {
                name: 'Rohan-Schloss',
                shortDescription: 'Ehemalige Residenz der Fürstbischöfe.',
                description: 'Dieser Palast aus dem 18. Jahrhundert ist ein Meisterwerk der französischen Barockarchitektur und beherbergt heute drei Museen.',
                location: '2 Pl. du Château'
            },
            es: {
                name: 'Palacio Rohan',
                shortDescription: 'Antigua residencia de los príncipes-obispos.',
                description: 'Este palacio del siglo XVIII es una obra maestra de la arquitectura barroca francesa y ahora alberga tres museos.',
                location: '2 Pl. du Château'
            },
            it: {
                name: 'Palazzo Rohan',
                shortDescription: 'Antica residenza dei principi-vescovi.',
                description: 'Questo palazzo del XVIII secolo è un capolavoro dell\'architettura barocca francese e oggi ospita tre musei.',
                location: '2 Pl. du Château'
            }
        }
    },
    {
        id: 'barrage-vauban',
        name: 'Barrage Vauban',
        shortDescription: '17th-century bridge and weir.',
        description: 'A defensive work erected in the 17th century on the River Ill. It offers a great panoramic view of the Petite France.',
        image: require('@/assets/images/sights/barrage-vauban.jpg'),
        category: 'sights',
        // Updated
        location: 'Pl. du Quartier Blanc',
        coordinates: { latitude: 48.579601192743404, longitude: 7.738016252519863 },
        translations: {
            tr: {
                name: 'Vauban Barajı (Barrage Vauban)',
                shortDescription: '17. yüzyıldan kalma köprü ve baraj.',
                description: '17. yüzyılda Ill Nehri üzerine inşa edilmiş savunma amaçlı bir yapı. Petite France bölgesinin harika bir panoramik manzarasını sunar.',
                location: 'Place du Quartier Blanc, Strazburg'
            },
            fr: {
                name: 'Barrage Vauban',
                shortDescription: 'Pont-écluse du 17ème siècle.',
                description: 'Ouvrage défensif érigé au XVIIe siècle sur l\'Ill. Il offre une superbe vue panoramique sur la Petite France.',
                location: 'Pl. du Quartier Blanc'
            },
            de: {
                name: 'Barrage Vauban',
                shortDescription: 'Brücke und Wehr aus dem 17. Jahrhundert.',
                description: 'Ein im 17. Jahrhundert errichtetes Verteidigungswerk an der Ill. Es bietet einen großartigen Panoramablick auf die Petite France.',
                location: 'Pl. du Quartier Blanc'
            },
            es: {
                name: 'Barrage Vauban',
                shortDescription: 'Puente y presa del siglo XVII.',
                description: 'Una obra defensiva erigida en el siglo XVII sobre el río Ill. Ofrece una gran vista panorámica de la Petite France.',
                location: 'Pl. du Quartier Blanc'
            },
            it: {
                name: 'Diga di Vauban',
                shortDescription: 'Ponte e sbarramento del XVII secolo.',
                description: 'Un\'opera difensiva eretta nel XVII secolo sul fiume Ill. Offre una splendida vista panoramica sulla Petite France.',
                location: 'Pl. du Quartier Blanc'
            }
        }
    },
    // Secondary Sights
    {
        id: 'eu-parliament',
        name: 'European Parliament',
        shortDescription: 'The legislative heart of Europe.',
        description: 'The Louise Weiss building houses the hemicycle where planetary debates take place. A symbol of modern Strasbourg.',
        image: require('@/assets/images/sights/eu-parliament.jpg'),
        category: 'sights',
        // Updated
        location: '1 Av. du Président Robert Schuman',
        coordinates: { latitude: 48.597484505938425, longitude: 7.768460744781987 },
        translations: {
            tr: {
                name: 'Avrupa Parlamentosu',
                shortDescription: 'Avrupa\'nın yasama kalbi.',
                description: 'Louise Weiss binası, gezegensel tartışmaların yapıldığı hemisikloya ev sahipliği yapar. Modern Strazburg\'un bir sembolüdür.',
                location: '1 Av. du Président Robert Schuman, Strazburg'
            },
            fr: {
                name: 'Parlement Européen',
                shortDescription: 'Le cœur législatif de l\'Europe.',
                description: 'Le bâtiment Louise Weiss abrite l\'hémicycle où se déroulent les débats planétaires. Un symbole du Strasbourg moderne.',
                location: '1 Av. du Président Robert Schuman'
            },
            de: {
                name: 'Europäisches Parlament',
                shortDescription: 'Das legislative Herz Europas.',
                description: 'Das Louise-Weiss-Gebäude beherbergt den Plenarsaal, in dem weltweite Debatten stattfinden. Ein Symbol des modernen Straßburg.',
                location: '1 Av. du Président Robert Schuman'
            },
            es: {
                name: 'Parlamento Europeo',
                shortDescription: 'El corazón legislativo de Europa.',
                description: 'El edificio Louise Weiss alberga el hemiciclo donde tienen lugar los debates planetarios. Un símbolo del Estrasburgo moderno.',
                location: '1 Av. du Président Robert Schuman'
            },
            it: {
                name: 'Parlamento Europeo',
                shortDescription: 'Il cuore legislativo dell\'Europa.',
                description: 'L\'edificio Louise Weiss ospita l\'emiciclo dove si svolgono i dibattiti planetari. Un simbolo della Strasburgo moderna.',
                location: '1 Av. du Président Robert Schuman'
            }
        }
    },
    {
        id: 'orangerie',
        name: 'Parc de l\'Orangerie',
        shortDescription: 'Strasbourg\'s oldest and favorite park.',
        description: 'A beautiful park with a lake, zoo, and stork reintroduction center, located near the European institutions.',
        image: require('@/assets/images/sights/orangerie.jpg'),
        category: 'sights',
        // Updated
        location: 'Parc de l\'Orangerie',
        coordinates: { latitude: 48.59242512751338, longitude: 7.774717627413548 },
        translations: {
            tr: {
                name: 'Orangerie Parkı (Parc de l\'Orangerie)',
                shortDescription: 'Strazburg\'un en eski ve en sevilen parkı.',
                description: 'Avrupa kurumlarının yakınında bulunan, içinde göl, hayvanat bahçesi ve leylek üretim merkezi barındıran güzel bir park.',
                location: 'Parc de l\'Orangerie, Strazburg'
            },
            fr: {
                name: 'Parc de l\'Orangerie',
                shortDescription: 'Le plus ancien et le parc préféré des Strasbourgeois.',
                description: 'Un magnifique parc avec un lac, un zoo et un centre de réintroduction des cigognes, situé près des institutions européennes.',
                location: 'Parc de l\'Orangerie'
            },
            de: {
                name: 'Orangerie-Park',
                shortDescription: 'Straßburgs ältester und beliebtester Park.',
                description: 'Ein wunderschöner Park mit einem See, einem Zoo und einem Zentrum zur Wiedereinführung von Störchen, in der Nähe der europäischen Institutionen gelegen.',
                location: 'Parc de l\'Orangerie'
            },
            es: {
                name: 'Parque de la Orangerie',
                shortDescription: 'El parque más antiguo y favorito de Estrasburgo.',
                description: 'Un hermoso parque con un lago, un zoológico y un centro de reintroducción de cigüeñas, ubicado cerca de las instituciones europeas.',
                location: 'Parque de la Orangerie'
            },
            it: {
                name: 'Parco dell\'Orangerie',
                shortDescription: 'Il parco più antico e preferito di Strasburgo.',
                description: 'Un bellissimo parco con un lago, uno zoo e un centro di reintroduzione delle cicogne, situato vicino alle istituzioni europee.',
                location: 'Parco dell\'Orangerie'
            }
        }
    },
    {
        id: 'jardin-deux-rives',
        name: 'Jardin des Deux Rives',
        shortDescription: 'A symbol of friendship between France and Germany.',
        description: 'This cross-border park spans the Rhine river, connected by a magnificent pedestrian bridge.',
        image: require('@/assets/images/sights/deux-rives.jpg'),
        category: 'sights',
        // Updated
        location: '1 Rue des Cavaliers',
        coordinates: { latitude: 48.568389795860774, longitude: 7.79880482370121 },
        translations: {
            tr: {
                name: 'İki Kıyı Bahçesi (Jardin des Deux Rives)',
                shortDescription: 'Fransa ve Almanya arasındaki dostluğun sembolü.',
                description: 'Ren Nehri\'nin her iki yakasına yayılan, muhteşem bir yaya köprüsüyle birbirine bağlanan sınır ötesi bir park.',
                location: '1 Rue des Cavaliers, Strazburg'
            },
            fr: {
                name: 'Jardin des Deux Rives',
                shortDescription: 'Un symbole d\'amitié entre la France et l\'Allemagne.',
                description: 'Ce parc transfrontalier enjambe le Rhin, relié par une magnifique passerelle piétonne.',
                location: '1 Rue des Cavaliers'
            },
            de: {
                name: 'Garten der zwei Ufer',
                shortDescription: 'Ein Symbol der Freundschaft zwischen Frankreich und Deutschland.',
                description: 'Dieser grenzüberschreitende Park erstreckt sich über den Rhein und ist durch eine prächtige Fußgängerbrücke verbunden.',
                location: '1 Rue des Cavaliers'
            },
            es: {
                name: 'Jardín de las Dos Riberas',
                shortDescription: 'Un símbolo de amistad entre Francia y Alemania.',
                description: 'Este parque transfronterizo se extiende a lo largo del río Rin, conectado por un magnífico puente peatonal.',
                location: '1 Rue des Cavaliers'
            },
            it: {
                name: 'Giardino delle Due Rive',
                shortDescription: 'Un simbolo di amicizia tra Francia e Germania.',
                description: 'Questo parco transfrontaliero si estende sul fiume Reno, collegato da un magnifico ponte pedonale.',
                location: '1 Rue des Cavaliers'
            }
        }
    },
    {
        id: 'palais-rhin',
        name: 'Palais du Rhin',
        shortDescription: 'Former Imperial Palace.',
        description: 'The former "Kaiserpalast", located on Place de la République, is a major example of 19th-century German architecture in Strasbourg.',
        image: require('@/assets/images/sights/palais-rhin.jpg'),
        category: 'sights',
        // Updated
        location: '2 Pl. de la République',
        coordinates: { latitude: 48.58760234137872, longitude: 7.7527729604229005 },
        translations: {
            tr: {
                name: 'Ren Sarayı (Palais du Rhin)',
                shortDescription: 'Eski İmparatorluk Sarayı.',
                description: 'Cumhuriyet Meydanı\'nda (Place de la République) yer alan eski "Kaiserpalast", 19. yüzyıl Alman mimarisinin Strazburg\'daki en önemli örneklerinden biridir.',
                location: '2 Place de la République, Strazburg'
            },
            fr: {
                name: 'Palais du Rhin',
                shortDescription: 'Ancien Palais Impérial.',
                description: 'L\'ancien "Kaiserpalast", situé sur la place de la République, est un exemple majeur de l\'architecture allemande du 19ème siècle à Strasbourg.',
                location: '2 Pl. de la République'
            },
            de: {
                name: 'Rheinpalast',
                shortDescription: 'Ehemaliger Kaiserpalast.',
                description: 'Der ehemalige „Kaiserpalast“ am Place de la République ist ein bedeutendes Beispiel der deutschen Architektur des 19. Jahrhunderts in Straßburg.',
                location: '2 Pl. de la République'
            },
            es: {
                name: 'Palacio del Rin',
                shortDescription: 'Antiguo Palacio Imperial.',
                description: 'El antiguo "Kaiserpalast", ubicado en la Place de la République, es un ejemplo importante de la arquitectura alemana del siglo XIX en Estrasburgo.',
                location: '2 Pl. de la République'
            },
            it: {
                name: 'Palazzo del Reno',
                shortDescription: 'Antico Palazzo Imperiale.',
                description: 'L\'antico "Kaiserpalast", situato in Place de la République, è un importante esempio dell\'architettura tedesca del XIX secolo a Strasburgo.',
                location: '2 Pl. de la République'
            }
        }
    },
    {
        id: 'st-paul',
        name: 'Eglise St. Paul',
        shortDescription: 'Neo-Gothic church on the river.',
        description: 'This striking Neo-Gothic protestant church stands on the southern tip of the Sainte-Hélène Island, offering beautiful reflections in the water.',
        image: require('@/assets/images/sights/st-paul.jpg'),
        category: 'sights',
        // Updated
        location: '1 Pl. du Général Eisenhower',
        coordinates: { latitude: 48.58618301091684, longitude: 7.7597309527141425 },
        translations: {
            tr: {
                name: 'Aziz Paul Kilisesi (Eglise St. Paul)',
                shortDescription: 'Nehir kenarında Neo-Gotik kilise.',
                description: 'Sainte-Hélène Adası\'nın güney ucunda yükselen bu etkileyici Neo-Gotik Protestan kilisesi, su üzerinde güzel yansımalar sunar.',
                location: '1 Place du Général Eisenhower, Strazburg'
            },
            fr: {
                name: 'Église St Paul',
                shortDescription: 'Église néo-gothique au bord de l\'eau.',
                description: 'Cette église protestante néo-gothique frappante se dresse à l\'extrémité sud de l\'île Sainte-Hélène, offrant de magnifiques reflets dans l\'eau.',
                location: '1 Pl. du Général Eisenhower'
            },
            de: {
                name: 'Paulskirche',
                shortDescription: 'Neugotische Kirche am Fluss.',
                description: 'Diese markante neugotische evangelische Kirche steht an der Südspitze der Insel Sainte-Hélène und bietet wunderschöne Spiegelungen im Wasser.',
                location: '1 Pl. du Général Eisenhower'
            },
            es: {
                name: 'Iglesia de San Pablo',
                shortDescription: 'Iglesia neogótica a la orilla del río.',
                description: 'Esta impresionante iglesia protestante neogótica se alza en el extremo sur de la isla Sainte-Hélène, ofreciendo hermosos reflejos en el agua.',
                location: '1 Pl. du Général Eisenhower'
            },
            it: {
                name: 'Chiesa di San Paolo',
                shortDescription: 'Chiesa neogotica sul fiume.',
                description: 'Questa imponente chiesa protestante neogotica sorge all\'estremità meridionale dell\'isola di Sainte-Hélène, offrendo splendidi riflessi nell\'acqua.',
                location: '1 Pl. du Général Eisenhower'
            }
        }
    },
    {
        id: 'university',
        name: 'Université de Strasbourg',
        shortDescription: 'The historic Palais Universitaire.',
        description: 'The University Palace is a grand Italian Renaissance style building completed in 1884, symbolizing the German period\'s emphasis on education.',
        image: require('@/assets/images/sights/university.jpg'),
        category: 'sights',
        // Updated
        location: '9 Pl. de l\'Université',
        coordinates: { latitude: 48.58481135926765, longitude: 7.762476855622575 },
        translations: {
            tr: {
                name: 'Strazburg Üniversitesi (Palais Universitaire)',
                shortDescription: 'Tarihi Üniversite Sarayı.',
                description: '1884 yılında tamamlanan, İtalyan Rönesans tarzındaki görkemli Üniversite Sarayı bina, Alman döneminin eğitime verdiği önemi simgeler.',
                location: '9 Place de l\'Université, Strazburg'
            },
            fr: {
                name: 'Palais Universitaire',
                shortDescription: 'Le Palais Universitaire historique.',
                description: 'Le Palais Universitaire est un grand bâtiment de style Renaissance italienne achevé en 1884, symbolisant l\'accent mis sur l\'éducation pendant la période allemande.',
                location: '9 Pl. de l\'Université'
            },
            de: {
                name: 'Universitätspalast',
                shortDescription: 'Der historische Universitätspalast.',
                description: 'Der Universitätspalast ist ein prächtiges Gebäude im italienischen Renaissance-Stil, das 1884 fertiggestellt wurde und die Bedeutung der Bildung während der deutschen Zeit symbolisiert.',
                location: '9 Pl. de l\'Université'
            },
            es: {
                name: 'Palacio Universitario',
                shortDescription: 'El histórico Palacio Universitario.',
                description: 'El Palacio Universitario es un grandioso edificio de estilo renacentista italiano terminado en 1884, que simboliza el énfasis en la educación durante el período alemán.',
                location: '9 Pl. de l\'Université'
            },
            it: {
                name: 'Palazzo Universitario',
                shortDescription: 'Lo storico Palazzo Universitario.',
                description: 'Il Palazzo Universitario è un grandioso edificio in stile rinascimentale italiano completato nel 1884, che simboleggia l\'enfasi sull\'istruzione durante il periodo tedesco.',
                location: '9 Pl. de l\'Université'
            }
        }
    },
];
