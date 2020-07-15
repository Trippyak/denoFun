//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import Keys from "../components/Keys.ts";
import Velocity from "../components/Velocity.ts";

class InputSystem extends System
{
    execute(delta: number, time: number)
    {
        this.queries.keys.results.forEach((entity: _Entity) => {
            const keys: Keys = entity.getComponent(Keys);
        });
    }

    handleKeys(keys: Keys)
    {

    }

    moveDown(velocity: Velocity)
    {
        velocity.y *= 1;
    }

    moveUp(velocity: Velocity)
    {
        velocity.y *= -1;
    }
}

InputSystem.queries = {
    keys: {
        components: [Keys]
    }
}

export { InputSystem };