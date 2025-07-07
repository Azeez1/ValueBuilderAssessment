import { Question } from "@shared/schema";

export const questions: Question[] = [
  // Driver 1: Financial Performance (15% weight)
  {
    id: "1.1",
    section: "Financial Performance",
    title: "Annual Revenue",
    question: "What was your company's total revenue in the most recent completed fiscal year?",
    options: [
      { text: "Under $500,000", points: 0 },
      { text: "$500,000 - $1 million", points: 20 },
      { text: "$1 million - $2.5 million", points: 40 },
      { text: "$2.5 million - $5 million", points: 60 },
      { text: "$5 million - $10 million", points: 80 },
      { text: "Over $10 million", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "1.2",
    section: "Financial Performance",
    title: "Pre-Tax Profit Margin",
    question: "What was your pre-tax profit margin in your most recent completed fiscal year?",
    options: [
      { text: "Lost money", points: 0 },
      { text: "0-5%", points: 25 },
      { text: "5-10%", points: 50 },
      { text: "10-15%", points: 70 },
      { text: "15-20%", points: 85 },
      { text: "Over 20%", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "1.3",
    section: "Financial Performance",
    title: "Revenue Growth Trend",
    question: "How has your revenue changed over the past three years (average annual growth)?",
    options: [
      { text: "Declined more than 10%", points: 0 },
      { text: "Declined 0-10%", points: 20 },
      { text: "Flat (no growth)", points: 40 },
      { text: "Grew 0-10% annually", points: 60 },
      { text: "Grew 10-20% annually", points: 80 },
      { text: "Grew more than 20% annually", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "1.4",
    section: "Financial Performance",
    title: "Financial Record Keeping",
    question: "How would you describe the professionalism of your financial record keeping?",
    options: [
      { text: "Basic/informal records", points: 0 },
      { text: "Bookkeeper-maintained records", points: 25 },
      { text: "Regular financial statements prepared", points: 50 },
      { text: "Monthly accrual-based statements", points: 75 },
      { text: "Audited or reviewed financials", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "1.5",
    section: "Financial Performance",
    title: "Gross Margin",
    question: "What is your gross profit margin (revenue minus direct costs)?",
    options: [
      { text: "Under 20%", points: 0 },
      { text: "20-30%", points: 20 },
      { text: "30-40%", points: 40 },
      { text: "40-50%", points: 60 },
      { text: "50-60%", points: 80 },
      { text: "Over 60%", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "1.6",
    section: "Financial Performance",
    title: "EBITDA Performance",
    question: "What is your EBITDA margin (Earnings Before Interest, Tax, Depreciation, Amortization)?",
    options: [
      { text: "Negative", points: 0 },
      { text: "0-10%", points: 30 },
      { text: "10-15%", points: 50 },
      { text: "15-20%", points: 70 },
      { text: "20-25%", points: 85 },
      { text: "Over 25%", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "1.7",
    section: "Financial Performance",
    title: "Revenue Predictability",
    question: "How predictable is your monthly revenue?",
    options: [
      { text: "Highly unpredictable", points: 0 },
      { text: "Difficult to forecast", points: 20 },
      { text: "Somewhat predictable", points: 40 },
      { text: "Moderately predictable", points: 60 },
      { text: "Very predictable", points: 80 },
      { text: "Extremely predictable", points: 100 }
    ],
    weight: 0.05
  },
  {
    id: "1.8",
    section: "Financial Performance",
    title: "Working Capital Requirements",
    question: "How many months of operating expenses do you keep in cash reserves?",
    options: [
      { text: "Less than 1 month", points: 0 },
      { text: "1-2 months", points: 30 },
      { text: "2-3 months", points: 50 },
      { text: "3-4 months", points: 70 },
      { text: "4-6 months", points: 85 },
      { text: "Over 6 months", points: 100 }
    ],
    weight: 0.05
  },

  // Driver 2: Growth Potential (15% weight)
  {
    id: "2.1",
    section: "Growth Potential",
    title: "Market Size",
    question: "How large is your total addressable market?",
    options: [
      { text: "Under $10 million", points: 0 },
      { text: "$10-50 million", points: 20 },
      { text: "$50-100 million", points: 40 },
      { text: "$100-500 million", points: 60 },
      { text: "$500 million - $1 billion", points: 80 },
      { text: "Over $1 billion", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "2.2",
    section: "Growth Potential",
    title: "Market Share",
    question: "What is your current market share in your primary market?",
    options: [
      { text: "Less than 1%", points: 20 },
      { text: "1-5%", points: 40 },
      { text: "5-10%", points: 60 },
      { text: "10-25%", points: 80 },
      { text: "25-50%", points: 90 },
      { text: "Over 50%", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "2.3",
    section: "Growth Potential",
    title: "Product Innovation",
    question: "How would you rate your company's innovation capabilities?",
    options: [
      { text: "Limited innovation", points: 0 },
      { text: "Occasional improvements", points: 20 },
      { text: "Regular product updates", points: 40 },
      { text: "Strong innovation culture", points: 60 },
      { text: "Market innovation leader", points: 80 },
      { text: "Disruptive innovation", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "2.4",
    section: "Growth Potential",
    title: "Customer Acquisition",
    question: "How effectively can you acquire new customers?",
    options: [
      { text: "Very difficult/expensive", points: 0 },
      { text: "Challenging process", points: 20 },
      { text: "Moderate difficulty", points: 40 },
      { text: "Relatively easy", points: 60 },
      { text: "Very efficient process", points: 80 },
      { text: "Customers seek us out", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "2.5",
    section: "Growth Potential",
    title: "Geographic Expansion",
    question: "What is your potential for geographic expansion?",
    options: [
      { text: "Limited to current location", points: 0 },
      { text: "Regional expansion possible", points: 20 },
      { text: "National expansion viable", points: 40 },
      { text: "Multiple countries possible", points: 60 },
      { text: "Global expansion ready", points: 80 },
      { text: "Already global presence", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "2.6",
    section: "Growth Potential",
    title: "Scalability",
    question: "How scalable is your business model?",
    options: [
      { text: "Requires proportional resources", points: 0 },
      { text: "Some economies of scale", points: 20 },
      { text: "Moderate scalability", points: 40 },
      { text: "Good scalability", points: 60 },
      { text: "Highly scalable", points: 80 },
      { text: "Infinitely scalable", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "2.7",
    section: "Growth Potential",
    title: "Strategic Partnerships",
    question: "How developed are your strategic partnerships?",
    options: [
      { text: "No strategic partnerships", points: 0 },
      { text: "Few informal relationships", points: 20 },
      { text: "Some formal partnerships", points: 40 },
      { text: "Strong partner network", points: 60 },
      { text: "Extensive partnerships", points: 80 },
      { text: "Dominant partnership position", points: 100 }
    ],
    weight: 0.05
  },
  {
    id: "2.8",
    section: "Growth Potential",
    title: "Future Market Trends",
    question: "How well positioned are you for future market trends?",
    options: [
      { text: "Behind market trends", points: 0 },
      { text: "Catching up to trends", points: 20 },
      { text: "Following market trends", points: 40 },
      { text: "Aligned with trends", points: 60 },
      { text: "Ahead of trends", points: 80 },
      { text: "Setting market trends", points: 100 }
    ],
    weight: 0.05
  },

  // Continue with remaining sections...
  // For brevity, I'll add a few more key questions from other sections

  // Driver 3: Switzerland Structure (12% weight)
  {
    id: "3.1",
    section: "Switzerland Structure",
    title: "Customer Concentration",
    question: "What percentage of revenue comes from your largest customer?",
    options: [
      { text: "Over 50%", points: 0 },
      { text: "25-50%", points: 20 },
      { text: "15-25%", points: 40 },
      { text: "10-15%", points: 60 },
      { text: "5-10%", points: 80 },
      { text: "Under 5%", points: 100 }
    ],
    weight: 0.25
  },
  {
    id: "3.2",
    section: "Switzerland Structure",
    title: "Supplier Dependence",
    question: "How dependent are you on key suppliers?",
    options: [
      { text: "Completely dependent on one", points: 0 },
      { text: "Heavily dependent on few", points: 20 },
      { text: "Moderate dependence", points: 40 },
      { text: "Some dependence", points: 60 },
      { text: "Multiple alternatives", points: 80 },
      { text: "No critical dependencies", points: 100 }
    ],
    weight: 0.20
  },

  // Section 9: Financial Health & Analysis
  {
    id: "9.1",
    section: "Financial Health & Analysis",
    title: "Debt-to-Equity Ratio",
    question: "What is your company's debt-to-equity ratio?",
    options: [
      { text: "Over 3:1", points: 0 },
      { text: "2:1 to 3:1", points: 20 },
      { text: "1.5:1 to 2:1", points: 40 },
      { text: "1:1 to 1.5:1", points: 60 },
      { text: "0.5:1 to 1:1", points: 80 },
      { text: "Under 0.5:1 or no debt", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "9.2",
    section: "Financial Health & Analysis",
    title: "Revenue Quality Audit",
    question: "What percentage of revenue comes from your most stable/reliable sources?",
    options: [
      { text: "Under 20%", points: 0 },
      { text: "20-40%", points: 20 },
      { text: "40-60%", points: 40 },
      { text: "60-75%", points: 60 },
      { text: "75-90%", points: 80 },
      { text: "Over 90%", points: 100 }
    ],
    weight: 0.15
  },

  // Section 10: Market & Competitive Position
  {
    id: "10.1",
    section: "Market & Competitive Position",
    title: "Market Growth Rate",
    question: "What is your industry's projected annual growth rate?",
    options: [
      { text: "Declining market", points: 0 },
      { text: "0-2% growth", points: 20 },
      { text: "2-5% growth", points: 40 },
      { text: "5-10% growth", points: 60 },
      { text: "10-15% growth", points: 80 },
      { text: "Over 15% growth", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "10.2",
    section: "Market & Competitive Position",
    title: "Competitive Intensity",
    question: "How would you describe competition in your market?",
    options: [
      { text: "Extremely intense", points: 0 },
      { text: "Very competitive", points: 20 },
      { text: "Moderately competitive", points: 40 },
      { text: "Some competition", points: 60 },
      { text: "Limited competition", points: 80 },
      { text: "Minimal competition", points: 100 }
    ],
    weight: 0.15
  },

  // Section 11: Operational Excellence
  {
    id: "11.1",
    section: "Operational Excellence",
    title: "Quality Control Systems",
    question: "How robust are your quality control systems?",
    options: [
      { text: "No formal QC", points: 0 },
      { text: "Basic QC processes", points: 20 },
      { text: "Standard QC systems", points: 40 },
      { text: "Above average QC", points: 60 },
      { text: "Comprehensive QC", points: 80 },
      { text: "Six Sigma/World-class", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "11.2",
    section: "Operational Excellence",
    title: "Technology Infrastructure",
    question: "How modern and scalable is your technology infrastructure?",
    options: [
      { text: "Outdated/problematic", points: 0 },
      { text: "Needs major upgrades", points: 20 },
      { text: "Adequate but aging", points: 40 },
      { text: "Good current state", points: 60 },
      { text: "Modern and scalable", points: 80 },
      { text: "Cutting-edge systems", points: 100 }
    ],
    weight: 0.15
  },

  // Driver 3: Switzerland Structure (12% weight) - continued
  {
    id: "3.3",
    section: "Switzerland Structure",
    title: "Employee Dependence",
    question: "How dependent is your business on key employees?",
    options: [
      { text: "Completely dependent on owner", points: 0 },
      { text: "Heavily dependent on few key people", points: 20 },
      { text: "Moderate dependence", points: 40 },
      { text: "Some dependence", points: 60 },
      { text: "Systems-dependent", points: 80 },
      { text: "No critical dependencies", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "3.4",
    section: "Switzerland Structure",
    title: "Product/Service Diversification",
    question: "How diversified is your product/service portfolio?",
    options: [
      { text: "Single product/service", points: 0 },
      { text: "2-3 products/services", points: 20 },
      { text: "4-5 products/services", points: 40 },
      { text: "6-8 products/services", points: 60 },
      { text: "9-12 products/services", points: 80 },
      { text: "Over 12 products/services", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "3.5",
    section: "Switzerland Structure",
    title: "Revenue Stream Diversification",
    question: "How many different revenue streams do you have?",
    options: [
      { text: "1 revenue stream", points: 0 },
      { text: "2 revenue streams", points: 20 },
      { text: "3 revenue streams", points: 40 },
      { text: "4 revenue streams", points: 60 },
      { text: "5 revenue streams", points: 80 },
      { text: "6+ revenue streams", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "3.6",
    section: "Switzerland Structure",
    title: "Geographic Diversification",
    question: "How geographically diversified is your customer base?",
    options: [
      { text: "Single location/region", points: 0 },
      { text: "2-3 regions", points: 20 },
      { text: "State/province wide", points: 40 },
      { text: "National presence", points: 60 },
      { text: "International presence", points: 80 },
      { text: "Global presence", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "3.7",
    section: "Switzerland Structure",
    title: "Industry Diversification",
    question: "How many different industries/sectors do you serve?",
    options: [
      { text: "Single industry", points: 0 },
      { text: "2 industries", points: 20 },
      { text: "3 industries", points: 40 },
      { text: "4 industries", points: 60 },
      { text: "5 industries", points: 80 },
      { text: "6+ industries", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "3.8",
    section: "Switzerland Structure",
    title: "Key Person Risk",
    question: "What would happen if the owner/key person was unavailable for 3 months?",
    options: [
      { text: "Business would fail", points: 0 },
      { text: "Severe problems", points: 20 },
      { text: "Significant challenges", points: 40 },
      { text: "Some difficulties", points: 60 },
      { text: "Minor issues", points: 80 },
      { text: "No impact", points: 100 }
    ],
    weight: 0.10
  },

  // Driver 4: Valuation Teeter-Totter (12% weight)
  {
    id: "4.1",
    section: "Valuation Teeter-Totter",
    title: "Cash Flow Predictability",
    question: "How predictable is your cash flow?",
    options: [
      { text: "Highly unpredictable", points: 0 },
      { text: "Very unpredictable", points: 20 },
      { text: "Somewhat unpredictable", points: 40 },
      { text: "Fairly predictable", points: 60 },
      { text: "Very predictable", points: 80 },
      { text: "Extremely predictable", points: 100 }
    ],
    weight: 0.25
  },
  {
    id: "4.2",
    section: "Valuation Teeter-Totter",
    title: "Business Model Sustainability",
    question: "How sustainable is your business model?",
    options: [
      { text: "Likely to be obsolete soon", points: 0 },
      { text: "May need significant changes", points: 20 },
      { text: "Needs some adaptation", points: 40 },
      { text: "Stable with minor tweaks", points: 60 },
      { text: "Very sustainable", points: 80 },
      { text: "Extremely sustainable", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "4.3",
    section: "Valuation Teeter-Totter",
    title: "Market Position Strength",
    question: "How strong is your market position?",
    options: [
      { text: "Weak position", points: 0 },
      { text: "Below average", points: 20 },
      { text: "Average position", points: 40 },
      { text: "Strong position", points: 60 },
      { text: "Very strong position", points: 80 },
      { text: "Dominant position", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "4.4",
    section: "Valuation Teeter-Totter",
    title: "Barriers to Entry",
    question: "How difficult is it for competitors to enter your market?",
    options: [
      { text: "Very easy to enter", points: 0 },
      { text: "Easy to enter", points: 20 },
      { text: "Moderate barriers", points: 40 },
      { text: "Difficult to enter", points: 60 },
      { text: "Very difficult to enter", points: 80 },
      { text: "Nearly impossible to enter", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "4.5",
    section: "Valuation Teeter-Totter",
    title: "Competitive Advantages",
    question: "How many sustainable competitive advantages do you have?",
    options: [
      { text: "No clear advantages", points: 0 },
      { text: "1 advantage", points: 20 },
      { text: "2 advantages", points: 40 },
      { text: "3 advantages", points: 60 },
      { text: "4 advantages", points: 80 },
      { text: "5+ advantages", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "4.6",
    section: "Valuation Teeter-Totter",
    title: "Customer Switching Costs",
    question: "How difficult/expensive is it for customers to switch to competitors?",
    options: [
      { text: "Very easy to switch", points: 0 },
      { text: "Easy to switch", points: 20 },
      { text: "Moderate switching costs", points: 40 },
      { text: "Difficult to switch", points: 60 },
      { text: "Very difficult to switch", points: 80 },
      { text: "Nearly impossible to switch", points: 100 }
    ],
    weight: 0.10
  },

  // Driver 5: Recurring Revenue (13% weight)
  {
    id: "5.1",
    section: "Recurring Revenue",
    title: "Recurring Revenue Percentage",
    question: "What percentage of your revenue is recurring?",
    options: [
      { text: "0% recurring", points: 0 },
      { text: "1-20% recurring", points: 20 },
      { text: "21-40% recurring", points: 40 },
      { text: "41-60% recurring", points: 60 },
      { text: "61-80% recurring", points: 80 },
      { text: "81-100% recurring", points: 100 }
    ],
    weight: 0.30
  },
  {
    id: "5.2",
    section: "Recurring Revenue",
    title: "Revenue Predictability",
    question: "How predictable is your revenue stream?",
    options: [
      { text: "Completely unpredictable", points: 0 },
      { text: "Very unpredictable", points: 20 },
      { text: "Somewhat unpredictable", points: 40 },
      { text: "Fairly predictable", points: 60 },
      { text: "Very predictable", points: 80 },
      { text: "Extremely predictable", points: 100 }
    ],
    weight: 0.25
  },
  {
    id: "5.3",
    section: "Recurring Revenue",
    title: "Customer Retention Rate",
    question: "What is your annual customer retention rate?",
    options: [
      { text: "Under 60%", points: 0 },
      { text: "60-70%", points: 20 },
      { text: "70-80%", points: 40 },
      { text: "80-90%", points: 60 },
      { text: "90-95%", points: 80 },
      { text: "Over 95%", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "5.4",
    section: "Recurring Revenue",
    title: "Contract Length",
    question: "What is the average length of your customer contracts?",
    options: [
      { text: "No contracts", points: 0 },
      { text: "Under 6 months", points: 20 },
      { text: "6-12 months", points: 40 },
      { text: "1-2 years", points: 60 },
      { text: "2-3 years", points: 80 },
      { text: "Over 3 years", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "5.5",
    section: "Recurring Revenue",
    title: "Subscription Model",
    question: "How developed is your subscription/membership model?",
    options: [
      { text: "No subscription model", points: 0 },
      { text: "Basic subscription", points: 20 },
      { text: "Standard subscription", points: 40 },
      { text: "Advanced subscription", points: 60 },
      { text: "Comprehensive subscription", points: 80 },
      { text: "Best-in-class subscription", points: 100 }
    ],
    weight: 0.10
  },

  // Driver 6: Monopoly Control (12% weight)
  {
    id: "6.1",
    section: "Monopoly Control",
    title: "Market Dominance",
    question: "What is your position in your primary market?",
    options: [
      { text: "Small player", points: 0 },
      { text: "Minor player", points: 20 },
      { text: "Moderate player", points: 40 },
      { text: "Major player", points: 60 },
      { text: "Leading player", points: 80 },
      { text: "Dominant player", points: 100 }
    ],
    weight: 0.25
  },
  {
    id: "6.2",
    section: "Monopoly Control",
    title: "Pricing Power",
    question: "How much pricing power do you have?",
    options: [
      { text: "No pricing power", points: 0 },
      { text: "Limited pricing power", points: 20 },
      { text: "Some pricing power", points: 40 },
      { text: "Good pricing power", points: 60 },
      { text: "Strong pricing power", points: 80 },
      { text: "Complete pricing power", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "6.3",
    section: "Monopoly Control",
    title: "Intellectual Property",
    question: "How well protected is your intellectual property?",
    options: [
      { text: "No IP protection", points: 0 },
      { text: "Minimal IP protection", points: 20 },
      { text: "Some IP protection", points: 40 },
      { text: "Good IP protection", points: 60 },
      { text: "Strong IP protection", points: 80 },
      { text: "Comprehensive IP protection", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "6.4",
    section: "Monopoly Control",
    title: "Regulatory Barriers",
    question: "How many regulatory barriers protect your business?",
    options: [
      { text: "No barriers", points: 0 },
      { text: "1 barrier", points: 20 },
      { text: "2 barriers", points: 40 },
      { text: "3 barriers", points: 60 },
      { text: "4 barriers", points: 80 },
      { text: "5+ barriers", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "6.5",
    section: "Monopoly Control",
    title: "Network Effects",
    question: "How strong are the network effects in your business?",
    options: [
      { text: "No network effects", points: 0 },
      { text: "Weak network effects", points: 20 },
      { text: "Some network effects", points: 40 },
      { text: "Good network effects", points: 60 },
      { text: "Strong network effects", points: 80 },
      { text: "Powerful network effects", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "6.6",
    section: "Monopoly Control",
    title: "Economies of Scale",
    question: "How significant are your economies of scale?",
    options: [
      { text: "No economies of scale", points: 0 },
      { text: "Minor economies of scale", points: 20 },
      { text: "Some economies of scale", points: 40 },
      { text: "Good economies of scale", points: 60 },
      { text: "Strong economies of scale", points: 80 },
      { text: "Massive economies of scale", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "6.7",
    section: "Monopoly Control",
    title: "Brand Strength",
    question: "How strong is your brand recognition?",
    options: [
      { text: "No brand recognition", points: 0 },
      { text: "Weak brand recognition", points: 20 },
      { text: "Some brand recognition", points: 40 },
      { text: "Good brand recognition", points: 60 },
      { text: "Strong brand recognition", points: 80 },
      { text: "Exceptional brand recognition", points: 100 }
    ],
    weight: 0.05
  },

  // Driver 7: Customer Satisfaction (11% weight)
  {
    id: "7.1",
    section: "Customer Satisfaction",
    title: "Net Promoter Score",
    question: "What is your Net Promoter Score (NPS)?",
    options: [
      { text: "Below 0", points: 0 },
      { text: "0-30", points: 20 },
      { text: "30-50", points: 40 },
      { text: "50-70", points: 60 },
      { text: "70-85", points: 80 },
      { text: "Over 85", points: 100 }
    ],
    weight: 0.25
  },
  {
    id: "7.2",
    section: "Customer Satisfaction",
    title: "Customer Complaints",
    question: "How many customer complaints do you receive monthly?",
    options: [
      { text: "Many complaints", points: 0 },
      { text: "Several complaints", points: 20 },
      { text: "Some complaints", points: 40 },
      { text: "Few complaints", points: 60 },
      { text: "Very few complaints", points: 80 },
      { text: "Almost no complaints", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "7.3",
    section: "Customer Satisfaction",
    title: "Customer Referrals",
    question: "What percentage of new customers come from referrals?",
    options: [
      { text: "Under 10%", points: 0 },
      { text: "10-20%", points: 20 },
      { text: "20-30%", points: 40 },
      { text: "30-40%", points: 60 },
      { text: "40-50%", points: 80 },
      { text: "Over 50%", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "7.4",
    section: "Customer Satisfaction",
    title: "Customer Lifetime Value",
    question: "How would you rate your customer lifetime value?",
    options: [
      { text: "Very low", points: 0 },
      { text: "Low", points: 20 },
      { text: "Average", points: 40 },
      { text: "High", points: 60 },
      { text: "Very high", points: 80 },
      { text: "Exceptional", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "7.5",
    section: "Customer Satisfaction",
    title: "Customer Support Quality",
    question: "How would you rate your customer support quality?",
    options: [
      { text: "Poor", points: 0 },
      { text: "Below average", points: 20 },
      { text: "Average", points: 40 },
      { text: "Good", points: 60 },
      { text: "Excellent", points: 80 },
      { text: "World-class", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "7.6",
    section: "Customer Satisfaction",
    title: "Customer Feedback System",
    question: "How systematic is your customer feedback collection?",
    options: [
      { text: "No systematic feedback", points: 0 },
      { text: "Occasional feedback", points: 20 },
      { text: "Regular feedback", points: 40 },
      { text: "Systematic feedback", points: 60 },
      { text: "Comprehensive feedback", points: 80 },
      { text: "Advanced feedback systems", points: 100 }
    ],
    weight: 0.10
  },

  // Driver 8: Hub & Spoke (10% weight)
  {
    id: "8.1",
    section: "Hub & Spoke",
    title: "Owner Dependence",
    question: "How dependent is the business on the owner?",
    options: [
      { text: "Completely dependent", points: 0 },
      { text: "Heavily dependent", points: 20 },
      { text: "Moderately dependent", points: 40 },
      { text: "Somewhat dependent", points: 60 },
      { text: "Minimally dependent", points: 80 },
      { text: "Not dependent", points: 100 }
    ],
    weight: 0.30
  },
  {
    id: "8.2",
    section: "Hub & Spoke",
    title: "Management Team Strength",
    question: "How strong is your management team?",
    options: [
      { text: "No management team", points: 0 },
      { text: "Weak management team", points: 20 },
      { text: "Basic management team", points: 40 },
      { text: "Good management team", points: 60 },
      { text: "Strong management team", points: 80 },
      { text: "Exceptional management team", points: 100 }
    ],
    weight: 0.25
  },
  {
    id: "8.3",
    section: "Hub & Spoke",
    title: "Systems & Processes",
    question: "How well documented are your systems and processes?",
    options: [
      { text: "No documentation", points: 0 },
      { text: "Minimal documentation", points: 20 },
      { text: "Some documentation", points: 40 },
      { text: "Good documentation", points: 60 },
      { text: "Comprehensive documentation", points: 80 },
      { text: "World-class documentation", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "8.4",
    section: "Hub & Spoke",
    title: "Employee Autonomy",
    question: "How autonomously can employees operate without owner input?",
    options: [
      { text: "Cannot operate without owner", points: 0 },
      { text: "Limited autonomy", points: 20 },
      { text: "Some autonomy", points: 40 },
      { text: "Good autonomy", points: 60 },
      { text: "High autonomy", points: 80 },
      { text: "Complete autonomy", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "8.5",
    section: "Hub & Spoke",
    title: "Decision Making Authority",
    question: "How distributed is decision-making authority?",
    options: [
      { text: "All decisions by owner", points: 0 },
      { text: "Most decisions by owner", points: 20 },
      { text: "Some decisions delegated", points: 40 },
      { text: "Many decisions delegated", points: 60 },
      { text: "Most decisions delegated", points: 80 },
      { text: "Fully distributed", points: 100 }
    ],
    weight: 0.10
  },

  // Section 9: Financial Health & Analysis (continuing from above)
  {
    id: "9.3",
    section: "Financial Health & Analysis",
    title: "Balance Sheet Strength",
    question: "How would you rate your balance sheet quality?",
    options: [
      { text: "Weak with concerns", points: 0 },
      { text: "Below average", points: 20 },
      { text: "Average for industry", points: 40 },
      { text: "Above average", points: 60 },
      { text: "Strong balance sheet", points: 80 },
      { text: "Exceptionally strong", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "9.4",
    section: "Financial Health & Analysis",
    title: "Budget Accuracy",
    question: "How accurately do you hit your annual budget projections?",
    options: [
      { text: "Off by more than 25%", points: 0 },
      { text: "Off by 15-25%", points: 20 },
      { text: "Off by 10-15%", points: 40 },
      { text: "Off by 5-10%", points: 60 },
      { text: "Within 5%", points: 80 },
      { text: "Consistently within 3%", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "9.5",
    section: "Financial Health & Analysis",
    title: "Historical Financial Consistency",
    question: "How consistent have your financial results been over 5 years?",
    options: [
      { text: "Highly erratic", points: 0 },
      { text: "Significant volatility", points: 20 },
      { text: "Some volatility", points: 40 },
      { text: "Relatively consistent", points: 60 },
      { text: "Very consistent", points: 80 },
      { text: "Extremely predictable growth", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "9.6",
    section: "Financial Health & Analysis",
    title: "Asset Utilization",
    question: "What is your return on assets (ROA)?",
    options: [
      { text: "Negative", points: 0 },
      { text: "0-5%", points: 20 },
      { text: "5-10%", points: 40 },
      { text: "10-15%", points: 60 },
      { text: "15-20%", points: 80 },
      { text: "Over 20%", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "9.7",
    section: "Financial Health & Analysis",
    title: "Financial Controls",
    question: "How robust are your financial controls and reporting systems?",
    options: [
      { text: "Basic or minimal", points: 0 },
      { text: "Some controls in place", points: 20 },
      { text: "Standard controls", points: 40 },
      { text: "Above average controls", points: 60 },
      { text: "Strong control environment", points: 80 },
      { text: "Best-in-class controls", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "9.8",
    section: "Financial Health & Analysis",
    title: "Cost Structure Flexibility",
    question: "What percentage of your costs are variable vs. fixed?",
    options: [
      { text: "Over 80% fixed", points: 0 },
      { text: "60-80% fixed", points: 20 },
      { text: "40-60% fixed", points: 40 },
      { text: "30-40% fixed", points: 60 },
      { text: "20-30% fixed", points: 80 },
      { text: "Under 20% fixed", points: 100 }
    ],
    weight: 0.10
  },

  // Section 10: Market & Competitive Position (continuing from above)
  {
    id: "10.3",
    section: "Market & Competitive Position",
    title: "Technology Disruption Risk",
    question: "How vulnerable is your business to technology disruption?",
    options: [
      { text: "Extremely vulnerable", points: 0 },
      { text: "Very vulnerable", points: 20 },
      { text: "Somewhat vulnerable", points: 40 },
      { text: "Limited vulnerability", points: 60 },
      { text: "Well protected", points: 80 },
      { text: "Leading the disruption", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "10.4",
    section: "Market & Competitive Position",
    title: "Regulatory Environment",
    question: "How favorable is your regulatory environment?",
    options: [
      { text: "Highly restrictive", points: 0 },
      { text: "Challenging regulations", points: 20 },
      { text: "Moderate regulations", points: 40 },
      { text: "Manageable regulations", points: 60 },
      { text: "Favorable environment", points: 80 },
      { text: "Very favorable/protected", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "10.5",
    section: "Market & Competitive Position",
    title: "Market Share Trajectory",
    question: "How has your market share changed over 3 years?",
    options: [
      { text: "Lost significant share", points: 0 },
      { text: "Lost some share", points: 20 },
      { text: "Maintained share", points: 40 },
      { text: "Gained modest share", points: 60 },
      { text: "Gained significant share", points: 80 },
      { text: "Dominant growth leader", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "10.6",
    section: "Market & Competitive Position",
    title: "Customer Acquisition Channels",
    question: "How many effective customer acquisition channels do you have?",
    options: [
      { text: "1 channel only", points: 0 },
      { text: "2 channels", points: 20 },
      { text: "3 channels", points: 40 },
      { text: "4 channels", points: 60 },
      { text: "5 channels", points: 80 },
      { text: "6+ diverse channels", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "10.7",
    section: "Market & Competitive Position",
    title: "Substitute Product Threat",
    question: "What is the threat level from substitute products/services?",
    options: [
      { text: "Very high threat", points: 0 },
      { text: "High threat", points: 20 },
      { text: "Moderate threat", points: 40 },
      { text: "Low threat", points: 60 },
      { text: "Very low threat", points: 80 },
      { text: "No viable substitutes", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "10.8",
    section: "Market & Competitive Position",
    title: "Economic Sensitivity",
    question: "How sensitive is your business to economic downturns?",
    options: [
      { text: "Extremely sensitive", points: 0 },
      { text: "Very sensitive", points: 20 },
      { text: "Moderately sensitive", points: 40 },
      { text: "Somewhat resistant", points: 60 },
      { text: "Very resistant", points: 80 },
      { text: "Counter-cyclical", points: 100 }
    ],
    weight: 0.10
  },

  // Section 11: Operational Excellence (continuing from above)
  {
    id: "11.3",
    section: "Operational Excellence",
    title: "Supply Chain Efficiency",
    question: "How efficient is your supply chain management?",
    options: [
      { text: "Highly inefficient", points: 0 },
      { text: "Below average", points: 20 },
      { text: "Average efficiency", points: 40 },
      { text: "Above average", points: 60 },
      { text: "Highly efficient", points: 80 },
      { text: "World-class efficiency", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "11.4",
    section: "Operational Excellence",
    title: "Process Optimization",
    question: "How optimized are your core business processes?",
    options: [
      { text: "Not optimized", points: 0 },
      { text: "Basic optimization", points: 20 },
      { text: "Some optimization", points: 40 },
      { text: "Well optimized", points: 60 },
      { text: "Highly optimized", points: 80 },
      { text: "Continuously improving", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "11.5",
    section: "Operational Excellence",
    title: "Inventory Management",
    question: "How effective is your inventory management?",
    options: [
      { text: "Poor inventory control", points: 0 },
      { text: "Basic inventory control", points: 20 },
      { text: "Average inventory control", points: 40 },
      { text: "Good inventory control", points: 60 },
      { text: "Excellent inventory control", points: 80 },
      { text: "Best-in-class inventory", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "11.6",
    section: "Operational Excellence",
    title: "Capacity Utilization",
    question: "What is your average capacity utilization rate?",
    options: [
      { text: "Under 50%", points: 0 },
      { text: "50-60%", points: 20 },
      { text: "60-70%", points: 40 },
      { text: "70-80%", points: 60 },
      { text: "80-90%", points: 80 },
      { text: "Over 90%", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "11.7",
    section: "Operational Excellence",
    title: "Performance Metrics",
    question: "How comprehensive are your performance measurement systems?",
    options: [
      { text: "No formal metrics", points: 0 },
      { text: "Basic metrics", points: 20 },
      { text: "Standard metrics", points: 40 },
      { text: "Comprehensive metrics", points: 60 },
      { text: "Advanced analytics", points: 80 },
      { text: "AI-driven insights", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "11.8",
    section: "Operational Excellence",
    title: "Continuous Improvement",
    question: "How strong is your continuous improvement culture?",
    options: [
      { text: "No improvement focus", points: 0 },
      { text: "Occasional improvements", points: 20 },
      { text: "Regular improvements", points: 40 },
      { text: "Strong improvement culture", points: 60 },
      { text: "Continuous improvement", points: 80 },
      { text: "Innovation-driven", points: 100 }
    ],
    weight: 0.10
  },

  // Section 12: Human Capital & Organization
  {
    id: "12.1",
    section: "Human Capital & Organization",
    title: "Employee Retention Rate",
    question: "What is your annual employee retention rate?",
    options: [
      { text: "Under 70%", points: 0 },
      { text: "70-80%", points: 20 },
      { text: "80-85%", points: 40 },
      { text: "85-90%", points: 60 },
      { text: "90-95%", points: 80 },
      { text: "Over 95%", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "12.2",
    section: "Human Capital & Organization",
    title: "Employee Skill Level",
    question: "How would you rate your employees' skill levels?",
    options: [
      { text: "Below industry average", points: 0 },
      { text: "At industry average", points: 20 },
      { text: "Slightly above average", points: 40 },
      { text: "Above average", points: 60 },
      { text: "Well above average", points: 80 },
      { text: "Best-in-class talent", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "12.3",
    section: "Human Capital & Organization",
    title: "Training & Development",
    question: "How comprehensive is your employee training and development program?",
    options: [
      { text: "No formal training", points: 0 },
      { text: "Basic training", points: 20 },
      { text: "Standard training", points: 40 },
      { text: "Comprehensive training", points: 60 },
      { text: "Advanced development", points: 80 },
      { text: "World-class development", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "12.4",
    section: "Human Capital & Organization",
    title: "Organizational Culture",
    question: "How strong is your organizational culture?",
    options: [
      { text: "Weak or toxic culture", points: 0 },
      { text: "Below average culture", points: 20 },
      { text: "Average culture", points: 40 },
      { text: "Good culture", points: 60 },
      { text: "Strong culture", points: 80 },
      { text: "Exceptional culture", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "12.5",
    section: "Human Capital & Organization",
    title: "Succession Planning",
    question: "How well developed is your succession planning?",
    options: [
      { text: "No succession planning", points: 0 },
      { text: "Basic succession planning", points: 20 },
      { text: "Some succession planning", points: 40 },
      { text: "Good succession planning", points: 60 },
      { text: "Comprehensive succession", points: 80 },
      { text: "Best-in-class succession", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "12.6",
    section: "Human Capital & Organization",
    title: "Employee Engagement",
    question: "How engaged are your employees?",
    options: [
      { text: "Disengaged workforce", points: 0 },
      { text: "Below average engagement", points: 20 },
      { text: "Average engagement", points: 40 },
      { text: "Good engagement", points: 60 },
      { text: "High engagement", points: 80 },
      { text: "Exceptional engagement", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "12.7",
    section: "Human Capital & Organization",
    title: "Compensation Competitiveness",
    question: "How competitive is your compensation package?",
    options: [
      { text: "Below market rate", points: 0 },
      { text: "Somewhat below market", points: 20 },
      { text: "At market rate", points: 40 },
      { text: "Above market rate", points: 60 },
      { text: "Well above market", points: 80 },
      { text: "Top-tier compensation", points: 100 }
    ],
    weight: 0.10
  },

  // Section 13: Legal, Risk & Compliance
  {
    id: "13.1",
    section: "Legal, Risk & Compliance",
    title: "Legal Structure Optimization",
    question: "How well optimized is your legal structure?",
    options: [
      { text: "Poor legal structure", points: 0 },
      { text: "Basic legal structure", points: 20 },
      { text: "Standard structure", points: 40 },
      { text: "Well-structured", points: 60 },
      { text: "Optimized structure", points: 80 },
      { text: "Best-in-class structure", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "13.2",
    section: "Legal, Risk & Compliance",
    title: "Insurance Coverage",
    question: "How comprehensive is your insurance coverage?",
    options: [
      { text: "Minimal coverage", points: 0 },
      { text: "Basic coverage", points: 20 },
      { text: "Standard coverage", points: 40 },
      { text: "Good coverage", points: 60 },
      { text: "Comprehensive coverage", points: 80 },
      { text: "Exceptional coverage", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "13.3",
    section: "Legal, Risk & Compliance",
    title: "Regulatory Compliance",
    question: "How well do you maintain regulatory compliance?",
    options: [
      { text: "Poor compliance", points: 0 },
      { text: "Basic compliance", points: 20 },
      { text: "Standard compliance", points: 40 },
      { text: "Good compliance", points: 60 },
      { text: "Excellent compliance", points: 80 },
      { text: "Best-in-class compliance", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "13.4",
    section: "Legal, Risk & Compliance",
    title: "Contract Management",
    question: "How well managed are your contracts and agreements?",
    options: [
      { text: "Poor contract management", points: 0 },
      { text: "Basic contract management", points: 20 },
      { text: "Standard management", points: 40 },
      { text: "Good management", points: 60 },
      { text: "Excellent management", points: 80 },
      { text: "Best-in-class management", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "13.5",
    section: "Legal, Risk & Compliance",
    title: "Risk Management Systems",
    question: "How robust are your risk management systems?",
    options: [
      { text: "No risk management", points: 0 },
      { text: "Basic risk management", points: 20 },
      { text: "Standard risk management", points: 40 },
      { text: "Good risk management", points: 60 },
      { text: "Comprehensive risk mgmt", points: 80 },
      { text: "Best-in-class risk mgmt", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "13.6",
    section: "Legal, Risk & Compliance",
    title: "Data Protection & Privacy",
    question: "How strong are your data protection and privacy measures?",
    options: [
      { text: "Poor data protection", points: 0 },
      { text: "Basic protection", points: 20 },
      { text: "Standard protection", points: 40 },
      { text: "Good protection", points: 60 },
      { text: "Strong protection", points: 80 },
      { text: "Best-in-class protection", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "13.7",
    section: "Legal, Risk & Compliance",
    title: "Litigation History",
    question: "What is your litigation history?",
    options: [
      { text: "Significant ongoing litigation", points: 0 },
      { text: "Some litigation issues", points: 20 },
      { text: "Minor litigation", points: 40 },
      { text: "Rare litigation", points: 60 },
      { text: "Very rare litigation", points: 80 },
      { text: "No litigation history", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "13.8",
    section: "Legal, Risk & Compliance",
    title: "Environmental Compliance",
    question: "How well do you manage environmental compliance?",
    options: [
      { text: "Poor environmental record", points: 0 },
      { text: "Basic compliance", points: 20 },
      { text: "Standard compliance", points: 40 },
      { text: "Good compliance", points: 60 },
      { text: "Excellent compliance", points: 80 },
      { text: "Industry leader", points: 100 }
    ],
    weight: 0.05
  },

  // Section 14: Strategic Assets & Intangibles
  {
    id: "14.1",
    section: "Strategic Assets & Intangibles",
    title: "Brand Value",
    question: "How valuable is your brand?",
    options: [
      { text: "Little brand value", points: 0 },
      { text: "Some brand value", points: 20 },
      { text: "Moderate brand value", points: 40 },
      { text: "Good brand value", points: 60 },
      { text: "Strong brand value", points: 80 },
      { text: "Exceptional brand value", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "14.2",
    section: "Strategic Assets & Intangibles",
    title: "Customer Relationships",
    question: "How strong are your customer relationships?",
    options: [
      { text: "Weak relationships", points: 0 },
      { text: "Basic relationships", points: 20 },
      { text: "Standard relationships", points: 40 },
      { text: "Good relationships", points: 60 },
      { text: "Strong relationships", points: 80 },
      { text: "Exceptional relationships", points: 100 }
    ],
    weight: 0.20
  },
  {
    id: "14.3",
    section: "Strategic Assets & Intangibles",
    title: "Proprietary Technology",
    question: "How advanced is your proprietary technology?",
    options: [
      { text: "No proprietary technology", points: 0 },
      { text: "Basic technology", points: 20 },
      { text: "Standard technology", points: 40 },
      { text: "Advanced technology", points: 60 },
      { text: "Cutting-edge technology", points: 80 },
      { text: "Revolutionary technology", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "14.4",
    section: "Strategic Assets & Intangibles",
    title: "Strategic Partnerships",
    question: "How valuable are your strategic partnerships?",
    options: [
      { text: "No strategic partnerships", points: 0 },
      { text: "Few partnerships", points: 20 },
      { text: "Some partnerships", points: 40 },
      { text: "Good partnerships", points: 60 },
      { text: "Strong partnerships", points: 80 },
      { text: "Exceptional partnerships", points: 100 }
    ],
    weight: 0.15
  },
  {
    id: "14.5",
    section: "Strategic Assets & Intangibles",
    title: "Market Position",
    question: "How strong is your overall market position?",
    options: [
      { text: "Weak market position", points: 0 },
      { text: "Below average position", points: 20 },
      { text: "Average position", points: 40 },
      { text: "Good position", points: 60 },
      { text: "Strong position", points: 80 },
      { text: "Dominant position", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "14.6",
    section: "Strategic Assets & Intangibles",
    title: "Innovation Capabilities",
    question: "How strong are your innovation capabilities?",
    options: [
      { text: "No innovation capability", points: 0 },
      { text: "Limited innovation", points: 20 },
      { text: "Some innovation", points: 40 },
      { text: "Good innovation", points: 60 },
      { text: "Strong innovation", points: 80 },
      { text: "Exceptional innovation", points: 100 }
    ],
    weight: 0.10
  },
  {
    id: "14.7",
    section: "Strategic Assets & Intangibles",
    title: "Knowledge Assets",
    question: "How valuable are your knowledge and information assets?",
    options: [
      { text: "Limited knowledge assets", points: 0 },
      { text: "Basic knowledge assets", points: 20 },
      { text: "Standard knowledge assets", points: 40 },
      { text: "Good knowledge assets", points: 60 },
      { text: "Strong knowledge assets", points: 80 },
      { text: "Exceptional knowledge", points: 100 }
    ],
    weight: 0.05
  },
  {
    id: "14.8",
    section: "Strategic Assets & Intangibles",
    title: "Future Growth Options",
    question: "How many future growth options do you have?",
    options: [
      { text: "No growth options", points: 0 },
      { text: "1-2 options", points: 20 },
      { text: "3-4 options", points: 40 },
      { text: "5-6 options", points: 60 },
      { text: "7-8 options", points: 80 },
      { text: "9+ options", points: 100 }
    ],
    weight: 0.05
  }
];

export const sectionWeights = {
  "Financial Performance": 0.15,
  "Growth Potential": 0.15,
  "Switzerland Structure": 0.12,
  "Valuation Teeter-Totter": 0.12,
  "Recurring Revenue": 0.13,
  "Monopoly Control": 0.12,
  "Customer Satisfaction": 0.11,
  "Hub & Spoke": 0.10,
  "Financial Health & Analysis": 0.05,
  "Market & Competitive Position": 0.05,
  "Operational Excellence": 0.05,
  "Human Capital & Organization": 0.05,
  "Legal, Risk & Compliance": 0.05,
  "Strategic Assets & Intangibles": 0.05,
};

export const coreDriverWeight = 0.7;
export const supplementalWeight = 0.3;
