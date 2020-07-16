import ControllerEmitter from "./emitters/ControllerEmitter.ts";
import Owner from "./components/Owner.ts";

interface IController
{
    emitter: ControllerEmitter;
    owner: Owner;
}

export { IController };