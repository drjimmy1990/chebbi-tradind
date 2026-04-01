const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── SITE SETTINGS ─────────────────────────────────────────────
const siteSettings = [
  { key: 'TELEGRAM_URL', value: 'https://t.me/ChebbiTrading' },
  { key: 'YOUTUBE_URL', value: 'https://www.youtube.com/@ChebbiTrading/streams' },
  { key: 'XM_LINK_FR', value: 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=fr&p=1' },
  { key: 'XM_LINK_EN', value: 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=en&p=1' },
  { key: 'XM_LINK_AR', value: 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=ar&p=1' },
  { key: 'LOGO_URL', value: 'https://i.imgur.com/USEEiyC.png' },
  { key: 'EMAIL', value: 'contact@chebbitrade.com' },
  { key: 'STAT_YEARS', value: '4+' },
  { key: 'STAT_PERFORMANCE', value: '+128%' },
  { key: 'STAT_MEMBERS', value: '1,920+' },
];

// ─── TESTIMONIALS ──────────────────────────────────────────────
const testimonials = [
  {
    name: 'Ahmed K.',
    initials: 'AK',
    stars: 5,
    titleFr: 'Membre depuis 2023',
    titleEn: 'Member since 2023',
    titleAr: 'عضو منذ 2023',
    textFr: "J'ai rejoint le groupe il y a 2 ans et les résultats parlent d'eux-mêmes. Chebbi est transparent, chaque trade est filmé en live. Enfin un groupe sérieux !",
    textEn: "I joined the group 2 years ago and the results speak for themselves. Chebbi is transparent, every trade is filmed live. Finally a serious group!",
    textAr: "انضممت إلى المجموعة قبل سنتين والنتائج تتحدث عن نفسها. شبي شفاف، كل صفقة يتم بثها مباشرة. أخيراً مجموعة جادة!",
  },
  {
    name: 'Sarah M.',
    initials: 'SM',
    stars: 5,
    titleFr: 'Membre depuis 2024',
    titleEn: 'Member since 2024',
    titleAr: 'عضو منذ 2024',
    textFr: "En tant que débutante, j'ai apprécié la gestion stricte du risque. J'ai commencé avec 100$ et je suis maintenant en profit. Merci Chebbi Trading !",
    textEn: "As a beginner, I appreciated the strict risk management. I started with $100 and I'm now in profit. Thank you Chebbi Trading!",
    textAr: "كمبتدئة، قدّرت الإدارة الصارمة للمخاطر. بدأت بـ 100$ والآن أنا في ربح. شكراً Chebbi Trading!",
  },
  {
    name: 'Karim B.',
    initials: 'KB',
    stars: 5,
    titleFr: 'Membre depuis 2022',
    titleEn: 'Member since 2022',
    titleAr: 'عضو منذ 2022',
    textFr: "Le meilleur groupe de signaux que j'ai testé. Les résultats sont réels, pas de fausses promesses. Le fait que tout soit en live sur YouTube rassure énormément.",
    textEn: "The best signal group I've tested. The results are real, no false promises. The fact that everything is live on YouTube is very reassuring.",
    textAr: "أفضل مجموعة إشارات جربتها. النتائج حقيقية، بدون وعود كاذبة. حقيقة أن كل شيء مباشر على يوتيوب مطمئنة جداً.",
  },
];

// ─── FAQS ──────────────────────────────────────────────────────
const faqs = [
  {
    questionFr: "C'est vraiment 100% gratuit ?",
    questionEn: "Is it really 100% free?",
    questionAr: "هل هو مجاني 100% فعلاً؟",
    answerFr: "Oui, totalement gratuit ! Il suffit d'ouvrir un compte XM via notre lien affilié. XM nous rémunère en tant que partenaire IB, ce qui nous permet de financer tout le service gratuitement pour vous. Vous ne payez rien de plus que vos trades habituels.",
    answerEn: "Yes, completely free! Just open an XM account via our affiliate link. XM pays us as an IB partner, which allows us to fund the entire service for free for you. You pay nothing more than your usual trades.",
    answerAr: "نعم، مجاني تماماً! يكفي فتح حساب XM عبر رابط الإحالة الخاص بنا. تدفع لنا XM كشريك IB، مما يتيح لنا تمويل الخدمة بالكامل مجاناً لك. أنت لا تدفع شيئاً إضافياً عن تداولاتك المعتادة.",
    category: 'gratuit',
    icon: 'gift',
    order: 1,
  },
  {
    questionFr: "Pourquoi m'inscrire via votre lien ?",
    questionEn: "Why should I sign up through your link?",
    questionAr: "لماذا يجب أن أسجل عبر رابطكم؟",
    answerFr: "Nous sommes <strong>partenaire officiel (IB) de XM</strong>. Lorsque vous tradez sur XM via notre lien, XM nous verse une commission sur le spread — ce qui ne vous coûte strictement rien de plus. C'est ainsi que nous finançons nos signaux gratuits.",
    answerEn: "We are an <strong>official XM partner (IB)</strong>. When you trade on XM through our link, XM pays us a commission on the spread — which costs you absolutely nothing extra. This is how we fund our free signals.",
    answerAr: "نحن <strong>شريك رسمي (IB) لـ XM</strong>. عندما تتداول على XM عبر رابطنا، تدفع لنا XM عمولة على السبريد — وهذا لا يكلفك شيئاً إضافياً على الإطلاق. هذا هو كيف نموّل إشاراتنا المجانية.",
    category: 'xm',
    icon: 'building',
    order: 2,
  },
  {
    questionFr: "J'ai déjà un compte XM. Que faire ?",
    questionEn: "I already have an XM account. What should I do?",
    questionAr: "لديّ حساب XM بالفعل. ماذا أفعل؟",
    answerFr: "Pas de problème ! Vous pouvez ouvrir un <strong>compte additionnel</strong> via notre lien d'affiliation. Contactez-nous directement sur <a href='https://t.me/ChebbiTrading' target='_blank' rel='noopener'>Telegram</a> et nous vous guiderons step by step pour la procédure.",
    answerEn: "No problem! You can open an <strong>additional account</strong> via our affiliate link. Contact us directly on <a href='https://t.me/ChebbiTrading' target='_blank' rel='noopener'>Telegram</a> and we'll guide you step by step through the process.",
    answerAr: "لا مشكلة! يمكنك فتح <strong>حساب إضافي</strong> عبر رابط الإحالة الخاص بنا. تواصل معنا مباشرة على <a href='https://t.me/ChebbiTrading' target='_blank' rel='noopener'>تيليجرام</a> وسنرشدك خطوة بخطوة.",
    category: 'xm',
    icon: 'user-check',
    order: 3,
  },
  {
    questionFr: "Où puis-je vérifier vos résultats ?",
    questionEn: "Where can I verify your results?",
    questionAr: "أين يمكنني التحقق من نتائجكم؟",
    answerFr: "Sur notre chaîne YouTube <strong>\"Chebbi Trading\"</strong> — plus de 4 ans de trades effectués en direct, streamés et vérifiables par n'importe qui. Aucun cherry-picking possible. Consultez aussi notre page résultats pour le détail complet.",
    answerEn: "On our YouTube channel <strong>\"Chebbi Trading\"</strong> — over 4 years of live trades, streamed and verifiable by anyone. No cherry-picking possible. Check our results page for the complete details.",
    answerAr: "على قناتنا على يوتيوب <strong>\"Chebbi Trading\"</strong> — أكثر من 4 سنوات من التداولات المباشرة والمبثوثة والقابلة للتحقق من قبل أي شخص. لا اختيار انتقائي ممكن. تحقق من صفحة النتائج للتفاصيل الكاملة.",
    category: 'resultats',
    icon: 'chart',
    order: 4,
  },
  {
    questionFr: "Quel capital minimum pour commencer ?",
    questionEn: "What is the minimum capital to start?",
    questionAr: "ما هو الحد الأدنى لرأس المال للبدء؟",
    answerFr: "XM permet de démarrer avec seulement <strong>5$</strong>. Cependant, nous recommandons un capital de <strong>100$ à 200$</strong> minimum pour une gestion du risque correcte et des trades confortables. Plus vous avez de capital, plus vous pouvez gérer le risque sereinement.",
    answerEn: "XM allows you to start with as little as <strong>$5</strong>. However, we recommend a minimum capital of <strong>$100 to $200</strong> for proper risk management and comfortable trading. The more capital you have, the more serenely you can manage risk.",
    answerAr: "يسمح XM بالبدء بـ <strong>5$ فقط</strong>. ومع ذلك، نوصي برأس مال <strong>100$ إلى 200$ كحد أدنى</strong> لإدارة المخاطر بشكل صحيح. كلما كان رأس المال أكبر، يمكنك إدارة المخاطر بسهولة أكبر.",
    category: 'capital',
    icon: 'dollar',
    order: 5,
  },
  {
    questionFr: "XM est-il un broker fiable ?",
    questionEn: "Is XM a reliable broker?",
    questionAr: "هل XM وسيط موثوق؟",
    answerFr: "Oui, XM est un broker <strong>régulé par CySEC, ASIC et FSC</strong>, avec plus de 10 millions de clients dans 190 pays. C'est l'un des brokers les plus solides du marché. Vous pouvez retirer vos fonds à tout moment sans problème.",
    answerEn: "Yes, XM is a broker <strong>regulated by CySEC, ASIC and FSC</strong>, with over 10 million clients in 190 countries. It's one of the most solid brokers in the market. You can withdraw your funds at any time without any issue.",
    answerAr: "نعم، XM وسيط <strong>مرخص من CySEC وASIC وFSC</strong>، مع أكثر من 10 ملايين عميل في 190 دولة. إنه أحد أقوى الوسطاء في السوق. يمكنك سحب أموالك في أي وقت دون مشكلة.",
    category: 'xm',
    icon: 'shield',
    order: 6,
  },
  {
    questionFr: "Comment reçoit-on les signaux ?",
    questionEn: "How do we receive signals?",
    questionAr: "كيف نستقبل الإشارات؟",
    answerFr: "Les signaux sont partagés dans notre <strong>groupe Telegram privé</strong>. Chaque signal comprend : la paire/instrument, la direction (BUY/SELL), le prix d'entrée, le stop loss et le take profit. Tout est expliqué en direct sur YouTube.",
    answerEn: "Signals are shared in our <strong>private Telegram group</strong>. Each signal includes: the pair/instrument, direction (BUY/SELL), entry price, stop loss and take profit. Everything is explained live on YouTube.",
    answerAr: "تتم مشاركة الإشارات في <strong>مجموعة تيليجرام الخاصة</strong>. تتضمن كل إشارة: الزوج/الأداة، الاتجاه (شراء/بيع)، سعر الدخول، وقف الخسارة وأخذ الربح. يتم شرح كل شيء مباشرة على يوتيوب.",
    category: 'signaux',
    icon: 'bell',
    order: 7,
  },
  {
    questionFr: "Combien de signaux par semaine ?",
    questionEn: "How many signals per week?",
    questionAr: "كم عدد الإشارات في الأسبوع؟",
    answerFr: "Le nombre de signaux varie selon les conditions de marché. En moyenne, vous pouvez compter sur <strong>5 à 15 signaux par semaine</strong>, principalement sur l'or (GOLD/XAUUSD) et quelques paires Forex majeures.",
    answerEn: "The number of signals varies depending on market conditions. On average, you can expect <strong>5 to 15 signals per week</strong>, mainly on gold (GOLD/XAUUSD) and a few major Forex pairs.",
    answerAr: "يختلف عدد الإشارات حسب ظروف السوق. في المتوسط، يمكنك توقع <strong>5 إلى 15 إشارة في الأسبوع</strong>، بشكل رئيسي على الذهب (GOLD/XAUUSD) وبعض أزواج الفوركس الرئيسية.",
    category: 'signaux',
    icon: 'clock',
    order: 8,
  },
  {
    questionFr: "C'est quoi le 'low risk' et 'medium risk' ?",
    questionEn: "What is 'low risk' and 'medium risk'?",
    questionAr: "ما هو \"مخاطر منخفضة\" و\"مخاطر متوسطة\"؟",
    answerFr: "Le <strong>low risk</strong> = 1$/pip pour un compte de 10 000$ (0,01% de risque par pip). Le <strong>medium risk</strong> = 2$/pip pour 10 000$. Ces niveaux déterminent la taille de vos positions. Plus le risque est bas, plus votre compte est protégé mais les gains sont aussi réduits.",
    answerEn: "<strong>Low risk</strong> = $1/pip for a $10,000 account (0.01% risk per pip). <strong>Medium risk</strong> = $2/pip for $10,000. These levels determine your position sizes. The lower the risk, the more your account is protected, but gains are also reduced.",
    answerAr: "<strong>مخاطر منخفضة</strong> = 1$/نقطة لحساب 10,000$ (0.01% مخاطرة لكل نقطة). <strong>مخاطر متوسطة</strong> = 2$/نقطة لـ 10,000$. هذه المستويات تحدد حجم مراكزك. كلما انخفضت المخاطر، كلما كان حسابك محمياً أكثر لكن الأرباح تكون أقل.",
    category: 'capital',
    icon: 'percent',
    order: 9,
  },
  {
    questionFr: "Faut-il avoir de l'expérience en trading ?",
    questionEn: "Do I need trading experience?",
    questionAr: "هل أحتاج خبرة في التداول؟",
    answerFr: "Non, <strong>aucune expérience n'est requise</strong>. Nous expliquons chaque signal en live sur YouTube. Cependant, nous vous recommandons de vous familiariser avec les bases du Forex avant de trader avec des fonds réels. Le risque zéro n'existe pas en trading.",
    answerEn: "No, <strong>no experience is required</strong>. We explain each signal live on YouTube. However, we recommend familiarizing yourself with Forex basics before trading with real funds. Zero risk doesn't exist in trading.",
    answerAr: "لا، <strong>لا خبرة مطلوبة</strong>. نشرح كل إشارة مباشرة على يوتيوب. ومع ذلك، نوصي بالتعرف على أساسيات الفوركس قبل التداول بأموال حقيقية. المخاطر الصفرية غير موجودة في التداول.",
    category: 'signaux',
    icon: 'graduation',
    order: 10,
  },
  {
    questionFr: "Depuis quel pays peut-on s'inscrire sur XM ?",
    questionEn: "From which countries can I register on XM?",
    questionAr: "من أي دولة يمكنني التسجيل في XM؟",
    answerFr: "XM est disponible dans <strong>190+ pays</strong>. En Tunisie, Maroc, Algérie, France, Belgique et la plupart des pays arabes et européens. Vérifiez simplement sur le site XM si votre pays est éligible avant de vous inscrire.",
    answerEn: "XM is available in <strong>190+ countries</strong>. In Tunisia, Morocco, Algeria, France, Belgium and most Arab and European countries. Simply check the XM website to see if your country is eligible before signing up.",
    answerAr: "XM متاح في <strong>أكثر من 190 دولة</strong>. في تونس والمغرب والجزائر وفرنسا وبلجيكا ومعظم الدول العربية والأوروبية. تحقق ببساطة من موقع XM لمعرفة ما إذا كانت دولتك مؤهلة قبل التسجيل.",
    category: 'xm',
    icon: 'globe',
    order: 11,
  },
  {
    questionFr: "Est-ce que vous gérez mon argent ?",
    questionEn: "Do you manage my money?",
    questionAr: "هل تديرون أموالي؟",
    answerFr: "<strong>Non, absolument pas.</strong> Nous ne gérons aucun compte. Vous tradez vous-même sur votre propre compte XM avec votre propre argent. Nous partageons uniquement des signaux d'analyse — la décision finale vous appartient toujours.",
    answerEn: "<strong>No, absolutely not.</strong> We do not manage any account. You trade yourself on your own XM account with your own money. We only share analysis signals — the final decision always belongs to you.",
    answerAr: "<strong>لا، أبداً.</strong> نحن لا ندير أي حساب. أنت تتداول بنفسك على حساب XM الخاص بك بأموالك الخاصة. نحن نشارك فقط إشارات التحليل — القرار النهائي يعود لك دائماً.",
    category: 'gratuit',
    icon: 'help',
    order: 12,
  },
];

// ─── BLOG ARTICLES ─────────────────────────────────────────────
const blogArticles = [
  {
    titleFr: "Pourquoi l'or (XAUUSD) est l'actif préféré",
    titleEn: "Why Gold (XAUUSD) is the Preferred Asset",
    titleAr: "لماذا الذهب (XAUUSD) هو الأصل المفضل",
    excerptFr: "L'or reste l'actif le plus échangé par les traders professionnels. Découvrez pourquoi XAUUSD offre les meilleures opportunités de trading en 2025.",
    excerptEn: "Gold remains the most traded asset by professional traders. Discover why XAUUSD offers the best trading opportunities in 2025.",
    excerptAr: "يبقى الذهب الأصل الأكثر تداولاً من قبل المتداولين المحترفين. اكتشف لماذا يقدم XAUUSD أفضل فرص التداول في 2025.",
    contentFr: `<h2>Pourquoi l'or est-il si populaire ?</h2><p>L'or (XAUUSD) est considéré comme l'un des actifs les plus liquides et les plus volatils du marché Forex. Sa valeur est influencée par de nombreux facteurs macroéconomiques : la politique monétaire de la FED, l'inflation, les tensions géopolitiques, et la demande des banques centrales.</p><h3>Les avantages du trading sur l'or</h3><ul><li><strong>Haute volatilité</strong> — Des mouvements de 15-30$ par jour sont fréquents.</li><li><strong>Liquidité maximale</strong> — L'or se négocie 24h/24 avec des spreads très serrés.</li><li><strong>Analyse technique claire</strong> — Les niveaux de support et résistance sont bien définis.</li><li><strong>Corrélation avec le dollar</strong> — Une baisse du DXY renforce généralement l'or.</li></ul><h3>Notre stratégie sur XAUUSD</h3><p>Chez Chebbi Trading, nous privilégions l'approche <strong>"BUY on Dips"</strong> sur l'or. Cette stratégie nous a permis de générer <strong>+128% de performance</strong> en Low Risk en 2025.</p>`,
    contentEn: `<h2>Why is Gold so Popular?</h2><p>Gold (XAUUSD) is considered one of the most liquid and volatile assets in the Forex market. Its value is influenced by numerous macroeconomic factors: Fed monetary policy, inflation, geopolitical tensions, and central bank demand.</p><h3>Advantages of Trading Gold</h3><ul><li><strong>High volatility</strong> — Movements of $15-30 per day are frequent.</li><li><strong>Maximum liquidity</strong> — Gold trades 24/7 with very tight spreads.</li><li><strong>Clear technical analysis</strong> — Support and resistance levels are well-defined.</li><li><strong>Dollar correlation</strong> — A falling DXY generally strengthens gold.</li></ul><h3>Our XAUUSD Strategy</h3><p>At Chebbi Trading, we favor the <strong>"BUY on Dips"</strong> approach on gold. This strategy generated <strong>+128% performance</strong> in Low Risk in 2025.</p>`,
    contentAr: `<h2>لماذا الذهب شائع جداً؟</h2><p>يُعتبر الذهب (XAUUSD) أحد أكثر الأصول سيولة وتقلباً في سوق الفوركس. تتأثر قيمته بعوامل اقتصادية كلية عديدة: السياسة النقدية للفيدرالي، التضخم، التوترات الجيوسياسية، وطلب البنوك المركزية.</p><h3>مزايا تداول الذهب</h3><ul><li><strong>تقلب عالي</strong> — تحركات 15-30$ يومياً شائعة.</li><li><strong>سيولة قصوى</strong> — الذهب يُتداول 24/7 بفروقات ضيقة جداً.</li><li><strong>تحليل فني واضح</strong> — مستويات الدعم والمقاومة محددة بوضوح.</li></ul><h3>استراتيجيتنا على XAUUSD</h3><p>في Chebbi Trading، نفضل نهج <strong>"الشراء عند الانخفاض"</strong> على الذهب. حققت لنا هذه الاستراتيجية <strong>+128% أداء</strong> بمخاطر منخفضة في 2025.</p>`,
    category: 'gold',
    catLabelFr: 'Or / Gold',
    catLabelEn: 'Gold',
    catLabelAr: 'ذهب',
    date: '2025-12-15',
    readTime: '8 min',
    views: 3240,
    emoji: '🥇',
    catColor: 'rgba(245,158,11,0.15)',
    catText: '#f59e0b',
  },
  {
    titleFr: 'Comprendre le Risk Management',
    titleEn: 'Understanding Risk Management',
    titleAr: 'فهم إدارة المخاطر',
    excerptFr: "Le risk management est la clé de la survie en trading. Apprenez à gérer votre risque comme un professionnel.",
    excerptEn: "Risk management is the key to survival in trading. Learn to manage your risk like a professional.",
    excerptAr: "إدارة المخاطر هي مفتاح البقاء في التداول. تعلم كيف تدير مخاطرك كمحترف.",
    contentFr: `<h2>Qu'est-ce que le Risk Management ?</h2><p>Le risk management est l'ensemble des techniques utilisées pour limiter les pertes et protéger votre capital.</p><h3>Les règles fondamentales</h3><ul><li><strong>Règle des 1%</strong> — Ne risquez jamais plus de 1% de votre capital sur un seul trade.</li><li><strong>Ratio Risque/Récompense</strong> — Visez un minimum de 1:2.</li><li><strong>Stop Loss obligatoire</strong> — Chaque trade doit avoir un stop loss.</li><li><strong>Maximum 2-3 trades ouverts</strong> — Ne surchargez pas.</li></ul><h3>Calcul de la taille de position</h3><p><strong>Taille = (Capital × Risque %) / Distance au SL en pips</strong></p>`,
    contentEn: `<h2>What is Risk Management?</h2><p>Risk management is the set of techniques used to limit losses and protect your trading capital.</p><h3>Fundamental Rules</h3><ul><li><strong>1% Rule</strong> — Never risk more than 1% of your capital on a single trade.</li><li><strong>Risk/Reward Ratio</strong> — Aim for a minimum of 1:2.</li><li><strong>Mandatory Stop Loss</strong> — Every trade must have a stop loss.</li><li><strong>Maximum 2-3 open trades</strong> — Don't overload.</li></ul><h3>Position Size Calculation</h3><p><strong>Size = (Capital × Risk %) / Distance to SL in pips</strong></p>`,
    contentAr: `<h2>ما هي إدارة المخاطر؟</h2><p>إدارة المخاطر هي مجموعة التقنيات المستخدمة لتقليل الخسائر وحماية رأس مال التداول.</p><h3>القواعد الأساسية</h3><ul><li><strong>قاعدة 1%</strong> — لا تخاطر أبداً بأكثر من 1% من رأس مالك في صفقة واحدة.</li><li><strong>نسبة المخاطرة/المكافأة</strong> — استهدف 1:2 كحد أدنى.</li><li><strong>وقف الخسارة إلزامي</strong> — كل صفقة يجب أن يكون لها وقف خسارة.</li></ul><h3>حساب حجم المركز</h3><p><strong>الحجم = (رأس المال × نسبة المخاطرة%) / المسافة إلى وقف الخسارة بالنقاط</strong></p>`,
    category: 'education',
    catLabelFr: 'Éducation',
    catLabelEn: 'Education',
    catLabelAr: 'تعليم',
    date: '2025-11-28',
    readTime: '12 min',
    views: 4150,
    emoji: '🎓',
    catColor: 'rgba(59,130,246,0.15)',
    catText: '#3b82f6',
  },
  {
    titleFr: 'BUY on Dips: la stratégie principale',
    titleEn: 'BUY on Dips: The Main Strategy',
    titleAr: 'الشراء عند الانخفاض: الاستراتيجية الرئيسية',
    excerptFr: "La stratégie BUY on Dips est notre approche principale pour trader l'or.",
    excerptEn: "The BUY on Dips strategy is our main approach for trading gold.",
    excerptAr: "استراتيجية الشراء عند الانخفاض هي نهجنا الرئيسي لتداول الذهب.",
    contentFr: `<h2>Qu'est-ce que BUY on Dips ?</h2><p>La stratégie "Buy on Dips" consiste à acheter un actif lorsqu'il corrige temporairement dans un trend haussier.</p><h3>Les conditions d'entrée</h3><ul><li><strong>Trend haussier confirmé</strong> — EMA 50, 100, 200 orientées à la hausse.</li><li><strong>Zone de support identifiée</strong></li><li><strong>Confirmation technique</strong> — Marteau, engulfing, RSI en survente.</li></ul><h3>Résultats</h3><p>Taux de réussite d'environ 70% sur l'or en 2025, contribuant à notre performance de +128%.</p>`,
    contentEn: `<h2>What is BUY on Dips?</h2><p>The "Buy on Dips" strategy involves buying an asset when it temporarily corrects in a bullish trend.</p><h3>Entry Conditions</h3><ul><li><strong>Confirmed bullish trend</strong> — EMA 50, 100, 200 pointing upward.</li><li><strong>Identified support zone</strong></li><li><strong>Technical confirmation</strong> — Hammer, engulfing, RSI in oversold.</li></ul><h3>Results</h3><p>Approximately 70% success rate on gold in 2025, contributing to our +128% performance.</p>`,
    contentAr: `<h2>ما هو الشراء عند الانخفاض؟</h2><p>تتمثل استراتيجية "الشراء عند الانخفاض" في شراء أصل عندما يصحح مؤقتاً في اتجاه صاعد.</p><h3>شروط الدخول</h3><ul><li><strong>اتجاه صاعد مؤكد</strong> — EMA 50، 100، 200 متجهة للأعلى.</li><li><strong>منطقة دعم محددة</strong></li><li><strong>تأكيد فني</strong> — شمعة المطرقة، الابتلاع، RSI في منطقة التشبع البيعي.</li></ul><h3>النتائج</h3><p>نسبة نجاح حوالي 70% على الذهب في 2025، ساهمت في أدائنا +128%.</p>`,
    category: 'strategie',
    catLabelFr: 'Stratégies',
    catLabelEn: 'Strategies',
    catLabelAr: 'استراتيجيات',
    date: '2025-11-10',
    readTime: '10 min',
    views: 2890,
    emoji: '⚙️',
    catColor: 'rgba(139,92,246,0.15)',
    catText: '#8b5cf6',
  },
  {
    titleFr: 'Bilan 2025: comment ChebbiTrade a généré +128%',
    titleEn: '2025 Review: How ChebbiTrade Generated +128%',
    titleAr: 'مراجعة 2025: كيف حقق ChebbiTrade +128%',
    excerptFr: "Bilan complet de l'année 2025 : nos trades, notre stratégie, et les chiffres.",
    excerptEn: "Complete review of 2025: our trades, strategy, and the numbers.",
    excerptAr: "مراجعة كاملة لعام 2025: صفقاتنا واستراتيجيتنا والأرقام.",
    contentFr: `<h2>Bilan 2025 : +128% en Low Risk</h2><p>L'année 2025 a été exceptionnelle pour Chebbi Trading.</p><h3>Chiffres clés</h3><ul><li><strong>Performance Low Risk</strong> : +128%</li><li><strong>Performance Medium Risk</strong> : +340%</li><li><strong>Trades documentés</strong> : 180+</li><li><strong>Win Rate</strong> : ~70%</li><li><strong>Pips gagnés</strong> : 4 200+</li></ul><h3>Stratégie</h3><p>Approche principale : <strong>"BUY on Dips"</strong> sur l'or (XAUUSD), avec gestion stricte du risque.</p>`,
    contentEn: `<h2>2025 Review: +128% in Low Risk</h2><p>2025 was an exceptional year for Chebbi Trading.</p><h3>Key Figures</h3><ul><li><strong>Low Risk Performance</strong>: +128%</li><li><strong>Medium Risk Performance</strong>: +340%</li><li><strong>Documented Trades</strong>: 180+</li><li><strong>Win Rate</strong>: ~70%</li><li><strong>Pips Won</strong>: 4,200+</li></ul><h3>Strategy</h3><p>Main approach: <strong>"BUY on Dips"</strong> on gold (XAUUSD), with strict risk management.</p>`,
    contentAr: `<h2>مراجعة 2025: +128% بمخاطر منخفضة</h2><p>كان عام 2025 استثنائياً لـ Chebbi Trading.</p><h3>الأرقام الرئيسية</h3><ul><li><strong>أداء المخاطر المنخفضة</strong>: +128%</li><li><strong>أداء المخاطر المتوسطة</strong>: +340%</li><li><strong>صفقات موثقة</strong>: 180+</li><li><strong>نسبة الفوز</strong>: ~70%</li><li><strong>نقاط ربحت</strong>: 4,200+</li></ul><h3>الاستراتيجية</h3><p>النهج الرئيسي: <strong>"الشراء عند الانخفاض"</strong> على الذهب (XAUUSD)، مع إدارة صارمة للمخاطر.</p>`,
    category: 'analyse',
    catLabelFr: 'Analyses',
    catLabelEn: 'Analysis',
    catLabelAr: 'تحليلات',
    date: '2026-01-05',
    readTime: '15 min',
    views: 5620,
    emoji: '📊',
    catColor: 'rgba(16,185,129,0.15)',
    catText: '#10b981',
  },
  {
    titleFr: 'Comment ouvrir son premier compte XM',
    titleEn: 'How to Open Your First XM Account',
    titleAr: 'كيفية فتح حساب XM الأول',
    excerptFr: "Guide complet pour ouvrir votre premier compte de trading chez XM.",
    excerptEn: "Complete guide to opening your first trading account with XM.",
    excerptAr: "دليل كامل لفتح أول حساب تداول لديك مع XM.",
    contentFr: `<h2>Ouvrir un compte XM en 5 minutes</h2><p>XM est un broker régulé (CySEC, FCA, ASIC) avec dépôt minimum à partir de 5$.</p><h3>Étapes</h3><ul><li><strong>Étape 1</strong> — Cliquez sur notre lien d'affiliation XM.</li><li><strong>Étape 2</strong> — Vérifiez votre identité.</li><li><strong>Étape 3</strong> — Choisissez votre type de compte.</li><li><strong>Étape 4</strong> — Effectuez votre dépôt.</li><li><strong>Étape 5</strong> — Envoyez votre numéro de compte sur Telegram.</li></ul>`,
    contentEn: `<h2>Open an XM Account in 5 Minutes</h2><p>XM is a regulated broker (CySEC, FCA, ASIC) with minimum deposit from $5.</p><h3>Steps</h3><ul><li><strong>Step 1</strong> — Click our XM affiliate link.</li><li><strong>Step 2</strong> — Verify your identity.</li><li><strong>Step 3</strong> — Choose your account type.</li><li><strong>Step 4</strong> — Make your deposit.</li><li><strong>Step 5</strong> — Send your account number on Telegram.</li></ul>`,
    contentAr: `<h2>افتح حساب XM في 5 دقائق</h2><p>XM وسيط مرخص (CySEC، FCA، ASIC) بحد أدنى للإيداع 5$.</p><h3>الخطوات</h3><ul><li><strong>الخطوة 1</strong> — انقر على رابط الإحالة.</li><li><strong>الخطوة 2</strong> — تحقق من هويتك.</li><li><strong>الخطوة 3</strong> — اختر نوع حسابك.</li><li><strong>الخطوة 4</strong> — قم بالإيداع.</li><li><strong>الخطوة 5</strong> — أرسل رقم حسابك على تيليجرام.</li></ul>`,
    category: 'education',
    catLabelFr: 'Éducation',
    catLabelEn: 'Education',
    catLabelAr: 'تعليم',
    date: '2025-10-20',
    readTime: '6 min',
    views: 8930,
    emoji: '🎓',
    catColor: 'rgba(59,130,246,0.15)',
    catText: '#3b82f6',
  },
  {
    titleFr: "L'impact de la politique de la FED sur l'or en 2026",
    titleEn: "The Impact of Fed Policy on Gold in 2026",
    titleAr: "تأثير سياسة الفيدرالي على الذهب في 2026",
    excerptFr: "Analyse des décisions de la FED et leur impact sur le cours de l'or en 2026.",
    excerptEn: "Analysis of Fed decisions and their impact on gold prices in 2026.",
    excerptAr: "تحليل قرارات الفيدرالي وتأثيرها على أسعار الذهب في 2026.",
    contentFr: `<h2>FED et Or : une relation clé</h2><p>La politique monétaire de la FED est l'un des principaux moteurs du cours de l'or.</p><h3>Mécanisme</h3><ul><li><strong>Baisse des taux</strong> → Le dollar s'affaiblit → L'or monte.</li><li><strong>Hausse des taux</strong> → Le dollar se renforce → L'or baisse.</li></ul><h3>Perspectives 2026</h3><p>Prix cible entre 2 800$ et 3 200$ pour l'once d'or d'ici fin 2026.</p>`,
    contentEn: `<h2>Fed and Gold: A Key Relationship</h2><p>The Fed's monetary policy is one of the main drivers of gold prices.</p><h3>Mechanism</h3><ul><li><strong>Rate cuts</strong> → Dollar weakens → Gold rises.</li><li><strong>Rate hikes</strong> → Dollar strengthens → Gold falls.</li></ul><h3>2026 Outlook</h3><p>Target price between $2,800 and $3,200 per ounce by end of 2026.</p>`,
    contentAr: `<h2>الفيدرالي والذهب: علاقة أساسية</h2><p>السياسة النقدية للفيدرالي هي أحد المحركات الرئيسية لأسعار الذهب.</p><h3>الآلية</h3><ul><li><strong>خفض الفائدة</strong> → الدولار يضعف → الذهب يرتفع.</li><li><strong>رفع الفائدة</strong> → الدولار يقوى → الذهب ينخفض.</li></ul><h3>توقعات 2026</h3><p>سعر مستهدف بين 2,800$ و3,200$ للأونصة بنهاية 2026.</p>`,
    category: 'analyse',
    catLabelFr: 'Analyses',
    catLabelEn: 'Analysis',
    catLabelAr: 'تحليلات',
    date: '2026-01-18',
    readTime: '11 min',
    views: 2150,
    emoji: '📊',
    catColor: 'rgba(16,185,129,0.15)',
    catText: '#10b981',
  },
];

// ─── MAIN SEED FUNCTION ────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Admin User
  const hash = bcrypt.hashSync('chebbi2024', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { password: hash },
    create: { username: 'admin', password: hash },
  });
  console.log('✅ AdminUser: admin / chebbi2024');

  // 2. Site Settings
  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ SiteSettings: ${siteSettings.length} keys`);

  // 3. Testimonials
  await prisma.testimonial.deleteMany();
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`✅ Testimonials: ${testimonials.length} (FR/EN/AR in each)`);

  // 4. FAQs
  await prisma.faq.deleteMany();
  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }
  console.log(`✅ FAQs: ${faqs.length} (FR/EN/AR in each)`);

  // 5. Blog Articles
  await prisma.blogArticle.deleteMany();
  for (const a of blogArticles) {
    await prisma.blogArticle.create({ data: a });
  }
  console.log(`✅ BlogArticles: ${blogArticles.length} (FR/EN/AR in each)`);

  // 6. Crypto Monthly Performance
  const cryptoMonthly = [
    // 2023 (May-Dec, starts at monthIndex 4)
    { year: 2023, monthIndex: 4, percentage: 12.34 },
    { year: 2023, monthIndex: 5, percentage: 19.96 },
    { year: 2023, monthIndex: 6, percentage: 14.00 },
    { year: 2023, monthIndex: 7, percentage: -22.75 },
    { year: 2023, monthIndex: 8, percentage: -1.32 },
    { year: 2023, monthIndex: 9, percentage: 15.04 },
    { year: 2023, monthIndex: 10, percentage: 15.26 },
    { year: 2023, monthIndex: 11, percentage: 29.26 },
    // 2024 (full year)
    { year: 2024, monthIndex: 0, percentage: -11.44 },
    { year: 2024, monthIndex: 1, percentage: 24.68 },
    { year: 2024, monthIndex: 2, percentage: 14.97 },
    { year: 2024, monthIndex: 3, percentage: -9.53 },
    { year: 2024, monthIndex: 4, percentage: 8.32 },
    { year: 2024, monthIndex: 5, percentage: -5.98 },
    { year: 2024, monthIndex: 6, percentage: 5.75 },
    { year: 2024, monthIndex: 7, percentage: 0.50 },
    { year: 2024, monthIndex: 8, percentage: 8.95 },
    { year: 2024, monthIndex: 9, percentage: 7.59 },
    { year: 2024, monthIndex: 10, percentage: 40.40 },
    { year: 2024, monthIndex: 11, percentage: 11.57 },
    // 2025 (full year)
    { year: 2025, monthIndex: 0, percentage: -13.79 },
    { year: 2025, monthIndex: 1, percentage: -1.95 },
    { year: 2025, monthIndex: 2, percentage: 8.51 },
    { year: 2025, monthIndex: 3, percentage: 8.50 },
    { year: 2025, monthIndex: 4, percentage: 15.43 },
    { year: 2025, monthIndex: 5, percentage: -14.79 },
    { year: 2025, monthIndex: 6, percentage: 32.11 },
    { year: 2025, monthIndex: 7, percentage: 6.67 },
    { year: 2025, monthIndex: 8, percentage: 14.70 },
    { year: 2025, monthIndex: 9, percentage: -14.06 },
    { year: 2025, monthIndex: 10, percentage: 23.86 },
    { year: 2025, monthIndex: 11, percentage: 9.62 },
  ];

  for (const cm of cryptoMonthly) {
    await prisma.cryptoMonthly.upsert({
      where: { year_monthIndex: { year: cm.year, monthIndex: cm.monthIndex } },
      update: { percentage: cm.percentage },
      create: cm,
    });
  }
  console.log(`✅ CryptoMonthly: ${cryptoMonthly.length} records (2023-2025)`);

  // 7. Signals (sample data)
  const existingSignals = await prisma.signal.count();
  if (existingSignals === 0) {
    const signals = [
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2645.50', takeProfit: '2672.00', stopLoss: '2635.00', result: '+265', date: '2025-12-02' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2658.30', takeProfit: '2630.00', stopLoss: '2668.00', result: '+283', date: '2025-12-05' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2620.00', takeProfit: '2645.00', stopLoss: '2610.00', result: '+250', date: '2025-12-09' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2670.80', takeProfit: '2640.00', stopLoss: '2682.00', result: '+308', date: '2025-12-12' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2635.20', takeProfit: '2660.00', stopLoss: '2625.00', result: '-100', date: '2025-12-15' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2692.50', takeProfit: '2660.00', stopLoss: '2700.00', result: '+325', date: '2025-12-18' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2610.00', takeProfit: '2640.00', stopLoss: '2598.00', result: '+300', date: '2026-01-06' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2655.80', takeProfit: '2625.00', stopLoss: '2665.00', result: '+308', date: '2026-01-10' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2628.40', takeProfit: '2658.00', stopLoss: '2618.00', result: '+296', date: '2026-01-15' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2680.60', takeProfit: '2650.00', stopLoss: '2692.00', result: '+306', date: '2026-01-20' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2640.30', takeProfit: '2670.00', stopLoss: '2630.00', result: '+297', date: '2026-02-03' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2710.00', takeProfit: '2680.00', stopLoss: '2720.00', result: '+300', date: '2026-02-10' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2685.50', takeProfit: '2710.00', stopLoss: '2675.00', result: '-100', date: '2026-02-14' },
      { instrument: 'XAU/USD', direction: 'BUY', entry: '2665.00', takeProfit: '2695.00', stopLoss: '2655.00', result: '+300', date: '2026-03-05' },
      { instrument: 'XAU/USD', direction: 'SELL', entry: '2720.80', takeProfit: '2690.00', stopLoss: '2730.00', result: 'open', date: '2026-03-28' },
    ];
    for (const s of signals) {
      await prisma.signal.create({ data: s });
    }
    console.log(`✅ Signals: ${signals.length} sample signals seeded`);
  } else {
    console.log(`⏭️  Signals: ${existingSignals} already exist, skipping`);
  }

  // 8. Sample Trades (from the spreadsheet pattern)
  const existingTrades = await prisma.trade.count();
  if (existingTrades === 0) {
    const trades = [
      // 2023
      { year: 2023, month: 0, contract: 'GOLD', period: '1ère sem. Janvier', direction: 'BUY', entry: 1850.50, exit: 1862.30, pips: 118, result: 'W' },
      { year: 2023, month: 0, contract: 'GOLD', period: '2ème sem. Janvier', direction: 'SELL', entry: 1870.00, exit: 1855.60, pips: 144, result: 'W' },
      { year: 2023, month: 1, contract: 'GOLD', period: '1ère sem. Février', direction: 'BUY', entry: 1860.20, exit: 1878.90, pips: 187, result: 'W' },
      { year: 2023, month: 1, contract: 'GOLD', period: '2ème sem. Février', direction: 'SELL', entry: 1885.00, exit: 1890.50, pips: -55, result: 'L' },
      { year: 2023, month: 2, contract: 'GOLD', period: '1ère sem. Mars', direction: 'BUY', entry: 1870.30, exit: 1835.00, pips: -353, result: 'L' },
      { year: 2023, month: 2, contract: 'GOLD', period: '2ème sem. Mars', direction: 'BUY', entry: 1940.00, exit: 1955.60, pips: 156, result: 'W' },
      { year: 2023, month: 3, contract: 'GOLD', period: 'Avril', direction: 'BUY', entry: 1980.50, exit: 2010.00, pips: 295, result: 'W' },
      { year: 2023, month: 4, contract: 'GOLD', period: 'Mai', direction: 'SELL', entry: 2020.00, exit: 1985.50, pips: 345, result: 'W' },
      { year: 2023, month: 5, contract: 'GOLD', period: 'Juin', direction: 'BUY', entry: 1950.80, exit: 1920.20, pips: -306, result: 'L' },
      { year: 2023, month: 6, contract: 'GOLD', period: 'Juillet', direction: 'BUY', entry: 1930.00, exit: 1965.40, pips: 354, result: 'W' },
      { year: 2023, month: 7, contract: 'GOLD', period: 'Août', direction: 'SELL', entry: 1945.60, exit: 1920.30, pips: 253, result: 'W' },
      { year: 2023, month: 8, contract: 'GOLD', period: 'Septembre', direction: 'BUY', entry: 1915.00, exit: 1945.80, pips: 308, result: 'W' },
      { year: 2023, month: 9, contract: 'GOLD', period: 'Octobre', direction: 'SELL', entry: 1970.00, exit: 1948.50, pips: 215, result: 'W' },
      { year: 2023, month: 10, contract: 'GOLD', period: 'Novembre', direction: 'BUY', entry: 1985.20, exit: 2028.90, pips: 437, result: 'W' },
      { year: 2023, month: 11, contract: 'GOLD', period: 'Décembre', direction: 'BUY', entry: 2035.00, exit: 2089.50, pips: 545, result: 'W' },
      // 2024
      { year: 2024, month: 0, contract: 'GOLD', period: 'Janvier', direction: 'BUY', entry: 2060.00, exit: 2085.30, pips: 253, result: 'W' },
      { year: 2024, month: 1, contract: 'GOLD', period: 'Février', direction: 'BUY', entry: 2020.50, exit: 2050.80, pips: 303, result: 'W' },
      { year: 2024, month: 2, contract: 'GOLD', period: 'Mars', direction: 'SELL', entry: 2175.00, exit: 2130.50, pips: 445, result: 'W' },
      { year: 2024, month: 3, contract: 'GOLD', period: 'Avril', direction: 'BUY', entry: 2300.00, exit: 2280.00, pips: -200, result: 'L' },
      { year: 2024, month: 4, contract: 'GOLD', period: 'Mai', direction: 'BUY', entry: 2330.80, exit: 2370.40, pips: 396, result: 'W' },
      { year: 2024, month: 5, contract: 'GOLD', period: 'Juin', direction: 'SELL', entry: 2340.00, exit: 2320.50, pips: 195, result: 'W' },
      { year: 2024, month: 6, contract: 'GOLD', period: 'Juillet', direction: 'BUY', entry: 2395.50, exit: 2445.00, pips: 495, result: 'W' },
      { year: 2024, month: 7, contract: 'GOLD', period: 'Août', direction: 'BUY', entry: 2430.00, exit: 2510.60, pips: 806, result: 'W' },
      { year: 2024, month: 8, contract: 'GOLD', period: 'Septembre', direction: 'BUY', entry: 2500.00, exit: 2560.00, pips: 600, result: 'W' },
      { year: 2024, month: 9, contract: 'GOLD', period: 'Octobre', direction: 'SELL', entry: 2750.00, exit: 2690.00, pips: 600, result: 'W' },
      { year: 2024, month: 10, contract: 'GOLD', period: 'Novembre', direction: 'BUY', entry: 2650.00, exit: 2590.50, pips: -595, result: 'L' },
      { year: 2024, month: 11, contract: 'GOLD', period: 'Décembre', direction: 'BUY', entry: 2630.00, exit: 2680.50, pips: 505, result: 'W' },
      // 2025 
      { year: 2025, month: 0, contract: 'GOLD', period: 'Janvier', direction: 'SELL', entry: 2650.00, exit: 2610.80, pips: 392, result: 'W' },
      { year: 2025, month: 1, contract: 'GOLD', period: 'Février', direction: 'BUY', entry: 2680.50, exit: 2740.00, pips: 595, result: 'W' },
      { year: 2025, month: 2, contract: 'GOLD', period: 'Mars', direction: 'BUY', entry: 2860.00, exit: 2950.30, pips: 903, result: 'W' },
      { year: 2025, month: 3, contract: 'GOLD', period: 'Avril', direction: 'BUY', entry: 2980.00, exit: 3085.00, pips: 1050, result: 'W' },
      { year: 2025, month: 4, contract: 'GOLD', period: 'Mai', direction: 'SELL', entry: 3120.50, exit: 3070.00, pips: 505, result: 'W' },
      { year: 2025, month: 5, contract: 'GOLD', period: 'Juin', direction: 'BUY', entry: 3010.00, exit: 3050.00, pips: 400, result: 'W' },
      { year: 2025, month: 6, contract: 'GOLD', period: 'Juillet', direction: 'BUY', entry: 3060.00, exit: 3160.50, pips: 1005, result: 'W' },
      { year: 2025, month: 7, contract: 'GOLD', period: 'Août', direction: 'SELL', entry: 3180.00, exit: 3130.00, pips: 500, result: 'W' },
      { year: 2025, month: 8, contract: 'GOLD', period: 'Septembre', direction: 'BUY', entry: 3150.00, exit: 3210.80, pips: 608, result: 'W' },
      { year: 2025, month: 9, contract: 'GOLD', period: 'Octobre', direction: 'BUY', entry: 3220.50, exit: 3150.00, pips: -705, result: 'L' },
      { year: 2025, month: 10, contract: 'GOLD', period: 'Novembre', direction: 'BUY', entry: 3160.00, exit: 3280.00, pips: 1200, result: 'W' },
      { year: 2025, month: 11, contract: 'GOLD', period: 'Décembre', direction: 'BUY', entry: 3290.00, exit: 3380.50, pips: 905, result: 'W' },
      // 2026
      { year: 2026, month: 0, contract: 'GOLD', period: 'Janvier', direction: 'BUY', entry: 3400.00, exit: 3460.00, pips: 600, result: 'W' },
      { year: 2026, month: 1, contract: 'GOLD', period: 'Février', direction: 'BUY', entry: 3470.50, exit: 3530.00, pips: 595, result: 'W' },
      { year: 2026, month: 2, contract: 'GOLD', period: 'Mars', direction: 'SELL', entry: 3550.00, exit: 3505.00, pips: 450, result: 'W' },
      { year: 2026, month: 2, contract: 'GOLD', period: '2e sem. Mars', direction: 'BUY', entry: 3520.00, exit: 3540.80, pips: 208, result: 'W' },
    ];
    for (const tr of trades) {
      await prisma.trade.create({ data: tr });
    }
    console.log(`✅ Trades: ${trades.length} sample trades seeded (2023-2026)`);
  } else {
    console.log(`⏭️  Trades: ${existingTrades} already exist, skipping`);
  }

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
