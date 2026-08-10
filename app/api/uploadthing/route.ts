import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/storage";

/**
 * UploadThing API Route Handler
 *
 * Wires the FileRouter defined in lib/storage/index.ts to HTTP endpoints.
 * This is required for UploadThing's client-side components to function.
 * Without this route, all upload attempts will fail with 404.
 *
 * Authorization is enforced in each endpoint's `.middleware()` within the FileRouter.
 * Only authenticated users with valid sessions can obtain upload presigned URLs.
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
