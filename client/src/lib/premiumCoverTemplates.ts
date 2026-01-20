import blackBlueCover from "@assets/Black_and_Blue_Modern_Corporate_Proposal_Cover_Page_1768870734957.png";
import blueOrangeCover from "@assets/Blue_and_Orange_Geometric_Project_Proposal_Cover_page_1768870734958.png";
import blackRedCover from "@assets/Black_and_Red_Modern_Project_Proposal_Cover_1768870734959.png";
import redWhiteCover from "@assets/Red_and_White_Modern_Business_Proposal_Cover_Page_1768870734959.png";
import orangeCover from "@assets/Orange_Modern_Business_Proposal_Cover_1768870734959.png";
import yellowCover from "@assets/Yellow_Modern_Company_Business_Proposal_1768870734960.png";
import orangeWhiteCover from "@assets/Orange_White_Modern_Business_Proposal_Cover_Page_1768870734960.png";
import greenYellowCover from "@assets/Green_and_Yellow_Modern_Cover_Page_1768870734961.png";
import redIllustrativeCover from "@assets/Red_Illustrative_Modern_Business_Proposal_Cover_1768870734961.png";

export type CoverColor = "blue" | "orange" | "red" | "yellow" | "green" | "black" | "white";
export type CoverStyle = "modern" | "corporate" | "geometric" | "illustrative";

export interface PremiumCoverTemplate {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  price: number;
  colors: CoverColor[];
  style: CoverStyle;
  tags: string[];
}

export const PREMIUM_COVER_TEMPLATES: PremiumCoverTemplate[] = [
  {
    id: "black-blue-corporate",
    name: "Black & Blue Corporate",
    description: "Modern corporate proposal with cityscape",
    imagePath: blackBlueCover,
    price: 5,
    colors: ["blue", "black"],
    style: "corporate",
    tags: ["professional", "modern", "business"],
  },
  {
    id: "blue-orange-geometric",
    name: "Blue & Orange Geometric",
    description: "Clean geometric design with orange accents",
    imagePath: blueOrangeCover,
    price: 5,
    colors: ["blue", "orange"],
    style: "geometric",
    tags: ["clean", "minimal", "project"],
  },
  {
    id: "black-red-modern",
    name: "Black & Red Modern",
    description: "Bold modern design with architectural photography",
    imagePath: blackRedCover,
    price: 5,
    colors: ["red", "black"],
    style: "modern",
    tags: ["bold", "dramatic", "sleek"],
  },
  {
    id: "red-white-modern",
    name: "Red & White Modern",
    description: "Professional business proposal with handshake imagery",
    imagePath: redWhiteCover,
    price: 5,
    colors: ["red", "white"],
    style: "modern",
    tags: ["professional", "trust", "partnership"],
  },
  {
    id: "orange-modern",
    name: "Orange Modern",
    description: "Vibrant orange design with city skyline",
    imagePath: orangeCover,
    price: 5,
    colors: ["orange"],
    style: "modern",
    tags: ["vibrant", "energetic", "bold"],
  },
  {
    id: "yellow-modern",
    name: "Yellow Modern Company",
    description: "Clean yellow accents with architectural backdrop",
    imagePath: yellowCover,
    price: 5,
    colors: ["yellow", "black"],
    style: "modern",
    tags: ["clean", "professional", "bright"],
  },
  {
    id: "orange-white-modern",
    name: "Orange & White Modern",
    description: "Contemporary design with geometric shapes",
    imagePath: orangeWhiteCover,
    price: 5,
    colors: ["orange", "white"],
    style: "geometric",
    tags: ["contemporary", "professional", "clean"],
  },
  {
    id: "green-yellow-modern",
    name: "Green & Yellow Modern",
    description: "Elegant green design with gold accents",
    imagePath: greenYellowCover,
    price: 5,
    colors: ["green", "yellow"],
    style: "modern",
    tags: ["elegant", "luxury", "sophisticated"],
  },
  {
    id: "red-illustrative",
    name: "Red Illustrative",
    description: "Creative design with business illustrations",
    imagePath: redIllustrativeCover,
    price: 5,
    colors: ["red", "white"],
    style: "illustrative",
    tags: ["creative", "colorful", "dynamic"],
  },
];

export const COVER_COLORS: { id: CoverColor; name: string; hex: string }[] = [
  { id: "blue", name: "Blue", hex: "#3B82F6" },
  { id: "orange", name: "Orange", hex: "#F97316" },
  { id: "red", name: "Red", hex: "#EF4444" },
  { id: "yellow", name: "Yellow", hex: "#EAB308" },
  { id: "green", name: "Green", hex: "#22C55E" },
  { id: "black", name: "Black", hex: "#1F2937" },
  { id: "white", name: "White", hex: "#F9FAFB" },
];

export const COVER_STYLES: { id: CoverStyle; name: string }[] = [
  { id: "modern", name: "Modern" },
  { id: "corporate", name: "Corporate" },
  { id: "geometric", name: "Geometric" },
  { id: "illustrative", name: "Illustrative" },
];

export function filterTemplates(
  templates: PremiumCoverTemplate[],
  colorFilter: CoverColor | null,
  styleFilter: CoverStyle | null
): PremiumCoverTemplate[] {
  return templates.filter((template) => {
    const matchesColor = !colorFilter || template.colors.includes(colorFilter);
    const matchesStyle = !styleFilter || template.style === styleFilter;
    return matchesColor && matchesStyle;
  });
}
