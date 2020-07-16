//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import ScoreEmitter from "../emitters/ScoreEmitter.ts";
import Velocity from "../components/Velocity.ts";
import Position from "../components/Position.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";
import TwoDimensions from "../components/TwoDimensions.ts";
import Ball from "../components/Ball.ts";
import Paddle from "../components/Paddle.ts";

class CollidableSystem extends System
{
    init()
    {
        this.context = this.world.options.context;
    }

    execute(delta: number, time: number)
    {
        let dynamicQuery = this.queries.dynamic;

        dynamicQuery.changed.forEach((entity: _Entity) => {
            const position: Position = entity.getComponent(Position);
            const dimensions: TwoDimensions = entity.getComponent(TwoDimensions);
            const bounds: AxisAlignedBoundingBox = entity.getMutableComponent(AxisAlignedBoundingBox);

            this.updateBounds(position, bounds, dimensions);
        });

        this.queries.paddles.results.forEach((entity: _Entity) => {    
            const bounds: AxisAlignedBoundingBox = entity.getComponent(AxisAlignedBoundingBox);
            const velocity: Velocity = entity.getMutableComponent(Velocity);

            this.paddleWallCollision(velocity, bounds);
        });

        const ball = this.queries.ball.results[0]
        const ballBounds: AxisAlignedBoundingBox = ball.getComponent(AxisAlignedBoundingBox);
        const ballVelocity: Velocity = ball.getMutableComponent(Velocity);

        this.ballWallCollision(ballVelocity, ballBounds);
    }

    updateBounds(position: Position, bounds: AxisAlignedBoundingBox, dimensions: TwoDimensions)
    {
        bounds.left = position.x;
        bounds.right = position.x + dimensions.width;
        bounds.top = position.y;
        bounds.bottom = position.y + dimensions.height;
    }

    ballWallCollision(velocity: Velocity, bounds: AxisAlignedBoundingBox)
    {
        if (bounds.left <= 0 || bounds.right >= this.context.canvas.width)
        {
            this.world.options.scoreEmitter.emit("score", {
                playerScored: bounds.left < 0 ? 2 : 1
            });
        }
        
        if (bounds.top <= 0 || bounds.bottom >= this.context.canvas.height)
            velocity.y *= -1;
    }

    paddleWallCollision (velocity: Velocity, bounds: AxisAlignedBoundingBox)
    {
        if (bounds.top <= 0 || bounds.bottom >= this.context.canvas.height)
            velocity.y = 0;
    }
}

CollidableSystem.queries = {
    dynamic: {
        components: [Velocity, Position, AxisAlignedBoundingBox]
        , listen: {
            changed: [Position]
        }
    }
    , ball: {
        components: [Ball]
    }
    , paddles: {
        components: [Paddle]
    }
}

export { CollidableSystem };