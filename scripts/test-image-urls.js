const https = require("https");

const imageUrls = [
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80", // w1: Jodhpur Palace
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80", // w2: Udaipur Lake
  "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80", // w3: Alleppey Backwaters
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80", // w4: Goa Beach
  "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=1200&q=80", // w5: Varanasi Ghats
  "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1200&q=80", // w6: Amritsar Golden Temple
  "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80", // w7: Jaipur Haveli
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80", // w8: Madurai Temple
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80", // w9: Andaman Island
  "https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=80", // w10: Kolkata Bengali
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80", // w11: Agra Taj Mahal
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80", // w12: Kashmir Dal Lake
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // w13: Coorg Coffee Plantation
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80", // w14: Hyderabad Nizam Palace
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80", // w15: Mussoorie Mountain Meadow
  "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&q=80", // w16: Mumbai Marine Drive
  "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&q=80", // w17: Ladakh Monastery
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80", // w18: Ooty Tea Gardens
  "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&q=80", // w19: Pondicherry French Quarter
  "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1200&q=80", // w20: Jaisalmer Sand Dunes
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80", // w21: Kumarakom Backwater Palms
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80", // w22: Ahmedabad Pol Haveli
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({ url, statusCode: res.statusCode });
    });
    req.on("error", (e) => resolve({ url, statusCode: 500, error: e.message }));
    req.end();
  });
}

async function main() {
  console.log("Checking HTTP accessibility of 22 image URLs...");
  const results = await Promise.all(imageUrls.map(checkUrl));
  let allOk = true;
  results.forEach((r, i) => {
    const ok = r.statusCode === 200 || r.statusCode === 302;
    if (!ok) allOk = false;
    console.log(`[w${i+1}] ${ok ? "✓ OK" : "❌ FAIL"} (Status ${r.statusCode}): ${r.url}`);
  });
  console.log(`\nALL IMAGES ACCESSIBLE: ${allOk}`);
}

main();
