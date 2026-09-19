export type CountryCode =
  | "uk" | "us" | "ca" | "au" | "de" | "fr" | "nl" | "sg"
  | "ae" | "nz" | "jp" | "ie" | "pt" | "es" | "se" | "ch";

export type CountryPublicData = {
  code: CountryCode;
  name: string;
  flag: string;
  authority: string;
  officialUrl: string;
  heroImage: string;
  summary: string;
};

export const COUNTRY_CODES: CountryCode[] = [
  "uk","us","ca","au","de","fr","nl","sg","ae","nz","jp","ie","pt","es","se","ch"
];

export const COUNTRY_PUBLIC_DATA: Record<CountryCode, CountryPublicData> = {
  uk: {
    code:"uk", name:"United Kingdom", flag:"gb",
    authority:"GOV.UK / UK Visas and Immigration",
    officialUrl:"https://www.gov.uk/browse/visas-immigration",
    heroImage:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=2200&q=88",
    summary:"Explore UK work, business, talent, study, family and visitor routes, with a live dedicated Visa Assistant for Innovator Founder."
  },
  us: {
    code:"us", name:"United States", flag:"us",
    authority:"USCIS / U.S. Department of State",
    officialUrl:"https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/all-visa-categories.html",
    heroImage:"https://unsplash.com/photos/L_U4jhwZ6hY/download?force=true&w=2200",
    summary:"Browse United States employment, talent, study, family, visitor and humanitarian visa pathways in one country catalogue."
  },
  ca: {
    code:"ca", name:"Canada", flag:"ca",
    authority:"Immigration, Refugees and Citizenship Canada",
    officialUrl:"https://www.canada.ca/en/immigration-refugees-citizenship/services.html",
    heroImage:"https://unsplash.com/photos/C2keINMOhIE/download?force=true&w=2200",
    summary:"Explore Canada permanent residence, economic immigration, work, study, family and visitor routes from one destination hub."
  },
  au: {
    code:"au", name:"Australia", flag:"au",
    authority:"Department of Home Affairs",
    officialUrl:"https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
    heroImage:"https://unsplash.com/photos/HlNhYW50CJs/download?force=true&w=2200",
    summary:"Review Australia skilled, employer-sponsored, study, family, working-holiday, business and humanitarian visa routes."
  },
  de: {
    code:"de", name:"Germany", flag:"de",
    authority:"Federal Government / Federal Foreign Office",
    officialUrl:"https://www.make-it-in-germany.com/en/visa-residence/types",
    heroImage:"https://unsplash.com/photos/CPKYsEel_Jw/download?force=true&w=2200",
    summary:"Explore Germany work, talent, Blue Card, opportunity, self-employment, study, training and family residence pathways."
  },
  fr: {
    code:"fr", name:"France", flag:"fr",
    authority:"France-Visas",
    officialUrl:"https://www.france-visas.gouv.fr/en/",
    heroImage:"https://unsplash.com/photos/IrlGJTJd-qI/download?force=true&w=2200",
    summary:"Browse France professional, talent, entrepreneur, study, family, visitor and long-stay visa routes."
  },
  nl: {
    code:"nl", name:"Netherlands", flag:"nl",
    authority:"Immigration and Naturalisation Service (IND)",
    officialUrl:"https://ind.nl/en/residence-permits",
    heroImage:"https://unsplash.com/photos/h8hXSf0_Kzk/download?force=true&w=2200",
    summary:"Explore Netherlands highly skilled migrant, Blue Card, start-up, self-employment, study and family residence routes."
  },
  sg: {
    code:"sg", name:"Singapore", flag:"sg",
    authority:"MOM / Immigration & Checkpoints Authority",
    officialUrl:"https://www.mom.gov.sg/passes-and-permits",
    heroImage:"https://unsplash.com/photos/HaH5Zap_VXE/download?force=true&w=2200",
    summary:"Review Singapore professional work passes, entrepreneur routes, study, family and residence pathways."
  },
  ae: {
    code:"ae", name:"United Arab Emirates", flag:"ae",
    authority:"UAE Government / ICP",
    officialUrl:"https://u.ae/en/information-and-services/visa-and-emirates-id/types-of-visas",
    heroImage:"https://unsplash.com/photos/7Hs7EkN9S9o/download?force=true&w=2200",
    summary:"Explore UAE Golden, Green, work, remote-work, business, study, family, visit and transit residence routes."
  },
  nz: {
    code:"nz", name:"New Zealand", flag:"nz",
    authority:"Immigration New Zealand",
    officialUrl:"https://www.immigration.govt.nz/new-zealand-visas/visa-lists/all-visas",
    heroImage:"https://unsplash.com/photos/8M7I-jXlWR8/download?force=true&w=2200",
    summary:"Browse New Zealand skilled, employer, business, study, family, visitor and residence visa pathways."
  },
  jp: {
    code:"jp", name:"Japan", flag:"jp",
    authority:"Ministry of Foreign Affairs / Immigration Services Agency",
    officialUrl:"https://www.mofa.go.jp/j_info/visit/visa/",
    heroImage:"https://unsplash.com/photos/1NhHaL92wjg/download?force=true&w=2200",
    summary:"Explore Japan work, highly skilled professional, business manager, study, family and short-stay visa categories."
  },
  ie: {
    code:"ie", name:"Ireland", flag:"ie",
    authority:"Irish Immigration Service",
    officialUrl:"https://www.irishimmigration.ie/coming-to-work-in-ireland/",
    heroImage:"https://unsplash.com/photos/wXuWMhVqL7k/download?force=true&w=2200",
    summary:"Review Ireland employment, critical skills, entrepreneur, study, family and visitor immigration routes."
  },
  pt: {
    code:"pt", name:"Portugal", flag:"pt",
    authority:"AIMA / Portuguese Government",
    officialUrl:"https://vistos.mne.gov.pt/en/",
    heroImage:"https://unsplash.com/photos/SuwpP1pl47s/download?force=true&w=2200",
    summary:"Explore Portugal employment, entrepreneur, D7, digital nomad, study, family and residence visa pathways."
  },
  es: {
    code:"es", name:"Spain", flag:"es",
    authority:"Spanish Government / Ministry of Foreign Affairs",
    officialUrl:"https://www.exteriores.gob.es/Consulados/",
    heroImage:"https://unsplash.com/photos/E6hOXV2aVMw/download?force=true&w=2200",
    summary:"Browse Spain work, entrepreneur, highly qualified, digital nomad, study, family and residence routes."
  },
  se: {
    code:"se", name:"Sweden", flag:"se",
    authority:"Swedish Migration Agency",
    officialUrl:"https://www.migrationsverket.se/English/Private-individuals.html",
    heroImage:"https://unsplash.com/photos/MD81eKcb9WY/download?force=true&w=2200",
    summary:"Explore Sweden work permits, EU Blue Card, self-employment, research, study, family and visitor routes."
  },
  ch: {
    code:"ch", name:"Switzerland", flag:"ch",
    authority:"State Secretariat for Migration (SEM)",
    officialUrl:"https://www.sem.admin.ch/sem/en/home/themen/einreise.html",
    heroImage:"https://unsplash.com/photos/hg8aJi7IDEY/download?force=true&w=2200",
    summary:"Review Switzerland work, residence, study, family, business and short-stay entry pathways."
  }
};

export function isCountryCode(value: string): value is CountryCode {
  return COUNTRY_CODES.includes(value as CountryCode);
}
