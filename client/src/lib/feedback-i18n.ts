import type { LanguageCode } from "@/lib/translations";

export type FeedbackCopy = {
  sendFeedback:string; closeFeedback:string; restoreFeedback:string; minimizeFeedback:string;
  currentArea:string; whatType:string; reportBug:string; suggestion:string; platformQuestion:string; rateUs:string;
  questionHint:string; rateExperience:string; optional:string; poor:string; fair:string; good:string; great:string; excellent:string;
  subject:string; subjectPlaceholder:string; yourMessage:string; bugPlaceholder:string; suggestionPlaceholder:string;
  questionPlaceholder:string; praisePlaceholder:string; genericPlaceholder:string; yourEmail:string; followUp:string;
  submittingAs:string; sending:string; feedbackReceived:string; thanksImprove:string; failedSubmit:string; tryLater:string;
  selectType:string; enterMessage:string; enterEmail:string; thankYou:string; feedbackHelps:string;
  innovatorLabel:string; innovatorShort:string; innovatorHelper:string;
  globalLabel:string; globalShort:string; globalHelper:string;
  platformLabel:string; platformShort:string; platformHelper:string;
  rateAria:(n:number)=>string;
  siteQuestion:string; sitePlaceholder:string; notNow:string; send:string; selectRating:string;
};

const en: FeedbackCopy = {
  sendFeedback:"Send Feedback",closeFeedback:"Close feedback",restoreFeedback:"Restore feedback",minimizeFeedback:"Minimize feedback button",
  currentArea:"Current area:",whatType:"What type of feedback?",reportBug:"Report a Bug",suggestion:"Suggestion",platformQuestion:"Platform Question",rateUs:"Rate Us ★",
  questionHint:"For visa or immigration preparation questions, the AI Assistant is usually faster. Use this form for questions about the platform, your account or a feature.",
  rateExperience:"Rate your experience",optional:"optional",poor:"Poor",fair:"Fair",good:"Good",great:"Great",excellent:"Excellent",
  subject:"Subject",subjectPlaceholder:"Brief summary...",yourMessage:"Your message",
  bugPlaceholder:"What were you trying to do, what happened, and what did you expect instead?",
  suggestionPlaceholder:"What should we improve, and how would it help you?",questionPlaceholder:"What would you like to know about the platform?",
  praisePlaceholder:"What's working well for you?",genericPlaceholder:"Tell us more...",yourEmail:"Your email",followUp:"So we can follow up if needed",
  submittingAs:"Submitting as",sending:"Sending...",feedbackReceived:"Feedback received",thanksImprove:"Thank you for helping us improve.",
  failedSubmit:"Failed to submit",tryLater:"Please try again later.",selectType:"Please select a feedback type",enterMessage:"Please enter your message",
  enterEmail:"Please enter your email",thankYou:"Thank you",feedbackHelps:"Your feedback helps us improve the platform.",
  innovatorLabel:"UK Innovator Founder Visa Assistant",innovatorShort:"UK Innovator Founder",
  innovatorHelper:"Your feedback will be tagged to the Innovator Founder experience and the page you are viewing.",
  globalLabel:"Visa Assistant Global",globalShort:"Global Home",globalHelper:"Your feedback will be tagged to the global experience and the page you are viewing.",
  platformLabel:"Visa Assistant",platformShort:"Platform",platformHelper:"Your feedback will include the page you are viewing so we can investigate it faster.",
  rateAria:n=>`Rate ${n} out of 5`,
  siteQuestion:"How's your experience so far?",sitePlaceholder:"What would make this better? (optional)",notNow:"Not now",send:"Send",selectRating:"Please select a rating",
};

const zh: FeedbackCopy = {
  sendFeedback:"发送反馈",closeFeedback:"关闭反馈",restoreFeedback:"恢复反馈",minimizeFeedback:"最小化反馈按钮",
  currentArea:"当前区域：",whatType:"您想提供哪类反馈？",reportBug:"报告问题",suggestion:"建议",platformQuestion:"平台问题",rateUs:"评价我们 ★",
  questionHint:"如果您有签证或移民准备方面的问题，人工智能助手通常更快。此表单用于平台、账户或功能相关问题。",
  rateExperience:"评价您的体验",optional:"可选",poor:"较差",fair:"一般",good:"良好",great:"很好",excellent:"优秀",
  subject:"主题",subjectPlaceholder:"简要概述...",yourMessage:"您的留言",
  bugPlaceholder:"您当时想做什么？发生了什么？您原本期望发生什么？",suggestionPlaceholder:"我们应该改进什么？这会如何帮助您？",
  questionPlaceholder:"您想了解平台的哪些内容？",praisePlaceholder:"哪些方面对您来说运行良好？",genericPlaceholder:"请告诉我们更多...",
  yourEmail:"您的电子邮箱",followUp:"便于我们在需要时与您跟进",submittingAs:"提交账户",sending:"正在发送...",
  feedbackReceived:"已收到反馈",thanksImprove:"感谢您帮助我们改进。",failedSubmit:"提交失败",tryLater:"请稍后再试。",
  selectType:"请选择反馈类型",enterMessage:"请输入您的留言",enterEmail:"请输入您的电子邮箱",thankYou:"谢谢",
  feedbackHelps:"您的反馈有助于我们改进平台。",
  innovatorLabel:"英国创新者创始人签证助手",innovatorShort:"英国创新者创始人",
  innovatorHelper:"您的反馈将标记到创新者创始人体验以及您当前查看的页面。",
  globalLabel:"Visa Assistant Global",globalShort:"全球首页",globalHelper:"您的反馈将标记到全球体验以及您当前查看的页面。",
  platformLabel:"Visa Assistant",platformShort:"平台",platformHelper:"您的反馈将包含您当前查看的页面，便于我们更快调查。",
  rateAria:n=>`评分 ${n}/5`,
  siteQuestion:"目前您的使用体验如何？",sitePlaceholder:"怎样改进会让体验更好？（可选）",notNow:"暂不",send:"发送",selectRating:"请选择评分",
};

const ja: FeedbackCopy = {
  sendFeedback:"フィードバックを送信",closeFeedback:"フィードバックを閉じる",restoreFeedback:"フィードバックを復元",minimizeFeedback:"フィードバックを最小化",
  currentArea:"現在のエリア：",whatType:"フィードバックの種類を選んでください",reportBug:"不具合を報告",suggestion:"提案",platformQuestion:"プラットフォームに関する質問",rateUs:"評価する ★",
  questionHint:"ビザや移民申請準備に関する質問は、通常AIアシスタントの方が早く回答できます。このフォームは、プラットフォーム、アカウント、機能に関する質問にご利用ください。",
  rateExperience:"体験を評価",optional:"任意",poor:"悪い",fair:"普通",good:"良い",great:"とても良い",excellent:"素晴らしい",
  subject:"件名",subjectPlaceholder:"簡単な概要...",yourMessage:"メッセージ",
  bugPlaceholder:"何をしようとしていましたか？何が起き、どうなることを期待していましたか？",
  suggestionPlaceholder:"どこを改善すべきですか？それによってどのように役立ちますか？",
  questionPlaceholder:"プラットフォームについて何を知りたいですか？",praisePlaceholder:"うまく機能している点を教えてください",genericPlaceholder:"詳しく教えてください...",
  yourEmail:"メールアドレス",followUp:"必要に応じてご連絡するために使用します",submittingAs:"送信元",
  sending:"送信中...",feedbackReceived:"フィードバックを受け付けました",thanksImprove:"改善にご協力いただきありがとうございます。",
  failedSubmit:"送信できませんでした",tryLater:"後でもう一度お試しください。",selectType:"フィードバックの種類を選択してください",
  enterMessage:"メッセージを入力してください",enterEmail:"メールアドレスを入力してください",thankYou:"ありがとうございます",
  feedbackHelps:"いただいたフィードバックはプラットフォームの改善に役立ちます。",
  innovatorLabel:"英国Innovator Founderビザアシスタント",innovatorShort:"英国Innovator Founder",
  innovatorHelper:"フィードバックはInnovator Founderの体験と現在表示しているページに関連付けられます。",
  globalLabel:"Visa Assistant Global",globalShort:"グローバルホーム",globalHelper:"フィードバックはグローバル体験と現在表示しているページに関連付けられます。",
  platformLabel:"Visa Assistant",platformShort:"プラットフォーム",platformHelper:"現在表示しているページ情報も送信されるため、より迅速に調査できます。",
  rateAria:n=>`5段階中${n}で評価`,
  siteQuestion:"これまでのご利用体験はいかがですか？",sitePlaceholder:"より良くするためのご意見（任意）",notNow:"今はしない",send:"送信",selectRating:"評価を選択してください",
};

const es: FeedbackCopy = {
  sendFeedback:"Enviar comentarios",closeFeedback:"Cerrar comentarios",restoreFeedback:"Restaurar comentarios",minimizeFeedback:"Minimizar comentarios",
  currentArea:"Área actual:",whatType:"¿Qué tipo de comentario?",reportBug:"Informar de un error",suggestion:"Sugerencia",platformQuestion:"Pregunta sobre la plataforma",rateUs:"Valóranos ★",
  questionHint:"Para preguntas de preparación de visado o inmigración, el asistente de IA suele ser más rápido. Usa este formulario para preguntas sobre la plataforma, tu cuenta o una función.",
  rateExperience:"Valora tu experiencia",optional:"opcional",poor:"Mala",fair:"Regular",good:"Buena",great:"Muy buena",excellent:"Excelente",
  subject:"Asunto",subjectPlaceholder:"Resumen breve...",yourMessage:"Tu mensaje",
  bugPlaceholder:"¿Qué intentabas hacer, qué ocurrió y qué esperabas que ocurriera?",suggestionPlaceholder:"¿Qué deberíamos mejorar y cómo te ayudaría?",
  questionPlaceholder:"¿Qué te gustaría saber sobre la plataforma?",praisePlaceholder:"¿Qué está funcionando bien para ti?",genericPlaceholder:"Cuéntanos más...",
  yourEmail:"Tu correo electrónico",followUp:"Para poder contactarte si hace falta",submittingAs:"Enviando como",sending:"Enviando...",
  feedbackReceived:"Comentarios recibidos",thanksImprove:"Gracias por ayudarnos a mejorar.",failedSubmit:"No se pudo enviar",tryLater:"Inténtalo de nuevo más tarde.",
  selectType:"Selecciona un tipo de comentario",enterMessage:"Introduce tu mensaje",enterEmail:"Introduce tu correo electrónico",thankYou:"Gracias",
  feedbackHelps:"Tus comentarios nos ayudan a mejorar la plataforma.",
  innovatorLabel:"Asistente de Visa UK Innovator Founder",innovatorShort:"UK Innovator Founder",innovatorHelper:"Tus comentarios se vincularán a la experiencia Innovator Founder y a la página que estás viendo.",
  globalLabel:"Visa Assistant Global",globalShort:"Inicio global",globalHelper:"Tus comentarios se vincularán a la experiencia global y a la página que estás viendo.",
  platformLabel:"Visa Assistant",platformShort:"Plataforma",platformHelper:"Tus comentarios incluirán la página que estás viendo para que podamos investigarlo más rápido.",
  rateAria:n=>`Valorar ${n} de 5`,siteQuestion:"¿Cómo ha sido tu experiencia hasta ahora?",sitePlaceholder:"¿Qué haría esto mejor? (opcional)",notNow:"Ahora no",send:"Enviar",selectRating:"Selecciona una valoración",
};

const fr: FeedbackCopy = {
  sendFeedback:"Envoyer un retour",closeFeedback:"Fermer le retour",restoreFeedback:"Restaurer le retour",minimizeFeedback:"Réduire le retour",
  currentArea:"Zone actuelle :",whatType:"Quel type de retour ?",reportBug:"Signaler un bug",suggestion:"Suggestion",platformQuestion:"Question sur la plateforme",rateUs:"Évaluez-nous ★",
  questionHint:"Pour les questions de préparation de visa ou d’immigration, l’assistant IA est généralement plus rapide. Utilisez ce formulaire pour les questions sur la plateforme, votre compte ou une fonctionnalité.",
  rateExperience:"Évaluez votre expérience",optional:"facultatif",poor:"Mauvaise",fair:"Correcte",good:"Bonne",great:"Très bonne",excellent:"Excellente",
  subject:"Objet",subjectPlaceholder:"Bref résumé...",yourMessage:"Votre message",
  bugPlaceholder:"Que tentiez-vous de faire, que s’est-il passé et qu’attendiez-vous à la place ?",suggestionPlaceholder:"Que devrions-nous améliorer et en quoi cela vous aiderait-il ?",
  questionPlaceholder:"Que souhaitez-vous savoir sur la plateforme ?",praisePlaceholder:"Qu’est-ce qui fonctionne bien pour vous ?",genericPlaceholder:"Dites-nous-en plus...",
  yourEmail:"Votre e-mail",followUp:"Afin de pouvoir vous recontacter si nécessaire",submittingAs:"Envoi en tant que",sending:"Envoi...",
  feedbackReceived:"Retour reçu",thanksImprove:"Merci de nous aider à nous améliorer.",failedSubmit:"Échec de l’envoi",tryLater:"Veuillez réessayer plus tard.",
  selectType:"Sélectionnez un type de retour",enterMessage:"Saisissez votre message",enterEmail:"Saisissez votre e-mail",thankYou:"Merci",
  feedbackHelps:"Votre retour nous aide à améliorer la plateforme.",
  innovatorLabel:"Assistant Visa UK Innovator Founder",innovatorShort:"UK Innovator Founder",innovatorHelper:"Votre retour sera associé à l’expérience Innovator Founder et à la page consultée.",
  globalLabel:"Visa Assistant Global",globalShort:"Accueil global",globalHelper:"Votre retour sera associé à l’expérience globale et à la page consultée.",
  platformLabel:"Visa Assistant",platformShort:"Plateforme",platformHelper:"Votre retour inclura la page consultée afin que nous puissions enquêter plus rapidement.",
  rateAria:n=>`Noter ${n} sur 5`,siteQuestion:"Comment se passe votre expérience jusqu’à présent ?",sitePlaceholder:"Qu’est-ce qui pourrait améliorer l’expérience ? (facultatif)",notNow:"Pas maintenant",send:"Envoyer",selectRating:"Sélectionnez une note",
};

const de: FeedbackCopy = {
  sendFeedback:"Feedback senden",closeFeedback:"Feedback schließen",restoreFeedback:"Feedback wiederherstellen",minimizeFeedback:"Feedback minimieren",
  currentArea:"Aktueller Bereich:",whatType:"Welche Art von Feedback?",reportBug:"Fehler melden",suggestion:"Vorschlag",platformQuestion:"Frage zur Plattform",rateUs:"Bewerten ★",
  questionHint:"Bei Fragen zur Visum- oder Einwanderungsvorbereitung ist der KI-Assistent normalerweise schneller. Nutzen Sie dieses Formular für Fragen zur Plattform, zu Ihrem Konto oder zu einer Funktion.",
  rateExperience:"Erfahrung bewerten",optional:"optional",poor:"Schlecht",fair:"Ausreichend",good:"Gut",great:"Sehr gut",excellent:"Ausgezeichnet",
  subject:"Betreff",subjectPlaceholder:"Kurze Zusammenfassung...",yourMessage:"Ihre Nachricht",
  bugPlaceholder:"Was wollten Sie tun, was ist passiert und was hätten Sie stattdessen erwartet?",suggestionPlaceholder:"Was sollten wir verbessern und wie würde Ihnen das helfen?",
  questionPlaceholder:"Was möchten Sie über die Plattform wissen?",praisePlaceholder:"Was funktioniert für Sie gut?",genericPlaceholder:"Erzählen Sie uns mehr...",
  yourEmail:"Ihre E-Mail",followUp:"Damit wir uns bei Bedarf melden können",submittingAs:"Senden als",sending:"Wird gesendet...",
  feedbackReceived:"Feedback erhalten",thanksImprove:"Danke, dass Sie uns beim Verbessern helfen.",failedSubmit:"Senden fehlgeschlagen",tryLater:"Bitte später erneut versuchen.",
  selectType:"Bitte Feedback-Typ auswählen",enterMessage:"Bitte Nachricht eingeben",enterEmail:"Bitte E-Mail eingeben",thankYou:"Vielen Dank",
  feedbackHelps:"Ihr Feedback hilft uns, die Plattform zu verbessern.",
  innovatorLabel:"UK Innovator Founder Visa Assistant",innovatorShort:"UK Innovator Founder",innovatorHelper:"Ihr Feedback wird der Innovator-Founder-Erfahrung und der aktuell angezeigten Seite zugeordnet.",
  globalLabel:"Visa Assistant Global",globalShort:"Global Start",globalHelper:"Ihr Feedback wird der globalen Erfahrung und der aktuell angezeigten Seite zugeordnet.",
  platformLabel:"Visa Assistant",platformShort:"Plattform",platformHelper:"Ihr Feedback enthält die aktuelle Seite, damit wir schneller nachforschen können.",
  rateAria:n=>`Mit ${n} von 5 bewerten`,siteQuestion:"Wie ist Ihre Erfahrung bisher?",sitePlaceholder:"Was würde es besser machen? (optional)",notNow:"Nicht jetzt",send:"Senden",selectRating:"Bitte Bewertung auswählen",
};

const pt: FeedbackCopy = {
  sendFeedback:"Enviar feedback",closeFeedback:"Fechar feedback",restoreFeedback:"Restaurar feedback",minimizeFeedback:"Minimizar feedback",
  currentArea:"Área atual:",whatType:"Que tipo de feedback?",reportBug:"Reportar um erro",suggestion:"Sugestão",platformQuestion:"Pergunta sobre a plataforma",rateUs:"Avaliar ★",
  questionHint:"Para perguntas de preparação de visto ou imigração, o assistente de IA costuma ser mais rápido. Use este formulário para questões sobre a plataforma, a sua conta ou uma funcionalidade.",
  rateExperience:"Avalie a sua experiência",optional:"opcional",poor:"Má",fair:"Razoável",good:"Boa",great:"Muito boa",excellent:"Excelente",
  subject:"Assunto",subjectPlaceholder:"Resumo breve...",yourMessage:"A sua mensagem",
  bugPlaceholder:"O que estava a tentar fazer, o que aconteceu e o que esperava que acontecesse?",suggestionPlaceholder:"O que devemos melhorar e como isso o ajudaria?",
  questionPlaceholder:"O que gostaria de saber sobre a plataforma?",praisePlaceholder:"O que está a funcionar bem para si?",genericPlaceholder:"Conte-nos mais...",
  yourEmail:"O seu e-mail",followUp:"Para podermos entrar em contacto se necessário",submittingAs:"A enviar como",sending:"A enviar...",
  feedbackReceived:"Feedback recebido",thanksImprove:"Obrigado por nos ajudar a melhorar.",failedSubmit:"Falha no envio",tryLater:"Tente novamente mais tarde.",
  selectType:"Selecione um tipo de feedback",enterMessage:"Introduza a sua mensagem",enterEmail:"Introduza o seu e-mail",thankYou:"Obrigado",
  feedbackHelps:"O seu feedback ajuda-nos a melhorar a plataforma.",
  innovatorLabel:"Assistente de Visto UK Innovator Founder",innovatorShort:"UK Innovator Founder",innovatorHelper:"O seu feedback será associado à experiência Innovator Founder e à página atual.",
  globalLabel:"Visa Assistant Global",globalShort:"Página global",globalHelper:"O seu feedback será associado à experiência global e à página atual.",
  platformLabel:"Visa Assistant",platformShort:"Plataforma",platformHelper:"O seu feedback incluirá a página atual para podermos investigar mais rapidamente.",
  rateAria:n=>`Avaliar ${n} de 5`,siteQuestion:"Como está a ser a sua experiência?",sitePlaceholder:"O que tornaria isto melhor? (opcional)",notNow:"Agora não",send:"Enviar",selectRating:"Selecione uma avaliação",
};

const ar: FeedbackCopy = {
  sendFeedback:"إرسال الملاحظات",closeFeedback:"إغلاق الملاحظات",restoreFeedback:"استعادة الملاحظات",minimizeFeedback:"تصغير الملاحظات",
  currentArea:"المنطقة الحالية:",whatType:"ما نوع الملاحظات؟",reportBug:"الإبلاغ عن خطأ",suggestion:"اقتراح",platformQuestion:"سؤال عن المنصة",rateUs:"قيّمنا ★",
  questionHint:"بالنسبة لأسئلة التحضير للتأشيرة أو الهجرة، يكون مساعد الذكاء الاصطناعي أسرع عادةً. استخدم هذا النموذج للأسئلة المتعلقة بالمنصة أو حسابك أو إحدى الميزات.",
  rateExperience:"قيّم تجربتك",optional:"اختياري",poor:"ضعيف",fair:"مقبول",good:"جيد",great:"جيد جداً",excellent:"ممتاز",
  subject:"الموضوع",subjectPlaceholder:"ملخص قصير...",yourMessage:"رسالتك",
  bugPlaceholder:"ما الذي كنت تحاول فعله، ماذا حدث، وما الذي كنت تتوقع حدوثه؟",suggestionPlaceholder:"ما الذي ينبغي تحسينه وكيف سيساعدك؟",
  questionPlaceholder:"ماذا تريد أن تعرف عن المنصة؟",praisePlaceholder:"ما الذي يعمل جيداً بالنسبة لك؟",genericPlaceholder:"أخبرنا بالمزيد...",
  yourEmail:"بريدك الإلكتروني",followUp:"حتى نتمكن من المتابعة عند الحاجة",submittingAs:"الإرسال باسم",sending:"جارٍ الإرسال...",
  feedbackReceived:"تم استلام الملاحظات",thanksImprove:"شكراً لمساعدتنا على التحسين.",failedSubmit:"فشل الإرسال",tryLater:"يرجى المحاولة لاحقاً.",
  selectType:"يرجى اختيار نوع الملاحظات",enterMessage:"يرجى إدخال رسالتك",enterEmail:"يرجى إدخال بريدك الإلكتروني",thankYou:"شكراً لك",
  feedbackHelps:"تساعدنا ملاحظاتك على تحسين المنصة.",
  innovatorLabel:"مساعد تأشيرة UK Innovator Founder",innovatorShort:"UK Innovator Founder",innovatorHelper:"سيتم ربط ملاحظاتك بتجربة Innovator Founder والصفحة التي تشاهدها.",
  globalLabel:"Visa Assistant Global",globalShort:"الصفحة العالمية",globalHelper:"سيتم ربط ملاحظاتك بالتجربة العالمية والصفحة التي تشاهدها.",
  platformLabel:"Visa Assistant",platformShort:"المنصة",platformHelper:"ستتضمن ملاحظاتك الصفحة التي تشاهدها حتى نتمكن من التحقيق بسرعة أكبر.",
  rateAria:n=>`تقييم ${n} من 5`,siteQuestion:"كيف كانت تجربتك حتى الآن؟",sitePlaceholder:"ما الذي سيجعل التجربة أفضل؟ (اختياري)",notNow:"ليس الآن",send:"إرسال",selectRating:"يرجى اختيار تقييم",
};

const copy: Record<LanguageCode, FeedbackCopy> = { en, es, fr, de, zh, ar, pt, ja };
export function getFeedbackCopy(language: LanguageCode): FeedbackCopy { return copy[language] || en; }
