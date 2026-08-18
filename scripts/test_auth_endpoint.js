const http = require("http");

function testFetch() {
  const req = http.get("http://localhost:3000/api/test/auth?email=admin@weddingwithindia.com&redirect=/dashboard/admin/weddings", (res) => {
    console.log("Status:", res.statusCode);
    console.log("Headers:", res.headers);
    let data = "";
    res.on("data", (chunk) => data += chunk);
    res.on("end", () => {
      console.log("Body length:", data.length);
      console.log("Body snippet:", data.substring(0, 300));
    });
  });
  req.on("error", console.error);
}

testFetch();
