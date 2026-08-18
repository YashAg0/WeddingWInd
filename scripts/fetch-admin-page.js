async function testFetch() {
  const loginRes = await fetch("http://localhost:3000/api/test/auth?email=admin@weddingwithindia.com&redirect=/dashboard/admin/weddings", {
    redirect: "manual"
  });
  console.log("Login status:", loginRes.status);
  const cookie = loginRes.headers.get("set-cookie");
  console.log("Set-Cookie:", cookie);
  const location = loginRes.headers.get("location");
  console.log("Location:", location);

  const pageRes = await fetch("http://localhost:3000/dashboard/admin/weddings", {
    headers: {
      cookie: cookie ? cookie.split(";")[0] : ""
    }
  });
  console.log("Page status:", pageRes.status);
  const html = await pageRes.text();
  console.log("HTML length:", html.length);
  console.log("Contains 'Wedding Directory':", html.includes("Wedding Directory"));
  console.log("Contains 'Varanasi Ganges':", html.includes("Varanasi Ganges"));
  console.log("Snippet (500 chars):", html.slice(0, 500));
  if (!html.includes("Wedding Directory")) {
    console.log("FULL HTML:\n", html);
  }
}

testFetch().catch(console.error);
