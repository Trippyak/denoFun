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
        if (keys["w"])
            this.keyUp(keys);
        this.keyDown(keys);velocity
    }

    keyDown(keys: Keys, key: string, velocity: Velocity, speed: number)
    {
        if (keys[key])
        {
            velocity.y = speed;
        }

        if (keys[key])
        {
            velocity.y = speed;
        }
    }

    keyUp(keys: Keys, key, velocity: Velocity, speed: number)
    {
        if (keys[key])
        {
            velocity.y = speed;
        }

        if (keys[key])
        {
            velocity.y = speed;
        }
    }
}

InputSystem.queries = {
    keys: {
        components: [Keys]
    }
}

export { InputSystem };