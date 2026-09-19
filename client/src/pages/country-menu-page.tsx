import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Compass, ExternalLink, Globe2, HelpCircle, Mail, Route, Search, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import CountryPublicNav from "@/components/CountryPublicNav";
import { Button } from "@/components/ui/button";
import { COUNTRY_CODES, COUNTRY_PUBLIC_DATA, isCountryCode, type CountryCode } from "@/lib/country-public-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/lib/global-destination-i18n";

export type CountryMenuSection = "countries" | "how-it-works" | "about" | "contact";

const sectionCopy = {
  en:{
    all:"All countries",current:"Current destination",choose:"Choose another destination",
    countriesTitle:(n:string)=>`Countries from your ${n} hub`,
    countriesBody:(n:string)=>`You are currently exploring ${n}. Switch destination at any time and continue with that country's own visa catalogue and country-specific pages.`,
    howTitle:(n:string)=>`How Visa Assistant works for ${n}`,
    howBody:(n:string)=>`Use the ${n} hub to discover routes, compare the route descriptions and move into dedicated preparation tools as they become available.`,
    aboutTitle:(n:string)=>`About the ${n} Visa Assistant hub`,
    aboutBody:(n:string)=>`The ${n} hub brings together country-specific route discovery, official-source signposting and Visa Assistant preparation features in one place.`,
    contactTitle:(n:string)=>`Contact and support for ${n}`,
    contactBody:(n:string)=>`Use the on-page feedback and chat controls for Visa Assistant platform questions about the ${n} catalogue. For official immigration decisions or current legal requirements, use the official authority below.`,
    routes:"Browse visa routes",official:"Official immigration source",open:"Open country hub",
    step1:"Choose the destination",step1d:(n:string)=>`Start in the ${n} country hub so the catalogue, sources and preparation context stay country-specific.`,
    step2:"Choose a visa route",step2d:(n:string)=>`Browse the available ${n} routes by category and review the published route descriptions.`,
    step3:"Prepare when an assistant is live",step3d:"Live routes open a dedicated preparation assistant. Coming-soon routes remain browseable without pretending the tool is already available.",
    scope:"What this hub is for",scopeD:(n:string)=>`The ${n} hub organises route discovery and preparation around information relevant to ${n}. It is not a government service and does not make immigration decisions.`,
    source:"Source discipline",sourceD:(a:string)=>`Catalogue information is anchored to official material from ${a}. Requirements can change, so users should verify the latest official rules before applying.`,
    platform:"Platform boundary",platformD:"Visa Assistant provides preparation and organisation tools. It does not replace a regulated adviser, an official authority or a decision-maker.",
    support:"Visa Assistant support",supportD:"For product feedback, navigation issues or catalogue problems, use the feedback/chat controls already available on this page.",
    authority:"Official authority",authorityD:(a:string)=>`For immigration rules, applications and official decisions, use ${a}.`
  },
  es:{
    all:"Todos los países",current:"Destino actual",choose:"Elegir otro destino",
    countriesTitle:(n:string)=>`Países desde tu centro de ${n}`,
    countriesBody:(n:string)=>`Actualmente estás explorando ${n}. Puedes cambiar de destino en cualquier momento y continuar con el catálogo y las páginas específicas de ese país.`,
    howTitle:(n:string)=>`Cómo funciona Visa Assistant para ${n}`,
    howBody:(n:string)=>`Usa el centro de ${n} para descubrir rutas, comparar descripciones y acceder a herramientas de preparación cuando estén disponibles.`,
    aboutTitle:(n:string)=>`Acerca del centro Visa Assistant de ${n}`,
    aboutBody:(n:string)=>`El centro de ${n} reúne rutas específicas del país, enlaces a fuentes oficiales y herramientas de preparación de Visa Assistant.`,
    contactTitle:(n:string)=>`Contacto y soporte para ${n}`,
    contactBody:(n:string)=>`Usa los controles de comentarios y chat para cuestiones sobre el catálogo de ${n}. Para decisiones oficiales o requisitos vigentes, consulta la autoridad oficial indicada abajo.`,
    routes:"Ver rutas de visado",official:"Fuente oficial de inmigración",open:"Abrir centro del país",
    step1:"Elige el destino",step1d:(n:string)=>`Empieza en el centro de ${n} para mantener el catálogo, las fuentes y la preparación dentro del contexto de ese país.`,
    step2:"Elige una ruta de visado",step2d:(n:string)=>`Explora las rutas disponibles de ${n} por categoría y revisa sus descripciones publicadas.`,
    step3:"Prepárate cuando el asistente esté activo",step3d:"Las rutas activas abren un asistente de preparación dedicado. Las rutas próximas siguen disponibles para consulta.",
    scope:"Para qué sirve este centro",scopeD:(n:string)=>`El centro de ${n} organiza el descubrimiento y la preparación de rutas relevantes para ${n}. No es un servicio gubernamental ni toma decisiones migratorias.`,
    source:"Fuentes oficiales",sourceD:(a:string)=>`La información del catálogo se basa en material oficial de ${a}. Los requisitos pueden cambiar; verifica siempre las normas actuales antes de solicitar.`,
    platform:"Límites de la plataforma",platformD:"Visa Assistant ofrece herramientas de preparación y organización. No sustituye a un asesor regulado, una autoridad oficial ni un responsable de decisiones.",
    support:"Soporte de Visa Assistant",supportD:"Para comentarios sobre el producto, problemas de navegación o del catálogo, usa los controles de comentarios/chat de esta página.",
    authority:"Autoridad oficial",authorityD:(a:string)=>`Para normas migratorias, solicitudes y decisiones oficiales, consulta ${a}.`
  },
  fr:{
    all:"Tous les pays",current:"Destination actuelle",choose:"Choisir une autre destination",
    countriesTitle:(n:string)=>`Pays depuis votre espace ${n}`,
    countriesBody:(n:string)=>`Vous explorez actuellement ${n}. Vous pouvez changer de destination à tout moment et poursuivre avec le catalogue et les pages propres au pays choisi.`,
    howTitle:(n:string)=>`Comment Visa Assistant fonctionne pour ${n}`,
    howBody:(n:string)=>`Utilisez l’espace ${n} pour découvrir les voies, comparer les descriptions et accéder aux outils de préparation lorsqu’ils sont disponibles.`,
    aboutTitle:(n:string)=>`À propos de l’espace Visa Assistant pour ${n}`,
    aboutBody:(n:string)=>`L’espace ${n} réunit la découverte des voies propres au pays, les sources officielles et les outils de préparation Visa Assistant.`,
    contactTitle:(n:string)=>`Contact et assistance pour ${n}`,
    contactBody:(n:string)=>`Utilisez les contrôles de retour et de chat pour les questions sur le catalogue ${n}. Pour les décisions officielles ou les exigences actuelles, consultez l’autorité indiquée ci-dessous.`,
    routes:"Voir les voies de visa",official:"Source officielle d’immigration",open:"Ouvrir l’espace pays",
    step1:"Choisissez la destination",step1d:(n:string)=>`Commencez dans l’espace ${n} afin de conserver le catalogue, les sources et la préparation dans le contexte de ce pays.`,
    step2:"Choisissez une voie de visa",step2d:(n:string)=>`Parcourez les voies disponibles pour ${n} par catégorie et consultez leurs descriptions publiées.`,
    step3:"Préparez-vous lorsqu’un assistant est disponible",step3d:"Les voies actives ouvrent un assistant de préparation dédié. Les voies à venir restent consultables.",
    scope:"Rôle de cet espace",scopeD:(n:string)=>`L’espace ${n} organise la découverte et la préparation des voies pertinentes pour ${n}. Ce n’est pas un service gouvernemental et il ne prend aucune décision d’immigration.`,
    source:"Sources officielles",sourceD:(a:string)=>`Le catalogue s’appuie sur les informations officielles de ${a}. Les exigences peuvent changer; vérifiez toujours les règles actuelles avant de déposer une demande.`,
    platform:"Limites de la plateforme",platformD:"Visa Assistant fournit des outils de préparation et d’organisation. Il ne remplace ni un conseiller réglementé, ni une autorité officielle, ni un décideur.",
    support:"Assistance Visa Assistant",supportD:"Pour les retours produit, les problèmes de navigation ou de catalogue, utilisez les contrôles de retour/chat disponibles sur cette page.",
    authority:"Autorité officielle",authorityD:(a:string)=>`Pour les règles d’immigration, les demandes et les décisions officielles, consultez ${a}.`
  },
  de:{
    all:"Alle Länder",current:"Aktuelles Ziel",choose:"Anderes Ziel wählen",
    countriesTitle:(n:string)=>`Länder aus Ihrem ${n}-Hub`,
    countriesBody:(n:string)=>`Sie erkunden derzeit ${n}. Sie können jederzeit das Ziel wechseln und mit dem länderspezifischen Visakatalog fortfahren.`,
    howTitle:(n:string)=>`So funktioniert Visa Assistant für ${n}`,
    howBody:(n:string)=>`Nutzen Sie den ${n}-Hub, um Routen zu entdecken, Beschreibungen zu vergleichen und verfügbare Vorbereitungstools zu öffnen.`,
    aboutTitle:(n:string)=>`Über den Visa-Assistant-Hub für ${n}`,
    aboutBody:(n:string)=>`Der ${n}-Hub bündelt länderspezifische Routen, Hinweise auf offizielle Quellen und Visa-Assistant-Vorbereitungstools.`,
    contactTitle:(n:string)=>`Kontakt und Support für ${n}`,
    contactBody:(n:string)=>`Nutzen Sie Feedback und Chat für Fragen zum ${n}-Katalog. Für amtliche Entscheidungen oder aktuelle Rechtsanforderungen verwenden Sie die unten genannte offizielle Behörde.`,
    routes:"Visumrouten ansehen",official:"Offizielle Einwanderungsquelle",open:"Länder-Hub öffnen",
    step1:"Ziel auswählen",step1d:(n:string)=>`Starten Sie im ${n}-Hub, damit Katalog, Quellen und Vorbereitung länderspezifisch bleiben.`,
    step2:"Visumroute auswählen",step2d:(n:string)=>`Durchsuchen Sie die verfügbaren ${n}-Routen nach Kategorie und prüfen Sie die veröffentlichten Beschreibungen.`,
    step3:"Vorbereiten, sobald ein Assistent live ist",step3d:"Live-Routen öffnen einen eigenen Vorbereitungsassistenten. Kommende Routen bleiben weiterhin durchsuchbar.",
    scope:"Zweck dieses Hubs",scopeD:(n:string)=>`Der ${n}-Hub organisiert Routensuche und Vorbereitung für ${n}. Er ist kein Regierungsdienst und trifft keine Einwanderungsentscheidungen.`,
    source:"Offizielle Quellen",sourceD:(a:string)=>`Die Kataloginformationen basieren auf offiziellen Angaben von ${a}. Anforderungen können sich ändern; prüfen Sie vor der Antragstellung stets die aktuellen Regeln.`,
    platform:"Plattformgrenzen",platformD:"Visa Assistant bietet Vorbereitungs- und Organisationstools. Es ersetzt weder einen regulierten Berater noch eine Behörde oder einen Entscheider.",
    support:"Visa Assistant Support",supportD:"Für Produktfeedback, Navigations- oder Katalogprobleme nutzen Sie die Feedback-/Chat-Funktionen auf dieser Seite.",
    authority:"Offizielle Behörde",authorityD:(a:string)=>`Für Einwanderungsregeln, Anträge und offizielle Entscheidungen nutzen Sie ${a}.`
  },
  zh:{
    all:"所有国家",current:"当前目的地",choose:"选择其他目的地",
    countriesTitle:(n:string)=>`从${n}中心选择国家`,
    countriesBody:(n:string)=>`您当前正在浏览${n}。您可以随时切换目的地，并继续使用该国家自己的签证目录和专属页面。`,
    howTitle:(n:string)=>`Visa Assistant 在${n}如何使用`,
    howBody:(n:string)=>`使用${n}中心查找签证路线、比较路线说明，并在专用准备工具上线后进入使用。`,
    aboutTitle:(n:string)=>`关于${n} Visa Assistant 中心`,
    aboutBody:(n:string)=>`${n}中心把该国签证路线、官方信息来源和 Visa Assistant 准备工具集中在一个地方。`,
    contactTitle:(n:string)=>`${n}联系与支持`,
    contactBody:(n:string)=>`有关${n}目录的平台问题，请使用页面上的反馈和聊天功能。有关官方移民决定或最新法律要求，请使用下方官方机构。`,
    routes:"浏览签证路线",official:"官方移民信息来源",open:"打开国家中心",
    step1:"选择目的地",step1d:(n:string)=>`从${n}国家中心开始，使目录、信息来源和准备内容保持该国专属。`,
    step2:"选择签证路线",step2d:(n:string)=>`按类别浏览${n}可用路线并查看已发布的路线说明。`,
    step3:"助手上线后开始准备",step3d:"已上线路线会打开专用准备助手。即将推出的路线仍可浏览。",
    scope:"此中心的用途",scopeD:(n:string)=>`${n}中心围绕与${n}相关的信息组织路线查找和准备。它不是政府服务，也不会作出移民决定。`,
    source:"官方信息来源",sourceD:(a:string)=>`目录信息以 ${a} 的官方资料为基础。要求可能变化，申请前请始终核实最新官方规定。`,
    platform:"平台边界",platformD:"Visa Assistant 提供准备和整理工具。它不能替代受监管的顾问、官方机构或决策者。",
    support:"Visa Assistant 支持",supportD:"有关产品反馈、导航或目录问题，请使用本页已有的反馈/聊天功能。",
    authority:"官方机构",authorityD:(a:string)=>`有关移民规则、申请和官方决定，请使用 ${a}。`
  },
  ar:{
    all:"جميع الدول",current:"الوجهة الحالية",choose:"اختر وجهة أخرى",
    countriesTitle:(n:string)=>`الدول من مركز ${n}`,
    countriesBody:(n:string)=>`أنت تستكشف ${n} حالياً. يمكنك تغيير الوجهة في أي وقت ومتابعة كتالوج التأشيرات والصفحات الخاصة بالدولة المختارة.`,
    howTitle:(n:string)=>`كيف يعمل Visa Assistant في ${n}`,
    howBody:(n:string)=>`استخدم مركز ${n} لاكتشاف المسارات ومقارنة الأوصاف والانتقال إلى أدوات التحضير المتخصصة عند توفرها.`,
    aboutTitle:(n:string)=>`حول مركز Visa Assistant لـ ${n}`,
    aboutBody:(n:string)=>`يجمع مركز ${n} مسارات الدولة ومصادرها الرسمية وأدوات التحضير من Visa Assistant في مكان واحد.`,
    contactTitle:(n:string)=>`التواصل والدعم لـ ${n}`,
    contactBody:(n:string)=>`استخدم أدوات الملاحظات والدردشة للأسئلة المتعلقة بكتالوج ${n}. للقرارات الرسمية أو المتطلبات القانونية الحالية، راجع الجهة الرسمية أدناه.`,
    routes:"تصفح مسارات التأشيرة",official:"المصدر الرسمي للهجرة",open:"فتح مركز الدولة",
    step1:"اختر الوجهة",step1d:(n:string)=>`ابدأ من مركز ${n} حتى يبقى الكتالوج والمصادر والتحضير ضمن سياق الدولة.`,
    step2:"اختر مسار التأشيرة",step2d:(n:string)=>`تصفح مسارات ${n} المتاحة حسب الفئة وراجع أوصافها المنشورة.`,
    step3:"ابدأ التحضير عند إطلاق المساعد",step3d:"المسارات المتاحة تفتح مساعد تحضير مخصصاً، بينما تبقى المسارات القادمة متاحة للتصفح.",
    scope:"الغرض من هذا المركز",scopeD:(n:string)=>`ينظم مركز ${n} اكتشاف المسارات والتحضير للمعلومات المتعلقة بـ ${n}. وهو ليس خدمة حكومية ولا يتخذ قرارات الهجرة.`,
    source:"المصادر الرسمية",sourceD:(a:string)=>`يعتمد الكتالوج على المواد الرسمية من ${a}. قد تتغير المتطلبات، لذا تحقق دائماً من أحدث القواعد الرسمية قبل التقديم.`,
    platform:"حدود المنصة",platformD:"يوفر Visa Assistant أدوات للتحضير والتنظيم ولا يحل محل مستشاراً منظماً أو جهة رسمية أو صاحب قرار.",
    support:"دعم Visa Assistant",supportD:"لملاحظات المنتج أو مشكلات التنقل أو الكتالوج، استخدم أدوات الملاحظات/الدردشة المتاحة في هذه الصفحة.",
    authority:"الجهة الرسمية",authorityD:(a:string)=>`لقواعد الهجرة والطلبات والقرارات الرسمية، استخدم ${a}.`
  },
  pt:{
    all:"Todos os países",current:"Destino atual",choose:"Escolher outro destino",
    countriesTitle:(n:string)=>`Países a partir do seu centro de ${n}`,
    countriesBody:(n:string)=>`Está atualmente a explorar ${n}. Pode mudar de destino a qualquer momento e continuar com o catálogo e as páginas específicas desse país.`,
    howTitle:(n:string)=>`Como funciona o Visa Assistant para ${n}`,
    howBody:(n:string)=>`Use o centro de ${n} para descobrir rotas, comparar descrições e aceder às ferramentas de preparação quando estiverem disponíveis.`,
    aboutTitle:(n:string)=>`Sobre o centro Visa Assistant de ${n}`,
    aboutBody:(n:string)=>`O centro de ${n} reúne descoberta de rotas específicas do país, fontes oficiais e ferramentas de preparação Visa Assistant.`,
    contactTitle:(n:string)=>`Contacto e apoio para ${n}`,
    contactBody:(n:string)=>`Use os controlos de feedback e chat para questões sobre o catálogo de ${n}. Para decisões oficiais ou requisitos legais atuais, consulte a autoridade indicada abaixo.`,
    routes:"Ver rotas de visto",official:"Fonte oficial de imigração",open:"Abrir centro do país",
    step1:"Escolha o destino",step1d:(n:string)=>`Comece no centro de ${n} para manter o catálogo, as fontes e a preparação específicos do país.`,
    step2:"Escolha uma rota de visto",step2d:(n:string)=>`Explore as rotas disponíveis de ${n} por categoria e reveja as descrições publicadas.`,
    step3:"Prepare-se quando o assistente estiver ativo",step3d:"As rotas ativas abrem um assistente de preparação dedicado. As rotas futuras continuam disponíveis para consulta.",
    scope:"Para que serve este centro",scopeD:(n:string)=>`O centro de ${n} organiza a descoberta e preparação de rotas relevantes para ${n}. Não é um serviço governamental nem toma decisões de imigração.`,
    source:"Fontes oficiais",sourceD:(a:string)=>`A informação do catálogo baseia-se em material oficial de ${a}. Os requisitos podem mudar; confirme sempre as regras atuais antes de solicitar.`,
    platform:"Limites da plataforma",platformD:"O Visa Assistant fornece ferramentas de preparação e organização. Não substitui um consultor regulado, uma autoridade oficial ou um decisor.",
    support:"Apoio Visa Assistant",supportD:"Para feedback do produto ou problemas de navegação/catálogo, use os controlos de feedback/chat desta página.",
    authority:"Autoridade oficial",authorityD:(a:string)=>`Para regras de imigração, pedidos e decisões oficiais, consulte ${a}.`
  },
  ja:{
    all:"すべての国",current:"現在の目的地",choose:"別の目的地を選択",
    countriesTitle:(n:string)=>`${n}ハブから国を選ぶ`,
    countriesBody:(n:string)=>`現在は${n}を閲覧しています。いつでも別の目的地に切り替え、その国専用のビザ一覧と案内ページを利用できます。`,
    howTitle:(n:string)=>`${n}でのVisa Assistantの使い方`,
    howBody:(n:string)=>`${n}ハブでルートを探し、説明を比較し、利用可能になった専用準備ツールへ進めます。`,
    aboutTitle:(n:string)=>`${n} Visa Assistantハブについて`,
    aboutBody:(n:string)=>`${n}ハブでは、その国専用のルート検索、公式情報への案内、Visa Assistantの準備ツールをまとめて利用できます。`,
    contactTitle:(n:string)=>`${n}の連絡先とサポート`,
    contactBody:(n:string)=>`${n}カタログに関するVisa Assistantの質問はページ上のフィードバック／チャットをご利用ください。公式要件や判断については下記の公的機関を確認してください。`,
    routes:"ビザルートを見る",official:"公式移民情報",open:"国別ハブを開く",
    step1:"目的地を選ぶ",step1d:(n:string)=>`${n}の国別ハブから開始し、カタログ・情報源・準備内容を国別に保ちます。`,
    step2:"ビザルートを選ぶ",step2d:(n:string)=>`${n}の利用可能なルートをカテゴリ別に閲覧し、公表された説明を確認します。`,
    step3:"アシスタントが公開されたら準備",step3d:"公開済みルートは専用準備アシスタントを開きます。準備中のルートも閲覧できます。",
    scope:"このハブの目的",scopeD:(n:string)=>`${n}に関連するルート検索と準備情報を整理します。政府サービスではなく、移民判断は行いません。`,
    source:"情報源",sourceD:(a:string)=>`カタログは${a}の公式情報を基礎にしています。要件は変更されるため、申請前に最新の公式規則を確認してください。`,
    platform:"プラットフォームの範囲",platformD:"Visa Assistantは準備と整理を支援します。規制対象の専門家、公的機関、意思決定者の代わりではありません。",
    support:"Visa Assistantサポート",supportD:"製品のフィードバック、ナビゲーション、カタログの問題は、このページのフィードバック／チャット機能をご利用ください。",
    authority:"公的機関",authorityD:(a:string)=>`移民規則、申請、公式判断については${a}をご利用ください。`
  }
} as const;

export default function CountryMenuPage({code,section}:{code:string;section:CountryMenuSection}) {
  const [,setLocation]=useLocation();
  const {language}=useLanguage();
  if(!isCountryCode(code)) return null;
  const country=COUNTRY_PUBLIC_DATA[code];
  const copy=(sectionCopy as any)[language]||sectionCopy.en;
  const displayName=localizeCountryName(language,code,country.name);

  const title =
    section==="countries" ? copy.countriesTitle(displayName) :
    section==="how-it-works" ? copy.howTitle(displayName) :
    section==="about" ? copy.aboutTitle(displayName) :
    copy.contactTitle(displayName);

  const body =
    section==="countries" ? copy.countriesBody(displayName) :
    section==="how-it-works" ? copy.howBody(displayName) :
    section==="about" ? copy.aboutBody(displayName) :
    copy.contactBody(displayName);

  return <div className="min-h-[100svh] bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900 dark:from-[#090b18] dark:via-[#0b1020] dark:to-[#090b18] dark:text-white">
    <CountryPublicNav code={code as CountryCode} active={section}/>
    <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-4 -ml-3 gap-2" onClick={()=>setLocation(`/${code}`)}><ArrowLeft className="h-4 w-4"/>{displayName}</Button>

      <section className="relative overflow-hidden rounded-[30px] border border-blue-100 shadow-[0_18px_55px_rgba(31,96,170,.10)] dark:border-white/10">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url("${country.heroImage}")`}}/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07172f]/96 via-[#0b1933]/90 to-[#0b1933]/45"/>
        <div className="relative max-w-4xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mb-5 flex items-center gap-3">
            <img src={`https://flagcdn.com/w160/${country.flag}.png`} alt={country.name} className="h-9 w-12 rounded-md object-cover shadow"/>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur">{displayName}</span>
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-100">{body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#086cf2] hover:bg-[#075fd4]" onClick={()=>setLocation(`/${code}`)}>{copy.routes}<ArrowRight className="ml-2 h-4 w-4"/></Button>
            <a href={country.officialUrl} target="_blank" rel="noreferrer"><Button variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">{copy.official}<ExternalLink className="ml-2 h-4 w-4"/></Button></a>
          </div>
        </div>
      </section>

      {section==="countries"&&<section className="mt-8">
        <div className="mb-4"><p className="text-sm font-semibold uppercase tracking-[.16em] text-[#086cf2]">{copy.current}</p><h2 className="mt-1 text-2xl font-black">{copy.choose}</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COUNTRY_CODES.map(item=>{
            const d=COUNTRY_PUBLIC_DATA[item];
            const name=localizeCountryName(language,item,d.name);
            const selected=item===code;
            return <button key={item} onClick={()=>setLocation(`/${item}/countries`)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected?"border-[#086cf2] bg-blue-50 ring-2 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/10":"border-blue-100 bg-white dark:border-white/10 dark:bg-white/[.035]"}`}>
              <img src={`https://flagcdn.com/w160/${d.flag}.png`} alt="" className="h-8 w-11 rounded-md object-cover"/>
              <div className="min-w-0"><p className="truncate font-bold">{name}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selected?copy.current:copy.open}</p></div>
            </button>;
          })}
        </div>
      </section>}

      {section==="how-it-works"&&<section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [Compass,copy.step1,copy.step1d(displayName)],
          [Search,copy.step2,copy.step2d(displayName)],
          [CheckCircle2,copy.step3,copy.step3d],
        ].map(([Icon,title,desc])=>{const C=Icon as typeof Compass;return <article key={String(title)} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><C className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-black">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{String(desc)}</p></article>})}
      </section>}

      {section==="about"&&<section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [Globe2,copy.scope,copy.scopeD(displayName)],
          [ShieldCheck,copy.source,copy.sourceD(country.authority)],
          [Route,copy.platform,copy.platformD],
        ].map(([Icon,title,desc])=>{const C=Icon as typeof Globe2;return <article key={String(title)} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><C className="h-6 w-6 text-[#086cf2]"/><h2 className="mt-4 text-xl font-black">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{String(desc)}</p></article>})}
      </section>}

      {section==="contact"&&<section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><HelpCircle className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-black">{copy.support}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.supportD}</p></article>
        <article className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><Building2 className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-black">{copy.authority}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.authorityD(country.authority)}</p><a href={country.officialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#086cf2] hover:underline">{country.authority}<ExternalLink className="h-4 w-4"/></a></article>
      </section>}
    </main>
  </div>;
}
