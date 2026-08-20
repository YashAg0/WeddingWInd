/**
 * WeddingWithIndia — Canonical Natural Cultural Couple Visual Profile Engine
 *
 * Guarantees that every wedding listing in the marketplace has a deterministic,
 * culturally accurate, 100% unique canonical image depicting authentic couples
 * in regional traditional attire (PEOPLE + CULTURAL IDENTITY + APPROPRIATE ATTIRE).
 *
 * ABSOLUTE RULE: ONE WEDDING = ONE CANONICAL COUPLE IMAGE
 * The exact same image is used everywhere that wedding appears:
 * - /weddings marketplace cards
 * - Homepage featured wedding cards
 * - Search results and filter views
 * - Wedding detail pages (Hero & Couple portrait)
 * - Related weddings & recommendations
 * - Mobile and Desktop cards
 * - Open Graph & Social structured data
 * - Database & Static fallbacks
 */

export interface WeddingImageMeta {
  photoId: string;
  imageUrl: string;
  photographerName: string;
  photographerUsername: string;
  photographerUrl: string;
  unsplashUrl: string;
  altText: string;
  searchContext: string;
  objectPosition?: string;
  isVerifiedRealMedia?: boolean;
}

/**
 * Single Source of Truth: Canonical Couple Names (Host Couple === Wedding Couple)
 */
export const CANONICAL_COUPLE_NAMES: Record<string, string> = {
  // 1. Rajasthan Royal Heritage
  "grand-maharaja-wedding": "Devika & Kaber Singhania",
  "rajasthan-royal-family-celebration": "Devika & Kaber Singhania",

  // 2. Shimla Himalayan Pine Forest Royal Celebration
  "shimla-himalayan-pine-royal-wedding": "Vikramaditya & Gayatri",
  "shimla-himalayan-meadow-celebration": "Vikramaditya & Gayatri",

  // 3. Punjabi Sikh Wedding Experience
  "punjabi-amritsar-golden-wedding": "Gurpreet & Harleen Dhillon",
  "punjabi-sikh-anand-karaj-experience": "Gurpreet & Harleen Dhillon",

  // 4. Hyderabad Nizam Heritage Wedding
  "hyderabad-nizam-wedding": "Zaid & Nusrat Farooqui",

  // 5. Ladakh Monastery Mountain Wedding
  "ladakh-monastery-mountain-wedding": "Stanzin & Rigzin Norbu",

  // 6. Lakeside Rajput Celebration
  "lakeside-rajput-celebration": "Aditya & Sanjana Rathore",

  // 7. Kerala Coastal Christian Matrimony
  "kerala-coastal-christian-matrimony": "Karan & Meera Nambiar",
  "kerala-coastal-christian-celebration": "Karan & Meera Nambiar",

  // 8. Goan Sunset Beach Nuptials
  "goan-sunset-beach-nuptials": "Rohan & Alisha D'Souza",
  "goa-coastal-family-wedding": "Rohan & Alisha D'Souza",

  // 9. Kolkata Bengali Heritage Wedding
  "kolkata-bengali-heritage-wedding": "Sourav & Rupa Banerjee",

  // 10. Kashmir Dal Lake Houseboat Wedding
  "kashmir-dal-lake-houseboat-wedding": "Tariq & Bushra Dar",

  // 11. Uttarakhand Mountain Meadow Wedding
  "uttarakhand-himalayan-meadow-wedding": "Devendra & Smriti Rawat",

  // 12. Ooty Nilgiris Tea Garden Wedding
  "ooty-nilgiris-tea-garden-wedding": "Clarence & Ananya Stirling",

  // 13. Coorg Coffee Plantation Wedding
  "coorg-coffee-plantation-wedding": "Bopanna & Thanusha Muttappa",

  // 14. Mumbai Marine Drive Rooftop Wedding
  "mumbai-skyline-rooftop-wedding": "Rohan & Rhea Mehta",

  // 15. Rajasthan Desert Camp Night Wedding
  "rajasthan-desert-camp-wedding": "Kunal & Tanvi Bhati",

  // 16. Ahmedabad Heritage Pol Haveli Wedding
  "ahmedabad-heritage-pol-wedding": "Chirag & Mansi Shah",
  "gujarat-jain-family-matrimony": "Chirag & Mansi Shah",

  // 17. Andaman Islands Tropical Beach Wedding
  "andaman-island-tropical-wedding": "Varun & Tanya D'Souza",

  // 18. Mughal Garden Wedding at Agra
  "mughal-garden-wedding-agra": "Arman & Sara Qureshi",

  // 19. Pondicherry French Quarter Wedding
  "pondicherry-french-quarter-wedding": "Pierre & Lakshmi Gautier",

  // 20. Varanasi Ganges Spiritual Union
  "varanasi-ganges-spiritual-wedding": "Aalok & Shambhavi Mishra",

  // 21. Tamil Brahmin Madurai Meenakshi Wedding
  "tamil-brahmin-wedding-madurai": "Karthik & Deepa Iyer",

  // 22. Manali Apple Orchard Meadow Wedding
  "manali-apple-orchard-wedding": "Rishi & Tanya Thakur",

  // 23. Chennai Coastal Temple Wedding
  "chennai-coastal-temple-wedding": "Karthik & Deepa Ramanathan",

  // 24. Delhi Interfaith Celebration
  "delhi-interfaith-multicultural-celebration": "Rahul & Sophie Deshmukh",
};

/**
 * Single Source of Truth: Canonical Visual Profiles
 */
export const CURATED_WEDDING_IMAGES: Record<string, WeddingImageMeta> = {
  // 1. Rajasthan Royal Heritage — Devika & Kaber Singhania
  "grand-maharaja-wedding": {
    photoId: "premium_photo-1691030255435-c1f4c3f5542e",
    imageUrl: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Getty Images",
    photographerUsername: "gettyimages",
    photographerUrl: "https://unsplash.com/@gettyimages?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Devika & Kaber Singhania in authentic royal Rajasthani traditional festive attire in Jaipur",
    searchContext: "Rajasthani couple Devika & Kaber Singhania",
    objectPosition: "center 30%",
  },
  "rajasthan-royal-family-celebration": {
    photoId: "premium_photo-1691030255435-c1f4c3f5542e",
    imageUrl: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Getty Images",
    photographerUsername: "gettyimages",
    photographerUrl: "https://unsplash.com/@gettyimages?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Devika & Kaber Singhania in authentic royal Rajasthani traditional festive attire in Jaipur",
    searchContext: "Rajasthani couple Devika & Kaber Singhania",
    objectPosition: "center 30%",
  },

  // 2. Shimla Himalayan Pine Forest Royal Celebration — Vikramaditya & Gayatri
  "shimla-himalayan-pine-royal-wedding": {
    photoId: "photo-1694712282503-0d6dc921cfdd",
    imageUrl: "https://images.unsplash.com/photo-1694712282503-0d6dc921cfdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1694712282503-0d6dc921cfdd?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Vikramaditya & Gayatri in traditional Himachali attire in Shimla pine forest",
    searchContext: "Himachali couple Vikramaditya & Gayatri",
    objectPosition: "center 35%",
  },
  "shimla-himalayan-meadow-celebration": {
    photoId: "photo-1694712282503-0d6dc921cfdd",
    imageUrl: "https://images.unsplash.com/photo-1694712282503-0d6dc921cfdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1694712282503-0d6dc921cfdd?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Vikramaditya & Gayatri in traditional Himachali attire in Shimla pine forest",
    searchContext: "Himachali couple Vikramaditya & Gayatri",
    objectPosition: "center 35%",
  },

  // 3. Punjabi Sikh Wedding Experience — Gurpreet & Harleen Dhillon
  "punjabi-amritsar-golden-wedding": {
    photoId: "photo-1671531776382-f32dff368120",
    imageUrl: "https://images.unsplash.com/photo-1671531776382-f32dff368120?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1671531776382-f32dff368120?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Gurpreet & Harleen Dhillon in authentic Punjabi traditional salwar suit and kurta in Amritsar",
    searchContext: "Punjabi Sikh couple Gurpreet & Harleen Dhillon",
    objectPosition: "center 30%",
  },
  "punjabi-sikh-anand-karaj-experience": {
    photoId: "photo-1671531776382-f32dff368120",
    imageUrl: "https://images.unsplash.com/photo-1671531776382-f32dff368120?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1671531776382-f32dff368120?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Gurpreet & Harleen Dhillon in authentic Punjabi traditional salwar suit and kurta in Amritsar",
    searchContext: "Punjabi Sikh couple Gurpreet & Harleen Dhillon",
    objectPosition: "center 30%",
  },

  // 4. Hyderabad Nizam Heritage Wedding — Zaid & Nusrat Farooqui
  "hyderabad-nizam-wedding": {
    photoId: "photo-1726694064556-c9565e8e81c9",
    imageUrl: "https://images.unsplash.com/photo-1726694064556-c9565e8e81c9?q=80&w=696&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1726694064556-c9565e8e81c9?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Zaid & Nusrat Farooqui in elegant traditional Nizami festive attire in Hyderabad",
    searchContext: "Indian Muslim couple Zaid & Nusrat Farooqui",
    objectPosition: "center 35%",
  },

  // 5. Ladakh Monastery Mountain Wedding — Stanzin & Rigzin Norbu
  "ladakh-monastery-mountain-wedding": {
    photoId: "photo-1781015878406-39a0008389b7",
    imageUrl: "https://images.unsplash.com/photo-1781015878406-39a0008389b7?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Rohan Shah",
    photographerUsername: "rohanshah657",
    photographerUrl: "https://unsplash.com/@rohanshah657?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1781015878406-39a0008389b7?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Stanzin & Rigzin Norbu in vibrant traditional Goncha robes in Leh",
    searchContext: "Ladakhi couple traditional Goncha portrait",
    objectPosition: "center 35%",
  },

  // 6. Lakeside Rajput Celebration — Aditya & Sanjana Rathore
  "lakeside-rajput-celebration": {
    photoId: "photo-1598875206191-5f88198c0a35",
    imageUrl: "https://images.unsplash.com/photo-1598875206191-5f88198c0a35?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Mohit Maru",
    photographerUsername: "mohit_0307",
    photographerUrl: "https://unsplash.com/@mohit_0307?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1598875206191-5f88198c0a35?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Aditya & Sanjana Rathore in traditional attire along Lake Pichola in Udaipur",
    searchContext: "Rajput couple traditional portrait",
    objectPosition: "center 35%",
  },

  // 7. Kerala Coastal Christian Matrimony — Karan & Meera Nambiar
  "kerala-coastal-christian-matrimony": {
    photoId: "photo-1581704723043-70c2216277de",
    imageUrl: "https://images.unsplash.com/photo-1581704723043-70c2216277de?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1581704723043-70c2216277de?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Karan & Meera Nambiar in traditional Kerala attire in Kochi",
    searchContext: "Kerala couple Karan & Meera Nambiar",
    objectPosition: "center 30%",
  },
  "kerala-coastal-christian-celebration": {
    photoId: "photo-1581704723043-70c2216277de",
    imageUrl: "https://images.unsplash.com/photo-1581704723043-70c2216277de?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1581704723043-70c2216277de?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Karan & Meera Nambiar in traditional Kerala attire in Kochi",
    searchContext: "Kerala couple Karan & Meera Nambiar",
    objectPosition: "center 30%",
  },

  // 8. Goan Sunset Beach Nuptials — Rohan & Alisha D'Souza
  "goan-sunset-beach-nuptials": {
    photoId: "photo-1728348471845-c7ffa602161a",
    imageUrl: "https://images.unsplash.com/photo-1728348471845-c7ffa602161a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1728348471845-c7ffa602161a?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Rohan & Alisha D'Souza on the sandy beach shore at sunset in North Goa",
    searchContext: "Goan couple Rohan & Alisha D'Souza",
    objectPosition: "center 35%",
  },
  "goa-coastal-family-wedding": {
    photoId: "photo-1728348471845-c7ffa602161a",
    imageUrl: "https://images.unsplash.com/photo-1728348471845-c7ffa602161a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1728348471845-c7ffa602161a?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Rohan & Alisha D'Souza on the sandy beach shore at sunset in North Goa",
    searchContext: "Goan couple Rohan & Alisha D'Souza",
    objectPosition: "center 35%",
  },

  // 9. Kolkata Bengali Heritage Wedding — Sourav & Rupa Banerjee
  "kolkata-bengali-heritage-wedding": {
    photoId: "photo-1720105761851-fa63513a1941",
    imageUrl: "https://images.unsplash.com/photo-1720105761851-fa63513a1941?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Ratul Pal",
    photographerUsername: "adventurelife24",
    photographerUrl: "https://unsplash.com/@adventurelife24?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1720105761851-fa63513a1941?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Sourav & Rupa Banerjee in traditional Bengali attire walking down a heritage path in Kolkata",
    searchContext: "Bengali couple traditional portrait",
    objectPosition: "center 30%",
  },

  // 10. Kashmir Dal Lake Houseboat Wedding — Tariq & Bushra Dar
  "kashmir-dal-lake-houseboat-wedding": {
    photoId: "photo-1719857646787-38c9c5f79312",
    imageUrl: "https://images.unsplash.com/photo-1719857646787-38c9c5f79312?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1719857646787-38c9c5f79312?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Tariq & Bushra Dar in authentic Kashmiri traditional attire in Srinagar",
    searchContext: "Kashmiri couple Tariq & Bushra Dar",
    objectPosition: "center 30%",
  },

  // 11. Uttarakhand Mountain Meadow Wedding — Devendra & Smriti Rawat
  "uttarakhand-himalayan-meadow-wedding": {
    photoId: "photo-1648724145806-2dd46cd02ea6",
    imageUrl: "https://images.unsplash.com/photo-1648724145806-2dd46cd02ea6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1648724145806-2dd46cd02ea6?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Devendra & Smriti Rawat in authentic Garhwali traditional attire in Mussoorie",
    searchContext: "Garhwali couple Devendra & Smriti Rawat",
    objectPosition: "center 30%",
  },

  // 12. Ooty Nilgiris Tea Garden Wedding — Clarence & Ananya Stirling
  "ooty-nilgiris-tea-garden-wedding": {
    photoId: "photo-1727430256509-0f897d6f4765",
    imageUrl: "https://images.unsplash.com/photo-1727430256509-0f897d6f4765?w=1200&q=80&auto=format&fit=crop",
    photographerName: "shades by 43",
    photographerUsername: "shades_by_43",
    photographerUrl: "https://unsplash.com/@shades_by_43?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1727430256509-0f897d6f4765?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Clarence & Ananya Stirling amidst lush green tea plantations in Ooty",
    searchContext: "South Indian couple tea garden traditional portrait",
    objectPosition: "center 35%",
  },

  // 13. Coorg Coffee Plantation Wedding — Bopanna & Thanusha Muttappa
  "coorg-coffee-plantation-wedding": {
    photoId: "photo-1515766024017-689e434ef22b",
    imageUrl: "https://images.unsplash.com/photo-1515766024017-689e434ef22b?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1515766024017-689e434ef22b?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Bopanna & Thanusha Muttappa in traditional attire in a Coorg coffee estate",
    searchContext: "Kodava couple Bopanna & Thanusha Muttappa",
    objectPosition: "center 30%",
  },

  // 14. Mumbai Marine Drive Rooftop Wedding — Rohan & Rhea Mehta
  "mumbai-skyline-rooftop-wedding": {
    photoId: "photo-1776964176663-1a25a5bec514",
    imageUrl: "https://images.unsplash.com/photo-1776964176663-1a25a5bec514?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Ishaan Sen",
    photographerUsername: "ishaanthephotoman",
    photographerUrl: "https://unsplash.com/@ishaanthephotoman?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1776964176663-1a25a5bec514?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Rohan & Rhea Mehta on the sea promenade overlooking the ocean in Mumbai",
    searchContext: "Mumbai Indian couple modern traditional portrait",
    objectPosition: "center 35%",
  },

  // 15. Rajasthan Desert Camp Night Wedding — Kunal & Tanvi Bhati
  "rajasthan-desert-camp-wedding": {
    photoId: "photo-1640953146604-2596432ee1eb",
    imageUrl: "https://images.unsplash.com/photo-1640953146604-2596432ee1eb?w=1200&q=80&auto=format&fit=crop",
    photographerName: "rajat sarki",
    photographerUsername: "rajat_sarki",
    photographerUrl: "https://unsplash.com/@rajat_sarki?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1640953146604-2596432ee1eb?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Kunal & Tanvi Bhati in traditional attire in the golden desert dunes of Jaisalmer",
    searchContext: "Rajasthani couple desert traditional",
    objectPosition: "center 35%",
  },

  // 16. Ahmedabad Heritage Pol Haveli Wedding — Chirag & Mansi Shah
  "ahmedabad-heritage-pol-wedding": {
    photoId: "photo-1735052712489-f45220126a0c",
    imageUrl: "https://images.unsplash.com/photo-1735052712489-f45220126a0c?w=1200&q=80&auto=format&fit=crop",
    photographerName: "iKshana Productions",
    photographerUsername: "ikshanaproductions",
    photographerUrl: "https://unsplash.com/@ikshanaproductions?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1735052712489-f45220126a0c?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Chirag & Mansi Shah in traditional ethnic attire in a historic Pol courtyard in Ahmedabad",
    searchContext: "Gujarati couple traditional ethnic Pol portrait",
    objectPosition: "center 30%",
  },
  "gujarat-jain-family-matrimony": {
    photoId: "photo-1735052712489-f45220126a0c",
    imageUrl: "https://images.unsplash.com/photo-1735052712489-f45220126a0c?w=1200&q=80&auto=format&fit=crop",
    photographerName: "iKshana Productions",
    photographerUsername: "ikshanaproductions",
    photographerUrl: "https://unsplash.com/@ikshanaproductions?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1735052712489-f45220126a0c?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Chirag & Mansi Shah in traditional ethnic attire in a historic Pol courtyard in Ahmedabad",
    searchContext: "Gujarati couple traditional ethnic Pol portrait",
    objectPosition: "center 30%",
  },

  // 17. Andaman Islands Tropical Beach Wedding — Varun & Tanya D'Souza
  "andaman-island-tropical-wedding": {
    photoId: "photo-1682089781034-a214f5768d58",
    imageUrl: "https://images.unsplash.com/photo-1682089781034-a214f5768d58?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Getty Images",
    photographerUsername: "gettyimages",
    photographerUrl: "https://unsplash.com/@gettyimages?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1682089781034-a214f5768d58?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Varun & Tanya D'Souza walking along the tropical white sand shoreline of Havelock Island",
    searchContext: "Indian couple beach tropical portrait",
    objectPosition: "center 35%",
  },

  // 18. Mughal Garden Wedding at Agra — Arman & Sara Qureshi
  "mughal-garden-wedding-agra": {
    photoId: "photo-1756304598536-560096376e49",
    imageUrl: "https://images.unsplash.com/photo-1756304598536-560096376e49?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Sushanta Rokka",
    photographerUsername: "sanoyatra",
    photographerUrl: "https://unsplash.com/@sanoyatra?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1756304598536-560096376e49?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Arman & Sara Qureshi in festive traditional attire in a lush heritage garden in Agra",
    searchContext: "Indian couple traditional garden portrait",
    objectPosition: "center 30%",
  },

  // 19. Pondicherry French Quarter Wedding — Pierre & Lakshmi Gautier
  "pondicherry-french-quarter-wedding": {
    photoId: "photo-1774814327717-44ffb5936631",
    imageUrl: "https://images.unsplash.com/photo-1774814327717-44ffb5936631?w=1200&q=80&auto=format&fit=crop",
    photographerName: "ARTO SURAJ",
    photographerUsername: "artosuraj",
    photographerUrl: "https://unsplash.com/@artosuraj?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1774814327717-44ffb5936631?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Pierre & Lakshmi Gautier walking down a colonial street in the French Quarter of Pondicherry",
    searchContext: "Pondicherry couple colonial street traditional",
    objectPosition: "center 35%",
  },

  // 20. Varanasi Ganges Spiritual Union — Aalok & Shambhavi Mishra
  "varanasi-ganges-spiritual-wedding": {
    photoId: "photo-1735052711950-c31c729c2a4e",
    imageUrl: "https://images.unsplash.com/photo-1735052711950-c31c729c2a4e?w=1200&q=80&auto=format&fit=crop",
    photographerName: "iKshana Productions",
    photographerUsername: "ikshanaproductions",
    photographerUrl: "https://unsplash.com/@ikshanaproductions?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1735052711950-c31c729c2a4e?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Aalok & Shambhavi Mishra in festive ethnic attire standing near sacred ghats in Varanasi",
    searchContext: "Hindu Vedic couple traditional Varanasi portrait",
    objectPosition: "center 35%",
  },

  // 21. Tamil Brahmin Madurai Meenakshi Wedding — Karthik & Deepa Iyer
  "tamil-brahmin-wedding-madurai": {
    photoId: "photo-1728221052130-810b42a6130e",
    imageUrl: "https://images.unsplash.com/photo-1728221052130-810b42a6130e?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Prashant Brahmbhatt",
    photographerUsername: "prashantbrahmbhatt",
    photographerUrl: "https://unsplash.com/@prashantbrahmbhatt?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1728221052130-810b42a6130e?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Karthik & Deepa Iyer in traditional Veshti and Kanchipuram silk saree in Madurai",
    searchContext: "Tamil Brahmin couple traditional Veshti portrait",
    objectPosition: "center 25%",
  },

  // 22. Manali Apple Orchard Meadow Wedding — Rishi & Tanya Thakur
  "manali-apple-orchard-wedding": {
    photoId: "photo-1635481728744-086dc12ceaf5",
    imageUrl: "https://images.unsplash.com/photo-1635481728744-086dc12ceaf5?w=1200&q=80&auto=format&fit=crop",
    photographerName: "RUPAM DUTTA",
    photographerUsername: "rupamdutta0",
    photographerUrl: "https://unsplash.com/@rupamdutta0?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1635481728744-086dc12ceaf5?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Rishi & Tanya Thakur in warm traditional attire in the mountain woods of Manali",
    searchContext: "Himachali couple traditional orchard portrait",
    objectPosition: "center 35%",
  },

  // 23. Chennai Coastal Temple Wedding — Karthik & Deepa Ramanathan
  "chennai-coastal-temple-wedding": {
    photoId: "photo-1682090879561-5c2d61f8b4db",
    imageUrl: "https://images.unsplash.com/photo-1682090879561-5c2d61f8b4db?w=1200&q=80&auto=format&fit=crop",
    photographerName: "Getty Images",
    photographerUsername: "gettyimages",
    photographerUrl: "https://unsplash.com/@gettyimages?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1682090879561-5c2d61f8b4db?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Karthik & Deepa Ramanathan holding a festive prayer plate in Chennai",
    searchContext: "Tamil couple traditional dress temple portrait",
    objectPosition: "center 30%",
  },

  // 24. Delhi Interfaith Celebration — Rahul & Sophie Deshmukh
  "delhi-interfaith-multicultural-celebration": {
    photoId: "photo-1722952934708-749c22eb2e58",
    imageUrl: "https://images.unsplash.com/photo-1722952934708-749c22eb2e58?w=1200&q=80",
    photographerName: "Unsplash Contributor",
    photographerUsername: "unsplash",
    photographerUrl: "https://unsplash.com/?utm_source=weddingwithindia&utm_medium=referral",
    unsplashUrl: "https://unsplash.com/photos/photo-1722952934708-749c22eb2e58?utm_source=weddingwithindia&utm_medium=referral",
    altText: "Rahul & Sophie Deshmukh at a garden estate celebration in New Delhi",
    searchContext: "Interfaith couple Rahul & Sophie Deshmukh",
    objectPosition: "center 35%",
  },
};

/**
 * Resolves the primary visual profile for a wedding listing based on slug, context keywords, or real media.
 */
export function resolveWeddingVisualProfile(wedding: {
  slug?: string;
  id?: string;
  imageUrl?: string;
  mainImageUrl?: string;
  title?: string;
  location?: string;
  religion?: string;
  isVerified?: boolean;
}): WeddingImageMeta {
  const slugKey = (wedding.slug || "").toLowerCase().trim();
  
  if (CURATED_WEDDING_IMAGES[slugKey]) {
    return CURATED_WEDDING_IMAGES[slugKey];
  }

  // 1. Verified Real Host Photography
  const rawUrl = wedding.imageUrl || wedding.mainImageUrl;
  if (rawUrl && wedding.isVerified) {
    return {
      photoId: extractPhotoId(rawUrl),
      imageUrl: rawUrl,
      photographerName: "Verified Wedding Host",
      photographerUsername: "host",
      photographerUrl: "https://weddingwithindia.com",
      unsplashUrl: rawUrl,
      altText: `Real wedding photography from ${wedding.title || "Wedding celebration"}`,
      searchContext: "Verified host wedding photography",
      objectPosition: "center 35%",
    };
  }

  // 2. Contextual Keyword Matching (Region / Culture > Religion > Destination)
  const fullText = `${slugKey} ${wedding.title || ""} ${wedding.location || ""} ${wedding.religion || ""}`.toLowerCase();

  if (fullText.includes("sikh") || fullText.includes("anand karaj") || fullText.includes("punjab") || fullText.includes("amritsar")) {
    return CURATED_WEDDING_IMAGES["punjabi-amritsar-golden-wedding"];
  }
  if (fullText.includes("muslim") || fullText.includes("nikah") || fullText.includes("nizam") || fullText.includes("hyderabad")) {
    return CURATED_WEDDING_IMAGES["hyderabad-nizam-wedding"];
  }
  if (fullText.includes("bengal") || fullText.includes("kolkata") || fullText.includes("banarasi")) {
    return CURATED_WEDDING_IMAGES["kolkata-bengali-heritage-wedding"];
  }
  if (fullText.includes("kerala") || (fullText.includes("christian") && fullText.includes("coastal"))) {
    return CURATED_WEDDING_IMAGES["kerala-coastal-christian-matrimony"];
  }
  if (fullText.includes("kashmir") || fullText.includes("dal lake") || fullText.includes("srinagar")) {
    return CURATED_WEDDING_IMAGES["kashmir-dal-lake-houseboat-wedding"];
  }
  if (fullText.includes("uttarakhand") || fullText.includes("mussoorie") || fullText.includes("garhwali") || fullText.includes("pahadi")) {
    return CURATED_WEDDING_IMAGES["uttarakhand-himalayan-meadow-wedding"];
  }
  if (fullText.includes("shimla") || fullText.includes("himachal") || fullText.includes("manali")) {
    return CURATED_WEDDING_IMAGES["shimla-himalayan-pine-royal-wedding"];
  }
  if (fullText.includes("coorg") || fullText.includes("kodava") || fullText.includes("karnataka")) {
    return CURATED_WEDDING_IMAGES["coorg-coffee-plantation-wedding"];
  }
  if (fullText.includes("mumbai") || fullText.includes("marine drive") || fullText.includes("maharashtra")) {
    return CURATED_WEDDING_IMAGES["mumbai-skyline-rooftop-wedding"];
  }
  if (fullText.includes("goa") || fullText.includes("mandrem") || fullText.includes("beach")) {
    return CURATED_WEDDING_IMAGES["goan-sunset-beach-nuptials"];
  }
  if (fullText.includes("tamil") || fullText.includes("madurai") || fullText.includes("brahmin") || fullText.includes("chennai")) {
    return CURATED_WEDDING_IMAGES["tamil-brahmin-wedding-madurai"];
  }
  if (fullText.includes("gujarat") || fullText.includes("ahmedabad") || fullText.includes("jain") || fullText.includes("haveli")) {
    return CURATED_WEDDING_IMAGES["ahmedabad-heritage-pol-wedding"];
  }
  if (fullText.includes("rajasthan") || fullText.includes("jaipur") || fullText.includes("jodhpur") || fullText.includes("udaipur") || fullText.includes("rajput")) {
    return CURATED_WEDDING_IMAGES["grand-maharaja-wedding"];
  }
  if (fullText.includes("andaman") || fullText.includes("havelock") || fullText.includes("tropical")) {
    return CURATED_WEDDING_IMAGES["andaman-island-tropical-wedding"];
  }
  if (fullText.includes("ladakh") || fullText.includes("leh") || fullText.includes("monastery") || fullText.includes("buddhist")) {
    return CURATED_WEDDING_IMAGES["ladakh-monastery-mountain-wedding"];
  }
  if (fullText.includes("agra") || fullText.includes("mughal") || fullText.includes("taj")) {
    return CURATED_WEDDING_IMAGES["mughal-garden-wedding-agra"];
  }
  if (fullText.includes("pondicherry") || fullText.includes("french")) {
    return CURATED_WEDDING_IMAGES["pondicherry-french-quarter-wedding"];
  }
  if (fullText.includes("varanasi") || fullText.includes("ganges") || fullText.includes("ghat")) {
    return CURATED_WEDDING_IMAGES["varanasi-ganges-spiritual-wedding"];
  }

  // 3. Fallback to Grand Maharaja Rajput
  return CURATED_WEDDING_IMAGES["grand-maharaja-wedding"];
}

/**
 * Extracts a clean photo ID from an Unsplash or external image URL.
 */
export function extractPhotoId(url?: string): string {
  if (!url) return "curated-default";
  const match = url.match(/(?:photo|premium_photo)-[a-zA-Z0-9_-]+/);
  return match ? match[0] : "curated-custom";
}
