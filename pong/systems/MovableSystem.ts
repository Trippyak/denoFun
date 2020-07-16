//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import Position from "../components/Position.ts";
import Velocity from "../components/Velocity.ts";

class MovableSystem extends System
{
    execute(delta: number, time: number)
    {
        const speed = this.world.options.speed;
        let movingQuery = this.queries.moving;

        let updatePosition = this.update(delta, speed);

        // movingQuery.changed.forEach(updatePosition);
        movingQuery.results.forEach(updatePosition);
    }

    update = (delta, speed) => (entity: _Entity) =>
    {
        const velocity: Velocity = entity.getComponent(Velocity);
        const position: Position = entity.getMutableComponent(Position);
        
        position.x += velocity.x * speed * delta;
        position.y += velocity.y * speed * delta;
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