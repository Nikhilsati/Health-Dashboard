export type Report = {
  id: string;
  date: string;
  lab: string;
  status: "Parsed" | "Pending";
};

export type Biomarker = {
  id: string;
  name: string;
  category: string;
  unit: string;
  referenceRange: [number, number] | { min?: number; max?: number; text?: string };
  history: number[]; // Index aligns with reports array
  trendDirection: "up" | "down" | "flat";
  status: "normal" | "borderline" | "critical";
  description: string;
};

export const profile = {
  name: "Nikhil Sati",
  dob: "1999-01-15",
  gender: "Male",
  age: 27,
  healthScore: 82,
};

export const reports: Report[] = [
  { id: "r1", date: "2024-06-15", lab: "Orange Health", status: "Parsed" },
  { id: "r2", date: "2025-05-10", lab: "Tata 1mg", status: "Parsed" },
  { id: "r3", date: "2025-07-22", lab: "Orange Health", status: "Parsed" },
  { id: "r4", date: "2026-06-05", lab: "Orange Health", status: "Parsed" },
];

export const biomarkers: Biomarker[] = [
  // LIPID PANEL
  { id: "cholesterol", name: "Total Cholesterol", category: "heart", unit: "mg/dL", referenceRange: { max: 200 }, history: [188, 192, 185, 178], trendDirection: "down", status: "normal", description: "Measure of the total amount of cholesterol in your blood." },
  { id: "ldl", name: "LDL", category: "heart", unit: "mg/dL", referenceRange: { max: 100 }, history: [148, 141, 138, 134], trendDirection: "down", status: "critical", description: "The 'bad' cholesterol. High levels can lead to plaque buildup in arteries." },
  { id: "hdl", name: "HDL", category: "heart", unit: "mg/dL", referenceRange: { min: 40 }, history: [38, 40, 41, 43], trendDirection: "up", status: "normal", description: "The 'good' cholesterol. Helps remove other forms of cholesterol from your bloodstream." },
  { id: "triglycerides", name: "Triglycerides", category: "heart", unit: "mg/dL", referenceRange: { max: 150 }, history: [134, 142, 158, 182], trendDirection: "up", status: "critical", description: "A type of fat found in your blood. High levels can increase heart disease risk." },
  { id: "vldl", name: "VLDL", category: "heart", unit: "mg/dL", referenceRange: { max: 30 }, history: [27, 28, 32, 36], trendDirection: "up", status: "borderline", description: "Contains the highest amount of triglycerides." },
  { id: "hscrp", name: "hsCRP", category: "heart", unit: "mg/L", referenceRange: { max: 3 }, history: [1.8, 2.1, 1.6, 1.4], trendDirection: "down", status: "normal", description: "High-sensitivity C-reactive protein. A marker for inflammation in blood vessels." },
  { id: "lpa", name: "Lp(a)", category: "heart", unit: "nmol/L", referenceRange: { max: 75 }, history: [62, 65, 61, 63], trendDirection: "up", status: "normal", description: "A type of lipoprotein that can build up in blood vessels." },

  // COMPLETE BLOOD COUNT
  { id: "hemoglobin", name: "Hemoglobin", category: "blood", unit: "g/dL", referenceRange: [13, 17], history: [15.0, 14.6, 13.9, 14.2], trendDirection: "up", status: "normal", description: "Protein in red blood cells that carries oxygen." },
  { id: "rbc", name: "RBC", category: "blood", unit: "million/μL", referenceRange: [4.5, 5.5], history: [5.4, 5.25, 5.1, 5.3], trendDirection: "up", status: "normal", description: "Red blood cell count." },
  { id: "wbc", name: "WBC", category: "blood", unit: "K/μL", referenceRange: [4, 11], history: [6.8, 7.2, 6.5, 7.0], trendDirection: "up", status: "normal", description: "White blood cell count." },
  { id: "platelets", name: "Platelets", category: "blood", unit: "K/μL", referenceRange: [150, 400], history: [220, 235, 218, 242], trendDirection: "up", status: "normal", description: "Cell fragments that help blood clot." },
  { id: "mcv", name: "MCV", category: "blood", unit: "fL", referenceRange: [80, 100], history: [82, 80, 78, 79], trendDirection: "up", status: "borderline", description: "Mean corpuscular volume. The average size of your red blood cells." },
  { id: "mch", name: "MCH", category: "blood", unit: "pg", referenceRange: [27, 32], history: [28, 27, 26, 27], trendDirection: "up", status: "borderline", description: "Amount of hemoglobin per red blood cell." },
  { id: "hematocrit", name: "Hematocrit", category: "blood", unit: "%", referenceRange: [40, 50], history: [44, 43, 41, 42], trendDirection: "up", status: "normal", description: "Proportion of blood volume that is occupied by red blood cells." },

  // LIVER FUNCTION
  { id: "alt", name: "ALT", category: "liver", unit: "U/L", referenceRange: { max: 40 }, history: [28, 32, 35, 30], trendDirection: "down", status: "normal", description: "Alanine transaminase. An enzyme found mostly in the liver." },
  { id: "ast", name: "AST", category: "liver", unit: "U/L", referenceRange: { max: 40 }, history: [24, 26, 22, 23], trendDirection: "up", status: "normal", description: "Aspartate transaminase." },
  { id: "alp", name: "ALP", category: "liver", unit: "U/L", referenceRange: [40, 150], history: [72, 78, 81, 74], trendDirection: "down", status: "normal", description: "Alkaline phosphatase." },
  { id: "bilirubin", name: "Total Bilirubin", category: "liver", unit: "mg/dL", referenceRange: [0.2, 1.2], history: [0.8, 0.9, 1.0, 0.8], trendDirection: "down", status: "normal", description: "Waste product from red blood cell breakdown." },
  { id: "ggt", name: "GGT", category: "liver", unit: "U/L", referenceRange: { max: 50 }, history: [22, 25, 28, 20], trendDirection: "down", status: "normal", description: "Gamma-glutamyl transferase." },
  { id: "total_protein", name: "Total Protein", category: "liver", unit: "g/dL", referenceRange: [6.3, 8.2], history: [7.2, 7.0, 7.4, 7.1], trendDirection: "down", status: "normal", description: "Total amount of protein in blood." },
  { id: "albumin", name: "Albumin", category: "liver", unit: "g/dL", referenceRange: [3.5, 5.0], history: [4.5, 4.3, 4.6, 4.4], trendDirection: "down", status: "normal", description: "Main protein made by the liver." },

  // KIDNEY FUNCTION
  { id: "creatinine", name: "Creatinine", category: "kidney", unit: "mg/dL", referenceRange: [0.7, 1.2], history: [0.9, 0.95, 0.98, 0.92], trendDirection: "down", status: "normal", description: "A waste product from muscle breakdown." },
  { id: "egfr", name: "eGFR", category: "kidney", unit: "mL/min", referenceRange: { min: 60 }, history: [102, 98, 96, 104], trendDirection: "up", status: "normal", description: "Estimated glomerular filtration rate." },
  { id: "bun", name: "BUN", category: "kidney", unit: "mg/dL", referenceRange: [7, 25], history: [14, 16, 15, 13], trendDirection: "down", status: "normal", description: "Blood urea nitrogen." },
  { id: "uric_acid", name: "Uric Acid", category: "kidney", unit: "mg/dL", referenceRange: [3.5, 7.2], history: [5.8, 6.2, 6.0, 5.6], trendDirection: "down", status: "normal", description: "Waste product from breaking down purines." },
  { id: "sodium", name: "Sodium", category: "kidney", unit: "mEq/L", referenceRange: [136, 145], history: [139, 141, 138, 140], trendDirection: "up", status: "normal", description: "Electrolyte that helps regulate water." },
  { id: "potassium", name: "Potassium", category: "kidney", unit: "mEq/L", referenceRange: [3.5, 5.1], history: [4.2, 4.0, 4.4, 4.1], trendDirection: "down", status: "normal", description: "Electrolyte crucial for cell function." },

  // VITAMINS & NUTRITION
  { id: "vitamind", name: "Vitamin D", category: "vitamins", unit: "ng/mL", referenceRange: [30, 100], history: [7.2, 25.0, 28.0, 33.0], trendDirection: "up", status: "borderline", description: "Important for bone health, immune function." },
  { id: "vitaminb12", name: "Vitamin B12", category: "vitamins", unit: "pg/mL", referenceRange: [200, 900], history: [285, 320, 410, 380], trendDirection: "down", status: "normal", description: "Crucial for nerve tissue and red blood cells." },
  { id: "folate", name: "Folate", category: "vitamins", unit: "ng/mL", referenceRange: { min: 5.4 }, history: [8.2, 9.1, 10.5, 11.2], trendDirection: "up", status: "normal", description: "Vitamin B9." },
  { id: "iron", name: "Iron", category: "vitamins", unit: "μg/dL", referenceRange: [60, 170], history: [72, 68, 75, 80], trendDirection: "up", status: "normal", description: "Essential mineral for blood production." },
  { id: "ferritin", name: "Ferritin", category: "vitamins", unit: "ng/mL", referenceRange: [12, 300], history: [22, 18, 25, 28], trendDirection: "up", status: "normal", description: "Protein that stores iron." },

  // THYROID
  { id: "tsh", name: "TSH", category: "thyroid", unit: "mIU/L", referenceRange: [0.4, 4.0], history: [2.1, 2.4, 1.9, 2.2], trendDirection: "up", status: "normal", description: "Thyroid stimulating hormone." },
  { id: "t3free", name: "T3 Free", category: "thyroid", unit: "pg/mL", referenceRange: [2.3, 4.2], history: [3.2, 3.0, 3.4, 3.1], trendDirection: "down", status: "normal", description: "Active form of thyroid hormone." },
  { id: "t4free", name: "T4 Free", category: "thyroid", unit: "ng/dL", referenceRange: [0.8, 1.8], history: [1.1, 1.0, 1.2, 1.1], trendDirection: "down", status: "normal", description: "Main form of thyroid hormone." },

  // INFLAMMATION
  { id: "esr", name: "ESR", category: "inflammation", unit: "mm/hr", referenceRange: { max: 20 }, history: [12, 14, 11, 10], trendDirection: "down", status: "normal", description: "Erythrocyte sedimentation rate." },
  { id: "homocysteine", name: "Homocysteine", category: "inflammation", unit: "μmol/L", referenceRange: { max: 15 }, history: [43, 38, 36, 34], trendDirection: "down", status: "critical", description: "An amino acid. High levels linked to heart disease." },

  // HORMONES
  { id: "testosterone", name: "Testosterone Total", category: "hormones", unit: "ng/dL", referenceRange: [300, 1000], history: [485, 510, 520, 498], trendDirection: "down", status: "normal", description: "Primary male sex hormone." },
  { id: "dheas", name: "DHEA-S", category: "hormones", unit: "μg/dL", referenceRange: [160, 449], history: [285, 295, 310, 302], trendDirection: "down", status: "normal", description: "Steroid hormone." },

  // DIABETES
  { id: "fasting_glucose", name: "Fasting Glucose", category: "diabetes", unit: "mg/dL", referenceRange: [70, 100], history: [92, 95, 98, 94], trendDirection: "down", status: "normal", description: "Blood sugar after fasting." },
  { id: "hba1c", name: "HbA1c", category: "diabetes", unit: "%", referenceRange: { max: 5.7 }, history: [5.1, 5.3, 5.4, 5.2], trendDirection: "down", status: "normal", description: "Average blood sugar level over the past 2-3 months." },
  { id: "insulin", name: "Insulin Fasting", category: "diabetes", unit: "μIU/mL", referenceRange: [2.6, 24.9], history: [8.2, 9.1, 10.2, 8.8], trendDirection: "down", status: "normal", description: "Hormone that regulates blood sugar." },
  { id: "homair", name: "HOMA-IR", category: "diabetes", unit: "", referenceRange: { max: 2.5 }, history: [1.88, 2.16, 2.49, 2.06], trendDirection: "down", status: "borderline", description: "Insulin resistance index." },
];

export const categories = [
  { id: "heart", label: "Heart", score: 18, total: 25 },
  { id: "blood", label: "Blood", score: 14, total: 15 },
  { id: "liver", label: "Liver", score: 10, total: 10 },
  { id: "kidney", label: "Kidney", score: 10, total: 10 },
  { id: "diabetes", label: "Diabetes", score: 13, total: 15 },
  { id: "vitamins", label: "Vitamins", score: 8, total: 15 },
  { id: "inflammation", label: "Inflammation", score: 7, total: 10 },
  { id: "thyroid", label: "Thyroid", score: 10, total: 10 },
  { id: "hormones", label: "Hormones", score: 10, total: 10 },
];
