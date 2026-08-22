/**
 * ============================================================
 * SEED SUPABASE VECTOR DATABASE (pgvector)
 * Breaks all 7 Haridwar real-estate projects into fine-grained 
 * mathematical vector chunks and uploads them to Supabase.
 * ============================================================
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 1. All 7 Projects Knowledge Dataset (Deep Details)
const PROPERTY_CHUNKS = [
    // ------------------- 1. MANTRA HAPPY HOMES (SALES EXPERT KNOWLEDGE) -------------------
    {
        project_name: "Mantra Happy Homes",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Mantra Happy Homes mein 810 sq.ft Super Builtup Area ka 2 BHK flat ₹27 se ₹28 Lakh se shuru hota hai (Builtup area 679 sq.ft). Isme 2 bedrooms (10x12.4 ft & 10x9 ft), 3 balconies (12x5 ft, 6.5x5 ft, 5x5 ft), 2 bathrooms aur drawing-dining space hai. Note: Carpet area 518 sq.ft sirf tab batayein jab customer specifically carpet area puche.",
        metadata: { project: "Mantra Happy Homes", bhk: "2BHK", size_super: "810 sq.ft", size_builtup: "679 sq.ft", size_carpet: "518 sq.ft", price: "₹27-28 Lakh", price_num: 2700000 }
    },
    {
        project_name: "Mantra Happy Homes",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Mantra Happy Homes mein 950 sq.ft Super Builtup Area ka spacious 2 BHK flat ₹34 se ₹35 Lakh se shuru hota hai (Builtup area 796 sq.ft). Isme 2 master bedrooms (10.5x13.3 ft & 11x10 ft), 3 balconies (13.3x5 ft, 7.5x5 ft, 4.5x5 ft), 2 bathrooms aur modular kitchen hai. Note: Carpet area 616 sq.ft sirf puchne par batayein.",
        metadata: { project: "Mantra Happy Homes", bhk: "2BHK", size_super: "950 sq.ft", size_builtup: "796 sq.ft", size_carpet: "616 sq.ft", price: "₹34-35 Lakh", price_num: 3400000 }
    },
    {
        project_name: "Mantra Happy Homes",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Mantra Happy Homes mein 1010 sq.ft Super Builtup Area ka luxury bada 2 BHK flat ₹38 Lakh se shuru hota hai (Builtup area 846 sq.ft). Isme 2 large bedrooms (11x14.4 ft & 11x10 ft), 3 wide balconies (14x5 ft, 8x5 ft, 5.5x6.2 ft) aur 2 toilets hain. Note: Carpet area 655 sq.ft sirf customer ke puchne par batayein.",
        metadata: { project: "Mantra Happy Homes", bhk: "2BHK", size_super: "1010 sq.ft", size_builtup: "846 sq.ft", size_carpet: "655 sq.ft", price: "₹38 Lakh", price_num: 3800000 }
    },
    {
        project_name: "Mantra Happy Homes",
        bhk_type: null,
        category: "society_info",
        content: "Mantra Happy Homes Haridwar Sidcul mein 6 एकड़ ki premium gated residential township hai jise CRC (Chandgi Ram Real Estate) ne 2018-2019 mein deliver kiya tha. Isme kul 5 towers (Tower A, B, C, D, E), 272 flats aur 68 independent plots (96 se 138 sq.m, 40 ft road) hain. Yeh 100% Freehold property hai aur HRDA approved hai. Yahan sabhi flats ready-to-move Resale mein uplabdh hain.",
        metadata: { project: "Mantra Happy Homes", township_acres: "6 Acres", towers: 5, total_flats: 272, total_plots: 68, delivered: "2018-2019", legal: "100% Freehold, HRDA Approved", resale: true }
    },
    {
        project_name: "Mantra Happy Homes",
        bhk_type: null,
        category: "connectivity",
        content: "Mantra Happy Homes ki prime connectivity: Sidcul Integrated Industrial Area 0 km par hai, Hero Industrial Park 150 meter, The Pentagon Mall, Radisson Blu Hotel, Gardenia aur Metro Hospital 1 km ke andar hain. Chinmaya College, BHEL aur Shivalik Nagar 2 se 3.5 km, District Court/Vikas Bhawan 2.5 km, Har Ki Pauri aur Haridwar Railway Station 8 se 10 km, Jolly Grant Airport 50 km aur Dehradun 65 km hai.",
        metadata: { project: "Mantra Happy Homes", sidcul_km: 0, hero_park_m: 150, mall_km: 1, hospital_km: 1, shivalik_nagar_km: 3.5, har_ki_pauri_km: 8 }
    },
    {
        project_name: "Mantra Happy Homes",
        bhk_type: null,
        category: "amenities",
        content: "Mantra Happy Homes ki world-class club & society amenities: Modern Clubhouse with Swimming Pool (separate male/female changing rooms), Gymnasium, Snooker/Pool Table, Table Tennis, Outdoor Badminton Court, Banquet & Multipurpose Hall, har tower mein 2 High Speed Lifts, 100% Power Backup (Generators), 2-Tier Gated Security with CCTV surveillance, society ke andar sundar Mandir (Temple), Commercial Daily Needs Shops, Kids Play Area, Jogging Track aur Amphitheater.",
        metadata: { project: "Mantra Happy Homes", amenities: ["Mandir / Temple", "Swimming Pool", "Gym", "Clubhouse", "2 Lifts per Tower", "100% Power Backup", "2-Tier Security", "Badminton Court", "Commercial Shops"] }
    },
    {
        project_name: "Mantra Happy Homes",
        bhk_type: null,
        category: "temple_spiritual",
        content: "Mantra Happy Homes township ke andar ek sundar Mandir (Temple) sthit hai jahan society ke sabhi niwasi daily puja aur aarti kar sakte hain. Society ka mahol poori tarah se divine, shant aur spiritual hai.",
        metadata: { project: "Mantra Happy Homes", temple_inside: true, mandir: "Available inside township" }
    },


    // ------------------- 2. HARIDWAR GREENS -------------------
    {
        project_name: "Haridwar Greens",
        bhk_type: "1BHK",
        category: "pricing_size",
        content: "Haridwar Greens mein 1 BHK flat ka price ₹15 Lakh* se shuru hota hai. Isme multiple vastu compliant facing options available hain.",
        metadata: { project: "Haridwar Greens", bhk: "1BHK", price: "₹15 Lakh", price_num: 1500000, size: "Compact 1BHK" }
    },
    {
        project_name: "Haridwar Greens",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Haridwar Greens mein 2 BHK flat ka super area 1075 sq.ft hai aur iska price ₹38 Lakh* hai. Flat fully ventilated hai aur multiple vastu facing options uplabdh hain.",
        metadata: { project: "Haridwar Greens", bhk: "2BHK", price: "₹38 Lakh", price_num: 3800000, size: "1075 sq.ft", size_sqft: 1075 }
    },
    {
        project_name: "Haridwar Greens",
        bhk_type: "3BHK",
        category: "pricing_size",
        content: "Haridwar Greens mein 3 BHK flat ka super area 1410 sq.ft hai aur iska price ₹50 Lakh* hai. Ye bade parivar ke liye spacious aur luxurious layout offer karta hai.",
        metadata: { project: "Haridwar Greens", bhk: "3BHK", price: "₹50 Lakh", price_num: 5000000, size: "1410 sq.ft", size_sqft: 1410 }
    },
    {
        project_name: "Haridwar Greens",
        bhk_type: null,
        category: "society_info",
        content: "Haridwar Greens Haridwar ka premium gated township hai jise 2017 mein deliver kiya gaya tha. Iski Google rating 4.2/5 hai (500+ Google Reviews). Ye lush green landscaped parks aur modern living environment ke liye jaana jata hai.",
        metadata: { project: "Haridwar Greens", delivered: "2017", rating: "4.2/5", reviews: "500+" }
    },
    {
        project_name: "Haridwar Greens",
        bhk_type: null,
        category: "connectivity",
        content: "Haridwar Greens ki connectivity: Har Ki Pauri se doori 18 km, Haridwar bus/railway station se 15 km, NH-58 Highway se 10 km, Hospital se 2.9 km, Shopping Mall se 6.3 km, School/College se 1 km, Shivalik Nagar se 7.8 km, Petrol pump se 0.5 km, Jolly Grant Airport se 55 km aur Dehradun se 69 km door hai.",
        metadata: { project: "Haridwar Greens", har_ki_pauri_km: 18, railway_km: 15, highway_km: 10, shivalik_nagar_km: 7.8 }
    },
    {
        project_name: "Haridwar Greens",
        bhk_type: null,
        category: "amenities",
        content: "Haridwar Greens ki top amenities: 24x7 gated security CCTV ke saath, landscaped green gardens aur parks, har flat ke liye dedicated parking space, common areas aur lifts ke liye 24x7 power backup, 24-hour water supply (borewell & municipal connection), modern clubhouse, fully equipped gym aur swimming pool.",
        metadata: { project: "Haridwar Greens", amenities: ["Clubhouse", "Gym", "Swimming Pool", "Lush Parks", "Dedicated Parking", "Power Backup"] }
    },

    // ------------------- 3. DEEP GANGA -------------------
    {
        project_name: "Deep Ganga",
        bhk_type: "1BHK",
        category: "pricing_size",
        content: "Deep Ganga mein 1 BHK flat ka size 740 sq.ft hai aur iska price ₹27 Lakh* hai. Flat modern layout aur good ventilation ke sath aata hai.",
        metadata: { project: "Deep Ganga", bhk: "1BHK", price: "₹27 Lakh", price_num: 2700000, size: "740 sq.ft", size_sqft: 740 }
    },
    {
        project_name: "Deep Ganga",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Deep Ganga mein 2 BHK flat ka size 1180 sq.ft hai aur iska price ₹38 Lakh* hai. Isme spacious bedrooms aur multiple facing options hain.",
        metadata: { project: "Deep Ganga", bhk: "2BHK", price: "₹38 Lakh", price_num: 3800000, size: "1180 sq.ft", size_sqft: 1180 }
    },
    {
        project_name: "Deep Ganga",
        bhk_type: "3BHK",
        category: "pricing_size",
        content: "Deep Ganga mein 3 BHK flat ka size 1478 sq.ft hai aur iska price ₹55 Lakh* hai. Ye premium river-side luxury flat hai.",
        metadata: { project: "Deep Ganga", bhk: "3BHK", price: "₹55 Lakh", price_num: 5500000, size: "1478 sq.ft", size_sqft: 1478 }
    },
    {
        project_name: "Deep Ganga",
        bhk_type: null,
        category: "society_info",
        content: "Deep Ganga Haridwar ka ek sundar riverside residential project hai jise 2015 mein deliver kiya gaya tha. Iski Google review rating 4.0/5 hai (400+ reviews). Yahan se holy river Ganga ke divine views dekhne ko milte hain.",
        metadata: { project: "Deep Ganga", delivered: "2015", rating: "4.0/5", reviews: "400+" }
    },
    {
        project_name: "Deep Ganga",
        bhk_type: null,
        category: "connectivity",
        content: "Deep Ganga ki connectivity: Har Ki Pauri se doori 17 km, Haridwar bus/railway station se 14 km, NH-58 Highway se 9 km, Shivalik Nagar se sirf 1.9 km, Hospital se 1 km, Shopping Mall se 5 km, School/College se 2 km, Petrol pump se 0.5 km, Jolly Grant Airport se 54 km aur Dehradun se 68 km hai.",
        metadata: { project: "Deep Ganga", har_ki_pauri_km: 17, railway_km: 14, highway_km: 9, shivalik_nagar_km: 1.9 }
    },
    {
        project_name: "Deep Ganga",
        bhk_type: null,
        category: "amenities",
        content: "Deep Ganga ki amenities: Ganga View flats, 24x7 gated security, covered aur open ample parking, full power backup, well-maintained green walking trails, aur bacho ke liye dedicated Kids Play Area.",
        metadata: { project: "Deep Ganga", amenities: ["Ganga River View", "Kids Play Area", "24x7 Security", "Ample Parking", "Power Backup"] }
    },

    // ------------------- 4. ANTRIKSH NRI CITY -------------------
    {
        project_name: "Antriksh NRI City",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Antriksh NRI City mein 2 BHK flat ka super area 915 sq.ft hai aur iska price ₹40 Lakh* hai. Flat international-standard specifications ke sath aata hai.",
        metadata: { project: "Antriksh NRI City", bhk: "2BHK", price: "₹40 Lakh", price_num: 4000000, size: "915 sq.ft", size_sqft: 915 }
    },
    {
        project_name: "Antriksh NRI City",
        bhk_type: "3BHK",
        category: "pricing_size",
        content: "Antriksh NRI City mein 3 BHK flat ka super area 1315 sq.ft hai aur iska price ₹57 Lakh* hai. Ye premium luxury segment me spacious layout offer karta hai.",
        metadata: { project: "Antriksh NRI City", bhk: "3BHK", price: "₹57 Lakh", price_num: 5700000, size: "1315 sq.ft", size_sqft: 1315 }
    },
    {
        project_name: "Antriksh NRI City",
        bhk_type: null,
        category: "society_info",
        content: "Antriksh NRI City Haridwar ka premium integrated township hai jise NRI investors aur high-standard families ke liye 2015 mein deliver kiya gaya tha. Iski Google rating 4.0/5 hai (200+ reviews).",
        metadata: { project: "Antriksh NRI City", delivered: "2015", rating: "4.0/5", reviews: "200+" }
    },
    {
        project_name: "Antriksh NRI City",
        bhk_type: null,
        category: "connectivity",
        content: "Antriksh NRI City ki connectivity: Shivalik Nagar se 0 km (bilkul adjacent), Shopping Mall se 0 km, Har Ki Pauri se 13 km, Haridwar bus/railway station se 10 km, NH-58 Highway se 5 km, Hospital se 2 km, School/College se 1 km, Petrol pump se 1 km, Jolly Grant Airport se 50 km aur Dehradun se 64 km hai.",
        metadata: { project: "Antriksh NRI City", har_ki_pauri_km: 13, railway_km: 10, highway_km: 5, shivalik_nagar_km: 0, mall_km: 0 }
    },
    {
        project_name: "Antriksh NRI City",
        bhk_type: null,
        category: "amenities",
        content: "Antriksh NRI City ki amenities: 70% open green area aur jogging tracks, world-class clubhouse, gym aur swimming pool, multi-tier gated township security, smart home power backup, multi-level covered parking, aur har tower me complete fire safety system.",
        metadata: { project: "Antriksh NRI City", amenities: ["70% Open Green Space", "Clubhouse & Gym", "Swimming Pool", "Multi-level Parking", "Smart Homes"] }
    },

    // ------------------- 5. JURS COUNTRY -------------------
    {
        project_name: "Jurs Country",
        bhk_type: "2BHK",
        category: "pricing_size",
        content: "Jurs Country mein 2 BHK flat ka super area 880 sq.ft hai aur iska price ₹45 Lakh* hai. Flat direct highway access aur scenic views deta hai.",
        metadata: { project: "Jurs Country", bhk: "2BHK", price: "₹45 Lakh", price_num: 4500000, size: "880 sq.ft", size_sqft: 880 }
    },
    {
        project_name: "Jurs Country",
        bhk_type: "3BHK",
        category: "pricing_size",
        content: "Jurs Country mein 3 BHK flat ka super area 1210 sq.ft hai aur iska price ₹60 Lakh* hai. Isme spacious balconies aur luxury fittings hain.",
        metadata: { project: "Jurs Country", bhk: "3BHK", price: "₹60 Lakh", price_num: 6000000, size: "1210 sq.ft", size_sqft: 1210 }
    },
    {
        project_name: "Jurs Country",
        bhk_type: "4BHK",
        category: "pricing_size",
        content: "Jurs Country mein 4 BHK ultra-luxury flat ka size 2296 sq.ft hai aur iska price ₹1.25 Crore* hai. Ye massive space aur premium lifestyle provide karta hai.",
        metadata: { project: "Jurs Country", bhk: "4BHK", price: "₹1.25 Crore", price_num: 12500000, size: "2296 sq.ft", size_sqft: 2296 }
    },
    {
        project_name: "Jurs Country",
        bhk_type: "5BHK",
        category: "pricing_size",
        content: "Jurs Country mein 5 BHK grand penthouse / flat ka size 2575 sq.ft hai aur iska price ₹1.35 Crore* hai. Haridwar ka one of the largest luxury configurations.",
        metadata: { project: "Jurs Country", bhk: "5BHK", price: "₹1.35 Crore", price_num: 13500000, size: "2575 sq.ft", size_sqft: 2575 }
    },
    {
        project_name: "Jurs Country",
        bhk_type: null,
        category: "society_info",
        content: "Jurs Country Haridwar ka sabse popular aur sprawling residential township hai jise 2014 mein deliver kiya gaya tha. Iski Google rating 4.1/5 hai (300+ Google reviews). Ye hills aur greenery ke beech direct NH-58 highway par sthit hai.",
        metadata: { project: "Jurs Country", delivered: "2014", rating: "4.1/5", reviews: "300+" }
    },
    {
        project_name: "Jurs Country",
        bhk_type: null,
        category: "connectivity",
        content: "Jurs Country ki prime connectivity: NH-58 Highway se 0 km (on highway), Har Ki Pauri se sirf 9 km (Har Ki Pauri ke sabse nazdeek flat projects me se ek), Haridwar railway/bus station se 7.6 km, Hospital se 1 km, Shopping Mall se 3 km, Shivalik Nagar se 3 km, School/College se 2 km, Petrol pump se 0 km, Jolly Grant Airport se 46 km aur Dehradun se 62 km door hai.",
        metadata: { project: "Jurs Country", har_ki_pauri_km: 9, railway_km: 7.6, highway_km: 0, shivalik_nagar_km: 3 }
    },
    {
        project_name: "Jurs Country",
        bhk_type: null,
        category: "amenities",
        content: "Jurs Country ki world-class amenities: Olympic-size swimming pool aur kids pool, 60-feet wide internal roads with streetlights, sports complex (tennis court, basketball court, jogging tracks), 24x7 gated security, full power backup inverter support, aur lush natural surroundings.",
        metadata: { project: "Jurs Country", amenities: ["Olympic Swimming Pool", "60-ft Wide Roads", "Tennis & Basketball Court", "Direct NH-58 Highway", "Full Power Backup"] }
    },

    // ------------------- 6. HOMELAND (PLOTS) -------------------
    {
        project_name: "Homeland",
        bhk_type: null,
        category: "plot_details",
        content: "Homeland Haridwar mein residential plots provide karta hai. Iska price ₹3500 per sq.ft* hai. Multiple plot sizes uplabdh hain. Status: Under Construction/Development. Clear legal titles ke sath gated community.",
        metadata: { project: "Homeland", is_plot: true, price_sqft: "₹3500/sq.ft", price_per_sqft_num: 3500 }
    },
    {
        project_name: "Homeland",
        bhk_type: null,
        category: "connectivity",
        content: "Homeland Plots ki connectivity: Haridwar Railway Station se 6 km, Main Road se 1 km, Hospital se 3 km, aur Schools se 2 km doori par hai.",
        metadata: { project: "Homeland", railway_km: 6, main_road_km: 1, hospital_km: 3 }
    },
    {
        project_name: "Homeland",
        bhk_type: null,
        category: "amenities",
        content: "Homeland plotted community ki facilities: 24x7 gated security CCTV coverage ke sath, landscaped green gardens, uninterrupted power supply aur 24-hour continuous water availability.",
        metadata: { project: "Homeland", amenities: ["Gated Security", "Green Gardens", "24-hr Water", "Power Supply"] }
    },

    // ------------------- 7. SHREE HARIDARSHAN, LAND & INDEPENDENT HOMES -------------------
    {
        project_name: "Shree Haridarshan",
        bhk_type: null,
        category: "plot_details",
        content: "Shree Haridarshan Haridwar mein prime residential plots provide karta hai. Rate ₹4500 per sq.ft* hai. Status: Under Development. Ye prime plot location high ROI aur capital appreciation ke sath perfect home canvas provide karta hai.",
        metadata: { project: "Shree Haridarshan", is_plot: true, price_sqft: "₹4500/sq.ft", price_per_sqft_num: 4500 }
    },
    {
        project_name: "Shree Haridarshan",
        bhk_type: null,
        category: "connectivity",
        content: "Shree Haridarshan Plots direct Main Road Connectivity par hain. Yahan 24-hour electricity aur water supply facility available hai. All properties 100% clear legal title ke sath hain.",
        metadata: { project: "Shree Haridarshan", connectivity: "On Main Road", electricity: "Available", water: "Available" }
    },
    {
        project_name: "Independent Home",
        bhk_type: null,
        category: "property_info",
        content: "Haridwar mein prime locations par Independent Homes (Kothis/Villas) available hain. Isme land aur building ka complete 100% ownership milta hai. Custom designs, private garden aur private dedicated parking space available hai. Price on request.",
        metadata: { project: "Independent Home", type: "Villa / House", ownership: "100% Full Ownership", parking: "Private" }
    },
    {
        project_name: "Land / Commercial Plots",
        bhk_type: null,
        category: "property_info",
        content: "Haridwar region mein residential aur commercial investment ke liye prime Land/Plots 100 sq.yd se lekar 500 sq.yd tak uplabdh hain. Ye high ROI, clear legal titles aur developed residential area on main road connectivity provide karte hain.",
        metadata: { project: "Land", type: "Residential & Commercial Land", sizes: "100 to 500 sq.yd", roi: "High" }
    },

    // ------------------- 8. UNIVERSAL SALES & LEGAL RULES (HARIDWAR REAL ESTATE) -------------------
    {
        project_name: "Universal Property Rules",
        bhk_type: null,
        category: "bank_loan",
        content: "Haridwar mein chahe koi bhi project ho (Mantra Happy Homes, Haridwar Greens, Deep Ganga, Antriksh NRI City, Jurs Country), sabhi projects par SBI (State Bank of India) aur PNB (Punjab National Bank) se 80% se 90% tak ka easy home loan uplabdh ho jata hai. Iske alawa ICICI aur HDFC se bhi approved hain.",
        metadata: { category: "loan", loan_percent: "80-90%", banks: ["SBI", "PNB", "HDFC", "ICICI"] }
    },
    {
        project_name: "Universal Property Rules",
        bhk_type: null,
        category: "legal_documents",
        content: "HRDA aur RERA documents ya project legal approval papers hum online ya internet/WhatsApp par share nahi karte hain. Jab aap site visit ke liye hamare office aate hain, tab table par aapko saare original documents, approvals aur registry papers physically check karwa diye jaate hain.",
        metadata: { category: "legal", rule: "Documents physically shown on site visit, not shared online" }
    },
    {
        project_name: "Universal Property Rules",
        bhk_type: null,
        category: "area_policy",
        content: "Flats ke size me hamesha Super Built-up Area bataya jata hai (jaise Mantra Happy Homes mein 810 sq.ft, 950 sq.ft, 1010 sq.ft) kyunki isse customer ko flat ka poora spacious feel pata chalta hai. Carpet area (518 sq.ft, 616 sq.ft, 655 sq.ft) sirf tabhi bataya jata hai jab customer specifically puche.",
        metadata: { category: "sales_rule", rule: "Always quote Super Built-up Area" }
    },
    {
        project_name: "Universal Property Rules",
        bhk_type: null,
        category: "portfolio_overview",
        content: "The Propbazar Haridwar (founded by Rahul Dwivedi) operates in all major residential societies, plotted townships and luxury villa projects across Haridwar: 1. Mantra Happy Homes, 2. Haridwar Greens, 3. Deep Ganga, 4. Antriksh NRI City, 5. Jurs Country, 6. Homeland (plotted township), 7. Shree Haridarshan (highway plots), aur Independent Luxury Villas/Kothis.",
        metadata: { category: "portfolio", total_projects: 8 }
    },
    {
        project_name: "Universal Property Rules",
        bhk_type: "2BHK",
        category: "2bhk_portfolio_overview",
        content: "The Propbazar Haridwar ke paas 2 BHK flats ke liye kul 5 shandar projects/societies uplabdh hain: 1. Mantra Happy Homes (810, 950, 1010 sq.ft), 2. Haridwar Greens, 3. Deep Ganga, 4. Antriksh NRI City, aur 5. Jurs Country. In sabhi 5 societies mein 2 BHK ke ready-to-move flats uplabdh hain.",
        metadata: { category: "2bhk_portfolio", total_2bhk_projects: 5, projects: ["Mantra Happy Homes", "Haridwar Greens", "Deep Ganga", "Antriksh NRI City", "Jurs Country"] }
    }
];

// 2. Embedding pipeline using Transformers.js (384-dimensional vectors)
async function generateEmbeddingsAndSeed() {
    console.log("=================================================");
    console.log("1. Checking Supabase Credentials in .env...");
    console.log("=================================================");

    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)?.trim();

    if (!supabaseUrl || !supabaseKey) {
        console.error("\n❌ ERROR: SUPABASE_URL or SUPABASE_KEY is missing in your .env file!");
        console.log("Please add SUPABASE_URL and SUPABASE_KEY to your .env file, then rerun this script.\n");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("✓ Connected to Supabase:", supabaseUrl);
    console.log("\n2. Initializing Xenova Transformers Embedding Model (all-MiniLM-L6-v2)...");

    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log("✓ Embedding model ready! Total Chunks to process:", PROPERTY_CHUNKS.length);

    console.log("\n3. Generating mathematical vector embeddings for all 7 projects...");

    const rowsToInsert = [];

    const hindiProjectMap = {
        "Mantra Happy Homes": "मंत्रा हैप्पी होम्स mantra happy homes",
        "Haridwar Greens": "हरिद्वार ग्रीन्स haridwar greens",
        "Deep Ganga": "डीप गंगा deep ganga deepganga",
        "Antriksh NRI City": "अंतरिक्ष एनआरआई सिटी antriksh nri city",
        "Jurs Country": "जर्स कंट्री jurs country",
        "Homeland": "होमलैंड homeland",
        "Shree Haridarshan": "श्री हरिदर्शन shree haridarshan",
        "Independent Home": "इंडिपेंडेंट होम विला independent home villa",
        "Land / Commercial Plots": "जमीन प्लॉट land plots",
        "Universal Property Rules": "लोन bank loan sbi pnb rera hrda documents papers legal rules registry approval loan"
    };

    const hindiBhkMap = {
        "1BHK": "1 BHK 1BHK 1 बीएचके",
        "2BHK": "2 BHK 2BHK 2 बीएचके",
        "3BHK": "3 BHK 3BHK 3 बीएचके",
        "4BHK": "4 BHK 4BHK 4 बीएचके",
        "5BHK": "5 BHK 5BHK 5 बीएचके"
    };

    for (let i = 0; i < PROPERTY_CHUNKS.length; i++) {
        const item = PROPERTY_CHUNKS[i];
        const hindiProj = hindiProjectMap[item.project_name] || "";
        const hindiBhk = hindiBhkMap[item.bhk_type] || "";
        const textToEmbed = `${item.project_name} ${hindiProj} ${item.bhk_type || ''} ${hindiBhk} ${item.category} ${item.content}`;
        
        // Generate 384-d normalized vector embedding
        const output = await embedder(textToEmbed, { pooling: 'mean', normalize: true });
        const embeddingArray = Array.from(output.data);

        rowsToInsert.push({
            project_name: item.project_name,
            bhk_type: item.bhk_type,
            category: item.category,
            content: item.content,
            metadata: item.metadata,
            embedding: embeddingArray
        });

        console.log(`  [${i + 1}/${PROPERTY_CHUNKS.length}] Vectorized: ${item.project_name} (${item.bhk_type || item.category}) - ${embeddingArray.length} dimensions`);
    }

    console.log("\n4. Clearing previous documents and inserting fresh vectorized knowledge base...");

    // Clear existing docs
    const { error: deleteError } = await supabase.from('property_documents').delete().neq('id', 0);
    if (deleteError) {
        console.warn("Notice during delete (table might be empty):", deleteError.message);
    }

    // Insert rows in batches of 10
    const batchSize = 10;
    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        const batch = rowsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase.from('property_documents').insert(batch);
        if (insertError) {
            console.error("❌ Insertion error:", insertError.message);
            throw insertError;
        }
        console.log(`  ✓ Inserted batch ${i + 1} - ${Math.min(i + batchSize, rowsToInsert.length)} / ${rowsToInsert.length}`);
    }

    console.log("\n=================================================");
    console.log("🎉 SUCCESS! All 7 Projects successfully vectorized and saved in Supabase Vector Database.");
    console.log("=================================================\n");
}

generateEmbeddingsAndSeed().catch(err => {
    console.error("Fatal Error during seeding:", err);
    process.exit(1);
});
