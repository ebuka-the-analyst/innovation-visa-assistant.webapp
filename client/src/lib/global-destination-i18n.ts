import type { LanguageCode } from "@/lib/translations";

const countryNames: Record<LanguageCode, Record<string, string>> = {
  en: {
    uk:"United Kingdom", us:"United States", ca:"Canada", au:"Australia", de:"Germany", fr:"France", nl:"Netherlands", sg:"Singapore", ae:"United Arab Emirates", nz:"New Zealand", jp:"Japan", ie:"Ireland", pt:"Portugal", es:"Spain", se:"Sweden", ch:"Switzerland"
  },
  es: {
    uk:"Reino Unido", us:"Estados Unidos", ca:"Canadá", au:"Australia", de:"Alemania", fr:"Francia", nl:"Países Bajos", sg:"Singapur", ae:"Emiratos Árabes Unidos", nz:"Nueva Zelanda", jp:"Japón", ie:"Irlanda", pt:"Portugal", es:"España", se:"Suecia", ch:"Suiza"
  },
  fr: {
    uk:"Royaume-Uni", us:"États-Unis", ca:"Canada", au:"Australie", de:"Allemagne", fr:"France", nl:"Pays-Bas", sg:"Singapour", ae:"Émirats arabes unis", nz:"Nouvelle-Zélande", jp:"Japon", ie:"Irlande", pt:"Portugal", es:"Espagne", se:"Suède", ch:"Suisse"
  },
  de: {
    uk:"Vereinigtes Königreich", us:"Vereinigte Staaten", ca:"Kanada", au:"Australien", de:"Deutschland", fr:"Frankreich", nl:"Niederlande", sg:"Singapur", ae:"Vereinigte Arabische Emirate", nz:"Neuseeland", jp:"Japan", ie:"Irland", pt:"Portugal", es:"Spanien", se:"Schweden", ch:"Schweiz"
  },
  zh: {
    uk:"英国", us:"美国", ca:"加拿大", au:"澳大利亚", de:"德国", fr:"法国", nl:"荷兰", sg:"新加坡", ae:"阿拉伯联合酋长国", nz:"新西兰", jp:"日本", ie:"爱尔兰", pt:"葡萄牙", es:"西班牙", se:"瑞典", ch:"瑞士"
  },
  ar: {
    uk:"المملكة المتحدة", us:"الولايات المتحدة", ca:"كندا", au:"أستراليا", de:"ألمانيا", fr:"فرنسا", nl:"هولندا", sg:"سنغافورة", ae:"الإمارات العربية المتحدة", nz:"نيوزيلندا", jp:"اليابان", ie:"أيرلندا", pt:"البرتغال", es:"إسبانيا", se:"السويد", ch:"سويسرا"
  },
  pt: {
    uk:"Reino Unido", us:"Estados Unidos", ca:"Canadá", au:"Austrália", de:"Alemanha", fr:"França", nl:"Países Baixos", sg:"Singapura", ae:"Emirados Árabes Unidos", nz:"Nova Zelândia", jp:"Japão", ie:"Irlanda", pt:"Portugal", es:"Espanha", se:"Suécia", ch:"Suíça"
  },
  ja: {
    uk:"イギリス", us:"アメリカ合衆国", ca:"カナダ", au:"オーストラリア", de:"ドイツ", fr:"フランス", nl:"オランダ", sg:"シンガポール", ae:"アラブ首長国連邦", nz:"ニュージーランド", jp:"日本", ie:"アイルランド", pt:"ポルトガル", es:"スペイン", se:"スウェーデン", ch:"スイス"
  }
};

const visaLabels: Partial<Record<LanguageCode, Record<string, string>>> = {
  es: {
    "Innovator Founder":"Fundador Innovador","Global Talent":"Talento Global","Skilled Worker":"Trabajador Cualificado","Start-up Visa":"Visa para Startups","Startup Visa":"Visa para Startups","Express Entry":"Entrada Exprés","Provincial Nominee":"Nominación Provincial","Business Innovation":"Innovación Empresarial","Skilled Independent":"Trabajador Cualificado Independiente","EU Blue Card":"Tarjeta Azul UE","Self-Employment":"Trabajo por Cuenta Propia","Freelance":"Autónomo","French Tech Visa":"Visa French Tech","Talent Passport":"Pasaporte de Talento","Entrepreneur":"Emprendedor","Highly Skilled Migrant":"Migrante Altamente Cualificado","EntrePass":"EntrePass","Tech.Pass":"Tech.Pass","Employment Pass":"Permiso de Empleo","Golden Visa":"Visa Dorada","Green Visa":"Visa Verde","Freelancer Visa":"Visa para Freelancers","Entrepreneur Work Visa":"Visa de Trabajo para Emprendedores","Investor Visa":"Visa de Inversor","Global Impact Visa":"Visa de Impacto Global","Business Manager":"Gestor Empresarial","Highly Skilled Professional":"Profesional Altamente Cualificado","Start-up Entrepreneur":"Emprendedor de Startup","Immigrant Investor":"Inversor Inmigrante","D7 Visa":"Visa D7","Tech Visa":"Visa Tecnológica","Entrepreneur Visa":"Visa de Emprendedor","Digital Nomad Visa":"Visa de Nómada Digital","Self-Employment Permit":"Permiso de Trabajo por Cuenta Propia","Work Permit":"Permiso de Trabajo","L Permit":"Permiso L","B Permit":"Permiso B"
  },
  fr: {
    "Innovator Founder":"Fondateur Innovateur","Global Talent":"Talent Mondial","Skilled Worker":"Travailleur Qualifié","Start-up Visa":"Visa Start-up","Startup Visa":"Visa Start-up","Express Entry":"Entrée Express","Provincial Nominee":"Programme des Candidats des Provinces","Business Innovation":"Innovation d'Entreprise","Skilled Independent":"Travailleur Qualifié Indépendant","EU Blue Card":"Carte Bleue UE","Self-Employment":"Travail Indépendant","Freelance":"Freelance","French Tech Visa":"Visa French Tech","Talent Passport":"Passeport Talent","Entrepreneur":"Entrepreneur","Highly Skilled Migrant":"Migrant Hautement Qualifié","EntrePass":"EntrePass","Tech.Pass":"Tech.Pass","Employment Pass":"Permis de Travail","Golden Visa":"Visa Doré","Green Visa":"Visa Vert","Freelancer Visa":"Visa Freelance","Entrepreneur Work Visa":"Visa de Travail Entrepreneur","Investor Visa":"Visa Investisseur","Global Impact Visa":"Visa d'Impact Mondial","Business Manager":"Gestionnaire d'Entreprise","Highly Skilled Professional":"Professionnel Hautement Qualifié","Start-up Entrepreneur":"Entrepreneur Start-up","Immigrant Investor":"Investisseur Immigrant","D7 Visa":"Visa D7","Tech Visa":"Visa Tech","Entrepreneur Visa":"Visa Entrepreneur","Digital Nomad Visa":"Visa Nomade Numérique","Self-Employment Permit":"Permis de Travail Indépendant","Work Permit":"Permis de Travail","L Permit":"Permis L","B Permit":"Permis B"
  },
  de: {
    "Innovator Founder":"Innovator Founder","Global Talent":"Global Talent","Skilled Worker":"Fachkräftevisum","Start-up Visa":"Start-up-Visum","Startup Visa":"Start-up-Visum","Express Entry":"Express Entry","Provincial Nominee":"Provincial Nominee","Business Innovation":"Unternehmensinnovation","Skilled Independent":"Unabhängige Fachkraft","EU Blue Card":"EU Blue Card","Self-Employment":"Selbstständigkeit","Freelance":"Freiberuflich","French Tech Visa":"French Tech Visa","Talent Passport":"Talentpass","Entrepreneur":"Unternehmer","Highly Skilled Migrant":"Hochqualifizierter Migrant","EntrePass":"EntrePass","Tech.Pass":"Tech.Pass","Employment Pass":"Beschäftigungspass","Golden Visa":"Golden Visa","Green Visa":"Green Visa","Freelancer Visa":"Freelancer-Visum","Entrepreneur Work Visa":"Unternehmer-Arbeitsvisum","Investor Visa":"Investorenvisum","Global Impact Visa":"Global Impact Visa","Business Manager":"Business Manager","Highly Skilled Professional":"Hochqualifizierte Fachkraft","Start-up Entrepreneur":"Start-up-Unternehmer","Immigrant Investor":"Immigrant Investor","D7 Visa":"D7-Visum","Tech Visa":"Tech-Visum","Entrepreneur Visa":"Unternehmervisum","Digital Nomad Visa":"Digital-Nomad-Visum","Self-Employment Permit":"Genehmigung zur Selbstständigkeit","Work Permit":"Arbeitserlaubnis","L Permit":"L-Bewilligung","B Permit":"B-Bewilligung"
  },
  zh: {
    "Innovator Founder":"创新者创始人","Global Talent":"全球人才","Skilled Worker":"技术工人","Start-up Visa":"初创企业签证","Startup Visa":"初创企业签证","Express Entry":"快速通道","Provincial Nominee":"省提名","Business Innovation":"商业创新","Skilled Independent":"独立技术移民","EU Blue Card":"欧盟蓝卡","Self-Employment":"自雇","Freelance":"自由职业","French Tech Visa":"法国科技签证","Talent Passport":"人才护照","Entrepreneur":"企业家","Highly Skilled Migrant":"高技能移民","EntrePass":"创业准证","Tech.Pass":"科技准证","Employment Pass":"就业准证","Golden Visa":"黄金签证","Green Visa":"绿色签证","Freelancer Visa":"自由职业者签证","Entrepreneur Work Visa":"企业家工作签证","Investor Visa":"投资者签证","Global Impact Visa":"全球影响力签证","Business Manager":"经营管理签证","Highly Skilled Professional":"高度专业人才","Start-up Entrepreneur":"初创企业家","Immigrant Investor":"投资移民","D7 Visa":"D7 签证","Tech Visa":"科技签证","Entrepreneur Visa":"企业家签证","Digital Nomad Visa":"数字游民签证","Self-Employment Permit":"自雇许可","Work Permit":"工作许可","L Permit":"L 类许可","B Permit":"B 类许可"
  },
  ar: {
    "Innovator Founder":"المؤسس المبتكر","Global Talent":"المواهب العالمية","Skilled Worker":"العامل الماهر","Start-up Visa":"تأشيرة الشركات الناشئة","Startup Visa":"تأشيرة الشركات الناشئة","Express Entry":"الدخول السريع","Provincial Nominee":"الترشيح الإقليمي","Business Innovation":"ابتكار الأعمال","Skilled Independent":"المهارات المستقلة","EU Blue Card":"البطاقة الزرقاء للاتحاد الأوروبي","Self-Employment":"العمل الحر","Freelance":"العمل المستقل","French Tech Visa":"تأشيرة French Tech","Talent Passport":"جواز المواهب","Entrepreneur":"رائد أعمال","Highly Skilled Migrant":"مهاجر عالي المهارة","EntrePass":"EntrePass","Tech.Pass":"Tech.Pass","Employment Pass":"تصريح التوظيف","Golden Visa":"التأشيرة الذهبية","Green Visa":"التأشيرة الخضراء","Freelancer Visa":"تأشيرة العمل الحر","Entrepreneur Work Visa":"تأشيرة عمل لرواد الأعمال","Investor Visa":"تأشيرة المستثمر","Global Impact Visa":"تأشيرة التأثير العالمي","Business Manager":"مدير أعمال","Highly Skilled Professional":"محترف عالي المهارة","Start-up Entrepreneur":"رائد أعمال ناشئ","Immigrant Investor":"مستثمر مهاجر","D7 Visa":"تأشيرة D7","Tech Visa":"تأشيرة التكنولوجيا","Entrepreneur Visa":"تأشيرة رائد الأعمال","Digital Nomad Visa":"تأشيرة الرحالة الرقمي","Self-Employment Permit":"تصريح العمل الحر","Work Permit":"تصريح عمل","L Permit":"تصريح L","B Permit":"تصريح B"
  },
  pt: {
    "Innovator Founder":"Fundador Inovador","Global Talent":"Talento Global","Skilled Worker":"Trabalhador Qualificado","Start-up Visa":"Visto para Startups","Startup Visa":"Visto para Startups","Express Entry":"Entrada Expressa","Provincial Nominee":"Nomeação Provincial","Business Innovation":"Inovação Empresarial","Skilled Independent":"Profissional Qualificado Independente","EU Blue Card":"Cartão Azul da UE","Self-Employment":"Trabalho por Conta Própria","Freelance":"Freelance","French Tech Visa":"Visto French Tech","Talent Passport":"Passaporte Talento","Entrepreneur":"Empreendedor","Highly Skilled Migrant":"Migrante Altamente Qualificado","EntrePass":"EntrePass","Tech.Pass":"Tech.Pass","Employment Pass":"Passe de Emprego","Golden Visa":"Visto Gold","Green Visa":"Visto Verde","Freelancer Visa":"Visto de Freelancer","Entrepreneur Work Visa":"Visto de Trabalho para Empreendedor","Investor Visa":"Visto de Investidor","Global Impact Visa":"Visto de Impacto Global","Business Manager":"Gestor de Negócios","Highly Skilled Professional":"Profissional Altamente Qualificado","Start-up Entrepreneur":"Empreendedor de Startup","Immigrant Investor":"Investidor Imigrante","D7 Visa":"Visto D7","Tech Visa":"Visto Tech","Entrepreneur Visa":"Visto de Empreendedor","Digital Nomad Visa":"Visto de Nómada Digital","Self-Employment Permit":"Autorização de Trabalho por Conta Própria","Work Permit":"Autorização de Trabalho","L Permit":"Permissão L","B Permit":"Permissão B"
  },
  ja: {
    "Innovator Founder":"イノベーター・ファウンダー","Global Talent":"グローバル・タレント","Skilled Worker":"熟練労働者","Start-up Visa":"スタートアップビザ","Startup Visa":"スタートアップビザ","Express Entry":"エクスプレス・エントリー","Provincial Nominee":"州推薦プログラム","Business Innovation":"ビジネス・イノベーション","Skilled Independent":"独立技能移民","EU Blue Card":"EUブルーカード","Self-Employment":"自営業","Freelance":"フリーランス","French Tech Visa":"フレンチテックビザ","Talent Passport":"タレント・パスポート","Entrepreneur":"起業家","Highly Skilled Migrant":"高度技能移民","EntrePass":"EntrePass","Tech.Pass":"Tech.Pass","Employment Pass":"就労パス","Golden Visa":"ゴールデンビザ","Green Visa":"グリーンビザ","Freelancer Visa":"フリーランサービザ","Entrepreneur Work Visa":"起業家就労ビザ","Investor Visa":"投資家ビザ","Global Impact Visa":"グローバル・インパクト・ビザ","Business Manager":"経営・管理","Highly Skilled Professional":"高度専門職","Start-up Entrepreneur":"スタートアップ起業家","Immigrant Investor":"移民投資家","D7 Visa":"D7ビザ","Tech Visa":"テックビザ","Entrepreneur Visa":"起業家ビザ","Digital Nomad Visa":"デジタルノマドビザ","Self-Employment Permit":"自営業許可","Work Permit":"就労許可","L Permit":"L許可","B Permit":"B許可"
  }
};

const sectionCopy: Record<LanguageCode, { explore: string; travelTo: string }> = {
  en:{ explore:"Explore visa and immigration routes by country", travelTo:"Travel to" },
  es:{ explore:"Explora rutas de visa e inmigración por país", travelTo:"Ir a" },
  fr:{ explore:"Explorez les voies de visa et d'immigration par pays", travelTo:"Aller vers" },
  de:{ explore:"Visa- und Einwanderungswege nach Land erkunden", travelTo:"Reisen nach" },
  zh:{ explore:"按国家探索签证和移民路线", travelTo:"前往" },
  ar:{ explore:"استكشف مسارات التأشيرات والهجرة حسب الدولة", travelTo:"الانتقال إلى" },
  pt:{ explore:"Explore rotas de visto e imigração por país", travelTo:"Ir para" },
  ja:{ explore:"国別にビザ・移民ルートを探す", travelTo:"移動先" }
};

export function localizeCountryName(language: LanguageCode, code: string, fallback: string): string {
  return countryNames[language]?.[code] || fallback;
}

export function localizeVisaLabel(language: LanguageCode, label: string): string {
  if (language === "en") return label;
  return visaLabels[language]?.[label] || label;
}

export function getDestinationSectionCopy(language: LanguageCode) {
  return sectionCopy[language] || sectionCopy.en;
}
