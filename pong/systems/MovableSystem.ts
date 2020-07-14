//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import Position from "../components/Position.ts";
import Velocity from "../components/Velocity.ts";

class MovableSystem extends System
{
    execute(delta: number, time: number)
    {
        this.queries.moving.results.forEach((entity: _Entity) => {
            const velocity: Velocity = entity.getComponent(Velocity);
            const position: Position = entity.getMutableComponent(Position);
            
            position.x += velocity.x * delta;
            position.y += velocity.y * delta;
        });
    }
}

MovableSystem.queries = {
    moving: {
        components: [Position, Velocity]
    }
}

export { MovableSystem };