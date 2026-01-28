import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
    pathPrefix: "/images/",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const { pathname } = new URL(request.url);
        const storageId = pathname.split("/").pop();
        if (!storageId) {
            return new Response("Image ID not found", { status: 400 });
        }
        const url = await ctx.storage.getUrl(storageId as Id<"_storage">);
        if (!url) {
            return new Response("Image not found", { status: 404 });
        }
        return Response.redirect(url);
    }),
});

export default http;
