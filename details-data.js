/*
  ============================================================
  PROPERTY DATA - You can easily edit this file to update content.
  
  FORMAT for each project:
    "project name" â†’ contains BHK options
      Each BHK option has:
        - flatPhotos: array of image URLs (6-8 photos)
        - flatVideos: array of video URLs (3-4 videos)
        - size: flat size string
        - price: price string
        - societyDescription: one-line society description
        - societyPhotos: array of image URLs
        - societyVideos: array of video URLs
        - connectivity: array of { icon, title, distance }
        - strengths: array of { icon, title, description }
  ============================================================
*/

const PROPERTY_DATA = {

    "Mantra Happy Homes": {
        "2BHK": {
            flatPhotos: [
            ],
            flatVideos: [
                "https://youtu.be/eGnJ-8d_vRQ",
                "https://youtube.com/shorts/2oPeM09RYa0?feature=share"
            ],
            size: "810 sq.ft",
            price: "₹27 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            googleReviews: "4.4/5 (550+ Google Reviews)",
            deliveredYear: "2018",
            rera: "UKREP10170000059",
            description: "Mantra Happy Homes is a modern nature-focused residential gated society offering 2 BHK flats with premium amenities opposite Raja Biscuit Chowk.",
            photos: [
                "images/mantra happy homes.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_4q6c1d4q6c1d4q6c (1).jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_7okrpg7okrpg7okr.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_mvj84cmvj84cmvj8.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_n1ztahn1ztahn1zt.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_pfvetkpfvetkpfve.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_s7zp27s7zp27s7zp.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_sfckj9sfckj9sfck.jpg",
                "mantra happy homes's society images and videos/watermark-removed-Gemini_Generated_Image_vs6hfmvs6hfmvs6h.jpg",
                "mantra happy homes's society images and videos/watermark-removed-watermark-removed-Gemini_Generated_Image_xlni6uxlni6uxlni.jpg"
            ],
            videos: [
                "https://youtube.com/shorts/zCpAppKWXN0?feature=share"
            ],
            connectivity: [
                { icon: "fa-place-of-worship", title: "Har Ki Pauri", distance: "25-30 Min Drive" },
                { icon: "fa-train", title: "Haridwar bus/railway station", distance: "20-25 Min Drive" },
                { icon: "fa-road", title: "NH- 58 Highway", distance: "5 Min Drive" },
                { icon: "fa-hospital", title: "Hospital", distance: "2-3 Min Drive" },
                { icon: "fa-cart-shopping", title: "Mall", distance: "2-3 Min Drive" },
                { icon: "fa-school", title: "School / College", distance: "5 Min Drive" },
                { icon: "fa-city", title: "Shivalik nagar", distance: "6-8 Min Drive" },
                { icon: "fa-gas-pump", title: "Petrol pump", distance: "2 Min Drive" },
                { icon: "fa-plane", title: "Jolly grand airport", distance: "55-60 Min Drive" },
                { icon: "fa-location-dot", title: "Dehradun", distance: "1 hr 15 min Drive" }
            ],
            strengths: [
                { icon: "fa-shield-halved", title: "Safe & Secure", desc: "Gated society with modern security." },
                { icon: "fa-place-of-worship", title: "Spiritual Location", desc: "Close to major temples and ghats." },
                { icon: "fa-tree", title: "Peaceful Environment", desc: "Calm and serene surroundings." },
                { icon: "fa-bolt", title: "Modern Amenities", desc: "All modern facilities available." }
            ]
        }
    },

    "Haridwar Greens": {
        "1BHK": {
            flatPhotos: [
                "1 BHK flat images haridwar greens/photo1.jpg",
                "1 BHK flat images haridwar greens/photo2.jpg"
            ],
            flatVideos: [
                "1 BHK flat images haridwar greens/video1.mp4"
            ],
            size: "485 sq.ft",
            price: "₹16 Lakh*",
            carpet: "367 sq.ft",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "2BHK": {
            flatPhotos: [
                "2 BHK flat images haridwar greens/IMG-20260714-WA0050.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0051.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0052.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0053.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0054.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0055.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0057.jpg",
                "2 BHK flat images haridwar greens/IMG-20260714-WA0058.jpg"
            ],
            flatVideos: [
                "2 BHK flat images haridwar greens/VID-20260714-WA0048.mp4",
                "2 BHK flat images haridwar greens/2 Bhk Apartment For Sale in Haridwar.#antriksh #nri #city 9897588881 - Investors Forum Realty (720p, h264).mp4"
            ],
            size: "1075 sq.ft",
            price: "₹38 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "3BHK": {
            flatPhotos: [
            ],
            flatVideos: [
                "https://youtube.com/shorts/_Ge5eT4V_m8?feature=share",
                "https://youtube.com/shorts/tl0zx1xgF20?feature=share"
            ],
            size: "1410 sq.ft",
            price: "₹50 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        // Society-level data (shared across all BHKs)
        society: {
            googleReviews: "4.2/5 (500+ Google Reviews)",
            deliveredYear: "2017",
            rera: "UKREP01190000211",
            description: "Haridwar Greens is a premium gated society with lush greenery, modern amenities, and a peaceful environment perfect for families.",
            photos: [
                "images/haridwar greens.jpg",
                "haridwar green's society photos and videos/haridwar greens.webp",
                "haridwar green's society photos and videos/image (1).webp",
                "haridwar green's society photos and videos/image (2).avif",
                "haridwar green's society photos and videos/image (2).webp",
                "haridwar green's society photos and videos/image (3).avif",
                "haridwar green's society photos and videos/image (3).webp",
                "haridwar green's society photos and videos/image (4).webp",
                "haridwar green's society photos and videos/image.avif",
                "haridwar green's society photos and videos/image.webp",
                "haridwar green's society photos and videos/unnamed (1).webp",
                "haridwar green's society photos and videos/unnamed (2).webp",
                "haridwar green's society photos and videos/unnamed (3).webp",
                "haridwar green's society photos and videos/unnamed (4).webp",
                "haridwar green's society photos and videos/unnamed (5).webp",
                "haridwar green's society photos and videos/unnamed (6).webp",
                "haridwar green's society photos and videos/unnamed (7).webp",
                "haridwar green's society photos and videos/unnamed (8).webp",
                "haridwar green's society photos and videos/unnamed.webp"
            ],
            videos: [
                "https://youtu.be/Hu6Xxf1VS8o",
                "https://youtu.be/ch3UQNx3vKM"
            ],
            connectivity: [
                { icon: "fa-place-of-worship", title: "Har Ki Pauri", distance: "35-40 Min Drive" },
                { icon: "fa-train", title: "Haridwar bus/railway station", distance: "30-35 Min Drive" },
                { icon: "fa-road", title: "NH- 58 Highway", distance: "15-20 Min Drive" },
                { icon: "fa-hospital", title: "Hospital", distance: "5-7 Min Drive" },
                { icon: "fa-cart-shopping", title: "Mall", distance: "12-15 Min Drive" },
                { icon: "fa-school", title: "School / College", distance: "2-3 Min Drive" },
                { icon: "fa-city", title: "Shivalik nagar", distance: "15 Min Drive" },
                { icon: "fa-gas-pump", title: "Petrol pump", distance: "1 Min Drive" },
                { icon: "fa-plane", title: "Jolly grand airport", distance: "1 hr Drive" },
                { icon: "fa-location-dot", title: "Dehradun", distance: "1 hr 20 min Drive" }
            ],
            strengths: [
                { icon: "fa-shield-halved", title: "24x7 Security", desc: "Gated community with CCTV and security guards." },
                { icon: "fa-tree", title: "Green Environment", desc: "Landscaped gardens and parks inside the society." },
                { icon: "fa-car", title: "Ample Parking", desc: "Dedicated parking space for every flat." },
                { icon: "fa-bolt", title: "Power Backup", desc: "24x7 power backup for common areas and lifts." },
                { icon: "fa-water", title: "Water Supply", desc: "24-hour water supply with borewell & municipal connection." },
                { icon: "fa-dumbbell", title: "Club & Gym", desc: "Modern clubhouse, gym, and swimming pool." }
            ]
        }
    },

    "Deep Ganga": {
        "1BHK": {
            flatPhotos: [
],
            flatVideos: [
],
            size: "740 sq.ft",
            price: "₹27 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "2BHK": {
            flatPhotos: [
],
            flatVideos: [
],
            size: "1180 sq.ft",
            price: "₹38 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "3BHK": {
            flatPhotos: [
],
            flatVideos: [
],
            size: "1478 sq.ft",
            price: "₹55 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            googleReviews: "4.0/5 (400+ Google Reviews)",
            deliveredYear: "2015",
            rera: "UKREP12170000139",
            description: "Deep Ganga is a residential gated township with in-house shopping mall and peaceful surroundings located in Sector 5-A, SIDCUL Haridwar.",
            photos: [
                "images/deep ganga.webp",
                "deep ganga's society's images and videos/58502527_15_PropertyImage917-9854757168027_470_1080.jpg",
                "deep ganga's society's images and videos/58502527_4_PropertyImage961-7355192958449_470_1080.jpg",
                "deep ganga's society's images and videos/58502527_5_PropertyImage604-3409554724503_470_1080.jpg",
                "deep ganga's society's images and videos/projGal-3-770x400.jpg",
                "deep ganga's society's images and videos/projGal-7.jpg",
                "deep ganga's society's images and videos/unnamed (1).webp",
                "deep ganga's society's images and videos/unnamed (2).webp",
                "deep ganga's society's images and videos/unnamed (3).webp",
                "deep ganga's society's images and videos/unnamed (4).webp",
                "deep ganga's society's images and videos/unnamed (5).webp",
                "deep ganga's society's images and videos/unnamed (6).webp",
                "deep ganga's society's images and videos/unnamed (7).webp",
                "deep ganga's society's images and videos/unnamed.webp"
            ],
            videos: [
],
            connectivity: [
                { icon: "fa-place-of-worship", title: "Har Ki Pauri", distance: "30-35 Min Drive" },
                { icon: "fa-train", title: "Haridwar bus/railway station", distance: "25-30 Min Drive" },
                { icon: "fa-road", title: "NH- 58 Highway", distance: "15-18 Min Drive" },
                { icon: "fa-hospital", title: "Hospital", distance: "2-3 Min Drive" },
                { icon: "fa-cart-shopping", title: "Mall", distance: "Walking Distance (2 Min)" },
                { icon: "fa-school", title: "School / College", distance: "4-5 Min Drive" },
                { icon: "fa-city", title: "Shivalik nagar", distance: "4-5 Min Drive" },
                { icon: "fa-gas-pump", title: "Petrol pump", distance: "1-2 Min Drive" },
                { icon: "fa-plane", title: "Jolly grand airport", distance: "1 hr Drive" },
                { icon: "fa-location-dot", title: "Dehradun", distance: "1 hr 20 min Drive" }
            ],
            strengths: [
                { icon: "fa-shield-halved", title: "24x7 Security", desc: "Gated community with CCTV and security guards." },
                { icon: "fa-water", title: "Ganga View", desc: "Beautiful views of the holy river Ganga from select flats." },
                { icon: "fa-car", title: "Ample Parking", desc: "Covered and open parking available." },
                { icon: "fa-bolt", title: "Power Backup", desc: "Full power backup for all units." },
                { icon: "fa-tree", title: "Green Spaces", desc: "Well-maintained gardens and walking trails." },
                { icon: "fa-children", title: "Kids Play Area", desc: "Dedicated play zone for children." }
            ]
        }
    },

    "Antriksh NRI City": {
        "2BHK": {
            flatPhotos: [
],
            flatVideos: [
                "https://youtube.com/shorts/AyMKw_3jOVg?feature=share"
],
            size: "915 sq.ft",
            price: "₹40 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "3BHK": {
            flatPhotos: [
],
            flatVideos: [
                "https://youtube.com/shorts/zaxsO6GiI8I?feature=share",
                "https://youtube.com/shorts/ipDCNKyHqIc?feature=share"
            ],
            size: "1315 sq.ft",
            price: "₹57 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            googleReviews: "4.0/5 (200+ Google Reviews)",
            deliveredYear: "2015",
            rera: "UKREP11170000108",
            description: "Antriksh NRI City is a premium township designed for NRI investors and families, offering international-standard living opposite Pentagon Mall Haridwar.",
            photos: [
                "images/antriksh nri city.jpg",
                "antriksh NRI city's society's images and videos/658322071O-1759996123386.jpg",
                "antriksh NRI city's society's images and videos/658322077O-1759996123335.jpg",
                "antriksh NRI city's society's images and videos/79023067_4_1745121088877-0042_470_1080.jpg",
                "antriksh NRI city's society's images and videos/antriksh.jpg",
                "antriksh NRI city's society's images and videos/od0wb987.jpg",
                "antriksh NRI city's society's images and videos/site_plan_nri_city.jpg"
            ],
            videos: [
                "https://youtube.com/shorts/d_QVCNHLNMo?feature=share"
            ],
            connectivity: [
                { icon: "fa-place-of-worship", title: "Har Ki Pauri", distance: "25-30 Min Drive" },
                { icon: "fa-train", title: "Haridwar bus/railway station", distance: "20-25 Min Drive" },
                { icon: "fa-road", title: "NH- 58 Highway", distance: "8-10 Min Drive" },
                { icon: "fa-hospital", title: "Hospital", distance: "4-5 Min Drive" },
                { icon: "fa-cart-shopping", title: "Mall", distance: "Walking Distance (1 Min)" },
                { icon: "fa-school", title: "School / College", distance: "2-3 Min Drive" },
                { icon: "fa-city", title: "Shivalik nagar", distance: "Walking Distance (2 Min)" },
                { icon: "fa-gas-pump", title: "Petrol pump", distance: "2 Min Drive" },
                { icon: "fa-plane", title: "Jolly grand airport", distance: "55-60 Min Drive" },
                { icon: "fa-location-dot", title: "Dehradun", distance: "1 hr 15 min Drive" }
            ],
            strengths: [
                { icon: "fa-shield-halved", title: "Gated Township", desc: "Premium security with multi-tier access control." },
                { icon: "fa-dumbbell", title: "Clubhouse & Gym", desc: "World-class clubhouse with gym and pool." },
                { icon: "fa-tree", title: "70% Open Area", desc: "Massive green open spaces and jogging tracks." },
                { icon: "fa-bolt", title: "Smart Homes", desc: "Smart home features with power backup." },
                { icon: "fa-car", title: "Multi-level Parking", desc: "Covered multi-level parking facility." },
                { icon: "fa-fire-extinguisher", title: "Fire Safety", desc: "Complete fire safety systems in every tower." }
            ]
        }
    },

    "Jurs Country": {
        "2BHK": {
            flatPhotos: [
                "jurs country's 2 BHK images and videos/6ehduir3_optOrig.jpg",
                "jurs country's 2 BHK images and videos/7tm3c6tn_optOrig.jpg",
                "jurs country's 2 BHK images and videos/jib9vl7m_optOrig.jpg",
                "jurs country's 2 BHK images and videos/tr389z8a_optOrig.jpg"
            ],
            flatVideos: [
                "jurs country's 2 BHK images and videos/2 Bhk Semi Furnished Apartment For Sale in Jurs Country Jwalapur Haridwar 9897588881. - Investors Forum Realty (360p, h264).mp4"
            ],
            size: "880 sq.ft",
            price: "₹45 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "3BHK": {
            flatPhotos: [
                "jurs country's 3 BHK images and videos/6ehduir3_optOrig.jpg",
                "jurs country's 3 BHK images and videos/7tm3c6tn_optOrig.jpg",
                "jurs country's 3 BHK images and videos/jib9vl7m_optOrig.jpg",
                "jurs country's 3 BHK images and videos/tr389z8a_optOrig.jpg"
            ],
            flatVideos: [
                "https://youtube.com/shorts/g3th1bt-au0?feature=share"
            ],
            size: "1210 sq.ft",
            price: "₹60 Lakh*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "4BHK": {
            flatPhotos: [
                "jurs country's 4 BHK images and videos/6ehduir3_optOrig.jpg",
                "jurs country's 4 BHK images and videos/7tm3c6tn_optOrig.jpg",
                "jurs country's 4 BHK images and videos/jib9vl7m_optOrig.jpg",
                "jurs country's 4 BHK images and videos/tr389z8a_optOrig.jpg"
            ],
            flatVideos: [
],
            size: "2296 sq.ft",
            price: "₹1.25 Cr*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        "5BHK": {
            flatPhotos: [
                "jurs country's 5 BHK images and videos/6ehduir3_optOrig.jpg",
                "jurs country's 5 BHK images and videos/7tm3c6tn_optOrig.jpg",
                "jurs country's 5 BHK images and videos/jib9vl7m_optOrig.jpg",
                "jurs country's 5 BHK images and videos/tr389z8a_optOrig.jpg"
            ],
            flatVideos: [
],
            size: "2575 sq.ft",
            price: "₹1.35 Cr*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            googleReviews: "4.1/5 (300+ Google Reviews)",
            deliveredYear: "2014",
            rera: "UKREP09170000025",
            description: "Jurs Country is a sprawling 35-acre residential township offering luxury living, Wisdom Global School, and world-class amenities amidst nature.",
            photos: [
                "images/jurs country.jpg",
                "jurs country's society's images and videos/1a4vnlk_1715597149_491757412_optOrig.jpg",
                "jurs country's society's images and videos/1belcqz_1715597150_491757420_optOrig.jpg",
                "jurs country's society's images and videos/4bc06fo_1715597148_491757402_optOrig.jpg",
                "jurs country's society's images and videos/7ksptwi_1715597147_491757394_optOrig.jpg",
                "jurs country's society's images and videos/8tuvsk8_1715597148_491757406_sm.jpg",
                "jurs country's society's images and videos/azwoitj_1715597574_491759358_optOrig.jpg",
                "jurs country's society's images and videos/bmvqev7_1715597148_491757400_optOrig.jpg",
                "jurs country's society's images and videos/gyihvezl.jpg",
                "jurs country's society's images and videos/jdlg0ha_1715597149_491757414_sm.jpg",
                "jurs country's society's images and videos/la6332d_1715597148_491757408_optOrig.jpg",
                "jurs country's society's images and videos/lxcjc2o_1715597149_491757418_optOrig.jpg",
                "jurs country's society's images and videos/mni7zzu_1715597147_491757392_sm.jpg",
                "jurs country's society's images and videos/unnamed.jpg",
                "jurs country's society's images and videos/yaupnns_1715597149_491757416_sm.jpg"
            ],
            videos: [
                "jurs country's society's images and videos/Jurs Country Jwalapur, Haridwar - MBTV by Magicbricks (720p, h264).mp4"
            ],
            connectivity: [
                { icon: "fa-place-of-worship", title: "Har Ki Pauri", distance: "15-18 Min Drive" },
                { icon: "fa-train", title: "Haridwar bus/railway station", distance: "12-15 Min Drive" },
                { icon: "fa-road", title: "NH- 58 Highway", distance: "On Highway (0 Min)" },
                { icon: "fa-hospital", title: "Hospital", distance: "2-3 Min Drive" },
                { icon: "fa-cart-shopping", title: "Mall", distance: "5-6 Min Drive" },
                { icon: "fa-school", title: "School / College", distance: "Inside Campus (Wisdom Global)" },
                { icon: "fa-city", title: "Shivalik nagar", distance: "5-6 Min Drive" },
                { icon: "fa-gas-pump", title: "Petrol pump", distance: "Next Door (1 Min)" },
                { icon: "fa-plane", title: "Jolly grand airport", distance: "50 Min Drive" },
                { icon: "fa-location-dot", title: "Dehradun", distance: "1 hr 10 min Drive" }
            ],
            strengths: [
                { icon: "fa-shield-halved", title: "Premium Township", desc: "Fully gated township with round-the-clock security." },
                { icon: "fa-swimming-pool", title: "Swimming Pool", desc: "Olympic-size swimming pool and kids pool." },
                { icon: "fa-tree", title: "Nature Living", desc: "Surrounded by natural greenery and hills." },
                { icon: "fa-bolt", title: "Power Backup", desc: "Full power backup with inverter support." },
                { icon: "fa-car", title: "Wide Roads", desc: "60-ft wide internal roads with streetlights." },
                { icon: "fa-basketball", title: "Sports Facilities", desc: "Tennis court, basketball court, and jogging track." }
            ]
        }
    },

    "Homeland": {
        isPlot: true,
        "Details": {
            flatPhotos: [],
            flatVideos: [],
            size: "852 to 2218 sq.ft (66 Plots)",
            price: "₹3500/sq.ft*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            deliveredYear: "Under Construction",
            rera: "UKREP11250000688",
            description: "My Home Land is an HRDA & RERA approved hill-view residential plotted project near Denso Chowk, SIDCUL Haridwar.",
            photos: [
                "home land's society images and videos/Screenshot 2026-07-24 130540.png",
                "home land's society images and videos/Screenshot 2026-07-24 130700.png",
                "home land's society images and videos/Screenshot 2026-07-24 130723.png",
                "home land's society images and videos/Screenshot 2026-07-24 130942.png"
            ],
            videos: [],
            connectivity: [
                { icon: "fa-train", title: "Railway Station", distance: "12-15 Min Drive" },
                { icon: "fa-road", title: "Main Road", distance: "2 Min Drive" },
                { icon: "fa-hospital", title: "Hospital", distance: "5-7 Min Drive" },
                { icon: "fa-school", title: "Schools", distance: "4-5 Min Drive" }
            ],
            strengths: [
                { icon: "fa-shield-halved", title: "Secure Community", desc: "24x7 gated security with CCTV coverage." },
                { icon: "fa-tree", title: "Green Living", desc: "Beautiful landscaped gardens." },
                { icon: "fa-bolt", title: "Power Backup", desc: "Uninterrupted power supply." },
                { icon: "fa-water", title: "Water Supply", desc: "24-hour water availability." }
            ]
        }
    },


    "Independent Home": {
        "Details": {
            flatPhotos: [
                "flat images/IMG-20260714-WA0050.jpg",
                "flat images/IMG-20260714-WA0051.jpg",
                "flat images/IMG-20260714-WA0052.jpg",
                "flat images/IMG-20260714-WA0053.jpg",
                "flat images/IMG-20260714-WA0054.jpg",
                "flat images/IMG-20260714-WA0055.jpg",
                "flat images/IMG-20260714-WA0057.jpg",
                "flat images/IMG-20260714-WA0058.jpg"
            ],
            flatVideos: [
                "flat video/VID-20260714-WA0048.mp4",
                "flat video/VID-20260714-WA0049.mp4"
            ],
            size: "Various Sizes Available",
            price: "Contact for Price",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            description: "Premium independent homes available in prime locations across Haridwar. Build your dream home with complete freedom and privacy.",
            photos: [
                "society images/haridwar greens.webp",
                "society images/image (1).avif",
                "society images/image (1).webp",
                "society images/image (2).avif",
                "society images/image (2).webp",
                "society images/image (3).avif",
                "society images/image (3).webp",
                "society images/image (4).webp",
                "society images/image.avif",
                "society images/image.webp",
                "society images/unnamed (1).webp",
                "society images/unnamed (2).webp",
                "society images/unnamed (3).webp",
                "society images/unnamed (4).webp",
                "society images/unnamed (5).webp",
                "society images/unnamed (6).webp",
                "society images/unnamed (7).webp",
                "society images/unnamed (8).webp",
                "society images/unnamed.webp"
            ],
            videos: [
                "society video/lv_0_20260715104532.mp4",
                "society video/lv_0_20260715111549.mp4"
            ],
            connectivity: [
                { icon: "fa-road", title: "Main Road Access", distance: "Varies" },
                { icon: "fa-hospital", title: "Nearby Hospital", distance: "Varies" },
                { icon: "fa-school", title: "Schools", distance: "Varies" }
            ],
            strengths: [
                { icon: "fa-house", title: "Full Ownership", desc: "Complete ownership of land and building." },
                { icon: "fa-maximize", title: "Customizable", desc: "Design and build as per your wish." },
                { icon: "fa-tree", title: "Private Garden", desc: "Your own private garden space." },
                { icon: "fa-car", title: "Private Parking", desc: "Dedicated parking within your premises." }
            ]
        }
    },

    "Land": {
        "Details": {
            flatPhotos: [
                "flat images/IMG-20260714-WA0050.jpg",
                "flat images/IMG-20260714-WA0051.jpg",
                "flat images/IMG-20260714-WA0052.jpg",
                "flat images/IMG-20260714-WA0053.jpg",
                "flat images/IMG-20260714-WA0054.jpg",
                "flat images/IMG-20260714-WA0055.jpg",
                "flat images/IMG-20260714-WA0057.jpg",
                "flat images/IMG-20260714-WA0058.jpg"
            ],
            flatVideos: [
                "flat video/VID-20260714-WA0048.mp4",
                "flat video/VID-20260714-WA0049.mp4"
            ],
            size: "Various Plot Sizes",
            price: "Contact for Price",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            description: "Prime land and plots available in and around Haridwar for residential and investment purposes. Excellent growth potential.",
            photos: [
                "society images/haridwar greens.webp",
                "society images/image (1).avif",
                "society images/image (1).webp",
                "society images/image (2).avif",
                "society images/image (2).webp",
                "society images/image (3).avif",
                "society images/image (3).webp",
                "society images/image (4).webp",
                "society images/image.avif",
                "society images/image.webp",
                "society images/unnamed (1).webp",
                "society images/unnamed (2).webp",
                "society images/unnamed (3).webp",
                "society images/unnamed (4).webp",
                "society images/unnamed (5).webp",
                "society images/unnamed (6).webp",
                "society images/unnamed (7).webp",
                "society images/unnamed (8).webp",
                "society images/unnamed.webp"
            ],
            videos: [
                "society video/lv_0_20260715104532.mp4",
                "society video/lv_0_20260715111549.mp4"
            ],
            connectivity: [
                { icon: "fa-road", title: "Road Connectivity", distance: "On Main Road" },
                { icon: "fa-bolt", title: "Electricity", distance: "Available" },
                { icon: "fa-water", title: "Water Supply", distance: "Available" }
            ],
            strengths: [
                { icon: "fa-chart-line", title: "High ROI", desc: "Excellent investment returns in Haridwar region." },
                { icon: "fa-file-contract", title: "Clear Title", desc: "All properties with clear legal titles." },
                { icon: "fa-maximize", title: "Flexible Sizes", desc: "Plots available from 100 sq.yd to 500 sq.yd." },
                { icon: "fa-road", title: "Developed Area", desc: "Located in well-developed residential areas." }
            ]
        }
    },

    "Shree Haridarshan": {
        isPlot: true,
        "Details": {
            flatPhotos: [],
            flatVideos: [],
            size: "Various Plot Sizes",
            price: "₹4500/sq.ft*",
            carpet: "Varies",
            facing: "Multiple Options",
            vastu: "Multiple Options"
        },
        society: {
            deliveredYear: "Under Construction",
            rera: "UKREP10230000522",
            description: "Shree Hari Darshan City by Vedanta Buildcon offers RERA approved residential plots near Patanjali Yogpeeth Haridwar.",
            photos: [
                "shree haridarshan's images and videos/Screenshot 2026-07-24 125554.png",
                "shree haridarshan's images and videos/Screenshot 2026-07-24 125628.png",
                "shree haridarshan's images and videos/Screenshot 2026-07-24 125650.png",
                "shree haridarshan's images and videos/Screenshot 2026-07-24 125924.png",
                "shree haridarshan's images and videos/Screenshot 2026-07-24 125945.png",
                "shree haridarshan's images and videos/Screenshot 2026-07-24 130007.png"
            ],
            videos: [],
            connectivity: [
                { icon: "fa-road", title: "Road Connectivity", distance: "On Main Road" },
                { icon: "fa-bolt", title: "Electricity", distance: "Available" }
            ],
            strengths: [
                { icon: "fa-chart-line", title: "High ROI", desc: "Excellent investment returns." },
                { icon: "fa-file-contract", title: "Clear Title", desc: "All properties with clear legal titles." }
            ]
        }
    }
};

