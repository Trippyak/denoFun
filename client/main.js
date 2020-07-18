//@ts-nocheck
const loadCss = (cssFile) => {
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    cssLink.href = cssFile;
    document.getElementsByTagName("head")[0].appendChild(cssLink);
}

let AppView;

import("../appFrame/public/build/bundle.js")
.then(AppFrameModule => {
    const AppFrameFactory = AppFrameModule.default;
    const appFrame = new AppFrameFactory({target: document.getElementById("appFrame")});
    
    import("../basicComp/public/build/bundle.js")
    .then(BasicCompModule => {
        const BasicComp = BasicCompModule.default;
        let anotherBasicCompProps = {
            name: "Daved"
        };

        appFrame.$set({
            controls: [{
                name: "basicComp"
                , component: BasicComp
                , props: {
                    name: "Beta"
                }
            }
            , {
                name: "anotherBaicComp"
                , component: BasicComp
                , props: anotherBasicCompProps
            }]
        });

        // anotherBasicCompProps.name = "NOT DAVED";
        AppView = appFrame;
    })
    .catch(err => {
        console.log(err);
    })
})
.catch(err => {
    console.log(err);
})

const run = () => {
    loadCss("/basicComp/public/build/bundle.css");
    import("../basicComp/public/build/bundle.js")
    .then((Module) => {
        const App = Module.default;
        const basicComp = new App({target: document.getElementById("basicComp"), props: {name: "daved"}});
        const apples = new App({target: document.getElementById("apples")});
        
        apples.$set({name: "Apples"});
    })
    .catch((err) => {
        console.log(err);
    });
}
export { run, AppView };