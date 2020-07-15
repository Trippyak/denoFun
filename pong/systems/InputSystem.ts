//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import KeyBoard from "../components/KeyBoard.ts";
import Velocity from "../components/Velocity.ts";

class InputSystem extends System
{
    execute(delta: number, time: number)
    {
        this.queries.keys.changed.forEach((entity: _Entity) => {
            const keyBoard: KeyBoard = entity.getComponent(KeyBoard);
            console.log("changed", keyBoard);
        });
    }
}

InputSystem.queries = {
    keys: {
        components: [KeyBoard]
        , listen: {
            changed: [KeyBoard]
        }
    }
}

export { InputSystem };