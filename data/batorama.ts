export const BATORAMA_DATA = {
    id: 'batorama',
    name: 'Batorama Boat Tour',
    image: require('@/assets/images/activities/batorama-header.png'),
    website: 'https://www.batorama.com/en',

    shopAddress: '18 Place de la Cathédrale, 67000 Strasbourg',
    dockAddress: 'Place du Marché aux Poissons, 67000 Strasbourg',
    coordinates: { latitude: 48.58024007020275, longitude: 7.752072749172037 },

    phone: '+33 (0)3 69 74 44 04',
    email: 'info@batorama.com',
    translations: {
        en: {
            name: 'Batorama Boat Tour',
            tagline: 'Discover Strasbourg from the Water',
            description: 'A must-do experience in Strasbourg. Batorama offers covered or open-top boat tours through the heart of the city.',
            mustDo: 'MUST DO',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'RED TOUR: 2000 years of history',
                    duration: '70 min',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'The complete tour covering the Big Island, Neustadt, and the European Quarter.',
                    highlights: [
                        { title: 'Grande Île', description: 'UNESCO site, Petite France district, locks, and Vauban dam.' },
                        { title: 'Neustadt', description: 'Imperial district from 1871-1918, including Palais du Rhin and Opera.' },
                        { title: 'European Quarter', description: 'Council of Europe, European Parliament, and Court of Human Rights.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Return Parliament – Cathedral',
                    duration: '45 min',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'A shorter tour focusing on the connection between the historic center and the modern institutions.',
                    highlights: [
                        { title: 'Urban Link', description: 'Discover the link between history and modernity.' }
                    ]
                }
            ],
            access: {
                title: 'Access & Contact',
                onFoot: '2 minutes from the Cathedral, at Place du Vieux Marché aux Poissons.',
                bus: 'Line 10 (Corbeau/Bateliers), Lines 14/24 (Ancienne Douane).',
                tram: 'Lines A & D (Porte de l\'Hôpital).',
                piers: 'Cathedral boarding point is 150m from Notre-Dame Cathedral.',
                shop: '18 Place de la Cathédrale (Information & Tickets).',
                labels: {
                    onFoot: 'On Foot',
                    bus: 'Bus',
                    tram: 'Tram',
                    departure: 'Departure',
                    shop: 'Shop'
                }
            },
            hours: {
                title: 'Opening Hours',
                piers: 'Daily from 10:00 AM. Last departure varies by season (3:30 PM to 8:30 PM).',
                shop: 'Daily from 9:30 AM.',
                labels: {
                    boarding: 'Boarding',
                    shop: 'Shop'
                }
            }
        },
        fr: {
            name: 'Batorama',
            tagline: 'Découvrez Strasbourg au fil de l\'eau',
            description: 'Une expérience incontournable à Strasbourg. Batorama propose des visites en bateau couvert ou ouvert à travers le cœur de la ville.',
            mustDo: 'À FAIRE',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'STRASBOURG, PLUS DE 20 SIÈCLES D\'HISTOIRE',
                    duration: '70 min',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'Le circuit complet couvrant la Grande Île, la Neustadt et le quartier Européen.',
                    highlights: [
                        { title: 'Grande Île', description: 'Site classé UNESCO, quartier de la Petite France, écluses et barrage Vauban.' },
                        { title: 'Neustadt', description: 'Quartier impérial (1871-1918), avec le Palais du Rhin et l\'Opéra.' },
                        { title: 'Quartier Européen', description: 'Conseil de l\'Europe, Parlement européen et Cour des Droits de l\'Homme.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Aller-Retour Parlement – Cathédrale',
                    duration: '45 min',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Un circuit plus court axé sur le lien entre le centre historique et les institutions modernes.',
                    highlights: [
                        { title: 'Lien Urbain', description: 'Découvrez le lien entre histoire et modernité.' }
                    ]
                }
            ],
            access: {
                title: 'Accès & Contact',
                onFoot: 'À 2 minutes de la cathédrale, Place du Vieux Marché au Poisson.',
                bus: 'Ligne 10 (Corbeau/Bateliers), Lignes 14/24 (Ancienne Douane).',
                tram: 'Lignes A & D (Porte de l\'Hôpital).',
                piers: 'Embarcadère Cathédrale à 150m de la Cathédrale Notre-Dame.',
                shop: '18 Place de la Cathédrale (Information & Billetterie).',
                labels: {
                    onFoot: 'À pied',
                    bus: 'Bus',
                    tram: 'Tram',
                    departure: 'Départ',
                    shop: 'Boutique'
                }
            },
            hours: {
                title: 'Horaires d\'ouverture',
                piers: 'Tous les jours dès 10h00. Dernier départ selon saison (15h30 à 20h30).',
                shop: 'Tous les jours dès 09h30.',
                labels: {
                    boarding: 'Embarquement',
                    shop: 'Boutique'
                }
            }
        },
        de: {
            name: 'Batorama Bootstour',
            tagline: 'Entdecken Sie Straßburg vom Wasser aus',
            description: 'Ein Muss in Straßburg. Batorama bietet überdachte oder offene Bootstouren durch das Herz der Stadt an.',
            mustDo: 'EIN MUSS',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'RED TOUR: 2000 Jahre Geschichte',
                    duration: '70 Min',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'Die komplette Tour über die Große Insel, die Neustadt und das Europaviertel.',
                    highlights: [
                        { title: 'Grande Île', description: 'UNESCO-Erbe, Viertel Petite France, Schleusen und Vauban-Damm.' },
                        { title: 'Neustadt', description: 'Kaiserquartier 1871-1918, einschließlich Palais du Rhin und Oper.' },
                        { title: 'Europaviertel', description: 'Europarat, Europäisches Parlament und Gerichtshof für Menschenrechte.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Tour Parlament – Münster',
                    duration: '45 Min',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Eine kürzere Tour, die sich auf die Verbindung zwischen dem historischen Zentrum und den modernen Institutionen konzentriert.',
                    highlights: [
                        { title: 'Urbane Verbindung', description: 'Entdecken Sie die Verbindung zwischen Geschichte und Moderne.' }
                    ]
                }
            ],
            access: {
                title: 'Anfahrt & Kontakt',
                onFoot: '2 Minuten vom Münster entfernt, am Place du Vieux Marché aux Poissons.',
                bus: 'Linie 10 (Corbeau/Bateliers), Linien 14/24 (Ancienne Douane).',
                tram: 'Linien A & D (Porte de l\'Hôpital).',
                piers: 'Die Anlegestelle Cathédrale befindet sich 150 m vom Straßburger Münster entfernt.',
                shop: '18 Place de la Cathédrale (Infos & Tickets).',
                labels: {
                    onFoot: 'Zu Fuß',
                    bus: 'Bus',
                    tram: 'Straßenbahn',
                    departure: 'Abfahrt',
                    shop: 'Geschäft'
                }
            },
            hours: {
                title: 'Öffnungszeiten',
                piers: 'Täglich ab 10:00 Uhr. Die letzte Abfahrt variiert je nach Saison (15:30 bis 20:30 Uhr).',
                shop: 'Täglich ab 09:30 Uhr.',
                labels: {
                    boarding: 'Einstieg',
                    shop: 'Geschäft'
                }
            }
        },
        es: {
            name: 'Batorama Paseo en Barco',
            tagline: 'Descubra Estrasburgo desde el agua',
            description: 'Una experiencia imprescindible en Estrasburgo. Batorama ofrece recorridos en barco cubiertos o descubiertos por el corazón de la ciudad.',
            mustDo: 'IMPRESCINDIBLE',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'TOUR ROJO: 2000 años de historia',
                    duration: '70 min',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'El recorrido completo que abarca la Gran Isla, la Neustadt y el Barrio Europeo.',
                    highlights: [
                        { title: 'Grande Île', description: 'Sitio de la UNESCO, barrio de la Petite France, esclusas y presa Vauban.' },
                        { title: 'Neustadt', description: 'Distrito imperial de 1871-1918, incluyendo el Palais du Rhin y la Ópera.' },
                        { title: 'Barrio Europeo', description: 'Consejo de Europa, Parlamento Europeo y Tribunal de Derechos Humanos.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Tour Parlamento – Catedral',
                    duration: '45 min',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Un recorrido más corto centrado en la conexión entre el centro histórico y las instituciones modernas.',
                    highlights: [
                        { title: 'Vínculo Urbano', description: 'Descubra el vínculo entre la historia y la modernidad.' }
                    ]
                }
            ],
            access: {
                title: 'Acceso y Contacto',
                onFoot: 'A 2 minutos de la catedral, en Place du Vieux Marché aux Poissons.',
                bus: 'Línea 10 (Corbeau/Bateliers), Líneas 14/24 (Ancienne Douane).',
                tram: 'Líneas A y D (Porte de l\'Hôpital).',
                piers: 'El punto de embarque Catedral se encuentra a 150 m de la Catedral de Notre-Dame.',
                shop: '18 Place de la Cathédrale (Información y Entradas).',
                labels: {
                    onFoot: 'A pie',
                    bus: 'Autobús',
                    tram: 'Tranvía',
                    departure: 'Salida',
                    shop: 'Tienda'
                }
            },
            hours: {
                title: 'Horarios',
                piers: 'Todos los días desde las 10:00. La última salida varía según la temporada (15:30 a 20:30).',
                shop: 'Todos los días desde las 09:30.',
                labels: {
                    boarding: 'Embarque',
                    shop: 'Tienda'
                }
            }
        },
        it: {
            name: 'Batorama Tour in Barca',
            tagline: 'Scopri Strasburgo dall\'acqua',
            description: 'Un\'esperienza imperdibile a Strasburgo. Batorama offre tour in barca coperti o scoperti attraverso il cuore della città.',
            mustDo: 'IMPERDIBILE',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'TOUR ROSSO: 2000 anni di storia',
                    duration: '70 min',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'Il tour completo che copre la Grande Île, la Neustadt e il Quartiere Europeo.',
                    highlights: [
                        { title: 'Grande Île', description: 'Sito UNESCO, quartiere Petite France, chiuse e diga Vauban.' },
                        { title: 'Neustadt', description: 'Quartiere imperiale dal 1871-1918, compresi Palais du Rhin e Opera.' },
                        { title: 'Quartiere Europeo', description: 'Consiglio d\'Europa, Parlamento Europeo e Corte dei Diritti Umani.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Tour Parlamento – Cattedrale',
                    duration: '45 min',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Un tour più breve incentrato sul collegamento tra il centro storico e le istituzioni moderne.',
                    highlights: [
                        { title: 'Legame Urbano', description: 'Scopri il legame tra storia e modernità.' }
                    ]
                }
            ],
            access: {
                title: 'Accesso e Contatti',
                onFoot: 'A 2 minuti dalla cattedrale, in Place du Vieux Marché aux Poissons.',
                bus: 'Linea 10 (Corbeau/Bateliers), Linee 14/24 (Ancienne Douane).',
                tram: 'Linee A e D (Porte de l\'Hôpital).',
                piers: 'L\'imbarco Cattedrale si trova a 150 m dalla Cattedrale di Notre-Dame.',
                shop: '18 Place de la Cathédrale (Informazioni e Biglietti).',
                labels: {
                    onFoot: 'A piedi',
                    bus: 'Bus',
                    tram: 'Tram',
                    departure: 'Partenza',
                    shop: 'Negozio'
                }
            },
            hours: {
                title: 'Orari di Apertura',
                piers: 'Tutti i giorni dalle 10:00. L\'ultima partenza varia a seconda della stagione (15:30 - 20:30).',
                shop: 'Tutti i giorni dalle 09:30.',
                labels: {
                    boarding: 'Imbarco',
                    shop: 'Negozio'
                }
            }
        },
        ru: {
            name: 'Batorama — прогулка на катере',
            tagline: 'Откройте для себя Страсбург с воды',
            description: 'Обязательный пункт программы в Страсбурге. Batorama предлагает экскурсии на крытых или открытых катерах по самому центру города.',
            mustDo: 'ОБЯЗАТЕЛЬНО',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'КРАСНЫЙ ТУР: 2000 лет истории',
                    duration: '70 мин',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'Полный тур, охватывающий Гранд-Иль, Нойштадт и Европейский квартал.',
                    highlights: [
                        { title: 'Гранд-Иль', description: 'Объект ЮНЕСКО, квартал «Маленькая Франция», шлюзы и дамба Вобана.' },
                        { title: 'Нойштадт', description: 'Имперский квартал 1871–1918 гг., включая Рейнский дворец и Оперу.' },
                        { title: 'Европейский квартал', description: 'Совет Европы, Европейский парламент и Суд по правам человека.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Тур «Парламент — Собор»',
                    duration: '45 мин',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Более короткий тур, посвященный связи между историческим центром и современными институтами.',
                    highlights: [
                        { title: 'Городская связь', description: 'Откройте для себя связь между историей и современностью.' }
                    ]
                }
            ],
            access: {
                title: 'Как добраться и контакты',
                onFoot: 'В 2 минутах от собора, на площади Старого рыбного рынка.',
                bus: 'Линия 10 (ост. Corbeau/Bateliers), линии 14/24 (ост. Ancienne Douane).',
                tram: 'Линии A и D (ост. Porte de l\'Hôpital).',
                piers: 'Пристань «Собор» (Cathédrale) находится в 150 метрах от Страсбургского собора.',
                shop: '18 Place de la Cathédrale (информация и билеты).',
                labels: {
                    onFoot: 'Пешком',
                    bus: 'Автобус',
                    tram: 'Трамвай',
                    departure: 'Пристань',
                    shop: 'Магазин'
                }
            },
            hours: {
                title: 'Часы работы',
                piers: 'Ежедневно с 10:00. Время последнего отправления зависит от сезона (с 15:30 до 20:30).',
                shop: 'Ежедневно с 09:30.',
                labels: {
                    boarding: 'Посадка',
                    shop: 'Магазин'
                }
            }
        },
        tr: {
            name: 'Batorama Tekne Turu',
            tagline: 'Strazburg\'u Su Üzerinden Keşfedin',
            description: 'Strazburg\'da mutlaka yapılması gereken bir deneyim. Batorama, şehrin kalbinde kapalı veya açık tekne turları sunmaktadır.',
            mustDo: 'MUTLAKA YAPIN',
            circuits: [
                {
                    id: 'red-tour',
                    name: '2000 Yıllık Tarih Turu',
                    duration: '70 dk',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'Büyük Ada, Neustadt ve Avrupa Mahallesini kapsayan tam tur.',
                    highlights: [
                        { title: 'Büyük Ada (Grande Île)', description: 'UNESCO mirası, Petite France bölgesi, kanallar ve baraj.' },
                        { title: 'Neustadt', description: '1871-1918 arası Alman imparatorluk mahallesi, Ren Sarayı ve Opera.' },
                        { title: 'Avrupa Mahallesi', description: 'Avrupa Konseyi, Avrupa Parlamentosu ve İnsan Hakları Mahkemesi.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Parlamento – Katedral Turu',
                    duration: '45 dk',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Tarihi merkez ile modern kurumlar arasındaki bağlantıya odaklanan kısa tur.',
                    highlights: [
                        { title: 'Kentsel Bağlantı', description: 'Tarih ve modernite arasındaki bağı keşfedin.' }
                    ]
                }
            ],
            access: {
                title: 'Erişim & İletişim',
                onFoot: 'Katedralden 2 dakika uzaklıkta, Place du Vieux Marché aux Poissons.',
                bus: 'Hat 10 (Corbeau/Bateliers), Hat 14/24 (Ancienne Douane).',
                tram: 'Hat A & D (Porte de l\'Hôpital).',
                piers: 'Katedral iskelesi Katedralden 150m uzaklıktadır.',
                shop: '18 Place de la Cathédrale (Bilgi & Bilet).',
                labels: {
                    onFoot: 'Yürüyerek',
                    bus: 'Otobüs',
                    tram: 'Tramvay',
                    departure: 'Kalkış',
                    shop: 'Mağaza'
                }
            },
            hours: {
                title: 'Açılış Saatleri',
                piers: 'Her gün saat 10:00\'dan itibaren. Son kalkış mevsime bağlıdır (15:30 - 20:30).',
                shop: 'Her gün saat 09:30\'dan itibaren.',
                labels: {
                    boarding: 'Biniş',
                    shop: 'Mağaza'
                }
            }
        },
        pt: {
            name: 'Passeio de Barco Batorama',
            tagline: 'Descubra Estrasburgo a partir da água',
            description: 'Uma experiência obrigatória em Estrasburgo. Batorama oferece passeios de barco cobertos ou abertos pelo coração da cidade.',
            mustDo: 'OBRIGATÓRIO',
            circuits: [
                {
                    id: 'red-tour',
                    name: 'TOUR VERMELHO: 2000 anos de história',
                    duration: '70 min',
                    image: require('@/assets/images/activities/batorama-circuit-2.png'),
                    description: 'O passeio completo que abrange a Grande Île, a Neustadt e o Bairro Europeu.',
                    highlights: [
                        { title: 'Grande Île', description: 'Sítio da UNESCO, bairro de Petite France, eclusas e barragem de Vauban.' },
                        { title: 'Neustadt', description: 'Distrito imperial de 1871-1918, incluindo o Palais du Rhin e a Ópera.' },
                        { title: 'Bairro Europeu', description: 'Conselho da Europa, Parlamento Europeu e Tribunal dos Direitos Humanos.' }
                    ]
                },
                {
                    id: 'parliament-tour',
                    name: 'Tour Parlamento – Catedral',
                    duration: '45 min',
                    image: require('@/assets/images/activities/batorama-circuit-1.png'),
                    description: 'Um passeio mais curto focado na ligação entre o centro histórico e as instituições modernas.',
                    highlights: [
                        { title: 'Ligação Urbana', description: 'Descubra a ligação entre a história e a modernidade.' }
                    ]
                }
            ],
            access: {
                title: 'Acesso e Contacto',
                onFoot: 'A 2 minutos da catedral, na Place du Vieux Marché aux Poissons.',
                bus: 'Linha 10 (Corbeau/Bateliers), Linhas 14/24 (Ancienne Douane).',
                tram: 'Linhas A e D (Porte de l\'Hôpital).',
                piers: 'O ponto de embarque da Catedral está localizado a 150 m da Catedral de Notre-Dame.',
                shop: '18 Place de la Cathédrale (Informações e Bilhetes).',
                labels: {
                    onFoot: 'A pé',
                    bus: 'Autocarro',
                    tram: 'Elétrico',
                    departure: 'Partida',
                    shop: 'Loja'
                }
            },
            hours: {
                title: 'Horário de Funcionamento',
                piers: 'Diariamente a partir das 10:00. A última partida varia consoante a época (15:30 às 20:30).',
                shop: 'Diariamente a partir das 09:30.',
                labels: {
                    boarding: 'Embarque',
                    shop: 'Loja'
                }
            }
        }
    }
};
