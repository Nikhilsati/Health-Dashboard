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
  healthScore: 78,
};

export const reports: Report[] = [
  { id: "r1", date: "2024-06-23", lab: "Tata 1mg", status: "Parsed" },
  { id: "r2", date: "2025-05-06", lab: "Orange Health", status: "Parsed" },
  { id: "r3", date: "2025-07-17", lab: "Tata 1mg", status: "Parsed" },
  { id: "r4", date: "2026-06-30", lab: "Orange Health", status: "Parsed" },
];

export const biomarkers: Biomarker[] = [
  // LIPID PANEL
  { id: "cholesterol", name: "Total Cholesterol", category: "heart", unit: "mg/dL", referenceRange: { max: 200 }, history: [215, 222, 199, 214], trendDirection: "up", status: "borderline", description: "Measure of the total amount of cholesterol in your blood." },
  { id: "ldl", name: "LDL", category: "heart", unit: "mg/dL", referenceRange: { max: 100 }, history: [148.2, 148.4, 104.0, 134.6], trendDirection: "up", status: "critical", description: "The 'bad' cholesterol. High levels can lead to plaque buildup in arteries." },
  { id: "hdl", name: "HDL", category: "heart", unit: "mg/dL", referenceRange: { min: 40 }, history: [40, 46, 47, 43], trendDirection: "down", status: "borderline", description: "The 'good' cholesterol. Helps remove other forms of cholesterol from your bloodstream." },
  { id: "triglycerides", name: "Triglycerides", category: "heart", unit: "mg/dL", referenceRange: { max: 150 }, history: [134, 138, 241, 182], trendDirection: "down", status: "critical", description: "A type of fat found in your blood. High levels can increase heart disease risk." },
  { id: "vldl", name: "VLDL", category: "heart", unit: "mg/dL", referenceRange: { max: 30 }, history: [27, 27.6, 48, 36.4], trendDirection: "down", status: "critical", description: "Contains the highest amount of triglycerides." },
  { id: "hscrp", name: "hsCRP", category: "heart", unit: "mg/L", referenceRange: { max: 3 }, history: [2.44, 2.249, 1.71, 1.258], trendDirection: "down", status: "normal", description: "High-sensitivity C-reactive protein. A marker for inflammation in blood vessels." },
  { id: "lpa", name: "Lp(a)", category: "heart", unit: "nmol/L", referenceRange: { max: 75 }, history: [50.8, 50.8, 43.7, 43.7], trendDirection: "flat", status: "normal", description: "A type of lipoprotein that can build up in blood vessels." },

  // COMPLETE BLOOD COUNT
  { id: "hemoglobin", name: "Hemoglobin", category: "blood", unit: "g/dL", referenceRange: [13, 17], history: [15.0, 14.6, 13.9, 14.8], trendDirection: "up", status: "normal", description: "Protein in red blood cells that carries oxygen." },
  { id: "rbc", name: "RBC", category: "blood", unit: "million/μL", referenceRange: [4.5, 5.5], history: [5.52, 5.51, 5.25, 5.52], trendDirection: "up", status: "borderline", description: "Red blood cell count." },
  { id: "wbc", name: "WBC", category: "blood", unit: "K/μL", referenceRange: [4, 11], history: [7.73, 8.76, 7.80, 7.57], trendDirection: "down", status: "normal", description: "White blood cell count." },
  { id: "platelets", name: "Platelets", category: "blood", unit: "K/μL", referenceRange: [150, 400], history: [260, 296, 225, 253], trendDirection: "up", status: "normal", description: "Cell fragments that help blood clot." },
  { id: "mcv", name: "MCV", category: "blood", unit: "fL", referenceRange: [80, 100], history: [81.6, 81.6, 78.1, 81.2], trendDirection: "up", status: "normal", description: "Mean corpuscular volume. The average size of your red blood cells." },
  { id: "mch", name: "MCH", category: "blood", unit: "pg", referenceRange: [27, 32], history: [27.2, 26.5, 26.5, 26.7], trendDirection: "up", status: "borderline", description: "Amount of hemoglobin per red blood cell." },
  { id: "hematocrit", name: "Hematocrit", category: "blood", unit: "%", referenceRange: [40, 50], history: [45.0, 45.0, 41.0, 44.8], trendDirection: "up", status: "normal", description: "Proportion of blood volume that is occupied by red blood cells." },

  // LIVER FUNCTION
  { id: "alt", name: "ALT", category: "liver", unit: "U/L", referenceRange: { max: 40 }, history: [56, 60, 52, 93], trendDirection: "up", status: "critical", description: "Alanine transaminase. An enzyme found mostly in the liver." },
  { id: "ast", name: "AST", category: "liver", unit: "U/L", referenceRange: { max: 40 }, history: [36, 36, 29, 46], trendDirection: "up", status: "critical", description: "Aspartate transaminase." },
  { id: "alp", name: "ALP", category: "liver", unit: "U/L", referenceRange: [40, 150], history: [104, 81, 83, 71], trendDirection: "down", status: "normal", description: "Alkaline phosphatase." },
  { id: "bilirubin", name: "Total Bilirubin", category: "liver", unit: "mg/dL", referenceRange: [0.2, 1.2], history: [1.79, 1.50, 1.16, 1.40], trendDirection: "up", status: "critical", description: "Waste product from red blood cell breakdown." },
  { id: "ggt", name: "GGT", category: "liver", unit: "U/L", referenceRange: { max: 50 }, history: [49, 42, 38, 58], trendDirection: "up", status: "critical", description: "Gamma-glutamyl transferase." },
  { id: "total_protein", name: "Total Protein", category: "liver", unit: "g/dL", referenceRange: [6.3, 8.2], history: [7.9, 8.3, 7.3, 7.8], trendDirection: "up", status: "normal", description: "Total amount of protein in blood." },
  { id: "albumin", name: "Albumin", category: "liver", unit: "g/dL", referenceRange: [3.5, 5.0], history: [5.1, 5.3, 4.72, 4.7], trendDirection: "down", status: "normal", description: "Main protein made by the liver." },

  // KIDNEY FUNCTION
  { id: "creatinine", name: "Creatinine", category: "kidney", unit: "mg/dL", referenceRange: [0.7, 1.2], history: [0.71, 0.65, 0.74, 0.81], trendDirection: "up", status: "normal", description: "A waste product from muscle breakdown." },
  { id: "egfr", name: "eGFR", category: "kidney", unit: "mL/min", referenceRange: { min: 60 }, history: [128, 133, 128, 125], trendDirection: "down", status: "normal", description: "Estimated glomerular filtration rate." },
  { id: "bun", name: "BUN", category: "kidney", unit: "mg/dL", referenceRange: [7, 25], history: [12.0, 13.1, 17.0, 13.5], trendDirection: "down", status: "normal", description: "Blood urea nitrogen." },
  { id: "uric_acid", name: "Uric Acid", category: "kidney", unit: "mg/dL", referenceRange: [3.5, 7.2], history: [8.8, 8.5, 7.3, 8.4], trendDirection: "up", status: "critical", description: "Waste product from breaking down purines." },
  { id: "sodium", name: "Sodium", category: "kidney", unit: "mEq/L", referenceRange: [136, 145], history: [142, 139, 141, 141], trendDirection: "flat", status: "normal", description: "Electrolyte that helps regulate water." },
  { id: "potassium", name: "Potassium", category: "kidney", unit: "mEq/L", referenceRange: [3.5, 5.1], history: [5.0, 5.3, 4.46, 5.32], trendDirection: "up", status: "critical", description: "Electrolyte crucial for cell function." },

  // VITAMINS & NUTRITION
  { id: "vitamind", name: "Vitamin D", category: "vitamins", unit: "ng/mL", referenceRange: [30, 100], history: [7.2, 51.7, 25.0, 72.5], trendDirection: "up", status: "normal", description: "Important for bone health, immune function." },
  { id: "vitaminb12", name: "Vitamin B12", category: "vitamins", unit: "pg/mL", referenceRange: [200, 900], history: [231, 256, 258, 292], trendDirection: "up", status: "normal", description: "Crucial for nerve tissue and red blood cells." },
  { id: "folate", name: "Folate", category: "vitamins", unit: "ng/mL", referenceRange: { min: 5.4 }, history: [7.3, 7.3, 3.64, 3.64], trendDirection: "flat", status: "critical", description: "Vitamin B9." },
  { id: "iron", name: "Iron", category: "vitamins", unit: "μg/dL", referenceRange: [60, 170], history: [80, 80, 63, 103], trendDirection: "up", status: "normal", description: "Essential mineral for blood production." },
  { id: "ferritin", name: "Ferritin", category: "vitamins", unit: "ng/mL", referenceRange: [12, 300], history: [154.01, 154.01, 83.7, 83.7], trendDirection: "flat", status: "normal", description: "Protein that stores iron." },

  // THYROID
  { id: "tsh", name: "TSH", category: "thyroid", unit: "mIU/L", referenceRange: [0.4, 4.0], history: [1.33, 2.72, 2.17, 2.17], trendDirection: "flat", status: "normal", description: "Thyroid stimulating hormone." },
  { id: "t3free", name: "T3 Free", category: "thyroid", unit: "pg/mL", referenceRange: [2.3, 4.2], history: [3.2, 3.0, 3.64, 3.1], trendDirection: "down", status: "normal", description: "Active form of thyroid hormone." },
  { id: "t4free", name: "T4 Free", category: "thyroid", unit: "ng/dL", referenceRange: [0.8, 1.8], history: [1.1, 1.0, 1.35, 1.1], trendDirection: "down", status: "normal", description: "Main form of thyroid hormone." },

  // INFLAMMATION
  { id: "esr", name: "ESR", category: "inflammation", unit: "mm/hr", referenceRange: { max: 20 }, history: [3, 20, 4, 14], trendDirection: "up", status: "normal", description: "Erythrocyte sedimentation rate." },
  { id: "homocysteine", name: "Homocysteine", category: "inflammation", unit: "μmol/L", referenceRange: { max: 15 }, history: [43.02, 43.02, 36.46, 36.46], trendDirection: "flat", status: "critical", description: "An amino acid. High levels linked to heart disease." },

  // HORMONES
  { id: "testosterone", name: "Testosterone Total", category: "hormones", unit: "ng/dL", referenceRange: [300, 1000], history: [432.13, 432.13, 432.13, 432.13], trendDirection: "flat", status: "normal", description: "Primary male sex hormone." },
  { id: "dheas", name: "DHEA-S", category: "hormones", unit: "μg/dL", referenceRange: [160, 449], history: [285, 295, 310, 302], trendDirection: "down", status: "normal", description: "Steroid hormone." },

  // DIABETES
  { id: "fasting_glucose", name: "Fasting Glucose", category: "diabetes", unit: "mg/dL", referenceRange: [70, 100], history: [75, 75, 77, 78], trendDirection: "up", status: "normal", description: "Blood sugar after fasting." },
  { id: "hba1c", name: "HbA1c", category: "diabetes", unit: "%", referenceRange: { max: 5.7 }, history: [4.9, 5.0, 5.1, 5.3], trendDirection: "up", status: "normal", description: "Average blood sugar level over the past 2-3 months." },
  { id: "insulin", name: "Insulin Fasting", category: "diabetes", unit: "μIU/mL", referenceRange: [2.6, 24.9], history: [16.4, 16.4, 16.4, 16.4], trendDirection: "flat", status: "normal", description: "Hormone that regulates blood sugar." },
  { id: "homair", name: "HOMA-IR", category: "diabetes", unit: "", referenceRange: { max: 2.5 }, history: [3.03, 3.03, 3.11, 3.16], trendDirection: "up", status: "critical", description: "Insulin resistance index." },
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

