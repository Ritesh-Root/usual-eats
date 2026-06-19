import vegThali from "../assets/food/veg-thali.jpg";
import masalaChai from "../assets/food/masala-chai.jpg";
import masalaDosa from "../assets/food/masala-dosa.jpg";
import filterCoffee from "../assets/food/filter-coffee.jpg";
import chickenBiryani from "../assets/food/chicken-biryani.jpg";
import raita from "../assets/food/raita.jpg";
import margherita from "../assets/food/margherita.jpg";
import paneerThali from "../assets/food/paneer-thali.jpg";

const MAP: Record<string, string> = {
  "Veg Thali": vegThali,
  "Paneer Thali": paneerThali,
  "Masala Chai": masalaChai,
  "Masala Dosa": masalaDosa,
  "Filter Coffee": filterCoffee,
  "Chicken Biryani": chickenBiryani,
  Raita: raita,
  Margherita: margherita,
};

const FALLBACK = vegThali;

export function foodImage(name: string): string {
  return MAP[name] ?? FALLBACK;
}