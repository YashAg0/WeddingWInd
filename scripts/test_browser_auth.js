const http = require("http");

async function run() {
  // 1. Hit /api/test/auth
  const loginRes = await new Promise((resolve) => {
    http.get("http://localhost:3000/api/test/auth?email=admin@weddingwithindia.com&redirect=/dashboard/admin/weddings", resolve);
  });

  console.log("Login status:", loginRes.statusCode);
  const setCookie = loginRes.headers["set-cookie"];
  console.log("Set-Cookie:", setCookie);

  const cookieVal = setCookie[0].split(";")[0];
  console.log("Cookie Val:", cookieVal);

  // 2. Hit /dashboard/admin/weddings with this cookie
  const pageRes = await new Promise((resolve) => {
    const req = http.get("http://localhost:3000/dashboard/admin/weddings", {
      headers: {
        Cookie: cookieVal
      }
    }, resolve);
  });

  console.log("Page status:", pageRes.statusCode);
  console.log("Page headers:", pageRes.headers);
  let pageBody = "";
  pageRes.on("data", chunk => pageBody += chunk);
  pageRes.on("end", () => {
    console.log("Page body snippet:", pageBody.substring(0, 400));
    console.log("Contains 'Wedding Directory':", pageBody.includes("Wedding Directory"));
    console.log("Contains 'Sign in':", pageBody.includes("Sign in"));
  });
}

run().catch(console.error);
