//@ts-nocheck
import { System, _Entity, Component } from "../deps/ecsy.ts";
import ScoreEmitter from "../emitters/ScoreEmitter.ts";
import Velocity from "../components/Velocity.ts";
import Position from "../components/Position.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";
import TwoDimensions from "../components/TwoDimensions.ts";
import Ball from "../components/Ball.ts";
import Paddle from "../components/Paddle.ts";
import { Player } from "../components/mod.ts";

class CollidableSystem extends System
{
    init()
    {
        this.context = this.world.options.context;
    }

    execute(delta: number, time: number)
    {
        const ball = this.queries.ball.results[0];
        let dynamicQuery = this.queries.dynamic;
        const paddleBounds: { [index: string]: AxisAlignedBoundingBox } = {};

        dynamicQuery.changed.forEach((entity: _Entity) => {
            const position: Position = entity.getComponent(Position);
            const dimensions: TwoDimensions = entity.getComponent(TwoDimensions);
            const bounds: AxisAlignedBoundingBox = entity.getMutableComponent(AxisAlignedBoundingBox);

            this.updateBounds(position, bounds, dimensions);
        });

        this.queries.paddles.results.forEach((entity: _Entity) => {    
            const bounds: AxisAlignedBoundingBox = entity.getComponent(AxisAlignedBoundingBox);
            const player: Player = entity.getComponent(Player);
            const velocity: Velocity = entity.getMutableComponent(Velocity);

            this.paddleWallCollision(velocity, bounds);
            paddleBounds[player.value] = bounds;
        });

        this.ballCollisison(ball, paddleBounds);
    }

    updateBounds(position: Position, bounds: AxisAlignedBoundingBox, dimensions: TwoDimensions): void
    {
        bounds.left = position.x;
        bounds.right = position.x + dimensions.width;
        bounds.top = position.y;
        bounds.bottom = position.y + dimensions.height;
    }

    handleBallPaddleCollision = (ballVelocity) => { ballVelocity.x *= -1; }

    ballWallCollision(velocity: Velocity, bounds: AxisAlignedBoundingBox): void
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

    ballPaddleCollision = 
        (predicate: (ballBounds: AxisAlignedBoundingBox, paddleBounds: AxisAlignedBoundingBox) => boolean
         , action: (ballVeloticy: Velocity) => void) =>
            (ballVelocity: Velocity, ballBounds: AxisAlignedBoundingBox, paddleBounds: AxisAlignedBoundingBox): void =>
        {
            if (predicate(ballBounds, paddleBounds))
            {
                action(ballVelocity);
            }
        }

    areOverlapping(a: AxisAlignedBoundingBox, b: AxisAlignedBoundingBox)
    {
        return (a.top < b.bottom && a.bottom > b.top)
                &&
                (a.left < b.right && a.right > b.left)
    }

    ballPaddleOneCollision = this.ballPaddleCollision(this.areOverlapping, this.handleBallPaddleCollision);

    ballPaddleTwoCollision = this.ballPaddleCollision(this.areOverlapping, this.handleBallPaddleCollision)

    paddleWallCollision (velocity: Velocity, bounds: AxisAlignedBoundingBox): void
    {
        if (bounds.top <= 0 || bounds.bottom >= this.context.canvas.height)
            velocity.y = 0;
    }

    ballCollisison(ball: _Entity, paddleBounds: AxisAlignedBoundingBox[]): void
    {
        const leftQuarterScreen = this.context.canvas.width * 0.25;
        const rightQuarterScreen = 1 - leftQuarterScreen;
        const ballBounds: AxisAlignedBoundingBox = ball.getComponent(AxisAlignedBoundingBox);
        const ballVelocity: Velocity = ball.getMutableComponent(Velocity);

        this.ballWallCollision(ballVelocity, ballBounds);

        if (ballBounds.left < leftQuarterScreen)
        {
            this.ballPaddleOneCollision(ballVelocity, paddleBounds["one"], ballBounds);
        }
        else if (ballBounds.right > rightQuarterScreen)
            this.ballPaddleTwoCollision(ballVelocity, paddleBounds["two"], ballBounds);
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