import { GET as getVersion } from "@/app/api/version/route";

describe("Telemetry Endpoints", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("GET /api/version returns version, commit, and commitSha", async () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT_SHA = "abcdef1234567890abcdef1234567890abcdef12";
    process.env.NEXT_PUBLIC_BUILD_COMMIT_SHORT = "abcdef1";

    const response = await getVersion();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.status).toBe("ok");
    expect(json.commit).toBe("abcdef1");
    expect(json.commitSha).toBe("abcdef1234567890abcdef1234567890abcdef12");
  });
});
