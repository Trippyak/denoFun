//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import Position from "../components/Position.ts";
import Velocity from "../components/Velocity.ts";

class MovableSystem extends System
{
    execute(delta: number, time: number)
    {
        let movingQuery = this.queries.moving;

        let updatePosition = this.update(delta);

        movingQuery.changed.forEach(updatePosition);
        movingQuery.results.forEach(updatePosition);
    }

    update = (delta) => (entity: _Entity) =>
    {
        const velocity: Velocity = entity.getComponent(Velocity);
        const position: Position = entity.getMutableComponent(Position);
        
        position.x += velocity.x * delta;
        position.y += velocity.y * delta;
    }
}

MovableSystem.queries = {
    moving: {
        components: [Position, Velocity]
        , listen: {
            changed: [Position]
        }
    }
}

export { MovableSystem };