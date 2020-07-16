//@ts-nocheck
import { World, _Entity, TagComponent } from "../deps/ecsy.ts";
import Position from "../components/Position.ts";
import Velocity from "../components/Velocity.ts";
import Shape from "../components/Shape.ts";
import Renderable from "../components/Renderable.ts";
import TwoDimensions from "../components/TwoDimensions.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";
import ControllerTag from "../components/ControllerTag.ts";
import KeyBoard from "../components/KeyBoard.ts";
import ControllerEmitter from "../emitters/ControllerEmitter.ts";
import { IController } from "../IController.ts";
import Owner from "../components/Owner.ts";
import Paddle from '../components/Paddle.ts';
import Ball from "../components/Ball.ts";

type I2D = 
{
    position: Position;
    dimensions: TwoDimensions;
    shape: Shape;
};

type IMovable = 
{
    velocity: Velocity;
};

type IAxisAlignedBoundingBox = 
{
    bounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }
};

type IMovable2D = I2D & IMovable;
type ICollidableMovable2D = IAxisAlignedBoundingBox & IMovable2D;

const create2D = (entity: _Entity, props: I2D) => {
    const { position, dimensions, shape } = props;
    return entity
            .addComponent(Position, position)
            .addComponent(TwoDimensions, dimensions)
            .addComponent(Shape, shape)
            .addComponent(Renderable);
}

const createMovable = (entity: _Entity, props: IMovable) => {
    const { velocity } = props;
    return entity.addComponent(Velocity, velocity);
}

const createCollidable=
    (entity: _Entity, props: I2D) => {
    props.bounds = createBoundingBox(props);
    return entity.addComponent(AxisAlignedBoundingBox, props);
}

const createMovable2D = (entity: _Entity, props: IMovable2D) => createMovable(create2D(entity, props), props);

const createCollidableMovable2D =
    (entity: _Entity, props: ICollidableMovable2D) => createCollidable(createMovable2D(entity, props), props);

const createBoundingBox = (props: I2D): IAxisAlignedBoundingBox => {
    const left = props.position.x;
    const right = props.position.x + props.dimensions.width;
    const top = props.position.y;
    const bottom = props.position.y + props.dimensions.height;

    return {
        bounds: {
            left
            , right
            , top
            , bottom
        }
    };
}

function ballFactory (world: World, props: ICollidableMovable2D) : _Entity & ICollidableMovable2D {
    const ball: _Entity & ICollidableMovable2D = world.createEntity("Ball");
    ball.addComponent(Ball);
    props.bounds = createBoundingBox(props);
    return createCollidableMovable2D(ball, props);
}
 

const movePaddleUp = (entity: _Entity) => {
    const velocity: Velocity = entity.getMutableComponent(Velocity);
    velocity.y = 1;
    console.log(velocity);
}
const movePaddleDown = (entity: _Entity) => {
    const velocity: Velocity = entity.getMutableComponent(Velocity);
    velocity.y = -1;
    console.log(velocity);
}

const controllerFactory = (world: World, props: IController) : _Entity & IController => {
    const controller: _Entity & IController = world.createEntity("Controller");
    const { owner } = props;
    controller
    .addComponent(KeyBoard)
    .addComponent(Owner, owner)
    .addComponent(ControllerTag);

    controller.emitter = new ControllerEmitter();
    controller
    .emitter
    .on("w", movePaddleUp)
    .on("s", movePaddleDown)
    .on("ArrowUp", movePaddleDown)
    .on("ArrowDown", movePaddleDown);
    
    return controller;
}

const paddleFactory = (world: World, name: string, playerTag: TagComponent, props: ICollidableMovable2D): _Entity & ICollidableMovable2D => {
    const paddle: _Entity = world.createEntity(name);
    paddle
    .addComponent(Paddle)
    .addComponent(playerTag);
    props.bounds = createBoundingBox(props);
    return createCollidableMovable2D(paddle, props);
}

export {
    ballFactory
    , controllerFactory
    , paddleFactory
}