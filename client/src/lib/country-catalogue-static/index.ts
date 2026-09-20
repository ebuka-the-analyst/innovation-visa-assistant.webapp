import us from "./us";
import ca from "./ca";
import au from "./au";
import de from "./de";
import fr from "./fr";
import nl from "./nl";
import sg from "./sg";
import ae from "./ae";
import nz from "./nz";
import jp from "./jp";
import ie from "./ie";
import pt from "./pt";
import es from "./es";
import se from "./se";
import ch from "./ch";

export type StaticCatalogueTranslations = Record<string, Record<string, string>>;

const staticCountryCatalogueTranslations: Record<string, StaticCatalogueTranslations> = {
  us,
  ca,
  au,
  de,
  fr,
  nl,
  sg,
  ae,
  nz,
  jp,
  ie,
  pt,
  es,
  se,
  ch,
};

export function getStaticCountryCatalogueTranslation(
  countryCode: string,
  language: string,
  sourceText: string,
): string {
  if (language === "en") return sourceText;
  return (
    staticCountryCatalogueTranslations[countryCode]?.[language]?.[sourceText] ??
    sourceText
  );
}

export function hasStaticCountryCatalogue(
  countryCode: string,
  language: string,
): boolean {
  if (language === "en") return true;
  return Boolean(staticCountryCatalogueTranslations[countryCode]?.[language]);
}

export default staticCountryCatalogueTranslations;
