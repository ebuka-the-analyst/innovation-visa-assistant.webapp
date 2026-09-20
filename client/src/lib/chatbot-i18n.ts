import type { LanguageCode } from "@/lib/translations";

export type ChatbotCopy = {
  important: string;
  title: string;
  greeting: string;
  disclaimer: string;
  placeholder: string;
  suggestions: string[];
  error: string;
  minimize: string;
  restore: string;
  close: string;
  open: string;
};

const UK: Record<LanguageCode, ChatbotCopy> = {
  en: {
    important: "Important:",
    title: "UK Innovator Founder AI Assistant",
    greeting: "Hi! I can help you prepare for the UK Innovator Founder route, including your business plan, innovation evidence, endorsement preparation and supporting documents. What are you working on?",
    disclaimer: "AI-assisted preparation information, not regulated immigration advice. UK immigration requirements can change; verify current requirements with GOV.UK and relevant official sources.",
    placeholder: "Ask about Innovator Founder preparation...",
    suggestions: ["What should I prepare first?","How can I strengthen my innovation evidence?","What should my business plan demonstrate?"],
    error: "I couldn't complete that request just now. Please try again in a moment. For time-sensitive immigration requirements, use the relevant official government source.",
    minimize: "Minimize chat button", restore: "Restore chat button", close: "Close chat", open: "Open AI Assistant",
  },
  es: {
    important: "Importante:",
    title: "Asistente de IA para UK Innovator Founder",
    greeting: "¡Hola! Puedo ayudarte a preparar la ruta UK Innovator Founder, incluido tu plan de negocio, las pruebas de innovación, la preparación para el endorsement y los documentos de apoyo. ¿En qué estás trabajando?",
    disclaimer: "Información de preparación asistida por IA, no asesoramiento migratorio regulado. Los requisitos migratorios del Reino Unido pueden cambiar; verifica los requisitos actuales en GOV.UK y en las fuentes oficiales pertinentes.",
    placeholder: "Pregunta sobre la preparación de Innovator Founder...",
    suggestions: ["¿Qué debería preparar primero?","¿Cómo puedo reforzar mis pruebas de innovación?","¿Qué debería demostrar mi plan de negocio?"],
    error: "No he podido completar esa solicitud ahora mismo. Inténtalo de nuevo en un momento. Para requisitos migratorios sensibles al tiempo, utiliza la fuente oficial del Gobierno correspondiente.",
    minimize: "Minimizar chat", restore: "Restaurar chat", close: "Cerrar chat", open: "Abrir asistente de IA",
  },
  fr: {
    important: "Important :",
    title: "Assistant IA UK Innovator Founder",
    greeting: "Bonjour ! Je peux vous aider à préparer la voie UK Innovator Founder, notamment votre business plan, les preuves d’innovation, la préparation à l’endorsement et les pièces justificatives. Sur quoi travaillez-vous ?",
    disclaimer: "Informations de préparation assistées par IA, et non conseil réglementé en immigration. Les exigences d’immigration britanniques peuvent changer ; vérifiez les exigences actuelles sur GOV.UK et auprès des sources officielles pertinentes.",
    placeholder: "Posez une question sur la préparation Innovator Founder...",
    suggestions: ["Que dois-je préparer en premier ?","Comment renforcer mes preuves d’innovation ?","Que doit démontrer mon business plan ?"],
    error: "Je n’ai pas pu traiter cette demande pour le moment. Réessayez dans un instant. Pour les exigences d’immigration susceptibles de changer, consultez la source officielle gouvernementale pertinente.",
    minimize: "Réduire le chat", restore: "Restaurer le chat", close: "Fermer le chat", open: "Ouvrir l’assistant IA",
  },
  de: {
    important: "Wichtig:",
    title: "UK Innovator Founder KI-Assistent",
    greeting: "Hallo! Ich kann Sie bei der Vorbereitung auf die UK-Innovator-Founder-Route unterstützen, einschließlich Businessplan, Innovationsnachweisen, Vorbereitung auf das Endorsement und Begleitunterlagen. Woran arbeiten Sie?",
    disclaimer: "KI-gestützte Vorbereitungsinformationen, keine regulierte Einwanderungsberatung. Britische Einwanderungsanforderungen können sich ändern; prüfen Sie aktuelle Anforderungen auf GOV.UK und bei den relevanten offiziellen Stellen.",
    placeholder: "Fragen zur Innovator-Founder-Vorbereitung...",
    suggestions: ["Was sollte ich zuerst vorbereiten?","Wie kann ich meine Innovationsnachweise stärken?","Was sollte mein Businessplan nachweisen?"],
    error: "Diese Anfrage konnte gerade nicht abgeschlossen werden. Versuchen Sie es gleich noch einmal. Prüfen Sie zeitkritische Einwanderungsanforderungen bei der zuständigen offiziellen Regierungsquelle.",
    minimize: "Chat minimieren", restore: "Chat wiederherstellen", close: "Chat schließen", open: "KI-Assistent öffnen",
  },
  zh: {
    important: "重要提示：",
    title: "英国创新者创始人人工智能助手",
    greeting: "您好！我可以帮助您准备英国创新者创始人签证路线，包括商业计划、创新证据、背书准备和支持文件。您目前正在准备哪一部分？",
    disclaimer: "这是由人工智能辅助提供的申请准备信息，并非受监管的移民建议。英国移民要求可能会发生变化；请通过 GOV.UK 和相关官方来源核实最新要求。",
    placeholder: "询问创新者创始人签证准备...",
    suggestions: ["我应该先准备什么？","如何加强我的创新证据？","我的商业计划应该证明什么？"],
    error: "目前无法完成该请求，请稍后再试。对于可能随时变化的移民要求，请以相关政府官方来源为准。",
    minimize: "最小化聊天", restore: "恢复聊天", close: "关闭聊天", open: "打开人工智能助手",
  },
  ar: {
    important: "مهم:",
    title: "مساعد الذكاء الاصطناعي لمسار UK Innovator Founder",
    greeting: "مرحباً! يمكنني مساعدتك في التحضير لمسار UK Innovator Founder، بما في ذلك خطة العمل وأدلة الابتكار والتحضير للتأييد والمستندات الداعمة. ما الذي تعمل عليه حالياً؟",
    disclaimer: "معلومات تحضيرية بمساعدة الذكاء الاصطناعي وليست استشارة هجرة خاضعة للتنظيم. قد تتغير متطلبات الهجرة البريطانية؛ تحقّق من المتطلبات الحالية عبر GOV.UK والمصادر الرسمية ذات الصلة.",
    placeholder: "اسأل عن التحضير لمسار Innovator Founder...",
    suggestions: ["ما الذي ينبغي أن أجهزه أولاً؟","كيف يمكنني تقوية أدلة الابتكار؟","ماذا يجب أن تُظهر خطة عملي؟"],
    error: "تعذر إكمال هذا الطلب الآن. حاول مرة أخرى بعد قليل. بالنسبة لمتطلبات الهجرة المتغيرة زمنياً، استخدم المصدر الحكومي الرسمي ذي الصلة.",
    minimize: "تصغير الدردشة", restore: "استعادة الدردشة", close: "إغلاق الدردشة", open: "فتح مساعد الذكاء الاصطناعي",
  },
  pt: {
    important: "Importante:",
    title: "Assistente de IA UK Innovator Founder",
    greeting: "Olá! Posso ajudar na preparação para a rota UK Innovator Founder, incluindo o plano de negócios, provas de inovação, preparação para o endorsement e documentos de suporte. Em que está a trabalhar?",
    disclaimer: "Informação de preparação assistida por IA, não aconselhamento de imigração regulamentado. Os requisitos de imigração do Reino Unido podem mudar; confirme os requisitos atuais no GOV.UK e em fontes oficiais relevantes.",
    placeholder: "Pergunte sobre a preparação Innovator Founder...",
    suggestions: ["O que devo preparar primeiro?","Como posso reforçar as minhas provas de inovação?","O que deve demonstrar o meu plano de negócios?"],
    error: "Não foi possível concluir este pedido agora. Tente novamente dentro de instantes. Para requisitos de imigração sujeitos a alterações, consulte a fonte oficial do governo relevante.",
    minimize: "Minimizar chat", restore: "Restaurar chat", close: "Fechar chat", open: "Abrir assistente de IA",
  },
  ja: {
    important: "重要:",
    title: "英国Innovator Founder AIアシスタント",
    greeting: "こんにちは。英国Innovator Founderルートの準備をお手伝いできます。ビジネスプラン、イノベーションの証拠、エンドースメント準備、補足書類などに対応します。現在どの部分に取り組んでいますか？",
    disclaimer: "AIによる申請準備情報であり、規制対象の移民助言ではありません。英国の移民要件は変更される可能性があるため、最新要件はGOV.UKおよび関連する公式情報源で確認してください。",
    placeholder: "Innovator Founderの準備について質問...",
    suggestions: ["まず何を準備すべきですか？","イノベーションの証拠をどう強化できますか？","ビジネスプランでは何を示すべきですか？"],
    error: "現在このリクエストを完了できませんでした。少し待ってからもう一度お試しください。変更される可能性のある移民要件は、該当する政府公式情報源で確認してください。",
    minimize: "チャットを最小化", restore: "チャットを復元", close: "チャットを閉じる", open: "AIアシスタントを開く",
  },
};

const GLOBAL: Record<LanguageCode, ChatbotCopy> = {
  en: {
    important:"Important:", title:"Visa Assistant Global",
    greeting:"Welcome to Visa Assistant Global. I can help you explore destinations and visa routes available on this platform. The UK Innovator Founder assistant is live, while other dedicated country tools are being added. What would you like help with?",
    disclaimer:"AI-assisted preparation information, not regulated immigration advice. Requirements can change, so verify time-sensitive information with the relevant official immigration authority.",
    placeholder:"Ask about destinations, visa routes or the platform...",
    suggestions:["What can Visa Assistant Global help me with?","Which visa route is live now?","How do I explore a country's visa routes?"],
    error:"I couldn't complete that request just now. Please try again in a moment. For time-sensitive immigration requirements, use the relevant official government source.",
    minimize:"Minimize chat button", restore:"Restore chat button", close:"Close chat", open:"Open AI Assistant",
  },
  es: {
    important:"Importante:", title:"Visa Assistant Global",
    greeting:"Bienvenido a Visa Assistant Global. Puedo ayudarte a explorar destinos y rutas de visado disponibles en la plataforma. El asistente UK Innovator Founder está activo y se están añadiendo herramientas para otros países. ¿En qué necesitas ayuda?",
    disclaimer:"Información de preparación asistida por IA, no asesoramiento migratorio regulado. Los requisitos pueden cambiar; verifica la información sensible al tiempo con la autoridad migratoria oficial correspondiente.",
    placeholder:"Pregunta sobre destinos, rutas de visado o la plataforma...",
    suggestions:["¿En qué puede ayudarme Visa Assistant Global?","¿Qué ruta de visado está activa ahora?","¿Cómo exploro las rutas de visado de un país?"],
    error:"No he podido completar esa solicitud ahora mismo. Inténtalo de nuevo en un momento. Para requisitos migratorios sensibles al tiempo, utiliza la fuente oficial correspondiente.",
    minimize:"Minimizar chat", restore:"Restaurar chat", close:"Cerrar chat", open:"Abrir asistente de IA",
  },
  fr: {
    important:"Important :", title:"Visa Assistant Global",
    greeting:"Bienvenue sur Visa Assistant Global. Je peux vous aider à explorer les destinations et les voies de visa disponibles sur la plateforme. L’assistant UK Innovator Founder est actif, tandis que d’autres outils pays sont en cours d’ajout. Comment puis-je vous aider ?",
    disclaimer:"Informations de préparation assistées par IA, et non conseil réglementé en immigration. Les exigences peuvent changer ; vérifiez les informations sensibles au temps auprès de l’autorité officielle compétente.",
    placeholder:"Posez une question sur les destinations, les visas ou la plateforme...",
    suggestions:["Comment Visa Assistant Global peut-il m’aider ?","Quelle voie de visa est active actuellement ?","Comment explorer les voies de visa d’un pays ?"],
    error:"Je n’ai pas pu traiter cette demande pour le moment. Réessayez dans un instant. Pour les exigences susceptibles de changer, consultez la source officielle pertinente.",
    minimize:"Réduire le chat", restore:"Restaurer le chat", close:"Fermer le chat", open:"Ouvrir l’assistant IA",
  },
  de: {
    important:"Wichtig:", title:"Visa Assistant Global",
    greeting:"Willkommen bei Visa Assistant Global. Ich kann Ihnen helfen, Ziele und Visumrouten auf der Plattform zu erkunden. Der UK-Innovator-Founder-Assistent ist live; weitere länderspezifische Tools werden ergänzt. Wobei benötigen Sie Hilfe?",
    disclaimer:"KI-gestützte Vorbereitungsinformationen, keine regulierte Einwanderungsberatung. Anforderungen können sich ändern; prüfen Sie zeitkritische Informationen bei der zuständigen offiziellen Einwanderungsbehörde.",
    placeholder:"Fragen zu Zielen, Visumrouten oder der Plattform...",
    suggestions:["Wobei kann Visa Assistant Global helfen?","Welche Visumroute ist derzeit live?","Wie erkunde ich die Visumrouten eines Landes?"],
    error:"Diese Anfrage konnte gerade nicht abgeschlossen werden. Versuchen Sie es gleich noch einmal. Prüfen Sie zeitkritische Anforderungen bei der zuständigen offiziellen Quelle.",
    minimize:"Chat minimieren", restore:"Chat wiederherstellen", close:"Chat schließen", open:"KI-Assistent öffnen",
  },
  zh: {
    important:"重要提示：", title:"Visa Assistant Global",
    greeting:"欢迎使用 Visa Assistant Global。我可以帮助您浏览平台上的目的地和签证路线。英国创新者创始人助手现已上线，其他国家的专用工具也在陆续加入。您想了解什么？",
    disclaimer:"这是由人工智能辅助提供的准备信息，并非受监管的移民建议。相关要求可能会变化，请通过对应的官方移民机构核实具有时效性的信息。",
    placeholder:"询问目的地、签证路线或平台...",
    suggestions:["Visa Assistant Global 可以帮助我做什么？","目前哪条签证路线已经上线？","如何浏览某个国家的签证路线？"],
    error:"目前无法完成该请求，请稍后再试。对于可能随时变化的移民要求，请以相关政府官方来源为准。",
    minimize:"最小化聊天", restore:"恢复聊天", close:"关闭聊天", open:"打开人工智能助手",
  },
  ar: {
    important:"مهم:", title:"Visa Assistant Global",
    greeting:"مرحباً بك في Visa Assistant Global. يمكنني مساعدتك في استكشاف الوجهات ومسارات التأشيرات المتاحة على المنصة. مساعد UK Innovator Founder متاح حالياً، ويجري إضافة أدوات مخصصة لدول أخرى. كيف يمكنني مساعدتك؟",
    disclaimer:"معلومات تحضيرية بمساعدة الذكاء الاصطناعي وليست استشارة هجرة خاضعة للتنظيم. قد تتغير المتطلبات، لذا تحقّق من المعلومات الحساسة زمنياً لدى جهة الهجرة الرسمية ذات الصلة.",
    placeholder:"اسأل عن الوجهات أو مسارات التأشيرات أو المنصة...",
    suggestions:["كيف يمكن أن يساعدني Visa Assistant Global؟","أي مسار تأشيرة متاح الآن؟","كيف أستكشف مسارات تأشيرات دولة ما؟"],
    error:"تعذر إكمال هذا الطلب الآن. حاول مرة أخرى بعد قليل. استخدم المصدر الحكومي الرسمي ذي الصلة للمتطلبات التي قد تتغير.",
    minimize:"تصغير الدردشة", restore:"استعادة الدردشة", close:"إغلاق الدردشة", open:"فتح مساعد الذكاء الاصطناعي",
  },
  pt: {
    important:"Importante:", title:"Visa Assistant Global",
    greeting:"Bem-vindo ao Visa Assistant Global. Posso ajudar a explorar destinos e rotas de visto disponíveis na plataforma. O assistente UK Innovator Founder está ativo e estão a ser adicionadas ferramentas dedicadas para outros países. Em que posso ajudar?",
    disclaimer:"Informação de preparação assistida por IA, não aconselhamento de imigração regulamentado. Os requisitos podem mudar; confirme informação sensível ao tempo junto da autoridade oficial de imigração relevante.",
    placeholder:"Pergunte sobre destinos, rotas de visto ou a plataforma...",
    suggestions:["Como pode o Visa Assistant Global ajudar-me?","Que rota de visto está ativa agora?","Como exploro as rotas de visto de um país?"],
    error:"Não foi possível concluir este pedido agora. Tente novamente dentro de instantes. Para requisitos sujeitos a alterações, consulte a fonte oficial relevante.",
    minimize:"Minimizar chat", restore:"Restaurar chat", close:"Fechar chat", open:"Abrir assistente de IA",
  },
  ja: {
    important:"重要:", title:"Visa Assistant Global",
    greeting:"Visa Assistant Globalへようこそ。プラットフォームで利用できる渡航先やビザルートを確認するお手伝いができます。英国Innovator Founderアシスタントは利用可能で、他国向けの専用ツールも順次追加されています。何をお手伝いしましょうか？",
    disclaimer:"AIによる準備情報であり、規制対象の移民助言ではありません。要件は変更される可能性があるため、時期により変わる情報は該当する公式移民当局で確認してください。",
    placeholder:"渡航先、ビザルート、プラットフォームについて質問...",
    suggestions:["Visa Assistant Globalでは何ができますか？","現在利用可能なビザルートはどれですか？","各国のビザルートはどう確認できますか？"],
    error:"現在このリクエストを完了できませんでした。少し待ってから再度お試しください。変更される可能性がある要件は、該当する政府公式情報源で確認してください。",
    minimize:"チャットを最小化", restore:"チャットを復元", close:"チャットを閉じる", open:"AIアシスタントを開く",
  },
};

const sectionLabels: Record<LanguageCode, Record<string,string>> = {
  en:{contact:"contact and support",about:"about","how-it-works":"how it works",countries:"countries","visa-routes":"visa routes"},
  es:{contact:"contacto y soporte",about:"información","how-it-works":"cómo funciona",countries:"países","visa-routes":"rutas de visado"},
  fr:{contact:"contact et assistance",about:"à propos","how-it-works":"fonctionnement",countries:"pays","visa-routes":"voies de visa"},
  de:{contact:"Kontakt und Support",about:"Überblick","how-it-works":"Funktionsweise",countries:"Länder","visa-routes":"Visumrouten"},
  zh:{contact:"联系与支持",about:"关于","how-it-works":"使用方式",countries:"国家","visa-routes":"签证路线"},
  ar:{contact:"التواصل والدعم",about:"حول","how-it-works":"طريقة العمل",countries:"الدول","visa-routes":"مسارات التأشيرة"},
  pt:{contact:"contacto e apoio",about:"sobre","how-it-works":"como funciona",countries:"países","visa-routes":"rotas de visto"},
  ja:{contact:"お問い合わせ・サポート",about:"概要","how-it-works":"使い方",countries:"国", "visa-routes":"ビザルート"},
};

export function getUkChatbotCopy(language: LanguageCode): ChatbotCopy {
  return UK[language] || UK.en;
}

export function getGlobalChatbotCopy(language: LanguageCode): ChatbotCopy {
  return GLOBAL[language] || GLOBAL.en;
}

export function getCatalogueChatbotCopy(
  language: LanguageCode,
  countryName: string,
  authority: string,
  section: string,
): ChatbotCopy {
  const label = sectionLabels[language]?.[section] || sectionLabels[language]?.["visa-routes"] || section;
  const base = GLOBAL[language] || GLOBAL.en;

  if (language === "zh") return {
    ...base,
    title:`${countryName}签证助手`,
    greeting:`您好！您正在浏览${countryName}的${label}页面。我可以帮助解释这里展示的签证路线和信息，提供高层次的准备指导，并引导您通过 ${authority} 核实最新官方要求。您想了解什么？`,
    disclaimer:`这是针对${countryName}签证路线浏览的人工智能辅助信息，并非受监管的移民建议。移民要求可能会变化，请通过 ${authority} 核实最新要求。`,
    placeholder:`询问${countryName}签证路线...`,
    suggestions:[`这里可以浏览哪些${countryName}签证路线？`,`哪些${countryName}签证类别适合技术专业人士？`,`在哪里可以核实${countryName}的官方要求？`],
  };
  if (language === "ja") return {
    ...base,
    title:`${countryName}ビザアシスタント`,
    greeting:`現在、${countryName}の${label}ページを閲覧しています。ここに表示されるビザルートや情報の説明、準備に関する一般的な案内、最新の公式要件を ${authority} で確認するための案内ができます。何を知りたいですか？`,
    disclaimer:`${countryName}のビザルート確認を支援するAI情報であり、規制対象の移民助言ではありません。要件は変更される可能性があるため、最新情報は ${authority} で確認してください。`,
    placeholder:`${countryName}のビザルートについて質問...`,
    suggestions:[`${countryName}ではどのルートを確認できますか？`,`専門職向けの${countryName}のルート区分は？`,`${countryName}の公式要件はどこで確認できますか？`],
  };
  if (language === "es") return {
    ...base,
    title:`Asistente de visados de ${countryName}`,
    greeting:`Estás consultando la página de ${label} de ${countryName}. Puedo explicar las rutas y la información mostradas, ayudarte con la preparación a un nivel general y orientarte hacia ${authority} para verificar los requisitos oficiales actuales. ¿Qué te gustaría saber?`,
    disclaimer:`Información asistida por IA para explorar las rutas de ${countryName}, no asesoramiento migratorio regulado. Los requisitos pueden cambiar; verifica los actuales con ${authority}.`,
    placeholder:`Pregunta sobre las rutas de visado de ${countryName}...`,
    suggestions:[`¿Qué rutas de ${countryName} puedo explorar aquí?`,`¿Qué categorías de ${countryName} encajan con profesionales cualificados?`,`¿Dónde puedo verificar los requisitos oficiales de ${countryName}?`],
  };
  if (language === "fr") return {
    ...base,
    title:`Assistant visa ${countryName}`,
    greeting:`Vous consultez la page ${label} de ${countryName}. Je peux expliquer les voies et informations affichées, vous aider à comprendre la préparation de manière générale et vous orienter vers ${authority} pour vérifier les exigences officielles actuelles. Que souhaitez-vous savoir ?`,
    disclaimer:`Informations assistées par IA pour explorer les voies de ${countryName}, et non conseil réglementé en immigration. Les exigences peuvent changer ; vérifiez les exigences actuelles auprès de ${authority}.`,
    placeholder:`Posez une question sur les visas de ${countryName}...`,
    suggestions:[`Quelles voies de ${countryName} puis-je explorer ici ?`,`Quelles catégories de ${countryName} conviennent aux professionnels qualifiés ?`,`Où vérifier les exigences officielles de ${countryName} ?`],
  };
  if (language === "de") return {
    ...base,
    title:`Visum-Assistent für ${countryName}`,
    greeting:`Sie befinden sich auf der ${label}-Seite für ${countryName}. Ich kann die angezeigten Visumrouten und Informationen erklären, allgemeine Vorbereitungshinweise geben und Sie zu ${authority} führen, um aktuelle offizielle Anforderungen zu prüfen. Was möchten Sie wissen?`,
    disclaimer:`KI-gestützte Informationen zur Erkundung von ${countryName}-Visumrouten, keine regulierte Einwanderungsberatung. Anforderungen können sich ändern; prüfen Sie aktuelle Anforderungen bei ${authority}.`,
    placeholder:`Fragen zu ${countryName}-Visumrouten...`,
    suggestions:[`Welche ${countryName}-Routen kann ich hier erkunden?`,`Welche Kategorien eignen sich für qualifizierte Fachkräfte?`,`Wo kann ich die offiziellen Anforderungen für ${countryName} prüfen?`],
  };
  if (language === "ar") return {
    ...base,
    title:`مساعد تأشيرات ${countryName}`,
    greeting:`أنت تتصفح صفحة ${label} الخاصة بـ ${countryName}. يمكنني شرح مسارات التأشيرات والمعلومات المعروضة، وتقديم إرشاد عام للتحضير، وتوجيهك إلى ${authority} للتحقق من المتطلبات الرسمية الحالية. ما الذي تريد معرفته؟`,
    disclaimer:`معلومات بمساعدة الذكاء الاصطناعي لاستكشاف مسارات ${countryName} وليست استشارة هجرة خاضعة للتنظيم. قد تتغير المتطلبات؛ تحقّق من المتطلبات الحالية لدى ${authority}.`,
    placeholder:`اسأل عن مسارات تأشيرات ${countryName}...`,
    suggestions:[`ما مسارات ${countryName} التي يمكنني استكشافها هنا؟`,`ما الفئات المناسبة للمهنيين المهرة في ${countryName}؟`,`أين يمكنني التحقق من المتطلبات الرسمية لـ ${countryName}؟`],
  };
  if (language === "pt") return {
    ...base,
    title:`Assistente de vistos de ${countryName}`,
    greeting:`Está a explorar a página de ${label} de ${countryName}. Posso explicar as rotas e informações apresentadas, ajudar com preparação a nível geral e indicar ${authority} para confirmar os requisitos oficiais atuais. O que gostaria de saber?`,
    disclaimer:`Informação assistida por IA para explorar rotas de ${countryName}, não aconselhamento de imigração regulamentado. Os requisitos podem mudar; confirme os atuais junto de ${authority}.`,
    placeholder:`Pergunte sobre as rotas de visto de ${countryName}...`,
    suggestions:[`Que rotas de ${countryName} posso explorar aqui?`,`Que categorias de ${countryName} são adequadas a profissionais qualificados?`,`Onde posso confirmar os requisitos oficiais de ${countryName}?`],
  };

  return {
    ...base,
    title:`${countryName} Visa Assistant`,
    greeting:`Hi! You're exploring the ${countryName} ${label} page. I can help explain the visa routes and information shown for ${countryName}, help you understand preparation at a high level, and point you to ${authority} for current official requirements. What would you like to know?`,
    disclaimer:`AI-assisted information for ${countryName} route discovery, not regulated immigration advice. Immigration requirements can change; verify current requirements with ${authority}.`,
    placeholder:`Ask about ${countryName} visa routes...`,
    suggestions:[`What ${countryName} routes can I explore here?`,`Which ${countryName} route categories suit skilled professionals?`,`Where can I verify ${countryName}'s official requirements?`],
  };
}
