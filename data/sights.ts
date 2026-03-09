export type Sight = {
    id: string;
    name: string;
    shortDescription: string;
    description?: string;
    image: any;
    category: 'sights' | 'nature' | 'modern' | 'mustSee' | 'museums' | 'restaurants';
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

    {
        id: 'cathedral',
        name: 'Cathédrale Notre-Dame',
        shortDescription: 'The stunning masterpiece of Gothic art.',
        description: 'Strasbourg Cathedral is widely considered a masterpiece of Gothic architecture, famous for its intricate pink sandstone facade and astronomical clock. Its 142-meter spire was the world\'s tallest building for over two centuries, dominating the Alsatian plain. Visitors can climb to the platform for a breathtaking view of the city and the Vosges mountains.',
        image: require('@/assets/images/sights/cathedral.jpg'),
        category: 'sights',

        location: 'Pl. de la Cathédrale',
        coordinates: { latitude: 48.58180755516249, longitude: 7.750911815075193 },
        translations: {
            tr: {
                name: 'Strazburg Notre-Dame Katedrali',
                shortDescription: 'Gotik sanatın büyüleyici şaheseri.',
                description: 'Strazburg Katedrali, karmaşık pembe kumtaşı cephesi ve astronomik saatiyle ünlü, Gotik mimarinin bir şaheseri olarak kabul edilir. 142 metrelik kulesi, iki yüzyılı aşkın bir süre boyunca dünyanın en yüksek yapısıydı ve Alsas ovasına hakimdir. Ziyaretçiler, şehrin ve Vosges dağlarının nefes kesen manzarası için platforma çıkabilirler.',
                location: 'Katedral Meydanı (Place de la Cathédrale)'
            },
            fr: {
                name: 'Cathédrale Notre-Dame',
                shortDescription: 'Le chef-d\'œuvre absolu de l\'art gothique.',
                description: "Chef-d'œuvre absolu de l'art gothique, la cathédrale de Strasbourg fascine par sa façade en grès rose et sa célèbre horloge astronomique. Avec sa flèche culminant à 142 mètres, elle est restée l'édifice le plus haut de la chrétienté jusqu'au XIXe siècle. La montée vers la plateforme offre un panorama exceptionnel sur la ville et les Vosges.",
                location: 'Pl. de la Cathédrale'
            },
            de: {
                name: 'Liebfrauenmünster zu Straßburg',
                shortDescription: 'Das atemberaubende Meisterwerk der Gotik.',
                description: 'Das Straßburger Münster gilt weithin als Meisterwerk der gotischen Architektur, berühmt für seine filigrane Fassade aus rosa Sandstein und die astronomische Uhr. Sein 142 Meter hoher Turm war über zwei Jahrhunderte lang das höchste Gebäude der Welt und dominiert die elsässische Ebene. Besucher können zur Plattform hinaufsteigen, um einen atemberaubenden Blick auf die Stadt und die Vogesen zu genießen.',
                location: 'Münsterplatz'
            },
            es: {
                name: 'Catedral de Notre-Dame',
                shortDescription: 'La impresionante obra maestra del arte gótico.',
                description: 'La Catedral de Estrasburgo es ampliamente considerada una obra maestra de la arquitectura gótica, famosa por su intrincada fachada de arenisca rosa y su reloj astronómico. Su aguja de 142 metros fue el edificio más alto del mundo durante más de dos siglos, dominando la llanura alsaciana. Los visitantes pueden subir a la plataforma para disfrutar de una vista impresionante de la ciudad y los montes Vosgos.',
                location: 'Pl. de la Cathédrale'
            },
            it: {
                name: 'Cattedrale di Nostra Signora',
                shortDescription: 'Il meraviglioso capolavoro dell\'arte gotica.',
                description: 'La Cattedrale di Strasburgo è ampiamente considerata un capolavoro dell\'architettura gotica, famosa per la sua intricata facciata in arenaria rosa e l\'orologio astronomico. La sua guglia di 142 metri è stata l\'edificio più alto del mondo per oltre due secoli, dominando la pianura alsaziana. I visitatori possono salire sulla piattaforma per una vista mozzafiato sulla città e sui monti Vosgi.',
                location: 'Pl. de la Cathédrale'
            },
            ru: {
                name: 'Страсбургский собор',
                shortDescription: 'Потрясающий шедевр готического искусства.',
                description: 'Страсбургский собор широко признан шедевром готической архитектуры, известным своим сложным фасадом из розового песчаника и астрономическими часами. Его 142-метровый шпиль был самым высоким зданием в мире на протяжении более двух столетий, доминируя над эльзасской равниной. Посетители могут подняться на платформу, чтобы насладиться захватывающим видом на город и Вогезы.',
                location: 'Pl. de la Cathédrale'
            },
            pt: {
                name: 'Catedral de Estrasburgo',
                shortDescription: 'A obra-prima deslumbrante da arte gótica.',
                description: 'A Catedral de Estrasburgo é amplamente considerada uma obra-prima da arquitetura gótica, famosa pela sua intrincada fachada de arenito rosa e pelo relógio astronômico. Sua torre de 142 metros foi o edifício mais alto do mundo por mais de dois séculos, dominando a planície da Alsácia. Os visitantes podem subir à plataforma para desfrutar de uma vista deslumbrante da cidade e das montanhas Vosges.',
                location: 'Pl. de la Cathédrale'
            },
        }
    },
    {
        id: 'petite-france',
        name: 'La Petite France',
        shortDescription: 'The most picturesque district of old Strasbourg.',
        description: 'This picturesque historic quarter was once home to the city\'s tanners, millers, and fishermen. The neighborhood is defined by its charming half-timbered houses dating from the 16th and 17th centuries, leaning over the canals. It is a pedestrian-friendly area best explored on foot, offering intimate views of the Ill River and its locks.',
        image: require('@/assets/images/sights/petite-france.jpg'),
        category: 'sights',

        location: '1 Rue du Pont Saint-Martin',
        coordinates: { latitude: 48.58009767451487, longitude: 7.743200116368558 },
        translations: {
            tr: {
                name: 'La Petite France (Küçük Fransa)',
                shortDescription: 'Eski Strazburg\'un en pitoresk bölgesi.',
                description: 'Bu pitoresk tarihi semt, bir zamanlar şehrin tabakçılarına, değirmencilerine ve balıkçılarına ev sahipliği yapıyordu. Mahalle, 16. ve 17. yüzyıllardan kalma, kanallara sarkan büyüleyici yarı ahşap evleri ile tanımlanır. Yayalara uygun bu bölge en iyi yürüyerek keşfedilir ve Ill Nehri ile kilitlerinin samimi manzaralarını sunar.',
                location: '1 Rue du Pont Saint-Martin, Strazburg'
            },
            fr: {
                name: 'La Petite France',
                shortDescription: 'Le quartier le plus pittoresque du vieux Strasbourg.',
                description: "Ce quartier historique pittoresque était autrefois le lieu de vie des tanneurs, meuniers et pêcheurs de la ville. Il se caractérise par ses magnifiques maisons à colombages des XVIe et XVIIe siècles qui se reflètent dans les canaux. C'est un espace privilégié pour la promenade à pied, offrant des vues charmantes sur l'Ill et ses écluses.",
                location: '1 Rue du Pont Saint-Martin'
            },
            de: {
                name: 'La Petite France',
                shortDescription: 'Das malerischste Viertel des alten Straßburg.',
                description: 'Dieses malerische historische Viertel war einst die Heimat der Gerber, Müller und Fischer der Stadt. Das Viertel ist geprägt von charmanten Fachwerkhäusern aus dem 16. und 17. Jahrhundert, die sich über die Kanäle neigen. Es ist eine fußgängerfreundliche Gegend, die man am besten zu Fuß erkundet, und bietet intime Einblicke in die Ill und ihre Schleusen.',
                location: '1 Rue du Pont Saint-Martin'
            },
            es: {
                name: 'La Petite France',
                shortDescription: 'El barrio más pintoresco del viejo Estrasburgo.',
                description: 'Este pintoresco barrio histórico fue el hogar de los curtidores, molineros y pescadores de la ciudad. El vecindario se define por sus encantadoras casas con entramado de madera que datan de los siglos XVI y XVII, inclinadas sobre los canales. Es una zona peatonal ideal para explorar a pie, que ofrece vistas íntimas del río Ill y sus esclusas.',
                location: '1 Rue du Pont Saint-Martin'
            },
            it: {
                name: 'La Petite France',
                shortDescription: 'Il quartiere più pittoresco della vecchia Strasburgo.',
                description: 'Questo pittoresco quartiere storico era un tempo la casa di conciatori, mugnai e pescatori della città. Il quartiere è definito dalle sue affascinanti case a graticcio risalenti al XVI e XVII secolo, che si affacciano sui canali. È un\'area pedonale ideale da esplorare a piedi, offrendo viste intime sul fiume Ill e le sue chiuse.',
                location: '1 Rue du Pont Saint-Martin'
            },
            ru: {
                name: 'Маленькая Франция',
                shortDescription: 'Самый живописный район старого Страсбурга.',
                description: 'Этот живописный исторический квартал когда-то был домом для городских кожевников, мельников и рыбаков. Район характеризуется очаровательными фахверковыми домами XVI и XVII веков, нависающими над каналами. Это пешеходная зона, которую лучше всего исследовать пешком, наслаждаясь уютными видами на реку Иль и ее шлюзы.',
                location: '1 Rue du Pont Saint-Martin'
            },
            pt: {
                name: 'Petite France',
                shortDescription: 'O bairro mais pitoresco da antiga Estrasburgo.',
                description: 'Este pitoresco bairro histórico foi outrora o lar dos curtidores, moleiros e pescadores da cidade. O bairro é definido pelas suas encantadoras casas em enxaimel datadas dos séculos XVI e XVII, inclinadas sobre os canais. É uma área ideal para pedestres e melhor explorada a pé, oferecendo vistas íntimas do rio Ill e das suas eclusas.',
                location: 'Bairro Histórico'
            }
        }
    },
    {
        id: 'rohan-palace',
        name: 'Palais Rohan',
        shortDescription: 'Former residence of the prince-bishops.',
        description: 'Built in the 18th century for the Prince-Bishops of Strasbourg, this palace is a splendid example of French Baroque architecture. Modeled after Parisian mansions, it features opulent royal apartments and a magnificent riverfront terrace. Today, it houses three major museums: the Museum of Fine Arts, the Archaeological Museum, and the Museum of Decorative Arts.',
        image: require('@/assets/images/sights/palais-rohan.jpg'),
        category: 'sights',

        location: '2 Pl. du Château',
        coordinates: { latitude: 48.581059628550705, longitude: 7.752234701598285 },
        translations: {
            tr: {
                name: 'Rohan Sarayı (Palais Rohan)',
                shortDescription: 'Prens-piskoposların eski ikametgahı.',
                description: '18. yüzyılda Strazburg\'un Prens Piskoposları için inşa edilen bu saray, Fransız Barok mimarisinin muhteşem bir örneğidir. Paris konaklarından model alınan sarayda, gösterişli kraliyet daireleri ve muhteşem bir nehir kıyısı terası bulunmaktadır. Bugün, Güzel Sanatlar Müzesi, Arkeoloji Müzesi ve Dekoratif Sanatlar Müzesi olmak üzere üç büyük müzeye ev sahipliği yapmaktadır.',
                location: '2 Place du Château, Strazburg'
            },
            fr: {
                name: 'Palais Rohan',
                shortDescription: 'Ancienne résidence des princes-évêques.',
                description: "Construit au XVIIIe siècle pour les princes-évêques, ce palais est un magnifique exemple de l'architecture baroque française. Inspiré des grands hôtels parisiens, il dévoile de somptueux appartements royaux et une superbe terrasse au bord de l'eau. Il abrite aujourd'hui trois musées majeurs : le Musée des Beaux-Arts, le Musée Archéologique et le Musée des Arts Décoratifs.",
                location: '2 Pl. du Château'
            },
            de: {
                name: 'Rohan-Schloss',
                shortDescription: 'Ehemalige Residenz der Fürstbischöfe.',
                description: 'Dieser im 18. Jahrhundert für die Fürstbischöfe von Straßburg erbaute Palast ist ein herrliches Beispiel französischer Barockarchitektur. Nach dem Vorbild Pariser Stadtpaläste bietet er opulente königliche Gemächer und eine prächtige Terrasse am Flussufer. Heute beherbergt er drei bedeutende Museen: das Museum für Bildende Kunst, das Archäologische Museum und das Kunstgewerbemuseum.',
                location: '2 Pl. du Château'
            },
            es: {
                name: 'Palacio Rohan',
                shortDescription: 'Antigua residencia de los príncipes-obispos.',
                description: 'Construido en el siglo XVIII para los príncipes obispos de Estrasburgo, este palacio es un espléndido ejemplo de la arquitectura barroca francesa. Inspirado en las mansiones parisinas, cuenta con opulentos apartamentos reales y una magnífica terraza frente al río. Hoy en día, alberga tres museos importantes: el Museo de Bellas Artes, el Museo Arqueológico y el Museo de Artes Decorativas.',
                location: '2 Pl. du Château'
            },
            it: {
                name: 'Palazzo Rohan',
                shortDescription: 'Antica residenza dei principi-vescovi.',
                description: 'Costruito nel XVIII secolo per i Principi Vescovi di Strasburgo, questo palazzo è uno splendido esempio di architettura barocca francese. Ispirato ai palazzi parigini, presenta opulenti appartamenti reali e una magnifica terrazza sul fiume. Oggi ospita tre importanti musei: il Museo delle Belle Arti, il Museo Archeologico e il Museo delle Arti Decorative.',
                location: '2 Pl. du Château'
            },
            ru: {
                name: 'Дворец Рогана',
                shortDescription: 'Бывшая резиденция князей-епископов.',
                description: 'Построенный в XVIII веке для князей-епископов Страсбурга, этот дворец является великолепным примером французской архитектуры барокко. Смоделированный по образцу парижских особняков, он располагает роскошными королевскими апартаментами и великолепной террасой на берегу реки. Сегодня в нем размещаются три крупных музея: Музей изящных искусств, Археологический музей и Музей декоративного искусства.',
                location: '2 Place du Château'
            },
            pt: {
                name: 'Palácio Rohan',
                shortDescription: 'Antiga residência dos príncipes-bispos.',
                description: 'Construído no século XVIII para os Príncipes-Bispos de Estrasburgo, este palácio é um esplêndido exemplo da arquitetura barroca francesa. Inspirado nas mansões parisienses, apresenta opulentos apartamentos reais e um magnífico terraço à beira do rio. Hoje, abriga três grandes museus: o Museu de Belas Artes, o Museu Arqueológico e o Museu de Artes Decorativas.',
                location: '2 Place du Château'
            }
        }
    },
    {
        id: 'barrage-vauban',
        name: 'Barrage Vauban',
        shortDescription: '17th-century bridge and weir.',
        description: 'Constructed in the late 17th century by the military engineer Vauban, this covered bridge and weir was designed to flood the city\'s southern approaches in case of attack. The structure spans the River Ill and features a rooftop terrace open to the public. From the top, visitors can enjoy one of the best panoramic views of the Petite France district and the cathedral\'s spire.',
        image: require('@/assets/images/sights/barrage-vauban.jpg'),
        category: 'sights',

        location: 'Pl. du Quartier Blanc',
        coordinates: { latitude: 48.579601192743404, longitude: 7.738016252519863 },
        translations: {
            tr: {
                name: 'Vauban Barajı (Barrage Vauban)',
                shortDescription: '17. yüzyıldan kalma köprü ve baraj.',
                description: 'Askeri mühendis Vauban tarafından 17. yüzyılın sonlarında inşa edilen bu kapalı köprü ve bent, saldırı durumunda şehrin güney yaklaşımlarını sular altında bırakmak için tasarlandı. Yapı Ill Nehri\'ni kapsar ve halka açık bir çatı terasına sahiptir. Ziyaretçiler tepeden, Petite France bölgesinin ve katedralin kulesinin en iyi panoramik manzaralarından birinin keyfini çıkarabilirler.',
                location: 'Place du Quartier Blanc, Strazburg'
            },
            fr: {
                name: 'Barrage Vauban',
                shortDescription: 'Pont-écluse du 17ème siècle.',
                description: "Construit à la fin du XVIIe siècle par Vauban, ce pont-écluse couvert avait pour but d'inonder le sud de la ville en cas d'attaque. Enjambant l'Ill, l'ouvrage dispose d'une terrasse panoramique accessible au public. Elle offre l'une des plus belles vues sur le quartier de la Petite France et la flèche de la cathédrale.",
                location: 'Pl. du Quartier Blanc'
            },
            de: {
                name: 'Barrage Vauban',
                shortDescription: 'Brücke und Wehr aus dem 17. Jahrhundert.',
                description: 'Diese gedeckte Brücke und das Wehr wurden im späten 17. Jahrhundert vom Militäringenieur Vauban erbaut und sollten im Angriffsfall die südlichen Zugänge der Stadt überfluten. Das Bauwerk überspannt die Ill und verfügt über eine öffentlich zugängliche Dachterrasse. Von oben genießen Besucher einen der besten Panoramablicke auf das Viertel Petite France und die Turmspitze des Münsters.',
                location: 'Pl. du Quartier Blanc'
            },
            es: {
                name: 'Barrage Vauban',
                shortDescription: 'Puente y presa del siglo XVII.',
                description: 'Construido a finales del siglo XVII por el ingeniero militar Vauban, este puente cubierto y presa fue diseñado para inundar los accesos sur de la ciudad en caso de ataque. La estructura atraviesa el río Ill y cuenta con una terraza en la azotea abierta al público. Desde la cima, los visitantes pueden disfrutar de una de las mejores vistas panorámicas del barrio de la Petite France y la aguja de la catedral.',
                location: 'Pl. du Quartier Blanc'
            },
            it: {
                name: 'Diga di Vauban',
                shortDescription: 'Ponte e sbarramento del XVII secolo.',
                description: 'Costruito alla fine del XVII secolo dall\'ingegnere militare Vauban, questo ponte coperto e diga è stato progettato per inondare gli accessi meridionali della città in caso di attacco. La struttura attraversa il fiume Ill e presenta una terrazza sul tetto aperta al pubblico. Dall\'alto, i visitatori possono godere di una delle migliori viste panoramiche sul quartiere Petite France e sulla guglia della cattedrale.',
                location: 'Pl. du Quartier Blanc'
            },
            ru: {
                name: 'Дамба Вобана',
                shortDescription: 'Мост и плотина XVII века.',
                description: 'Построенный в конце XVII века военным инженером Вобаном, этот крытый мост и плотина были спроектированы для затопления южных подступов к городу в случае нападения. Сооружение переброшено через реку Иль и имеет террасу на крыше, открытую для публики. С вершины посетители могут насладиться одним из лучших панорамных видов на квартал Маленькая Франция и шпиль собора.',
                location: 'Place du Quartier Blanc'
            },
            pt: {
                name: 'Barragem Vauban',
                shortDescription: 'Ponte e represa do século XVII.',
                description: 'Construída no final do século XVII pelo engenheiro militar Vauban, esta ponte coberta e represa foi projetada para inundar os acessos sul da cidade em caso de ataque. A estrutura atravessa o rio Ill e possui um terraço na cobertura aberto ao público. Do topo, os visitantes podem desfrutar de uma das melhores vistas panorâmicas do bairro Petite France e da torre da catedral.',
                location: 'Place du Quartier Blanc'
            }
        }
    },

    {
        id: 'eu-parliament',
        name: 'European Parliament',
        shortDescription: 'The legislative heart of Europe.',
        description: 'The Louise Weiss building is the impressive seat of the European Parliament, featuring a vast hemicycle for plenary sessions. Its distinctive glass and metal architecture symbolizes transparency and the unfinished nature of the European project. Visitors can tour the building to witness the heart of European democracy and admire its contemporary design.',
        image: require('@/assets/images/sights/eu-parliament.jpg'),
        category: 'sights',

        location: '1 Av. du Président Robert Schuman',
        coordinates: { latitude: 48.597484505938425, longitude: 7.768460744781987 },
        translations: {
            tr: {
                name: 'Avrupa Parlamentosu',
                shortDescription: 'Avrupa\'nın yasama kalbi.',
                description: 'Louise Weiss binası, genel kurul oturumları için geniş bir yarım daireye sahip olan Avrupa Parlamentosu\'nun etkileyici merkezidir. Kendine özgü cam ve metal mimarisi, şeffaflığı ve Avrupa projesinin tamamlanmamış doğasını simgeler. Ziyaretçiler, Avrupa demokrasisinin kalbine tanıklık etmek ve çağdaş tasarımına hayran kalmak için binayı gezebilirler.',
                location: '1 Av. du Président Robert Schuman, Strazburg'
            },
            fr: {
                name: 'Parlement Européen',
                shortDescription: 'Le cœur législatif de l\'Europe.',
                description: "Le bâtiment Louise Weiss est le siège impressionnant du Parlement européen, abritant le grand hémicycle des sessions plénières. Son architecture audacieuse de verre et de métal symbolise la transparence et la construction permanente de l'Europe. Les visiteurs peuvent y découvrir le cœur de la démocratie européenne et admirer son design contemporain.",
                location: '1 Av. du Président Robert Schuman'
            },
            de: {
                name: 'Europäisches Parlament',
                shortDescription: 'Das legislative Herz Europas.',
                description: 'Das Louise-Weiss-Gebäude ist der beeindruckende Sitz des Europäischen Parlaments und verfügt über einen riesigen Plenarsaal für die Vollversammlungen. Seine markante Glas- und Metallarchitektur symbolisiert Transparenz und den unvollendeten Charakter des europäischen Projekts. Besucher können das Gebäude besichtigen, um das Herz der europäischen Demokratie zu erleben und sein zeitgenössisches Design zu bewundern.',
                location: '1 Av. du Président Robert Schuman'
            },
            es: {
                name: 'Parlamento Europeo',
                shortDescription: 'El corazón legislativo de Europa.',
                description: 'El edificio Louise Weiss es la impresionante sede del Parlamento Europeo, con un vasto hemiciclo para las sesiones plenarias. Su distintiva arquitectura de vidrio y metal simboliza la transparencia y la naturaleza inacabada del proyecto europeo. Los visitantes pueden recorrer el edificio para presenciar el corazón de la democracia europea y admirar su diseño contemporáneo.',
                location: '1 Av. du Président Robert Schuman'
            },
            it: {
                name: 'Parlamento Europeo',
                shortDescription: 'Il cuore legislativo dell\'Europa.',
                description: 'L\'edificio Louise Weiss è l\'imponente sede del Parlamento Europeo, caratterizzato da un vasto emiciclo per le sessioni plenarie. La sua particolare architettura in vetro e metallo simboleggia la trasparenza e la natura incompiuta del progetto europeo. I visitatori possono visitare l\'edificio per testimoniare il cuore della democrazia europea e ammirarne il design contemporaneo.',
                location: '1 Av. du Président Robert Schuman'
            },
            ru: {
                name: 'Европейский парламент',
                shortDescription: 'Законодательное сердце Европы.',
                description: 'Здание Луизы Вайс является впечатляющей резиденцией Европейского парламента с огромным амфитеатром для пленарных заседаний. Его отличительная архитектура из стекла и металла символизирует прозрачность и незавершенность европейского проекта. Посетители могут осмотреть здание, чтобы увидеть сердце европейской демократии и полюбоваться его современным дизайном.',
                location: '1 Av. du Président Robert Schuman'
            },
            pt: {
                name: 'Parlamento Europeu',
                shortDescription: 'O coração legislativo da Europa.',
                description: 'O edifício Louise Weiss é a impressionante sede do Parlamento Europeu, com um vasto hemiciclo para as sessões plenárias. A sua distinta arquitetura de vidro e metal simboliza a transparência e a natureza inacabada do projeto europeu. Os visitantes podem percorrer o edifício para testemunhar o coração da democracia europeia e admirar o seu design contemporâneo.',
                location: '1 Av. du Président Robert Schuman'
            }
        }
    },
    {
        id: 'orangerie',
        name: 'Parc de l\'Orangerie',
        shortDescription: 'Strasbourg\'s oldest and favorite park.',
        description: 'This is Strasbourg\'s oldest and most beloved park, a favorite retreat for locals located right next to the European institutions. It features a boating lake, a small zoo, and a famous sanctuary for storks, the symbol of Alsace. The park also boasts the Pavillon Joséphine, built for Napoleon\'s wife, and extensive walking paths lined with centuries-old trees.',
        image: require('@/assets/images/sights/orangerie.jpg'),
        category: 'sights',

        location: 'Parc de l\'Orangerie',
        coordinates: { latitude: 48.59242512751338, longitude: 7.774717627413548 },
        translations: {
            tr: {
                name: 'Orangerie Parkı (Parc de l\'Orangerie)',
                shortDescription: 'Strazburg\'un en eski ve en sevilen parkı.',
                description: 'Burası, Strazburg\'un en eski ve en sevilen parkıdır ve Avrupa kurumlarının hemen yanında yer alan, yerel halkın gözde bir inziva yeridir. İçinde bir kayık gölü, küçük bir hayvanat bahçesi ve Alsas\'ın sembolü olan leylekler için ünlü bir sığınak bulunmaktadır. Park ayrıca Napolyon\'un karısı için inşa edilen Pavillon Joséphine\'e ve asırlık ağaçlarla çevrili geniş yürüyüş yollarına sahiptir.',
                location: 'Parc de l\'Orangerie, Strazburg'
            },
            fr: {
                name: 'Parc de l\'Orangerie',
                shortDescription: 'Le plus ancien et le parc préféré des Strasbourgeois.',
                description: "Plus ancien et plus vaste parc de la ville, l'Orangerie est le lieu de détente privilégié des Strasbourgeois, au pied des institutions européennes. Il abrite un lac, un zoo et un célèbre centre de réintroduction des cigognes, emblème de l'Alsace. On y trouve également le Pavillon Joséphine, érigé pour l'impératrice, et de nombreuses allées ombragées.",
                location: 'Parc de l\'Orangerie'
            },
            de: {
                name: 'Orangerie-Park',
                shortDescription: 'Straßburgs ältester und beliebtester Park.',
                description: 'Dies ist Straßburgs ältester und beliebtester Park, ein bevorzugter Rückzugsort für Einheimische, direkt neben den europäischen Institutionen gelegen. Er verfügt über einen See zum Bootfahren, einen kleinen Zoo und eine berühmte Station für Störche, das Symbol des Elsass. Der Park beherbergt auch den Pavillon Joséphine, der für Napoleons Frau erbaut wurde, sowie weitläufige Spazierwege, die von jahrhundertealten Bäumen gesäumt sind.',
                location: 'Parc de l\'Orangerie'
            },
            es: {
                name: 'Parque de la Orangerie',
                shortDescription: 'El parque más antiguo y favorito de Estrasburgo.',
                description: 'Este es el parque más antiguo y querido de Estrasburgo, un refugio favorito para los lugareños ubicado justo al lado de las instituciones europeas. Cuenta con un lago para botes, un pequeño zoológico y un famoso santuario para cigüeñas, el símbolo de Alsacia. El parque también cuenta con el Pavillon Joséphine, construido para la esposa de Napoleón, y extensos senderos bordeados de árboles centenarios.',
                location: 'Parque de la Orangerie'
            },
            it: {
                name: 'Parco dell\'Orangerie',
                shortDescription: 'Il parco più antico e preferito di Strasburgo.',
                description: 'Questo è il parco più antico e amato di Strasburgo, un rifugio preferito per i locali situato proprio accanto alle istituzioni europee. Dispone di un lago navigabile, un piccolo zoo e un famoso santuario per le cicogne, simbolo dell\'Alsazia. Il parco vanta anche il Pavillon Joséphine, costruito per la moglie di Napoleone, e ampi sentieri fiancheggiati da alberi secolari.',
                location: 'Parco dell\'Orangerie'
            },
            ru: {
                name: 'Парк Оранжери',
                shortDescription: 'Самый старый и любимый парк Страсбурга.',
                description: 'Это самый старый и любимый парк Страсбурга, любимое место отдыха местных жителей, расположенное рядом с европейскими учреждениями. Здесь есть лодочное озеро, небольшой зоопарк и знаменитый приют для аистов — символа Эльзаса. В парке также находится Павильон Жозефины, построенный для жены Наполеона, и обширные пешеходные дорожки, обсаженные вековыми деревьями.',
                location: 'Parc de l\'Orangerie'
            },
            pt: {
                name: 'Parque da Orangerie',
                shortDescription: 'O parque mais antigo e favorito de Estrasburgo.',
                description: 'Este é o parque mais antigo e querido de Estrasburgo, um refúgio favorito para os habitantes locais, localizado ao lado das instituições europeias. Possui um lago para passeios de barco, um pequeno zoológico e um famoso santuário para cegonhas, o símbolo da Alsácia. O parque também ostenta o Pavillon Joséphine, construído para a esposa de Napoleão, e extensos caminhos ladeados por árvores centenárias.',
                location: 'Parc de l\'Orangerie'
            }
        }
    },
    {
        id: 'jardin-deux-rives',
        name: 'Jardin des Deux Rives',
        shortDescription: 'A symbol of friendship between France and Germany.',
        description: 'Spanning both banks of the Rhine, this unique cross-border park symbolizes the friendship between France and Germany. A magnificent pedestrian and cyclist bridge connects the Strasbourg side with the German town of Kehl. It offers expansive green spaces for recreation and hosts cultural events that celebrate the unity of the two nations.',
        image: require('@/assets/images/sights/deux-rives.jpg'),
        category: 'sights',

        location: '1 Rue des Cavaliers',
        coordinates: { latitude: 48.568389795860774, longitude: 7.79880482370121 },
        translations: {
            tr: {
                name: 'İki Kıyı Bahçesi (Jardin des Deux Rives)',
                shortDescription: 'Fransa ve Almanya arasındaki dostluğun sembolü.',
                description: 'Ren Nehri\'nin her iki yakasına yayılan bu eşsiz sınır ötesi park, Fransa ve Almanya arasındaki dostluğu simgeler. Muhteşem bir yaya ve bisiklet köprüsü, Strazburg tarafını Alman şehri Kehl ile birleştirir. Rekreasyon için geniş yeşil alanlar sunar ve iki ulusun birliğini kutlayan kültürel etkinliklere ev sahipliği yapar.',
                location: '1 Rue des Cavaliers, Strazburg'
            },
            fr: {
                name: 'Jardin des Deux Rives',
                shortDescription: 'Un symbole d\'amitié entre la France et l\'Allemagne.',
                description: "S'étendant sur les deux rives du Rhin, ce parc transfrontalier unique symbolise l'amitié franco-allemande. Une magnifique passerelle pour piétons et cyclistes relie le côté strasbourgeois à la ville allemande de Kehl. Le parc offre de vastes espaces verts et accueille des événements culturels célébrant l'unité des deux nations.",
                location: '1 Rue des Cavaliers'
            },
            de: {
                name: 'Garten der zwei Ufer',
                shortDescription: 'Ein Symbol der Freundschaft zwischen Frankreich und Deutschland.',
                description: 'Dieser einzigartige grenzüberschreitende Park erstreckt sich über beide Ufer des Rheins und symbolisiert die Freundschaft zwischen Frankreich und Deutschland. Eine prächtige Fußgänger- und Radfahrerbrücke verbindet die Straßburger Seite mit der deutschen Stadt Kehl. Er bietet weitläufige Grünflächen zur Erholung und beherbergt kulturelle Veranstaltungen, die die Einheit der beiden Nationen feiern.',
                location: '1 Rue des Cavaliers'
            },
            es: {
                name: 'Jardín de las Dos Riberas',
                shortDescription: 'Un símbolo de amistad entre Francia y Alemania.',
                description: 'Abarcando ambas orillas del Rin, este parque transfronterizo único simboliza la amistad entre Francia y Alemania. Un magnífico puente peatonal y ciclista conecta el lado de Estrasburgo con la ciudad alemana de Kehl. Ofrece amplios espacios verdes para la recreación y alberga eventos culturales que celebran la unidad de las dos naciones.',
                location: '1 Rue des Cavaliers'
            },
            it: {
                name: 'Giardino delle Due Rive',
                shortDescription: 'Un simbolo di amicizia tra Francia e Germania.',
                description: 'Estendendosi su entrambe le rive del Reno, questo parco transfrontaliero unico simboleggia l\'amicizia tra Francia e Germania. Un magnifico ponte pedonale e ciclabile collega il lato di Strasburgo con la città tedesca di Kehl. Offre ampi spazi verdi per la ricreazione e ospita eventi culturali che celebrano l\'unità delle due nazioni.',
                location: '1 Rue des Cavaliers'
            },
            ru: {
                name: 'Сад двух берегов',
                shortDescription: 'Символ дружбы между Францией и Германией.',
                description: 'Охватывая оба берега Рейна, этот уникальный трансграничный парк символизирует дружбу между Францией и Германией. Великолепный пешеходный и велосипедный мост соединяет сторону Страсбурга с немецким городом Кель. Он предлагает обширные зеленые насаждения для отдыха и проводит культурные мероприятия, прославляющие единство двух наций.',
                location: '1 Rue des Cavaliers'
            },
            pt: {
                name: 'Jardim das Duas Margens',
                shortDescription: 'Um símbolo de amizade entre França e Alemanha.',
                description: 'Abrangendo ambas as margens do Reno, este parque transfronteiriço único simboliza a amizade entre França e Alemanha. Uma magnífica ponte pedonal e ciclável liga o lado de Estrasburgo à cidade alemã de Kehl. Oferece amplos espaços verdes para recreação e acolhe eventos culturais que celebram a unidade das duas nações.',
                location: '1 Rue des Cavaliers'
            }
        }
    },
    {
        id: 'palais-rhin',
        name: 'Palais du Rhin',
        shortDescription: 'Former Imperial Palace.',
        description: 'Situated on the Place de la République, the former "Kaiserpalast" is a monumental example of late 19th-century German imperial architecture. Built for the German Emperor, its massive dome and Renaissance-inspired facade dominate the Neustadt district. While not always open to the public, its imposing exterior and historical significance make it a key landmark of the city\'s dual heritage.',
        image: require('@/assets/images/sights/palais-rhin.jpg'),
        category: 'sights',

        location: '2 Pl. de la République',
        coordinates: { latitude: 48.58760234137872, longitude: 7.7527729604229005 },
        translations: {
            tr: {
                name: 'Ren Sarayı (Palais du Rhin)',
                shortDescription: 'Eski İmparatorluk Sarayı.',
                description: 'Place de la République\'de bulunan eski \'Kaiserpalast\', 19. yüzyıl sonu Alman imparatorluk mimarisinin anıtsal bir örneğidir. Alman İmparatoru için inşa edilen devasa kubbesi ve Rönesans esintili cephesi, Neustadt bölgesine hakimdir. Her zaman halka açık olmasa da, heybetli dış cephesi ve tarihi önemi, onu şehrin ikili mirasının önemli bir simgesi haline getirir.',
                location: '2 Place de la République, Strazburg'
            },
            fr: {
                name: 'Palais du Rhin',
                shortDescription: 'Ancien Palais Impérial.',
                description: 'Situé place de la République, l\'ancien "Kaiserpalast" est un exemple monumental de l\'architecture impériale allemande de la fin du XIXe siècle. Construit pour l\'Empereur, son dôme massif et sa façade néo-Renaissance dominent le quartier de la Neustadt. Témoin de la double culture de la ville, cet édifice imposant reste un repère historique majeur.',
                location: '2 Pl. de la République'
            },
            de: {
                name: 'Rheinpalast',
                shortDescription: 'Ehemaliger Kaiserpalast.',
                description: 'Das ehemalige "Kaiserpalast" befindet sich am Place de la République und ist ein monumentales Beispiel deutscher kaiserlicher Architektur des späten 19. Jahrhunderts. Erbaut für den deutschen Kaiser, dominieren seine massive Kuppel und die von der Renaissance inspirierte Fassade das Viertel Neustadt. Obwohl nicht immer für die Öffentlichkeit zugänglich, machen sein imposantes Äußeres und seine historische Bedeutung es zu einem wichtigen Wahrzeichen des doppelten Erbes der Stadt.',
                location: '2 Pl. de la République'
            },
            es: {
                name: 'Palacio del Rin',
                shortDescription: 'Antiguo Palacio Imperial.',
                description: 'Situado en la Place de la République, el antiguo "Kaiserpalast" es un ejemplo monumental de la arquitectura imperial alemana de finales del siglo XIX. Construido para el emperador alemán, su enorme cúpula y su fachada de inspiración renacentista dominan el distrito de Neustadt. Aunque no siempre está abierto al público, su imponente exterior y su importancia histórica lo convierten en un hito clave de la doble herencia de la ciudad.',
                location: '2 Pl. de la République'
            },
            it: {
                name: 'Palazzo del Reno',
                shortDescription: 'Antico Palazzo Imperiale.',
                description: 'Situato in Place de la République, l\'ex "Kaiserpalast" è un esempio monumentale dell\'architettura imperiale tedesca della fine del XIX secolo. Costruito per l\'imperatore tedesco, la sua massiccia cupola e la facciata ispirata al Rinascimento dominano il quartiere Neustadt. Sebbene non sempre aperto al pubblico, il suo imponente esterno e il suo significato storico lo rendono un punto di riferimento fondamentale della doppia eredità della città.',
                location: '2 Pl. de la République'
            },
            ru: {
                name: 'Рейнский дворец',
                shortDescription: 'Бывший Императорский дворец.',
                description: 'Расположенный на площади Республики, бывший «Кайзерпаласт» является монументальным образцом немецкой имперской архитектуры конца XIX века. Построенный для немецкого императора, его массивный купол и фасад в стиле ренессанс доминируют над районом Нойштадт. Хотя он не всегда открыт для публики, его впечатляющий внешний вид и историческое значение делают его ключевой достопримечательностью двойного наследия города.',
                location: '2 Place de la République'
            },
            pt: {
                name: 'Palácio do Reno',
                shortDescription: 'Antigo Palácio Imperial.',
                description: 'Situado na Place de la République, o antigo "Kaiserpalast" é um exemplo monumental da arquitetura imperial alemã do final do século XIX. Construído para o imperador alemão, a sua enorme cúpula e fachada de inspiração renascentista dominam o distrito de Neustadt. Embora nem sempre aberto ao público, o seu exterior imponente e significado histórico tornam-no um marco fundamental da dupla herança da cidade.',
                location: '2 Place de la République'
            }
        }
    },
    {
        id: 'st-paul',
        name: 'Eglise St. Paul',
        shortDescription: 'Neo-Gothic church on the river.',
        description: 'Commanding the southern tip of Sainte-Hélène Island, the Reformed Church of St. Paul is a masterpiece of Neo-Gothic architecture. Its twin spires rise elegantly above the river, creating stunning reflections in the Ill and the Aar. Built during the German annexation for the garrison troops, it remains one of the most photographed and picturesque sites in Strasbourg.',
        image: require('@/assets/images/sights/st-paul.jpg'),
        category: 'sights',

        location: '1 Pl. du Général Eisenhower',
        coordinates: { latitude: 48.58618301091684, longitude: 7.7597309527141425 },
        translations: {
            tr: {
                name: 'Aziz Paul Kilisesi (Eglise St. Paul)',
                shortDescription: 'Nehir kenarında Neo-Gotik kilise.',
                description: 'Sainte-Hélène Adası\'nın güney ucuna hakim olan Aziz Paul Reform Kilisesi, Neo-Gotik mimarinin bir şaheseridir. İkiz kuleleri nehrin üzerinde zarif bir şekilde yükselir ve Ill ile Aar nehirlerinde çarpıcı yansımalar yaratır. Alman ilhakı sırasında garnizon birlikleri için inşa edilen kilise, Strazburg\'un en çok fotoğraflanan ve pitoresk yerlerinden biri olmaya devam etmektedir.',
                location: '1 Place du Général Eisenhower, Strazburg'
            },
            fr: {
                name: 'Église St Paul',
                shortDescription: 'Église néo-gothique au bord de l\'eau.',
                description: "Dominant la pointe sud de l'île Sainte-Hélène, l'église réformée Saint-Paul est un chef-d'œuvre de l'architecture néo-gothique. Ses deux flèches s'élèvent élégamment au-dessus de la rivière, créant de superbes reflets dans l'Ill et l'Aar. Construite sous l'annexion allemande pour la garnison, elle demeure l'un des sites les plus pittoresques de Strasbourg.",
                location: '1 Pl. du Général Eisenhower'
            },
            de: {
                name: 'Paulskirche',
                shortDescription: 'Neugotische Kirche am Fluss.',
                description: 'Die reformierte Paulskirche beherrscht die Südspitze der Insel Sainte-Hélène und ist ein Meisterwerk neugotischer Architektur. Ihre Zwillingstürme ragen elegant über den Fluss und erzeugen atemberaubende Spiegelungen in der Ill und der Aar. Erbaut während der deutschen Annexion für die Garnisonstruppen, bleibt sie einer der meistfotografierten und malerischsten Orte in Straßburg.',
                location: '1 Pl. du Général Eisenhower'
            },
            es: {
                name: 'Iglesia de San Pablo',
                shortDescription: 'Iglesia neogótica a la orilla del río.',
                description: 'Dominando el extremo sur de la isla Sainte-Hélène, la Iglesia Reformada de San Pablo es una obra maestra de la arquitectura neogótica. Sus torres gemelas se elevan elegantemente sobre el río, creando impresionantes reflejos en el Ill y el Aar. Construida durante la anexión alemana para las tropas de la guarnición, sigue siendo uno de los sitios más fotografiados y pintorescos de Estrasburgo.',
                location: '1 Pl. du Général Eisenhower'
            },
            it: {
                name: 'Chiesa di San Paolo',
                shortDescription: 'Chiesa neogotica sul fiume.',
                description: 'Dominando la punta meridionale dell\'isola di Sainte-Hélène, la Chiesa Riformata di San Paolo è un capolavoro dell\'architettura neogotica. Le sue guglie gemelle si ergono elegantemente sopra il fiume, creando splendidi riflessi nell\'Ill e nell\'Aar. Costruita durante l\'annessione tedesca per le truppe della guarnigione, rimane uno dei siti più fotografati e pittoreschi di Strasburgo.',
                location: '1 Pl. du Général Eisenhower'
            },
            ru: {
                name: 'Церковь Святого Павла',
                shortDescription: 'Неоготическая церковь на реке.',
                description: 'Возвышаясь на южной оконечности острова Сент-Элен, реформатская церковь Святого Павла является шедевром неоготической архитектуры. Ее башни-близнецы элегантно возвышаются над рекой, создавая потрясающие отражения в Иле и Ааре. Построенная во время немецкой аннексии для гарнизонных войск, она остается одним из самых фотографируемых и живописных мест в Страсбурге.',
                location: '1 Place du Général Eisenhower'
            },
            pt: {
                name: 'Igreja de São Paulo',
                shortDescription: 'Igreja neogótica à beira do rio.',
                description: 'Comandando a ponta sul da Ilha de Sainte-Hélène, a Igreja Reformada de São Paulo é uma obra-prima da arquitetura neogótica. As suas torres gémeas erguem-se elegantemente sobre o rio, criando reflexos deslumbrantes no Ill e no Aar. Construída durante a anexação alemã para as tropas da guarnição, continua a ser um dos locais mais fotografados e pitorescos de Estrasburgo.',
                location: '1 Place du Général Eisenhower'
            }
        }
    },
    {
        id: 'university',
        name: 'Université de Strasbourg',
        shortDescription: 'The historic Palais Universitaire.',
        description: 'The Palais Universitaire is a grand edifice designed in the Italian Renaissance style and completed in 1884. It served as the center of the new imperial university, reflecting the heavy investment in education during the German period. The building features a majestic aula and stands as the focal point of the expansive university campus in the Neustadt.',
        image: require('@/assets/images/sights/university.jpg'),
        category: 'sights',

        location: '9 Pl. de l\'Université',
        coordinates: { latitude: 48.58481135926765, longitude: 7.762476855622575 },
        translations: {
            tr: {
                name: 'Strazburg Üniversitesi (Palais Universitaire)',
                shortDescription: 'Tarihi Üniversite Sarayı.',
                description: 'Palais Universitaire, İtalyan Rönesans tarzında tasarlanan ve 1884\'te tamamlanan görkemli bir yapıdır. Alman döneminde eğitime yapılan büyük yatırımı yansıtan yeni imparatorluk üniversitesinin merkezi olarak hizmet vermiştir. Görkemli bir aulaya (büyük salon) sahip olan bina, Neustadt\'taki geniş üniversite kampüsünün odak noktasıdır.',
                location: '9 Place de l\'Université, Strazburg'
            },
            fr: {
                name: 'Palais Universitaire',
                shortDescription: 'Le Palais Universitaire historique.',
                description: "Le Palais Universitaire est un édifice grandiose de style néo-Renaissance italien, achevé en 1884. Centre de la nouvelle université impériale, il témoigne de l'importance accordée à l'enseignement durant la période allemande. Doté d'une aula majestueuse, il constitue le point central du vaste campus universitaire de la Neustadt.",
                location: '9 Pl. de l\'Université'
            },
            de: {
                name: 'Universitätspalast',
                shortDescription: 'Der historische Universitätspalast.',
                description: 'Der Universitätspalast ist ein grandioses Gebäude im Stil der italienischen Renaissance, das 1884 fertiggestellt wurde. Er diente als Zentrum der neuen kaiserlichen Universität und spiegelt die hohen Investitionen in die Bildung während der deutschen Zeit wider. Das Gebäude verfügt über eine majestätische Aula und ist der Mittelpunkt des weitläufigen Universitätscampus in der Neustadt.',
                location: '9 Pl. de l\'Université'
            },
            es: {
                name: 'Palacio Universitario',
                shortDescription: 'El histórico Palacio Universitario.',
                description: 'El Palacio Universitario es un grandioso edificio diseñado en estilo renacentista italiano y terminado en 1884. Sirvió como centro de la nueva universidad imperial, reflejando la fuerte inversión en educación durante el período alemán. El edificio cuenta con una majestuosa aula y se erige como el punto focal del extenso campus universitario en Neustadt.',
                location: '9 Pl. de l\'Université'
            },
            it: {
                name: 'Palazzo Universitario',
                shortDescription: 'Lo storico Palazzo Universitario.',
                description: 'Il Palazzo Universitario è un grandioso edificio progettato in stile rinascimentale italiano e completato nel 1884. Fungeva da centro della nuova università imperiale, riflettendo i forti investimenti nell\'istruzione durante il periodo tedesco. L\'edificio presenta una maestosa aula e si erge come punto focale del vasto campus universitario nella Neustadt.',
                location: '9 Pl. de l\'Université'
            },
            ru: {
                name: 'Университетский дворец',
                shortDescription: 'Исторический университетский дворец.',
                description: 'Университетский дворец — это грандиозное здание, спроектированное в стиле итальянского Возрождения и завершенное в 1884 году. Оно служило центром нового имперского университета, отражая крупные инвестиции в образование в немецкий период. В здании есть величественная аула, и оно является центральным элементом обширного университетского кампуса в Нойштадте.',
                location: '9 Place de l\'Université'
            },
            pt: {
                name: 'Palácio Universitário',
                shortDescription: 'O histórico Palácio Universitário.',
                description: 'O Palácio Universitário é um edifício grandioso projetado no estilo renascentista italiano e concluído em 1884. Serviu como centro da nova universidade imperial, refletindo o forte investimento na educação durante o período alemão. O edifício apresenta uma majestosa aula e destaca-se como o ponto focal do vasto campus universitário em Neustadt.',
                location: '9 Place de l\'Université'
            }
        },
    },
];
