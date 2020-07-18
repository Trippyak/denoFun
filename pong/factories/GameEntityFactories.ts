//@ts-nocheck
import { World, _Entity, TagComponent } from "../deps/ecsy.ts";
import ControllerEmitter from "../emitters/ControllerEmitter.ts";
import {
    Position
    , Velocity
    , Shape
    , Renderable
    , TwoDimensions
    , AxisAlignedBoundingBox
    , ControllerTag
    , KeyBoard
    , Owner
    , Paddle
    , Ball
    , IController
    , PlayerValue,
    Player
} from "../components/mod.ts";

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

type IPlayer =
{
    value: PlayerValue;
}

type IControllable =
{
    player: IPlayer
}

type IMovable2D = I2D & IMovable;
type ICollidableMovable2D = IAxisAlignedBoundingBox & IMovable2D;
type IBall = ICollidableMovable2D;
type IPaddle = IControllable & ICollidableMovable2D;
type IBallEntity = IBall & _Entity;
type IPaddleEntity = IPaddle & _Entity;
type IControllerEntity = IController & _Entity;

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

const createBoundingBox = (props: ICollidableMovable2D): IAxisAlignedBoundingBox => {
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

function ballFactory (world: World, props: IBall) : IBallEntity {
    const ball: _Entity & ICollidableMovable2D = world.createEntity("Ball");
    ball.addComponent(Ball);
    props.bounds = createBoundingBox(props);
    return createCollidableMovable2D(ball, props);
}

const controllerFactory = (world: World, props: IController) : IControllerEntity => {
    const controller: _Entity & IController = world.createEntity("Controller");
    const { owner, emitter } = props;
    
    controller
    .addComponent(KeyBoard)
    .addComponent(Owner, owner)
    .addComponent(ControllerTag);
    
    controller.emitter = emitter;

    return controller;
}

const paddleFactory = (world: World, props: IPaddle): IPaddleEntity => {
    const { player } = props;
    const paddle: _Entity = world.createEntity("Paddle");
    paddle
    .addComponent(Paddle)
    .addComponent(Player, player);
    props.bounds = createBoundingBox(props);
    return createCollidableMovable2D(paddle, props);
}

export {
    ballFactory
    , controllerFactory
    , paddleFactory
}