import { Router, send } from "https://deno.land/x/oak/mod.ts";

const componentRouter = new Router();

const components = [
    "/basicComp"
    , "/pong/ui/ScoreBoard"
    , "/pong/ui/WinScreen"
];

const dependencies = [
    "/public/favicon.png"
    , "/public/global.css"
    , "/public/build/bundle.css"
    , "/public/build/bundle.js"
];

for (const component of components)
{
    for (const dependency of dependencies)
    {
        console.log(component + dependency);
        componentRouter.get(component + dependency
            , async (context) => {
                await send(context, dependency, { root: `./${component}`})
            });
    }
}

export { componentRouter };