import { useState, useEffect } from "react";
import { useTutorStore } from "../../store/tutor-store";

const INDUSTRIES: Record<string, string[]> = {
  "Agriculture": ["Crop Production", "Animal Husbandry", "AgTech", "Forestry", "Aquaculture", "Vertical Farming", "Precision Agriculture", "Agrochemicals", "Farm Machinery"],
  "Construction": ["Residential Construction", "Commercial Construction", "Civil Engineering", "Architecture", "Green Building", "Real Estate Development", "Construction Tech", "Building Materials"],
  "Education": ["Early Childhood", "K-12 Education", "Higher Education", "EdTech", "Corporate Training", "Vocational Training", "Special Education", "E-Learning"],
  "Energy": ["Renewable Energy", "Oil & Gas", "Nuclear Power", "Energy Storage", "Smart Grid", "Hydrogen", "Geothermal", "Energy Efficiency"],
  "Environment": ["Waste Management", "Water Treatment", "Carbon Capture", "Conservation", "Environmental Consulting", "Recycling", "Pollution Control", "Sustainability Services"],
  "Finance": ["Retail Banking", "Investment Banking", "FinTech", "Insurance", "Wealth Management", "Venture Capital", "Web3 / Crypto", "Accounting", "Quantitative Trading"],
  "Governance": ["Public Administration", "Public Policy", "Urban Planning", "Defense & Security", "Smart Cities", "Civic Tech", "Diplomacy", "Legal Services", "Regulatory Compliance"],
  "Healthcare": ["Pharmaceuticals", "Medical Devices", "Telemedicine", "Hospitals & Clinics", "Biotechnology", "Health Informatics", "Mental Health", "Public Health", "Nursing"],
  "Infrastructure": ["Transportation Networks", "Telecommunications", "Water Utilities", "Power Utilities", "Logistics", "Ports & Aviation", "Public Works", "Broadband", "Data Centers"],
  "Lifestyle": ["Fashion & Apparel", "Travel & Tourism", "Entertainment & Media", "Sports & Fitness", "Hospitality", "Food & Beverage", "Beauty & Cosmetics", "Retail"],
  "Manufacturing": ["Automotive", "Aerospace", "Electronics", "Heavy Machinery", "Consumer Goods", "3D Printing", "Advanced Materials", "Supply Chain Management", "Robotics"],
  "Mobility": ["Electric Vehicles (EVs)", "Autonomous Driving", "Public Transit", "Micro-mobility", "Ride-sharing", "Aerospace & Aviation", "Rail Transport", "Fleet Management"]
};

export function Component() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const setStoreSettings = useTutorStore((state) => state.setSettings);
  
  const [personalInfo, setPersonalInfo] = useState({
    interests: "",
    learningNeeds: "",
    goal: "",
    industry: "",
    secondaryIndustry: "",
    difficulty: "Intermediate",
  });

  useEffect(() => {
    fetch('/api/tutor/settings')
      .then(res => res.json())
      .then(data => {
        if (data.personalInfo) {
          const info = {
            interests: data.personalInfo.interests || "",
            learningNeeds: data.personalInfo.learningNeeds || "",
            goal: data.personalInfo.goal || "",
            industry: data.personalInfo.industry || "",
            secondaryIndustry: data.personalInfo.secondaryIndustry || "",
            difficulty: data.personalInfo.difficulty || "Intermediate",
          };
          setPersonalInfo(info);
          setStoreSettings(info);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, [setStoreSettings]);

  const handleChange = (field: string, value: string) => {
    setPersonalInfo(prev => {
      const next = { ...prev, [field]: value };
      if (field === "industry") {
        next.secondaryIndustry = "";
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/tutor/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalInfo })
      });
      setStoreSettings(personalInfo);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        <div>
          <h1 className="text-3xl font-display font-light mb-2">Personal Info & Settings</h1>
          <p className="text-zinc-400">Tell your tutor about yourself to receive highly personalized learning content, analogies, and pacing.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Primary Industry / Domain
              </label>
              <select 
                value={personalInfo.industry}
                onChange={e => handleChange("industry", e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="" disabled>Select your primary industry ...</option>
                {Object.keys(INDUSTRIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Secondary Industry / Sub-domain
              </label>
              <select 
                value={personalInfo.secondaryIndustry}
                onChange={e => handleChange("secondaryIndustry", e.target.value)}
                disabled={!personalInfo.industry}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select a sub-domain ...</option>
                {personalInfo.industry && INDUSTRIES[personalInfo.industry] ? (
                  INDUSTRIES[personalInfo.industry].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))
                ) : null}
              </select>
              <p className="text-xs text-zinc-500">This helps the tutor contextualize examples for your specific field.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Difficulty Level
              </label>
              <select 
                value={personalInfo.difficulty}
                onChange={e => handleChange("difficulty", e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/50 focus:border-[var(--teal)] transition-all appearance-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Interests & Hobbies
              </label>
              <textarea 
                value={personalInfo.interests}
                onChange={e => handleChange("interests", e.target.value)}
                placeholder="E.g., I love playing chess, reading sci-fi, and building model rockets..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[100px] resize-y"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Learning Needs & Style
              </label>
              <textarea 
                value={personalInfo.learningNeeds}
                onChange={e => handleChange("learningNeeds", e.target.value)}
                placeholder="E.g., I'm a visual learner. I need lots of diagrams. I struggle with abstract math..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[100px] resize-y"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Primary Learning Goal
              </label>
              <textarea 
                value={personalInfo.goal}
                onChange={e => handleChange("goal", e.target.value)}
                placeholder="E.g., I want to transition into a software engineering role within 6 months..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[100px] resize-y"
              />
            </div>

          </div>
          
          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
