import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

const equipment = [
  // VITRINE 1 — Robotique / VR
  { internalId: "VIT1-001", name: "Robot bleu", model: "Robot Éducatif BLEU", brand: "EPSI/Divers", category: "ROBOTICS", condition: "GOOD", location: "Vitrine 1", quantity: 1, description: "Robot pédagogique programmable", loanable: true },
  { internalId: "VIT1-002", name: "VR MetaQuest 2", model: "Quest 2 256 Go", brand: "Meta", reference: "S0216960", category: "VR_AR", condition: "GOOD", location: "Vitrine 1", quantity: 2, description: "Casque VR autonome 256 Go, 2 manettes", loanable: true },
  { internalId: "VIT1-003", name: "VR Varjo XR-3", model: "XR-3", brand: "Varjo", category: "VR_AR", condition: "NEW", location: "Vitrine 1", quantity: 1, description: "Casque VR/AR haute fidélité professionnel, résolution humaine", loanable: true },
  { internalId: "VIT1-004", name: "VR Microsoft HoloLens 2", model: "HoloLens 2", brand: "Microsoft", category: "VR_AR", condition: "GOOD", location: "Vitrine 1", quantity: 1, description: "Casque AR holographique développeur", loanable: true },
  { internalId: "VIT1-005", name: "VR Oculus Dev Kit DK2", model: "DK2", brand: "Oculus", category: "VR_AR", condition: "USED", location: "Vitrine 1", quantity: 1, description: "Kit développement VR (ancienne génération)", loanable: true },
  { internalId: "VIT1-006", name: "Boîte vide Quest 3S", model: "Boîte Quest 3S", brand: "Meta", category: "MISC", condition: "GOOD", location: "Vitrine 1", quantity: 1, description: "Boîte vide de rangement Quest 3S", loanable: false },
  { internalId: "VIT1-007", name: "Boîte vide Quest 3", model: "Boîte Quest 3", brand: "Meta", category: "MISC", condition: "GOOD", location: "Vitrine 1", quantity: 1, description: "Boîte vide de rangement Quest 3", loanable: false },
  { internalId: "VIT1-008", name: "Boîte vide Quest 1", model: "Boîte Quest 1", brand: "Oculus", category: "MISC", condition: "USED", location: "Vitrine 1", quantity: 1, description: "Boîte vide de rangement Quest 1", loanable: false },
  { internalId: "VIT1-009", name: "Bras robot Niryo Ned2", model: "Ned2", brand: "Niryo", category: "ROBOTICS", condition: "NEW", location: "Vitrine 1", quantity: 1, description: "Bras robotique 6 axes éducatif, portée 440mm", loanable: true },
  { internalId: "VIT1-010", name: "Ubtech Yanshee", model: "Yanshee", brand: "Ubtech", category: "ROBOTICS", condition: "GOOD", location: "Vitrine 1", quantity: 1, description: "Robot humanoïde programmable, 16 servos", loanable: true },
  { internalId: "VIT1-011", name: "Robomaster S1", model: "RoboMaster S1", brand: "DJI", reference: "2432001662", category: "ROBOTICS", condition: "GOOD", location: "Vitrine 1", quantity: 1, description: "Robot tank éducatif DJI, programmation Python", loanable: true },

  // VITRINE 2 — IoT / Composants / Impression 3D
  { internalId: "VIT2-001", name: "Arduino UNO R3", model: "UNO R3", brand: "Arduino", category: "IOT", condition: "GOOD", location: "Vitrine 2", quantity: 6, description: "Carte microcontrôleur ATmega328P, 14 E/S digitales", loanable: true },
  { internalId: "VIT2-002", name: "ESP32", model: "ESP32-WROOM-32", brand: "Espressif", category: "IOT", condition: "NEW", location: "Vitrine 2", quantity: 6, description: "Module WiFi/Bluetooth dual-core 240MHz", loanable: true },
  { internalId: "VIT2-003", name: "Boutons poussoirs", model: "Boutons 6x6mm", brand: "Divers", category: "COMPONENTS", condition: "NEW", location: "Vitrine 2", quantity: 40, description: "Boutons poussoirs électroniques divers", loanable: true },
  { internalId: "VIT2-004", name: "Actionneurs", model: "Servomoteurs / Moteurs pas à pas", brand: "Divers", category: "COMPONENTS", condition: "GOOD", location: "Vitrine 2", quantity: 7, description: "Actionneurs électromécaniques divers", loanable: true },
  { internalId: "VIT2-005", name: "LED RGB et monocolor", model: "LED 3mm/5mm", brand: "Divers", category: "COMPONENTS", condition: "NEW", location: "Vitrine 2", quantity: 35, description: "Diodes électroluminescentes diverses", loanable: true },
  { internalId: "VIT2-006", name: "Cartes SD", model: "Micro SD 16/32/64 Go", brand: "SanDisk", reference: "S1620723", category: "COMPONENTS", condition: "NEW", location: "Vitrine 2", quantity: 10, description: "Cartes mémoire microSD avec adaptateur", loanable: true },
  { internalId: "VIT2-007", name: "Écran LCD", model: "LCD 16x2 / 20x4 I2C", brand: "Divers", category: "COMPONENTS", condition: "GOOD", location: "Vitrine 2", quantity: 8, description: "Écrans LCD alphanumériques avec backpack I2C", loanable: true },
  { internalId: "VIT2-008", name: "Condensateurs", model: "Céramique/électrolytique", brand: "Divers", category: "COMPONENTS", condition: "GOOD", location: "Vitrine 2", quantity: 32, description: "Condensateurs divers 10pF-1000µF", loanable: true },
  { internalId: "VIT2-009", name: "Résistances", model: "1/4W 1% E12", brand: "Divers", category: "COMPONENTS", condition: "NEW", location: "Vitrine 2", quantity: 100, description: "Résistances carbone film 10Ω-1MΩ", loanable: true },
  { internalId: "VIT2-010", name: "Modules GPIO extension", model: "GPIO extension", brand: "Divers", category: "COMPONENTS", condition: "GOOD", location: "Vitrine 2", quantity: 3, description: "Modules d'extension GPIO pour Raspberry/Arduino", loanable: true },
  { internalId: "VIT2-011", name: "Boîtes de rangement", model: "Boîtes plastique", brand: "Divers", category: "MISC", condition: "GOOD", location: "Vitrine 2", quantity: 3, description: "Boîtes plastique de rangement composants", loanable: false },
  { internalId: "VIT2-012", name: "Boîtes de câbles", model: "Boîtes câbles USB/RJ45", brand: "Divers", category: "MISC", condition: "USED", location: "Vitrine 2", quantity: 4, description: "Boîtes de rangement câbles divers", loanable: false },
  { internalId: "VIT2-013", name: "Batteries", model: "Li-Po / Li-Ion / AA", brand: "Divers", category: "MISC", condition: "GOOD", location: "Vitrine 2", quantity: 8, description: "Batteries rechargeables diverses", loanable: true },
  { internalId: "VIT2-014", name: "Casque Logitech G335", model: "G335", brand: "Logitech", category: "AUDIO", condition: "GOOD", location: "Vitrine 2", quantity: 4, description: "Casque gaming léger, jack 3.5mm, micro intégré", loanable: true },
  { internalId: "VIT2-015", name: "Manettes Nacon", model: "Revolution Pro / Compact", brand: "Nacon", category: "PERIPHERALS", condition: "NEW", location: "Vitrine 2", quantity: 4, description: "Manette gaming filaire/sans fil PS4/PC", loanable: true },
  { internalId: "VIT2-016", name: "Imprimante 3D Ender 3 Pro", model: "Ender 3 Pro", brand: "Creality", reference: "S0310935", category: "PRINTING_3D", condition: "USED", location: "Vitrine 2", quantity: 1, description: "Imprimante 3D FDM, plateau 220x220x250mm", loanable: true },
  { internalId: "VIT2-017", name: "Stylo 3D Mynt3D", model: "MYNT3D PRO", brand: "MYNT", category: "PRINTING_3D", condition: "GOOD", location: "Vitrine 2", quantity: 2, description: "Stylo 3D d'impression avec écran OLED", loanable: true },
  { internalId: "VIT2-018", name: "Potentiomètres (80pcs)", model: "Kit linéaires/rotatifs", brand: "Divers", category: "COMPONENTS", condition: "NEW", location: "Vitrine 2", quantity: 1, description: "Kit 80 potentiomètres 1kΩ-1MΩ", loanable: true },
  { internalId: "VIT2-019", name: "Capteurs divers", model: "Température/Humidité/Ultrason/PIR", brand: "Divers", category: "IOT", condition: "GOOD", location: "Vitrine 2", quantity: 40, description: "Kit capteurs électroniques divers", loanable: true },
  { internalId: "VIT2-020", name: "Raspberry Pi", model: "Pi 4 8Go / Pi 3 / Zero W", brand: "Raspberry", reference: "C0187035", category: "IOT", condition: "NEW", location: "Vitrine 2", quantity: 8, description: "Nano-ordinateur ARM, ports GPIO 40 broches", loanable: true },

  // VITRINE 3 — Claviers / PC portables
  { internalId: "VIT3-001", name: "Clavier Logitech K120", model: "K120", brand: "Logitech", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 3", quantity: 5, description: "Clavier filaire USB AZERTY, résistant aux éclaboussures", loanable: true },
  { internalId: "VIT3-002", name: "Clavier HP", model: "320M", brand: "HP", category: "PERIPHERALS", condition: "USED", location: "Vitrine 3", quantity: 1, description: "Clavier filaire USB AZERTY", loanable: true },
  { internalId: "VIT3-003", name: "Clavier Microsoft", model: "Keyboard 200", brand: "Microsoft", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 3", quantity: 1, description: "Clavier filaire USB AZERTY, touches silencieuses", loanable: true },
  { internalId: "VIT3-004", name: "Clavier Logitech G512", model: "G512/G513 Carbon", brand: "Logitech", category: "PERIPHERALS", condition: "NEW", location: "Vitrine 3", quantity: 4, description: "Clavier mécanique gaming GX Brown, RGB Lightsync", loanable: true },
  { internalId: "VIT3-005", name: "Clavier Dell", model: "KB216", brand: "Dell", category: "PERIPHERALS", condition: "USED", location: "Vitrine 3", quantity: 1, description: "Clavier filaire USB AZERTY", loanable: true },
  { internalId: "VIT3-006", name: "Clavier Logitech K800", model: "K800", brand: "Logitech", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 3", quantity: 1, description: "Clavier sans fil rétroéclairé, touches PerfectStroke", loanable: true },
  { internalId: "VIT3-007", name: "PC MSI GF75", model: "GF75 Thin 10SC", brand: "MSI", category: "COMPUTER", condition: "GOOD", location: "Vitrine 3", quantity: 1, description: "PC Portable Gamer 17.3\" FHD 144Hz, GTX 1650 — i7-10750H, 16Go DDR4, 512Go SSD + 1To HDD", loanable: true },
  { internalId: "VIT3-008", name: "PC MSI GF66 Katana", model: "GF66 11UD", brand: "MSI", category: "COMPUTER", condition: "GOOD", location: "Vitrine 3", quantity: 3, description: "PC Portable Gamer 15.6\" FHD 144Hz, RTX 3050 Ti — i5-11400H, 16Go DDR4, 512Go SSD NVMe", loanable: true },
  { internalId: "VIT3-009", name: "PC Dell Latitude 5510", model: "Latitude 5510", brand: "Dell", category: "COMPUTER", condition: "USED", location: "Vitrine 3", quantity: 1, description: "PC Portable professionnel 15.6\" FHD — i5-10210U, 8Go DDR4, 256Go SSD", loanable: true },
  { internalId: "VIT3-010", name: "Caméra Smart Home EZVIZ", model: "C6N / C3W", brand: "EZVIZ", category: "PERIPHERALS", condition: "NEW", location: "Vitrine 3", quantity: 1, description: "Caméra surveillance WiFi 1080p, vision nocturne", loanable: true },

  // VITRINE 4 — Périphériques / Audio / Caméras
  { internalId: "VIT4-001", name: "Google Chromecast", model: "3rd Gen", brand: "Google", reference: "21400024", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 4", quantity: 1, description: "Dongle streaming HDMI, Full HD 1080p", loanable: true },
  { internalId: "VIT4-002", name: "Wireless Presenter", model: "R800 / R400", brand: "Logitech", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 4", quantity: 1, description: "Télécommande présentation laser rouge", loanable: true },
  { internalId: "VIT4-003", name: "Micro cravate sans fil", model: "K30 4-en-1", brand: "Lavalier", category: "AUDIO", condition: "GOOD", location: "Vitrine 4", quantity: 1, description: "Micro cravate sans fil 4 en 1 (Lightning/USB-C/jack)", loanable: true },
  { internalId: "VIT4-004", name: "Caméra Polycom", model: "RealPresence Group 310", brand: "Polycom", category: "PERIPHERALS", condition: "USED", location: "Vitrine 4", quantity: 1, description: "Système visioconférence HD, caméra PTZ", loanable: true },
  { internalId: "VIT4-005", name: "Micro HyperX QuadCast", model: "QuadCast S", brand: "HyperX", category: "AUDIO", condition: "NEW", location: "Vitrine 4", quantity: 1, description: "Micro USB condensateur gaming, RGB, anti-pop", loanable: true },
  { internalId: "VIT4-006", name: "Support caméra PIXI", model: "Mini Tripod", brand: "Manfrotto", category: "MISC", condition: "GOOD", location: "Vitrine 4", quantity: 3, description: "Mini trépied pour caméra compacte", loanable: true },
  { internalId: "VIT4-007", name: "Webcam Logitech C920s", model: "C920s PRO HD", brand: "Logitech", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 4", quantity: 1, description: "Webcam Full HD 1080p, autofocus, stéréo", loanable: true },
  { internalId: "VIT4-008", name: "Ring Light LED", model: "Air Ring Light / LED Panel", brand: "Divers", category: "MISC", condition: "NEW", location: "Vitrine 4", quantity: 2, description: "Éclairage LED pour streaming/photo", loanable: true },

  // VITRINE 5 — Réseau / Outillage
  { internalId: "VIT5-001", name: "Caméra Vaddio", model: "RoboSHOT / ConferenceSHOT", brand: "Vaddio", category: "PERIPHERALS", condition: "GOOD", location: "Vitrine 5", quantity: 1, description: "Caméra PTZ USB professionnelle", loanable: true },
  { internalId: "VIT5-002", name: "WiFi Router Linksys", model: "WRT1900ACS", brand: "Linksys", reference: "S1600805", category: "NETWORK", condition: "USED", location: "Vitrine 5", quantity: 1, description: "Routeur WiFi AC1900 dual-band, OpenWRT", loanable: true },
  { internalId: "VIT5-003", name: "Access Point Planet", model: "WNAP-6350/WNAP-6305", brand: "Planet", category: "NETWORK", condition: "GOOD", location: "Vitrine 5", quantity: 1, description: "Point d'accès WiFi N 300Mbps, PoE", loanable: true },
  { internalId: "VIT5-004", name: "Access Point Netgear", model: "WAC104/WAC510", brand: "Netgear", category: "NETWORK", condition: "GOOD", location: "Vitrine 5", quantity: 1, description: "Point d'accès WiFi AC dual-band", loanable: true },
  { internalId: "VIT5-005", name: "Kit soudure Goobay", model: "Kit soudure complet", brand: "Goobay", reference: "S0700287", category: "TOOLS", condition: "GOOD", location: "Vitrine 5", quantity: 3, description: "Kit fer à souder 60W + support + pompe + soudure", loanable: true },
  { internalId: "VIT5-006", name: "Fer à souder Parkside", model: "PLS48D2/PLSG48", brand: "Parkside", category: "TOOLS", condition: "USED", location: "Vitrine 5", quantity: 1, description: "Fer à souder électrique 48W avec LED", loanable: true },
  { internalId: "VIT5-007", name: "Switch Cisco", model: "Catalyst 2950/SG250-08", brand: "Cisco", reference: "FOC07862SXS", category: "NETWORK", condition: "GOOD", location: "Vitrine 5", quantity: 1, description: "Switch Ethernet 24/8 ports 10/100/1000 Mbps", loanable: true },
  { internalId: "VIT5-008", name: "Perceuse-visseuse", model: "12/18V", brand: "Divers", category: "TOOLS", condition: "GOOD", location: "Vitrine 5", quantity: 1, description: "Perceuse électrique pour bricolage/montage", loanable: true },
  { internalId: "VIT5-009", name: "Cisco Router 2800", model: "2801/2811/2600", brand: "Cisco", category: "NETWORK", condition: "OBSOLETE", location: "Vitrine 5", quantity: 1, description: "Routeur modulaire Cisco série 2800/2600", loanable: true },

  // SALLE myDiL
  { internalId: "SALLE-001", name: "Imprimante 3D Falcin", model: "Falcin", brand: "Falcin", category: "PRINTING_3D", condition: "GOOD", location: "Salle myDiL", quantity: 1, description: "Imprimante 3D FDM professionnelle", loanable: true },
  { internalId: "SALLE-002", name: "Makerbot Replicator", model: "Replicator+ / Replicator 2", brand: "Makerbot", category: "PRINTING_3D", condition: "USED", location: "Salle myDiL", quantity: 1, description: "Imprimante 3D FDM professionnelle, don IDRAC", loanable: true },
  { internalId: "SALLE-003", name: "Creality K2 Plus", model: "K2 Plus", brand: "Creality", category: "PRINTING_3D", condition: "NEW", location: "Salle myDiL", quantity: 1, description: "Imprimante 3D FDM CoreXY, volume 350x350x350mm", loanable: true },
  { internalId: "SALLE-004", name: "Rouleaux filament PLA/ABS/PETG", model: "1.75mm", brand: "Sunlu/Neofil3D/Smartfil", reference: "S0743663", category: "CONSUMABLE", condition: "GOOD", location: "Salle myDiL", quantity: 13, description: "Filament 3D 1.75mm diverses couleurs", loanable: false },
  { internalId: "SALLE-005", name: "Filament PLA vert 750g", model: "PLA 1.75mm 750g Vert", brand: "Neofil3D", category: "CONSUMABLE", condition: "NEW", location: "Salle myDiL", quantity: 1, description: "Filament PLA vert 1.75mm, bobine 750g", loanable: false },
  { internalId: "SALLE-006", name: "Filament PLA vert 750g (2)", model: "PLA 1.75mm 750g Vert", brand: "Neofil3D", category: "CONSUMABLE", condition: "NEW", location: "Salle myDiL", quantity: 1, description: "Filament PLA vert 1.75mm, bobine 750g", loanable: false },
];

async function main() {
  console.log(`Import de ${equipment.length} équipements...`);

  for (const item of equipment) {
    await prisma.equipment.upsert({
      where: { internalId: item.internalId },
      update: {},
      create: {
        internalId: item.internalId,
        name: item.name,
        model: item.model,
        brand: item.brand,
        reference: item.reference,
        category: item.category as never,
        condition: item.condition as never,
        status: "AVAILABLE",
        location: item.location,
        quantity: item.quantity,
        description: item.description,
        loanable: item.loanable,
      },
    });
  }

  console.log(`✅ ${equipment.length} équipements importés avec succès.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
