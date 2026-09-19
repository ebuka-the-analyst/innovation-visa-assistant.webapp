import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Award, Baby, BookOpen, BriefcaseBusiness, Building2, Camera, Church, ExternalLink, GraduationCap, Handshake, Heart, House, Languages, Leaf, Lightbulb, Lock, Microscope, Palette, Plane, Repeat2, Rocket, Scale, Search, ShieldCheck, Sparkles, Stethoscope, Trophy, Users, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCatalogueText } from "@/lib/catalogue-i18n";
import { localizeCountryName } from "@/lib/global-destination-i18n";
import CountryPublicNav from "@/components/CountryPublicNav";
import type { CountryCode } from "@/lib/country-public-data";

const countryHeroImages: Record<string, string> = {
  us: "https://unsplash.com/photos/L_U4jhwZ6hY/download?force=true&w=2200",
  ca: "https://unsplash.com/photos/C2keINMOhIE/download?force=true&w=2200",
  au: "https://unsplash.com/photos/HlNhYW50CJs/download?force=true&w=2200",
  de: "https://unsplash.com/photos/CPKYsEel_Jw/download?force=true&w=2200",
  fr: "https://unsplash.com/photos/IrlGJTJd-qI/download?force=true&w=2200",
  nl: "https://unsplash.com/photos/h8hXSf0_Kzk/download?force=true&w=2200",
  sg: "https://unsplash.com/photos/HaH5Zap_VXE/download?force=true&w=2200",
  ae: "https://unsplash.com/photos/7Hs7EkN9S9o/download?force=true&w=2200",
  nz: "https://unsplash.com/photos/8M7I-jXlWR8/download?force=true&w=2200",
  jp: "https://unsplash.com/photos/1NhHaL92wjg/download?force=true&w=2200",
  ie: "https://unsplash.com/photos/wXuWMhVqL7k/download?force=true&w=2200",
  pt: "https://unsplash.com/photos/SuwpP1pl47s/download?force=true&w=2200",
  es: "https://unsplash.com/photos/E6hOXV2aVMw/download?force=true&w=2200",
  se: "https://unsplash.com/photos/MD81eKcb9WY/download?force=true&w=2200",
  ch: "https://unsplash.com/photos/hg8aJi7IDEY/download?force=true&w=2200",
};

type Route = { name:string; description:string };
type Group = { title:string; icon: typeof BriefcaseBusiness; routes:Route[] };
type Country = { name:string; flag:string; authority:string; officialUrl:string; groups:Group[] };
const r=(name:string,description:string):Route=>({name,description});
const g=(title:string,icon:typeof BriefcaseBusiness,routes:Route[]):Group=>({title,icon,routes});

const countries:Record<string,Country>={
 us:{name:"United States",flag:"us",authority:"USCIS / U.S. Department of State",officialUrl:"https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/all-visa-categories.html",groups:[
  g("Employment & Talent",BriefcaseBusiness,[r("EB-1","Priority workers: extraordinary ability, outstanding professors/researchers and certain multinational executives."),r("EB-2 / National Interest Waiver","Advanced-degree or exceptional-ability permanent residence, including eligible NIW cases."),r("EB-3","Skilled workers, professionals and other workers."),r("O-1","Extraordinary ability or achievement."),r("H-1B","Specialty occupation and qualifying professional employment."),r("L-1","Intracompany transferee."),r("E-1 Treaty Trader","Treaty-based trade activity."),r("E-2 Treaty Investor","Treaty-based investment activity."),r("TN","Qualifying Canadian and Mexican professionals."),r("P visas","Athletes, artists and entertainers."),r("R-1","Religious workers."),r("H-2A","Temporary agricultural workers."),r("H-2B","Temporary non-agricultural workers."),r("J-1","Exchange visitors."),r("Q-1","International cultural exchange.")]),
  g("Study & Exchange",GraduationCap,[r("F-1","Academic student."),r("M-1","Vocational student."),r("J-1 Exchange Visitor","Approved exchange programmes.")]),
  g("Family & Permanent Residence",Heart,[r("Immediate Relative immigrant visas","Spouse, child or parent categories for qualifying U.S. citizens."),r("Family Preference immigrant visas","Family-sponsored preference categories."),r("K-1","Fiancé(e) of a U.S. citizen."),r("K-3","Spouse of a U.S. citizen in qualifying circumstances."),r("Diversity Visa","Diversity immigrant visa programme where eligible.")]),
  g("Visit & Transit",Plane,[r("B-1","Temporary business visitor."),r("B-2","Tourism, visits and certain medical travel."),r("C","Transit."),r("D","Crewmember."),r("ESTA / Visa Waiver Programme","Travel authorisation for eligible visa-waiver travellers.")]),
  g("Humanitarian & Other",Building2,[r("Refugee","Refugee admission programme."),r("Asylum","Protection for qualifying applicants."),r("U visa","Certain victims of qualifying criminal activity."),r("T visa","Certain victims of human trafficking."),r("S visa","Certain witnesses or informants."),r("Humanitarian parole","Temporary parole in qualifying urgent circumstances.")])]},
 ca:{name:"Canada",flag:"ca",authority:"Immigration, Refugees and Citizenship Canada",officialUrl:"https://www.canada.ca/en/immigration-refugees-citizenship/services.html",groups:[
  g("Permanent Residence & Economic",Sparkles,[r("Express Entry – Federal Skilled Worker","Economic immigration for eligible skilled workers."),r("Express Entry – Canadian Experience Class","For eligible applicants with Canadian skilled work experience."),r("Express Entry – Federal Skilled Trades","For eligible skilled tradespeople."),r("Provincial Nominee Program","Province or territory nomination pathways."),r("Atlantic Immigration Program","Employer-led permanent residence in Atlantic Canada."),r("Rural Community Immigration Pilot","Community-based permanent residence pathway."),r("Francophone Community Immigration Pilot","Francophone community pathway."),r("Quebec-selected skilled workers","Quebec-selected economic immigration."),r("Caregiver pathways","Eligible home-care worker permanent residence pathways."),r("Start-up Visa","Entrepreneur permanent residence programme, subject to current programme rules.")]),
  g("Work",BriefcaseBusiness,[r("Employer-specific work permit","Work for the employer and under the conditions stated on the permit."),r("Open work permit","Open employment permission for eligible circumstances."),r("Post-Graduation Work Permit","Eligible graduates of designated learning institutions."),r("International Experience Canada – Working Holiday","Youth mobility open work permit for eligible nationalities."),r("IEC – Young Professionals","Employer-specific youth mobility category."),r("IEC – International Co-op","Internship category for eligible students."),r("International Mobility Program","LMIA-exempt work permit streams where eligible."),r("Temporary Foreign Worker Program","LMIA-supported temporary work.")]),
  g("Study",GraduationCap,[r("Study Permit","Study at a designated learning institution."),r("Student Direct Stream / related processing","Where a current facilitated processing route applies; verify current availability.")]),
  g("Family",Heart,[r("Spouse or partner sponsorship","Permanent residence family sponsorship."),r("Dependent child sponsorship","Eligible dependent children."),r("Parents and Grandparents Program","Family sponsorship when intake is available."),r("Super Visa","Longer family visits for eligible parents and grandparents.")]),
  g("Visit, Transit & Protection",Plane,[r("Visitor Visa (TRV)","Temporary resident visa for eligible visitors."),r("Electronic Travel Authorization (eTA)","Travel authorisation for eligible visa-exempt travellers."),r("Transit Visa","Transit through Canada where required."),r("Temporary Resident Permit","For certain otherwise inadmissible travellers."),r("Refugee / asylum protection","Protection pathways for qualifying applicants.")])]},
 au:{name:"Australia",flag:"au",authority:"Department of Home Affairs",officialUrl:"https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",groups:[
  g("Skilled & Employer Work",BriefcaseBusiness,[r("Skills in Demand (subclass 482)","Employer-sponsored temporary skilled work."),r("Employer Nomination Scheme (186)","Employer-sponsored permanent residence."),r("Skilled Independent (189)","Points-tested independent skilled migration."),r("Skilled Nominated (190)","State or territory nominated skilled migration."),r("Skilled Work Regional (491)","Regional provisional skilled migration."),r("Skilled Employer Sponsored Regional (494)","Regional employer sponsorship."),r("Permanent Residence Skilled Regional (191)","Permanent residence for eligible regional provisional visa holders."),r("Temporary Work Short Stay Specialist (400)","Short-term highly specialised work."),r("Temporary Activity (408)","Specified temporary activities."),r("International Relations (403)","Work connected to international arrangements."),r("National Innovation (858)","Invitation-based permanent visa for exceptional achievement.")]),
  g("Study & Training",GraduationCap,[r("Student (500)","Full-time study with an eligible provider."),r("Student Guardian (590)","Guardian for an eligible international student."),r("Training (407)","Occupational training and professional development.")]),
  g("Family",Heart,[r("Partner visas (820/801, 309/100)","Partner migration onshore or offshore."),r("Prospective Marriage (300)","Fiancé(e) pathway."),r("Parent visas","Parent migration categories, including contributory routes."),r("Child visas","Eligible dependent, adoption and orphan-relative child categories."),r("Other family visas","Remaining relative and carer family categories.")]),
  g("Visit & Working Holiday",Plane,[r("Visitor (600)","Tourism, family and eligible business visitor activity."),r("Electronic Travel Authority (601)","ETA for eligible passport holders."),r("eVisitor (651)","Visitor permission for eligible passport holders."),r("Working Holiday (417)","Work and holiday for eligible young adults."),r("Work and Holiday (462)","Work and holiday for eligible partner-country citizens."),r("Transit (771)","Transit through Australia."),r("Medical Treatment (602)","Travel for medical treatment or support.")]),
  g("Business, Residence & Humanitarian",Building2,[r("Business Innovation and Investment Permanent (888)","Permanent stage for eligible legacy business/investment holders."),r("Resident Return (155/157)","Travel facility for eligible permanent residents."),r("Refugee and Humanitarian visas","Offshore and onshore humanitarian/protection categories."),r("Bridging visas","Temporary lawful status while immigration matters are resolved.")])]},
 de:{name:"Germany",flag:"de",authority:"Federal Government / Federal Foreign Office",officialUrl:"https://www.make-it-in-germany.com/en/visa-residence/types",groups:[
  g("Work & Talent",BriefcaseBusiness,[r("EU Blue Card","Highly qualified employment meeting the applicable requirements."),r("Work visa for qualified professionals","Qualified employment with recognised/comparable qualifications."),r("Visa for professionally experienced workers","Employment route based on qualifying professional experience."),r("Opportunity Card (Chancenkarte)","Job-search route for eligible applicants."),r("Visa for IT professionals","Employment options for qualifying IT specialists."),r("Visa for research","Research activity in Germany."),r("Intra-corporate transfer (ICT Card)","Qualifying company transfers."),r("Recognition partnership","Work while completing qualification recognition where eligible.")]),
  g("Business",Sparkles,[r("Self-employment – business","Residence for qualifying commercial self-employment."),r("Self-employment – freelance","Residence for qualifying freelance professions.")]),
  g("Study & Training",GraduationCap,[r("Study visa","University study and qualifying preparatory measures."),r("Seeking a place in higher education","Search for a study place where eligible."),r("Vocational training visa","Company or school-based vocational training."),r("Seeking vocational training place","Search for eligible vocational training."),r("Language course visa","Qualifying intensive language study.")]),
  g("Family & Other",Heart,[r("Family reunification","Eligible spouses, children and other qualifying family circumstances."),r("Visa for marriage / joining spouse","Family formation or reunification route."),r("Schengen short-stay visa","Visits up to 90 days where a visa is required."),r("Airport transit visa","Airport transit where required.")])]},
 fr:{name:"France",flag:"fr",authority:"France-Visas",officialUrl:"https://www.france-visas.gouv.fr/en/",groups:[
  g("Professional & Talent",BriefcaseBusiness,[r("Talent Passport / Talent residence routes","Qualifying highly skilled, innovative, artistic, research and investment profiles."),r("Employee / salaried worker","Long-stay employment route."),r("Temporary worker","Temporary salaried employment."),r("Entrepreneur / self-employed","Business creation or self-employed professional activity."),r("Intra-company mobility","Qualifying assignments within international groups."),r("Researcher","Research and academic mobility."),r("Artist / cultural profession","Qualifying artistic and cultural professional activity."),r("Working Holiday","Youth mobility for eligible nationalities.")]),
  g("Study & Training",GraduationCap,[r("Student","Long-stay study."),r("Student – entrance examination","Short-stay student examination route."),r("School-going minor","Long-stay schooling for eligible minors."),r("Intern / trainee","Qualifying internship or professional training."),r("Au pair","Eligible au-pair stay.")]),
  g("Family",Heart,[r("Family of French national","Spouse, child, parent and other qualifying relationships."),r("Family reunification","Join an eligible foreign resident in France."),r("Family of EU/EEA/Swiss citizen","Qualifying family-member route.")]),
  g("Visit & Other",Plane,[r("Schengen short-stay visa","Tourism, business, family visits and other stays up to 90 days."),r("Airport transit visa","Transit through the international zone where required."),r("Long-stay visitor","Residence without professional activity."),r("Medical stay","Travel connected with medical treatment."),r("Overseas territories visa","Visas applicable to French overseas territories where required.")])]},
 nl:{name:"Netherlands",flag:"nl",authority:"Immigration and Naturalisation Service (IND)",officialUrl:"https://ind.nl/en/residence-permits",groups:[
  g("Work & Talent",BriefcaseBusiness,[r("Highly skilled migrant","Employment with an IND-recognised sponsor."),r("EU Blue Card","Highly qualified employment route."),r("Paid employment / single permit (GVVA)","Employment requiring combined residence and work authorisation."),r("Intra-corporate transferee","Manager, specialist or trainee transfer."),r("Researcher","Scientific research under the relevant directive."),r("Orientation year","Post-study/research job-search year for eligible graduates and researchers."),r("Essential start-up personnel","Pilot residence route for qualifying start-up employees."),r("Seasonal work","Qualifying seasonal employment."),r("Working holiday","Youth exchange/work holiday where eligible.")]),
  g("Business",Sparkles,[r("Start-up","Innovative business with a recognised facilitator."),r("Self-employed person","Entrepreneur or self-employed professional route."),r("Foreign investor / business routes","Applicable business residence permissions under current IND rules.")]),
  g("Study",GraduationCap,[r("Study at university or higher professional education","Residence for recognised higher education."),r("Secondary or vocational education","Qualifying secondary/MBO study."),r("Exchange","Recognised exchange programmes.")]),
  g("Family & Other",Heart,[r("Partner / spouse","Residence with a qualifying partner."),r("Minor child","Family residence for qualifying children."),r("Parent / family under EU law","Applicable family and EU-law routes."),r("Short-stay Schengen visa","Visits up to 90 days where required."),r("MVV long-stay entry visa","Provisional residence visa where required."),r("Asylum","Protection for qualifying applicants.")])]},
 sg:{name:"Singapore",flag:"sg",authority:"MOM / Immigration & Checkpoints Authority",officialUrl:"https://www.mom.gov.sg/passes-and-permits",groups:[
  g("Professional Work",BriefcaseBusiness,[r("Employment Pass","Foreign professionals, managers and executives."),r("S Pass","Skilled workers meeting current eligibility requirements."),r("Overseas Networks & Expertise Pass","Top talent across qualifying fields."),r("Personalised Employment Pass","Eligible high-earning professionals."),r("EntrePass","Eligible founders of venture-backed or innovative businesses."),r("Tech.Pass / successor arrangements","Technology talent route subject to current programme status."),r("Work Permit","Approved sector-specific semi-skilled work."),r("Miscellaneous Work Pass","Certain short-term assignments."),r("Training Employment Pass","Practical training for eligible foreign professionals."),r("Training Work Permit","Practical training for eligible semi-skilled trainees."),r("Work Holiday Pass","Eligible students and graduates under participating programmes.")]),
  g("Study & Family",GraduationCap,[r("Student's Pass","Full-time study at an approved institution."),r("Dependant's Pass","Eligible spouses and children of qualifying work-pass holders."),r("Long-Term Visit Pass","Eligible family members under MOM or ICA rules."),r("Long-Term Visit Pass Plus","Longer-term family permission in qualifying ICA cases.")]),
  g("Visit & Residence",Plane,[r("Short-Term Visit Pass","Short visits for tourism, social or business purposes."),r("Singapore entry visa","Entry visa for visa-required nationalities."),r("Permanent Residence","PR schemes for eligible professionals, investors and family members.")])]},
 ae:{name:"United Arab Emirates",flag:"ae",authority:"UAE Government / ICP",officialUrl:"https://u.ae/en/information-and-services/visa-and-emirates-id/types-of-visas",groups:[
  g("Long-term & Business Residence",Sparkles,[r("Golden Visa","Long-term residence for qualifying investors, entrepreneurs, exceptional talent, scientists, students and other eligible categories."),r("Green Visa – skilled worker","Five-year self-sponsored residence for qualifying skilled workers."),r("Green Visa – freelancer / self-employed","Five-year self-sponsored residence for eligible freelancers and self-employed people."),r("Green Visa – investor / business partner","Residence for qualifying investors and business partners."),r("Investor / partner residence","Business-owner and investor residence options under applicable emirate/federal rules."),r("Blue Visa","Long-term residence for qualifying environmental contributors.")]),
  g("Work & Remote",BriefcaseBusiness,[r("Standard Work Visa","Employer-sponsored government or private-sector employment."),r("Domestic Worker Visa","Residence and work for eligible domestic workers."),r("Virtual Work Residence Visa","Live in the UAE while working remotely for an overseas organisation."),r("Jobseeker Visit Visa","Visit to explore employment opportunities."),r("Visit Visa to Explore Business Opportunities","Visit to explore investment or business opportunities.")]),
  g("Study & Family",GraduationCap,[r("Student Visa","Residence for study under parent or accredited institution sponsorship."),r("Family Residence Visa","Residence for qualifying family members of residents."),r("Residence for families of university students","Qualifying family residence connected to a student."),r("Retirement Residence","Residence for eligible retirees.")]),
  g("Visit & Transit",Plane,[r("Tourist Visa","Tourism visit permission."),r("Visit Visa","Family, friends and other eligible visit purposes."),r("Transit Visa","Transit permission, including applicable 48/96-hour arrangements."),r("Medical Visa / Patient Entry Permit","Entry for qualifying medical treatment."),r("Multiple-entry visit options","Longer or repeated visit permissions where eligibility rules are met.")])]},
 nz:{name:"New Zealand",flag:"nz",authority:"Immigration New Zealand",officialUrl:"https://www.immigration.govt.nz/visas/",groups:[
  g("Work",BriefcaseBusiness,[r("Accredited Employer Work Visa","Work for an accredited employer in an approved job."),r("Post Study Work Visa","Work after eligible New Zealand study."),r("Working Holiday Visas","Country-specific youth working holiday schemes."),r("Specific Purpose Work Visa","Work for an approved specific purpose or event."),r("Partner of a Worker Work Visa","Work based on an eligible partner's status."),r("Partner of a Student Work Visa","Work based on an eligible student's status."),r("Religious Worker Work Visa","Qualifying religious work."),r("Recognised Seasonal Employer Limited Visa","Seasonal horticulture/viticulture work."),r("Business Investor Work Visa","Invest in and actively run an established business."),r("Entrepreneur Work Visa","Legacy/eligible self-employment business route subject to current availability.")]),
  g("Residence",Sparkles,[r("Skilled Migrant Category Resident Visa","Points/skills-based residence."),r("Straight to Residence Visa","Eligible Green List Tier 1 employment."),r("Work to Residence Visa","Eligible work-to-residence pathway."),r("Care Workforce Work to Residence","Eligible care workforce residence."),r("Transport Work to Residence","Eligible transport workforce residence."),r("Active Investor Plus Visa","Residence through qualifying investment."),r("Business Investor Resident Visa","Residence after qualifying business-investor activity."),r("Permanent Resident Visa","Permanent residence for eligible resident visa holders."),r("Pacific Access Category","Residence for eligible Pacific nationals selected under the scheme."),r("Samoan Quota Resident Visa","Residence under the Samoa quota."),r("Religious Workers Resident Visa","Residence for qualifying religious workers.")]),
  g("Study",GraduationCap,[r("Fee Paying Student Visa","Full-time fee-paying study."),r("Pathway Student Visa","Up to three approved programmes in sequence."),r("English Language Student Visa","Full-time English-language study."),r("Dependent Child Student Visa","School study for eligible dependent children."),r("Exchange Student Visa","Approved exchange study."),r("Foreign Government Supported Student Visa","Study supported by a foreign government.")]),
  g("Family & Visit",Heart,[r("Partner visas","Visitor, work and residence routes for eligible partners."),r("Dependent Child visas","Visitor, student and resident routes for eligible children."),r("Parent Resident Visa","Residence for eligible parents."),r("Parent Boost Visitor Visa","Longer visits for eligible parents."),r("Visitor Visa","Tourism and family visits."),r("Business Visitor Visa","Short business visits."),r("NZeTA","Travel authority for eligible visa-waiver travellers."),r("Transit Visa","Transit through New Zealand where required.")])]},
 jp:{name:"Japan",flag:"jp",authority:"Ministry of Foreign Affairs of Japan",officialUrl:"https://www.mofa.go.jp/j_info/visit/visa/long/index.html",groups:[
  g("Working Visas",BriefcaseBusiness,[r("Professor","Academic teaching/research."),r("Artist","Professional artistic activity."),r("Religious Activities","Religious work."),r("Journalist","Professional journalism."),r("Business Manager","Business management or administration."),r("Legal / Accounting Services","Licensed legal or accounting professions."),r("Medical Services","Qualifying medical professions."),r("Researcher","Research activity."),r("Instructor","Teaching at qualifying educational institutions."),r("Engineer / Specialist in Humanities / International Services","Professional technical, humanities or international-services work."),r("Nursing Care","Certified nursing-care work."),r("Intra-company Transferee","Qualifying company transfer."),r("Skilled Labor","Specified skilled occupations."),r("Specified Skilled Worker","Specified industry work under SSW status."),r("Technical Intern Training","Technical intern programme."),r("Highly Skilled Professional","Points-based highly skilled professional status.")]),
  g("General & Study",GraduationCap,[r("Student","Study at a qualifying educational institution."),r("Cultural Activities","Unpaid academic/artistic/cultural study."),r("Training","Non-employment skills/knowledge training."),r("Dependent","Eligible dependants of certain long-term residents.")]),
  g("Specified & Family",Heart,[r("Designated Activities","Activities individually designated by the Minister of Justice, including certain working holiday and other programmes."),r("Spouse or Child of Japanese National","Family status for eligible spouse/child."),r("Spouse or Child of Permanent Resident","Family status for eligible spouse/child."),r("Long-Term Resident","Status for designated family/humanitarian circumstances."),r("Permanent Resident","Permanent residence status for eligible applicants.")]),
  g("Short Stay",Plane,[r("Temporary Visitor","Tourism, family visits, business and other permitted short stays."),r("Transit Visa","Transit where required."),r("Medical Stay Visa","Medical treatment and accompanying persons where eligible.")])]},
 ie:{name:"Ireland",flag:"ie",authority:"Immigration Service Delivery",officialUrl:"https://www.irishimmigration.ie/",groups:[
  g("Work & Business",BriefcaseBusiness,[r("Critical Skills Employment Permit route","Employment and immigration permission for qualifying critical-skills roles."),r("General Employment Permit route","Employment and immigration permission for eligible occupations."),r("Intra-Company Transfer Employment Permit route","Qualifying company transfers."),r("Contract for Services Employment Permit route","Eligible contract-service employment."),r("Sport and Cultural Employment Permit route","Eligible sports/cultural employment."),r("Exchange Agreement Employment Permit route","Employment under approved exchange agreements."),r("Atypical Working Scheme","Certain short-term specialised work."),r("Start-up Entrepreneur Programme (STEP)","Residence permission for qualifying innovative entrepreneurs."),r("Working Holiday Authorisation","Youth mobility for eligible nationalities.")]),
  g("Study",GraduationCap,[r("Long Stay D Study Visa","Study longer than 90 days for visa-required nationals."),r("Short Stay C Study Visa","Short study up to 90 days where applicable."),r("Third Level Graduate Programme","Post-study permission for eligible graduates."),r("English-language / higher-education student permission","Eligible programmes under current student immigration rules.")]),
  g("Family",Heart,[r("Join Family – Irish national","Join an eligible Irish citizen family member."),r("Join Family – non-EEA sponsor","Join an eligible non-EEA resident sponsor."),r("EU Treaty Rights family route","Qualifying family of EU/EEA/Swiss citizens."),r("Family reunification for international protection holders","Statutory family reunification where eligible.")]),
  g("Visit & Other",Plane,[r("Short Stay C Visit Visa","Tourism, family/friend visits and other permitted short stays."),r("Short Stay C Business Visa","Eligible short business travel."),r("Transit Visa","Transit where required."),r("Long Stay D Visa","Entry visa for qualifying stays over 90 days."),r("Volunteer Permission","Eligible volunteering."),r("Minister of Religion Permission","Eligible religious work."),r("International Protection","Asylum/protection process for qualifying applicants.")])]},
 pt:{name:"Portugal",flag:"pt",authority:"Portuguese Government / AIMA",officialUrl:"https://www.gov.pt/temas/estrangeiros-em-portugal",groups:[
  g("Work & Business",BriefcaseBusiness,[r("Residence Visa – employed work","Residence for qualifying subordinate employment."),r("Residence Visa – independent work / entrepreneur (D2)","Self-employed activity or entrepreneurship."),r("Highly qualified activity / D3","Residence for qualifying highly qualified work."),r("EU Blue Card","Highly qualified employment under EU rules."),r("Job Seeker Visa","Entry to seek qualifying employment under current rules."),r("Digital Nomad / remote work residence","Residence for eligible remote workers."),r("Temporary Stay Visa – work","Temporary employed or independent work under one year."),r("Seasonal Work Visa","Qualifying seasonal employment."),r("Intra-corporate transfer","Qualifying ICT residence.")]),
  g("Income, Investment & Residence",Sparkles,[r("D7 Residence Visa","Residence for eligible applicants with qualifying own/passive income."),r("Residence Permit for Investment Activity (ARI)","Qualifying investment residence programme under current eligible investment rules."),r("Retirement / own-income residence","Residence commonly processed through the D7 framework where eligible.")]),
  g("Study & Family",GraduationCap,[r("Study Residence Visa","Higher education and other qualifying long-term study."),r("Student Temporary Stay Visa","Qualifying shorter study/training."),r("Research / highly qualified academic activity","Research and academic residence routes."),r("Family Reunification","Join an eligible resident family member."),r("Family member of EU citizen","Residence under EU free-movement rules where eligible.")]),
  g("Visit & Transit",Plane,[r("Schengen Short-Stay Visa","Visits up to 90 days where required."),r("Airport Transit Visa","Airport transit where required."),r("Temporary Stay Visa","Stays longer than 90 days but generally under one year for specified purposes.")])]},
 es:{name:"Spain",flag:"es",authority:"Ministry of Foreign Affairs, European Union and Cooperation",officialUrl:"https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/inicio.aspx",groups:[
  g("Work & Business",BriefcaseBusiness,[r("Employee Work Visa","Residence and employment under the general scheme."),r("Self-employed Work Visa","Residence to carry out self-employed activity."),r("Highly Qualified Worker Visa","Residence for qualifying highly skilled professionals."),r("Intra-company Transfer Visa","Qualifying company transfers."),r("Entrepreneur Visa","Innovative entrepreneurial activity of particular economic interest."),r("Digital Nomad Visa","Residence for qualifying international remote workers."),r("Researcher Visa","Research, development and innovation activity."),r("Audiovisual Sector Professional Visa","Qualifying audiovisual professionals."),r("Work Visa with Permit Exemption","Specified work categories exempt from ordinary work authorisation.")]),
  g("Residence, Study & Family",GraduationCap,[r("Non-lucrative Residence Visa","Residence without gainful activity."),r("Study Visa","Long-term study, training and related eligible activities."),r("Internship Visa","Qualifying internship."),r("Family Reunification Visa","Join qualifying non-EU resident family."),r("Family of Spanish Citizen Visa","Residence for qualifying family of Spanish citizens."),r("Family of EU Citizen Visa","Qualifying family under EU free-movement rules."),r("Long-term / EU Long-term Residence Recovery Visa","Recover qualifying long-term residence status.")]),
  g("Short Stay",Plane,[r("Schengen Visa","Short tourism, business, family and other permitted stays."),r("Airport Transit Visa","Airport transit where required.")])]},
 se:{name:"Sweden",flag:"se",authority:"Swedish Migration Agency",officialUrl:"https://www.migrationsverket.se/en/you-want-to-apply.html",groups:[
  g("Work & Business",BriefcaseBusiness,[r("Work Permit – employee","Employment in Sweden for eligible non-EU/EEA nationals."),r("EU Blue Card","Highly qualified employment."),r("ICT Permit","Intra-corporate transfer for qualifying managers, specialists and trainees."),r("Researcher Residence Permit","Research activity."),r("Seasonal Work Permit","Qualifying seasonal employment."),r("Self-employed Residence Permit","Run a qualifying business in Sweden."),r("Permit to look for work or start a business after advanced studies","Job-search/business exploration for eligible highly educated applicants."),r("Working Holiday Permit","Youth mobility for eligible nationalities."),r("Au Pair Permit","Eligible au-pair cultural exchange.")]),
  g("Study",GraduationCap,[r("Higher Education Residence Permit","University/university-college study."),r("Other Studies Residence Permit","Other qualifying full-time studies."),r("Doctoral Studies Residence Permit","Doctoral education."),r("Mobility Studies Permit","Qualifying EU programme mobility.")]),
  g("Family & Visit",Heart,[r("Residence Permit to Live with Partner","Spouse, registered/cohabiting partner or intended partner."),r("Residence Permit for Child / Parent","Qualifying family connection."),r("Family of worker / researcher / self-employed person","Accompanying or later family application."),r("EU/EEA family residence card","Family of EU/EEA citizen where applicable."),r("Schengen Entry Visa","Visits up to 90 days where required."),r("Visitor's Residence Permit","Visits longer than 90 days where eligible."),r("Asylum","International protection for qualifying applicants.")])]},
 ch:{name:"Switzerland",flag:"ch",authority:"State Secretariat for Migration / FDFA",officialUrl:"https://www.eda.admin.ch/en/visa-requirements-for-entry-into-switzerland",groups:[
  g("Entry Visas",Plane,[r("Schengen Visa Type C","Short stays up to 90 days in a 180-day period."),r("National Visa Type D","Long-term stays over 90 days, subject to cantonal authorisation."),r("Airport Transit Visa","Airport transit for nationalities that require it.")]),
  g("Work & Residence",BriefcaseBusiness,[r("Short-term Residence Permit L","Short-term residence, including qualifying employment."),r("Residence Permit B","Longer residence for an approved purpose, including qualifying employment."),r("Settlement Permit C","Permanent/settled residence for eligible long-term residents."),r("Cross-border Commuter Permit G","Qualifying cross-border employment."),r("Work authorisation for third-country nationals","Employer-led authorisation for highly qualified workers, subject to quotas and labour-market rules."),r("EU/EFTA work residence","Residence/work permissions under free-movement rules for eligible EU/EFTA citizens."),r("Self-employment residence","Business/self-employment permission subject to nationality and cantonal/federal rules.")]),
  g("Study & Family",GraduationCap,[r("Student National Visa / Residence","Long-term study with cantonal residence authorisation."),r("Family Reunification","Qualifying spouse/partner and family residence."),r("Marriage in Switzerland","National visa/residence process where applicable."),r("Residence without gainful employment","Residence for eligible financially self-sufficient applicants, subject to applicable rules.")])]},
};

function routeIconFor(name:string,description:string){
 const value=`${name} ${description}`.toLowerCase();
 if(/health|medical|care|patient/.test(value)) return Stethoscope;
 if(/sport|athlet|coach/.test(value)) return Trophy;
 if(/religio|minister|faith/.test(value)) return Church;
 if(/creative|artist|cultur/.test(value)) return Palette;
 if(/student|study|school|graduate|education|training/.test(value)) return GraduationCap;
 if(/research|scientist|professor/.test(value)) return Microscope;
 if(/child/.test(value)) return Baby;
 if(/spouse|partner|fianc|family|parent|relative/.test(value)) return Heart;
 if(/refugee|asylum|humanitarian|protection|parole/.test(value)) return ShieldCheck;
 if(/visitor|touris|visit/.test(value)) return Camera;
 if(/transit|travel|eta|esta|holiday|mobility/.test(value)) return Plane;
 if(/seasonal|agricultur/.test(value)) return Leaf;
 if(/exchange|secondment|transfer|intracompany|intra-company/.test(value)) return Repeat2;
 if(/treaty|agreement|legal|blue card/.test(value)) return Scale;
 if(/domestic|residence|settlement|permanent residence/.test(value)) return House;
 if(/start-up|startup|entrepreneur|innovator|self-employ/.test(value)) return Lightbulb;
 if(/talent|extraordinary|high potential|exceptional/.test(value)) return Award;
 if(/invest|business manager|business owner|golden visa/.test(value)) return Rocket;
 if(/skilled|worker|work permit|employment|employee|profession|occupation|specialist|manager|permit/.test(value)) return Wrench;
 if(/language/.test(value)) return Languages;
 if(/supplier|contract/.test(value)) return Handshake;
 if(/academic|course/.test(value)) return BookOpen;
 return BriefcaseBusiness;
}

export default function CountryVisaRoutes({code}:{code:string}){
 const [,setLocation]=useLocation();
 const { language }=useLanguage();
 const tx=getCatalogueText(language);
 const [query,setQuery]=useState("");
 const [translatedCatalogue,setTranslatedCatalogue]=useState<Record<string,string>>({});
 const c=countries[code];

 useEffect(()=>{
  if(!c || language==="en"){
   setTranslatedCatalogue({});
   return;
  }

  const controller=new AbortController();
  const cacheKey=`visaassistant:catalogue:${code}:${language}:v2`;
  let cached:Record<string,string>={};
  try{
   const raw=window.localStorage.getItem(cacheKey);
   cached=raw?JSON.parse(raw):{};
  }catch{
   cached={};
  }
  setTranslatedCatalogue(cached);

  const texts=Array.from(new Set([
   ...c.groups.map(group=>group.title),
   ...c.groups.flatMap(group=>group.routes.flatMap(route=>[route.name,route.description])),
  ]));
  const missing=texts.filter(text=>!cached[text]);

  const run=async()=>{
   const next={...cached};
   for(let i=0;i<missing.length;i+=60){
    if(controller.signal.aborted) return;
    const chunk=missing.slice(i,i+60);
    let completed=false;
    for(let attempt=0;attempt<2&&!completed;attempt++){
     try{
      const res=await fetch(`/api/translate?lang=${encodeURIComponent(language)}`,{
       method:"POST",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({texts:chunk}),
       signal:controller.signal,
      });
      if(!res.ok) throw new Error(`Translation request failed: ${res.status}`);
      const data=await res.json();
      const values=Array.isArray(data.translations)?data.translations:[];
      if(values.length!==chunk.length) throw new Error("Translation response length mismatch");
      chunk.forEach((source,index)=>{
       const value=String(values[index]||"").trim();
       if(value) next[source]=value;
      });
      completed=true;
     }catch(error){
      if(controller.signal.aborted) return;
      if(attempt===0) await new Promise(resolve=>window.setTimeout(resolve,350));
     }
    }
    if(!controller.signal.aborted){
     setTranslatedCatalogue({...next});
     try{window.localStorage.setItem(cacheKey,JSON.stringify(next));}catch{}
    }
   }
  };
  void run();
  return()=>controller.abort();
 },[language,code,c]);

 const t=(text:string)=>translatedCatalogue[text]||text;
 const displayCountryName=c?localizeCountryName(language,code,c.name):"";
 const filtered=useMemo(()=>{
  if(!c)return[];
  const q=query.trim().toLocaleLowerCase();
  if(!q)return c.groups;
  return c.groups.map(group=>({
   ...group,
   routes:group.routes.filter(route=>{
    const haystack=[group.title,route.name,route.description,t(group.title),t(route.name),t(route.description)]
      .join(" ")
      .toLocaleLowerCase();
    return haystack.includes(q);
   })
  })).filter(group=>group.routes.length);
 },[c,query,translatedCatalogue,language]);
 if(!c)return null; const total=c.groups.reduce((n,x)=>n+x.routes.length,0);
 return <div className="min-h-[100svh] bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900 dark:from-[#090b18] dark:via-[#0b1020] dark:to-[#090b18] dark:text-white">
  <CountryPublicNav code={code as CountryCode} active="routes" />
  <main id="country-catalogue-main" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"><Button variant="ghost" className="mb-4 -ml-3 gap-2" onClick={()=>setLocation('/')}><ArrowLeft className="h-4 w-4"/>{tx.allCountries}</Button>
   <section className="relative mb-8 overflow-hidden rounded-[30px] border border-blue-100 shadow-[0_18px_55px_rgba(31,96,170,.10)] dark:border-white/10">
    <div
      className="absolute inset-0 bg-no-repeat"
      style={{ backgroundImage: `url("${countryHeroImages[code]}")`, backgroundSize: "auto 88%", backgroundPosition: "right center" }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#07172f]/95 via-[#0b1933]/88 to-[#0b1933]/35" aria-hidden="true" />
    <div className="relative flex flex-col justify-center p-4 sm:p-5 lg:h-[290px] lg:p-5">
      <div className="max-w-4xl">
        <div className="mb-2 flex items-center gap-3">
          <img src={`https://flagcdn.com/w160/${c.flag}.png`} alt={c.name} className="h-8 w-11 rounded-md object-cover shadow"/>
          <Badge className="gap-1 rounded-full bg-red-500 px-3 py-1 text-white shadow-sm hover:bg-red-500"><Lock className="h-3 w-3"/>{displayCountryName} · {tx.comingSoon}</Badge>
        </div>
        <h1 className="text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-[42px]">{tx.visaRoutes(displayCountryName)}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-100 sm:text-base">{tx.exploreCountry(displayCountryName)}</p>
        <p className="mt-1.5 max-w-3xl text-xs leading-4 text-slate-300">{tx.checkedCountry(c.authority)}</p>
        <div className="mt-3 max-w-3xl rounded-2xl border border-white/15 bg-[#08152c]/78 p-1.5 shadow-xl backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300"/>
            <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tx.searchRoutes(total,displayCountryName)} className="h-10 rounded-xl border-white/10 bg-transparent pl-11 text-sm text-white placeholder:text-slate-300 focus-visible:ring-blue-400"/>
          </div>
        </div>
      </div>
    </div>
   </section>
   <div className="space-y-8">{filtered.map(group=>{const Icon=group.icon;return <section key={group.title}><div className="mb-3 flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-white/10"><Icon className="h-6 w-6 text-black dark:text-white" strokeWidth={2.3}/></div><div><h2 className="text-xl font-semibold">{t(group.title)}</h2></div></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{group.routes.map(route=>{const RouteIcon=routeIconFor(route.name,route.description);return <article key={route.name} className="group flex min-h-[148px] items-stretch gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_8px_30px_rgba(15,56,110,.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(15,56,110,.10)] dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-white/10"><RouteIcon className="h-8 w-8 text-black dark:text-white" strokeWidth={2.1}/></div><div className="flex min-w-0 flex-1 flex-col"><div className="flex items-start justify-between gap-2"><h3 className="pr-2 text-[17px] font-extrabold leading-5 text-slate-900 dark:text-white">{t(route.name)}</h3><Badge className="shrink-0 gap-1 rounded-full bg-red-500 px-3 py-1 text-white shadow-sm hover:bg-red-500"><Lock className="h-3 w-3"/>{tx.comingSoon}</Badge></div><p className="mt-1.5 text-sm leading-5 text-slate-600 dark:text-slate-400">{t(route.description)}</p><span className="mt-auto pt-3 text-xs text-slate-400">{tx.assistantDevelopment}</span></div></article>})}</div></section>})}</div>
   {filtered.length===0&&<div className="py-20 text-center text-slate-500">{tx.noRoutes(query,displayCountryName)}</div>}
   <div className="mt-10 text-center"><a href={c.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#005EB8] hover:underline">{tx.officialAuthority} <ExternalLink className="h-4 w-4"/></a></div>
  </main></div>
}
