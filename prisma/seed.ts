import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const MONTH_LABELS = [
  { fr: "Janvier", en: "January", ar: "يناير" },
  { fr: "Février", en: "February", ar: "فبراير" },
  { fr: "Mars", en: "March", ar: "مارس" },
  { fr: "Avril", en: "April", ar: "أبريل" },
  { fr: "Mai", en: "May", ar: "مايو" },
  { fr: "Juin", en: "June", ar: "يونيو" },
  { fr: "Juillet", en: "July", ar: "يوليو" },
  { fr: "Août", en: "August", ar: "أغسطس" },
  { fr: "Septembre", en: "September", ar: "سبتمبر" },
  { fr: "Octobre", en: "October", ar: "أكتوبر" },
  { fr: "Novembre", en: "November", ar: "نوفمبر" },
  { fr: "Décembre", en: "December", ar: "ديسمبر" },
];

async function seedMonthlyPerformance() {
  console.log("🌱 Seeding MonthlyPerformance...");

  const data: {
    year: number;
    monthIndex: number;
    lowRisk: number | null;
    mediumRisk: number | null;
  }[] = [];

  // 2023: May(4) to Dec(11)
  const low2023 = [null, 14.72, 5.46, 0.81, 2.55, 10.38, 6, 10.83];
  const med2023 = [null, 29.44, 10.92, 1.62, 5.10, 20.76, 12, 21.66];
  for (let i = 0; i < low2023.length; i++) {
    data.push({
      year: 2023,
      monthIndex: 4 + i,
      lowRisk: low2023[i],
      mediumRisk: med2023[i],
    });
  }

  // 2024: all 12 months
  const low2024 = [-3.54, 7.1, 0.08, 14.16, 11.96, 7.17, -4.68, 3, 7.15, 7.62, 13.12, 3.12];
  const med2024 = [-7.08, 14.2, 0.16, 28, 23.92, 14.34, -9.36, 6, 14.3, 15, 26.24, 6.24];
  for (let i = 0; i < 12; i++) {
    data.push({
      year: 2024,
      monthIndex: i,
      lowRisk: low2024[i],
      mediumRisk: med2024[i],
    });
  }

  // 2025: all 12 months
  const low2025 = [4.2, -4.25, 12.79, 22.22, 1.58, 9.21, 17.02, 14.45, 12.4, -10.03, 2.0, 8.13];
  const med2025 = [8.4, -8.5, 25.58, 44.44, 3.16, 18.42, 34.04, 28.9, 24.8, -20.06, 4.0, 16.16];
  for (let i = 0; i < 12; i++) {
    data.push({
      year: 2025,
      monthIndex: i,
      lowRisk: low2025[i],
      mediumRisk: med2025[i],
    });
  }

  // 2026: Jan(0), Feb(1), rest null
  const low2026 = [5.5, 11.8];
  const med2026 = [11.0, 23.6];
  for (let i = 0; i < 12; i++) {
    data.push({
      year: 2026,
      monthIndex: i,
      lowRisk: i < 2 ? low2026[i] : null,
      mediumRisk: i < 2 ? med2026[i] : null,
    });
  }

  for (const d of data) {
    await db.monthlyPerformance.upsert({
      where: {
        year_monthIndex: { year: d.year, monthIndex: d.monthIndex },
      },
      update: {
        lowRisk: d.lowRisk,
        mediumRisk: d.mediumRisk,
      },
      create: {
        year: d.year,
        monthIndex: d.monthIndex,
        monthLabelFr: MONTH_LABELS[d.monthIndex].fr,
        monthLabelEn: MONTH_LABELS[d.monthIndex].en,
        monthLabelAr: MONTH_LABELS[d.monthIndex].ar,
        lowRisk: d.lowRisk,
        mediumRisk: d.mediumRisk,
      },
    });
  }

  console.log(`✅ Seeded ${data.length} monthly performance records`);
}

async function seedTrades() {
  console.log("🌱 Seeding Trades...");

  const trades = [
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5410, exit: 5401, pips: -90, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5405, exit: 5395, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5393, exit: 5383, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5384, exit: 5374, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5370, exit: 5360, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5349, exit: 5339, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5334, exit: 5320, pips: -140, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5343, exit: 5354, pips: 110, result: "W" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5340, exit: 5330, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5337, exit: 5327, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5376, exit: 5366, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5366, exit: 5356, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5344, exit: 5334, pips: -100, result: "L" },
    { contract: "GOLD", period: "1st week March", direction: "BUY", entry: 5340, exit: 5350, pips: 100, result: "W" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5053, exit: 5130, pips: 770, result: "W" },
    { contract: "EUR USD", period: "2nd week March", direction: "SELL", entry: 1.164, exit: 1.151, pips: 0, result: "BE" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5080, exit: 5110, pips: 300, result: "W" },
    { contract: "GBP USD", period: "2nd week March", direction: "SELL", entry: 1.3368, exit: 1.3438, pips: -70, result: "L" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5092, exit: 5108, pips: 160, result: "W" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5142, exit: 5122, pips: -200, result: "L" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5127, exit: 5157, pips: 300, result: "W" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5201, exit: 5227, pips: 260, result: "W" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5195, exit: 5235, pips: 400, result: "W" },
    { contract: "EUR USD", period: "2nd week March", direction: "SELL", entry: 1.1583, exit: 1.1458, pips: 125, result: "W" },
    { contract: "GOLD", period: "2nd week March", direction: "BUY", entry: 5088, exit: 5095, pips: 70, result: "W" },
    { contract: "USD JPY", period: "2nd week March", direction: "SELL", entry: 159.1, exit: 159.7, pips: -60, result: "L" },
  ];

  for (const t of trades) {
    await db.trade.create({
      data: { ...t, year: 2025, month: 3 },
    });
  }

  console.log(`✅ Seeded ${trades.length} trades`);
}

async function seedMembers() {
  console.log("🌱 Seeding Members...");

  const members = [
    { name: "Ahmed K.", email: "ahmed@gmail.com", xmId: "78234512", status: "pending" },
    { name: "Sara B.", email: "sara@hotmail.com", xmId: "65981234", status: "pending" },
    { name: "Mohamed H.", email: "moh@gmail.com", xmId: "91234678", status: "pending" },
    { name: "Fatima A.", email: "fatima@gmail.com", xmId: "44123789", status: "active" },
    { name: "Youssef M.", email: "youssef@gmail.com", xmId: "55678901", status: "active" },
    { name: "Nour T.", email: "nour@outlook.com", xmId: "33456789", status: "rejected" },
  ];

  for (const m of members) {
    await db.member.create({ data: m });
  }

  console.log(`✅ Seeded ${members.length} members`);
}

async function seedSignals() {
  console.log("🌱 Seeding Signals...");

  const signals = [
    { instrument: "XAU/USD", direction: "BUY", entry: "3020", takeProfit: "3060", stopLoss: "3000", result: "open", date: "22 Mar 2026" },
    { instrument: "XAU/USD", direction: "BUY", entry: "2980", takeProfit: "3018", stopLoss: "2960", result: "+380", date: "19 Mar 2026" },
    { instrument: "EUR/USD", direction: "SELL", entry: "1.083", takeProfit: "1.079", stopLoss: "1.087", result: "+40", date: "18 Mar 2026" },
    { instrument: "XAU/USD", direction: "BUY", entry: "3005", takeProfit: "3040", stopLoss: "2990", result: "-150", date: "15 Mar 2026" },
    { instrument: "GBP/USD", direction: "SELL", entry: "1.295", takeProfit: "1.290", stopLoss: "1.300", result: "+50", date: "12 Mar 2026" },
  ];

  for (const s of signals) {
    await db.signal.create({ data: s });
  }

  console.log(`✅ Seeded ${signals.length} signals`);
}

async function seedBlogArticles() {
  console.log("🌱 Seeding BlogArticles...");

  const articles = [
    {
      title: "Pourquoi l'or (XAUUSD) est l'actif préféré de ChebbiTrade",
      category: "gold",
      catLabel: "Or / Gold",
      date: "15 Mars 2026",
      readTime: "5 min",
      views: 1240,
      excerpt: "L'or est l'instrument le plus tradé dans notre groupe. Découvrez pourquoi XAUUSD offre les meilleures opportunités en 2026.",
      content: `<h3>L'or : l'instrument roi du Forex</h3>
            <p>Depuis 4 ans que ChebbiTrade partage des signaux en live, <strong>l'or (XAUUSD)</strong> reste de loin l'actif le plus tradé dans notre groupe. Et ce n'est pas un hasard.</p>
            <div class="highlight">💡 En 2025, plus de 80% de nos signaux étaient sur l'or. Résultat : +128% low risk sur l'année.</div>
            <h3>Pourquoi l'or ?</h3>
            <p>L'or présente plusieurs avantages majeurs pour un trader actif :</p>
            <ul>
                <li><strong>Volatilité prévisible</strong> : L'or réagit fortement aux données macro (inflation, FED, tensions géopolitiques)</li>
                <li><strong>Tendances longues</strong> : Les mouvements directionnels sur l'or durent souvent plusieurs semaines</li>
                <li><strong>Liquidité maximale</strong> : Spreads serrés, exécution instantanée sur XM</li>
                <li><strong>Analyse technique fiable</strong> : Les niveaux S/R fonctionnent très bien sur XAUUSD</li>
            </ul>
            <h3>Comment on trade l'or chez ChebbiTrade</h3>
            <p>Notre approche est simple : <strong>BUY on dips</strong> dans un marché haussier structurel. Avec une gestion du risque stricte à 1% par trade en low risk.</p>
            <p>Chaque trade est annoncé en live sur YouTube avant l'entrée. Transparent, vérifiable, sans filtre.</p>`,
      language: "fr",
      emoji: "🥇",
      catColor: "rgba(245,158,11,.15)",
      catText: "#f59e0b",
    },
    {
      title: "Comprendre le Risk Management : la clé de la survie en trading",
      category: "education",
      catLabel: "Éducation",
      date: "8 Mars 2026",
      readTime: "7 min",
      views: 980,
      excerpt: "Sans une gestion du risque solide, même les meilleurs signaux ne suffiront pas. Voici les bases indispensables pour protéger votre capital.",
      content: `<h3>Le Risk Management, ce que les débutants ignorent</h3>
            <p>La majorité des traders débutants perdent leur capital non pas parce qu'ils manquent de signaux, mais parce qu'ils <strong>ne gèrent pas leur risque</strong>.</p>
            <div class="highlight">⚠️ Avec un win rate de 42% seulement, ChebbiTrade a généré +128% en 2025. Comment ? Grâce à un ratio risque/rendement favorable et une gestion stricte des positions.</div>
            <h3>Les règles de base</h3>
            <ul>
                <li><strong>Ne jamais risquer plus de 1-2% par trade</strong> sur votre capital total</li>
                <li><strong>Toujours définir un stop loss</strong> avant d'entrer en position</li>
                <li><strong>Le ratio R/R minimum</strong> : viser au moins 1:2 (risque 100 pips pour gagner 200)</li>
                <li><strong>Ne pas sur-trader</strong> : moins de positions = plus de contrôle</li>
            </ul>
            <h3>Low risk vs Medium risk</h3>
            <p>Dans notre groupe, on propose deux niveaux de risque :</p>
            <ul>
                <li><strong>Low risk</strong> : 1$/pip pour un compte de 10 000$ → protège du margin call même en cas de longue série perdante</li>
                <li><strong>Medium risk</strong> : 2$/pip → rendements doublés mais risque doublé aussi</li>
            </ul>
            <p>Commencez toujours par le low risk, surtout si vous débutez.</p>`,
      language: "fr",
      emoji: "🎓",
      catColor: "rgba(59,130,246,.15)",
      catText: "#3b82f6",
    },
    {
      title: "BUY on Dips : la stratégie principale de ChebbiTrade expliquée",
      category: "strategie",
      catLabel: "Stratégie",
      date: "1 Mars 2026",
      readTime: "6 min",
      views: 750,
      excerpt: "BUY on dips est notre stratégie phare sur l'or. Découvrez comment identifier les bons niveaux d'entrée dans une tendance haussière.",
      content: `<h3>Qu'est-ce que le "BUY on Dips" ?</h3>
            <p>La stratégie <strong>BUY on Dips</strong> consiste à acheter lors des corrections à la baisse dans une tendance haussière. L'idée : profiter des pullbacks pour entrer à meilleur prix dans le sens de la tendance principale.</p>
            <div class="highlight">📈 Sur l'or en 2025, le marché était structurellement haussier. Chaque correction était une opportunité d'achat.</div>
            <h3>Comment identifier un bon "dip" ?</h3>
            <ul>
                <li>Attendre une correction de <strong>30-50% du dernier mouvement</strong></li>
                <li>Chercher un <strong>support technique</strong> (niveau S/R, retracement Fibonacci)</li>
                <li>Vérifier que la <strong>tendance supérieure reste intacte</strong> (pas de break de structure)</li>
                <li>Confirmer avec un <strong>signal de momentum</strong> (bougie de retournement)</li>
            </ul>
            <h3>Exemple concret</h3>
            <p>Semaine 2 de mars 2025 : après une consolidation sur la zone 5050-5080, le marché a retesté ce niveau. Nos membres ont acheté à 5053 pour sortir à 5130 — soit <strong>770 pips de gain</strong>, le meilleur trade du mois.</p>`,
      language: "fr",
      emoji: "⚙️",
      catColor: "rgba(139,92,246,.15)",
      catText: "#8b5cf6",
    },
    {
      title: "Bilan 2025 : comment ChebbiTrade a généré +128% en 12 mois",
      category: "analyse",
      catLabel: "Analyse",
      date: "5 Janv 2026",
      readTime: "8 min",
      views: 2100,
      excerpt: "Analyse détaillée de nos performances 2025 : les meilleurs mois, les moins bons, et les leçons à retenir pour 2026.",
      content: `<h3>2025, une année exceptionnelle</h3>
            <p>L'année 2025 restera dans les annales de ChebbiTrade. Avec <strong>+128% en low risk</strong> (et +256% en medium risk), c'est notre meilleure performance depuis la création du groupe.</p>
            <div class="highlight">🏆 10 000$ investis en janvier 2025 = 22 800$ en décembre 2025 (low risk)</div>
            <h3>Les meilleurs mois</h3>
            <ul>
                <li><strong>Avril 2025 : +22.22%</strong> — marché de l'or en pleine explosion post-FED</li>
                <li><strong>Juillet 2025 : +17.02%</strong> — tendance haussière claire sur XAUUSD</li>
                <li><strong>Mars 2025 : +12.79%</strong> — recovery après une mauvaise semaine</li>
            </ul>
            <h3>Les mois difficiles</h3>
            <ul>
                <li><strong>Octobre 2025 : -10.03%</strong> — marché très chaotique, beaucoup de faux signaux</li>
                <li><strong>Février 2025 : -4.25%</strong> — début d'année difficile avec forte volatilité</li>
            </ul>
            <h3>Les leçons pour 2026</h3>
            <p>La discipline dans la gestion du risque a été la clé. Même pendant les mauvais mois, on n'a jamais sur-tradé. C'est ce qui nous a permis de récupérer rapidement et terminer l'année sur un bilan exceptionnel.</p>`,
      language: "fr",
      emoji: "📊",
      catColor: "rgba(16,185,129,.15)",
      catText: "#10b981",
    },
    {
      title: "Comment ouvrir son premier compte XM en 10 minutes",
      category: "education",
      catLabel: "Éducation",
      date: "20 Fév 2026",
      readTime: "4 min",
      views: 1560,
      excerpt: "Guide pas-à-pas pour ouvrir votre compte XM via notre lien affilié et rejoindre notre groupe de signaux gratuits.",
      content: `<h3>Étape 1 : Ouvrir le compte</h3>
            <p>Cliquez sur notre lien d'inscription XM (disponible sur le site). Renseignez vos informations personnelles : nom, email, pays de résidence.</p>
            <h3>Étape 2 : Choisir votre type de compte</h3>
            <p>XM propose plusieurs types de comptes. Nous recommandons le compte <strong>Standard ou Micro</strong> pour les débutants. Le compte Ultra Low est idéal pour les spreads minimaux.</p>
            <h3>Étape 3 : Vérification d'identité (KYC)</h3>
            <p>Uploadez une pièce d'identité et un justificatif de domicile. La vérification prend généralement <strong>24-48 heures</strong>.</p>
            <h3>Étape 4 : Premier dépôt</h3>
            <p>Dépôt minimum <strong>5$</strong> (recommandé 100$+). XM accepte virement, carte bancaire, et plusieurs méthodes locales selon votre pays.</p>
            <div class="highlight">✅ Une fois inscrit via notre lien, contactez-nous sur Telegram @ChebbiTrading avec votre ID XM pour rejoindre le groupe privé !</div>
            <h3>Étape 5 : Rejoindre notre groupe</h3>
            <p>Envoyez votre ID de compte XM sur Telegram. Notre équipe vérifiera l'inscription et vous ajoutera au groupe privé dans les 24 heures.</p>`,
      language: "fr",
      emoji: "📚",
      catColor: "rgba(59,130,246,.15)",
      catText: "#3b82f6",
    },
    {
      title: "L'impact de la politique de la FED sur l'or en 2026",
      category: "analyse",
      catLabel: "Analyse",
      date: "12 Mars 2026",
      readTime: "6 min",
      views: 890,
      excerpt: "Comment les décisions de la Réserve Fédérale américaine influencent le prix de l'or et comment en profiter dans vos trades.",
      content: `<h3>FED et or : une relation inverse</h3>
            <p>Il existe une corrélation bien établie entre la politique monétaire de la FED et le prix de l'or. En général : <strong>baisse des taux = hausse de l'or</strong> et vice versa.</p>
            <h3>Pourquoi cette relation ?</h3>
            <p>L'or ne génère pas de rendement (pas d'intérêts). Quand les taux d'intérêt sont élevés, les obligations US deviennent plus attractives que l'or. Inversement, quand la FED baisse ses taux, l'or retrouve son attractivité comme valeur refuge.</p>
            <div class="highlight">📅 Surveillez toujours le calendrier économique : les annonces FED sont des événements à fort impact sur XAUUSD.</div>
            <h3>Comment trader autour des annonces FED ?</h3>
            <ul>
                <li><strong>Avant l'annonce</strong> : Réduisez vos positions ou fermez-les si vous avez des gains</li>
                <li><strong>Pendant l'annonce</strong> : Ne prenez pas de nouvelles positions — la volatilité est imprévisible</li>
                <li><strong>Après l'annonce</strong> : Attendez la stabilisation du marché (15-30 min) avant d'entrer</li>
            </ul>
            <h3>Notre approche chez ChebbiTrade</h3>
            <p>En 2025, nous avons systématiquement évité de trader lors des grandes annonces macro. Cette discipline a contribué à éviter plusieurs pertes importantes pendant les périodes de haute volatilité.</p>`,
      language: "fr",
      emoji: "🌍",
      catColor: "rgba(16,185,129,.15)",
      catText: "#10b981",
    },
  ];

  for (const a of articles) {
    await db.blogArticle.create({ data: a });
  }

  console.log(`✅ Seeded ${articles.length} blog articles`);
}

async function seedFaqs() {
  console.log("🌱 Seeding FAQs...");

  const faqs = [
    {
      question: "C'est vraiment 100% gratuit ?",
      answer: "Oui, nos signaux de trading sont 100% gratuits. Nous sommes rémunérés par XM en tant que partenaire affilié. Cela ne vous coûte absolument rien — ni à l'inscription, ni pour recevoir les signaux. Le seul prérequis est d'ouvrir un compte XM via notre lien, ce qui nous permet de continuer à offrir ce service gratuitement à tous nos membres.",
      category: "Gratuité",
      language: "fr",
      order: 1,
    },
    {
      question: "Pourquoi m'inscrire via votre lien ?",
      answer: "L'inscription via notre lien affilié XM est la seule condition pour rejoindre notre groupe. Cela ne change absolument rien pour vous : mêmes spreads, même plateforme, mêmes conditions. La différence c'est que XM nous verse une commission sur votre activité de trading — pas sur votre dépôt. C'est ce qui nous permet de financer notre travail et de continuer à fournir des signaux gratuits à toute la communauté.",
      category: "XM",
      language: "fr",
      order: 2,
    },
    {
      question: "J'ai déjà un compte XM, comment faire ?",
      answer: "Si vous avez déjà un compte XM, vous pouvez créer un nouveau compte XM via notre lien (XM autorise plusieurs comptes) et l'utiliser pour suivre nos signaux. Ensuite, envoyez-nous le numéro du nouveau compte sur Telegram @ChebbiTrading et nous vous ajouterons au groupe privé. Notez que le compte doit être créé via notre lien d'affiliation pour être éligible.",
      category: "XM",
      language: "fr",
      order: 3,
    },
    {
      question: "Où voir vos résultats en détail ?",
      answer: "Tous nos résultats mensuels et annuels sont publiés sur notre site dans la section 'Résultats'. Vous y trouverez nos performances mois par mois depuis 2023, avec les pourcentages en low risk et medium risk. Chaque performance est vérifiable car tous nos trades sont annoncés en live sur YouTube avant l'entrée. Nous croyons à la transparence totale.",
      category: "Résultats",
      language: "fr",
      order: 4,
    },
    {
      question: "Quel est le capital minimum requis ?",
      answer: "Chez XM, le dépôt minimum est de 5$. Cependant, pour une expérience optimale et une gestion du risque correcte, nous recommandons un capital minimum de 100$ à 500$. Avec 100$ en low risk (1$/pip), vous pouvez supporter une série de pertes sans risquer le margin call. Plus votre capital est important, plus la gestion du risque est confortable. Commencez toujours petit et augmentez progressivement.",
      category: "Capital",
      language: "fr",
      order: 5,
    },
    {
      question: "XM est-il un broker fiable ?",
      answer: "Oui, XM est l'un des brokers forex les plus régulés au monde. Il est supervisé par plusieurs autorités financières de premier plan : FCA (Royaume-Uni), CySEC (Chypre), ASIC (Australie), et d'autres. XM existe depuis 2009, compte plus de 5 millions de clients dans 190 pays, et a reçu de nombreux prix pour la qualité de ses services. Nous tradeons nous-mêmes sur XM depuis le début et n'avons jamais eu aucun problème de retrait ou d'exécution.",
      category: "XM",
      language: "fr",
      order: 6,
    },
  ];

  for (const f of faqs) {
    await db.faq.create({ data: f });
  }

  console.log(`✅ Seeded ${faqs.length} FAQs`);
}

async function seedSiteSettings() {
  console.log("🌱 Seeding SiteSettings...");

  const settings = [
    { key: "xmCode", value: "VOTRE_CODE" },
    { key: "siteName", value: "Chebbi Trading" },
    { key: "contactEmail", value: "contact@chebbitrade.com" },
    { key: "telegram", value: "@ChebbiTrading" },
    { key: "youtube", value: "@ChebbiTrading" },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log(`✅ Seeded ${settings.length} site settings`);
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  await seedMonthlyPerformance();
  await seedTrades();
  await seedMembers();
  await seedSignals();
  await seedBlogArticles();
  await seedFaqs();
  await seedSiteSettings();

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
