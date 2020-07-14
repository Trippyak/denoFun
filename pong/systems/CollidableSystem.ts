//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import ScoreEmitter from "../emitters/ScoreEmitter.ts";
import Velocity from "../components/Velocity.ts";
import Position from "../components/Position.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";
import TwoDimensions from "../components/TwoDimensions.ts";

class CollidableSystem extends System
{
    execute(delta: number, time: number)
    {
        let dynamicQuery = this.queries.dynamic;

        dynamicQuery.changed.forEach((entity: _Entity) => {
            const position: Position = entity.getComponent(Position);
            const bounds: AxisAlignedBoundingBox = entity.getMutableComponent(AxisAlignedBoundingBox);
            const dimensions: TwoDimensions = entity.getComponent(TwoDimensions);

            this.updateBounds(position, bounds, dimensions);
        });

        dynamicQuery.results.forEach((entity: _Entity) => {
            const bounds: AxisAlignedBoundingBox = entity.getMutableComponent(AxisAlignedBoundingBox);
            const velocity: Velocity = entity.getMutableComponent(Velocity);

            this.updateVelocity(velocity, bounds);
        });
    }

    updateBounds(position: Position, bounds: AxisAlignedBoundingBox, dimensions: TwoDimensions)
    {
        bounds.left = position.x;
        bounds.right = position.x + dimensions.width;
        bounds.top = position.y;
        bounds.bottom = position.y + dimensions.height;
    }

    updateVelocity(velocity: Velocity, bounds: AxisAlignedBoundingBox)
    {
        if (bounds.left < 0 || bounds.right > CollidableSystem.context.canvas.width)
        {
            CollidableSystem.scoreEmitter.emit("score", {
                playerScored: bounds.left < 0 ? 2 : 1
            });
            velocity.x *= -1;
        }
        
        if (bounds.top < 0 || bounds.bottom > CollidableSystem.context.canvas.height)
            velocity.y *= -1;
    }
}

CollidableSystem.queries = {
    dynamic: {
        components: [Velocity, Position, AxisAlignedBoundingBox]
        , listen: {
            changed: [Position]
        }
    }
}

export { CollidableSystem };