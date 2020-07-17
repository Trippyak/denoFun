import EventEmitter from "../deps/eventEmitter.ts";
import GameControls from "../gameControls.ts";

class ControllerEmitter extends EventEmitter
{
    emit(controlKey: GameControls, ...args: any[]): boolean
    {
        return super.emit(controlKey, ...args);
    }

    on(controlKey: GameControls, handler: (...args: any[]) => void): this
    {
        return super.on(controlKey, handler)
    }
}

export default ControllerEmitter;