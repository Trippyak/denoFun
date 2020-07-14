import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { componentRouter } from "./router.ts";

const app = new Application();
const router = new Router();

app
.use(async (context, next) => {
    const pathname = context.request.url.pathname;
    if (pathname.startsWith("/public"))
    {
        const [publicRoot, resource] = pathname.split("/public");
        await send(context, resource, { root: "./public" });
    }
    else
       await next();
})
.use(router.routes())
.use(router.allowedMethods())
.use(componentRouter.routes())
.use(componentRouter.allowedMethods());

router
.get("/", async (context) => {
    await send(context, "index.html", { root: "./views"});
});

app.addEventListener("listen", ({hostname, secure, port}) => {
    const protocol = secure ? "HTTPS" : "HTTP";
    console.log(`Server started on ${protocol}://${hostname}:${port}`);
});

app.listen({port: 8080});