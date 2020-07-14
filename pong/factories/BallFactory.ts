//@ts-nocheck
import { World, _Entity } from "../deps/ecsy.ts";
import Position from "../components/Position.ts";
import Velocity from "../components/Velocity.ts";
import Shape from "../components/Shape.ts";
import Renderable from "../components/Renderable.ts";
import TwoDimensions from "../components/TwoDimensions.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";

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

interface IFactory
{
    <T>(props: T): (entity: _Entity) => _Entity;
}

type IMovable2D = I2D & IMovable;
type ICollidableMovable2D = IAxisAlignedBoundingBox & IMovable2D;

const create2D: IFactory =
    <I2D>(props: I2D) =>
        (entity: _Entity) => {
            const { position, dimensions, shape } = props;
            return entity
                    .addComponent(Position, position)
                    .addComponent(TwoDimensions, dimensions)
                    .addComponent(Shape, shape)
                    .addComponent(Renderable);
        }

// {
//     console.log(props);
//     
// }

const createMovable: IFactory =
    <IMovable>(props: IMovable) =>
        (entity: _Entity) => {
            const { velocity } = props;
            return entity.addComponent(Velocity, velocity);
        }

const createCollidable: IFactory =
    <I2D>(props: I2D) =>
        (entity: _Entity) => {
            props.bounds = createBoundingBox(props);
            return entity.addComponent(AxisAlignedBoundingBox, props);
        }

// const createMovable2D = (entity: _Entity, props: IMovable2D) => createMovable(create2D(entity, props), props);

// const createCollidableMovable2D =
//     (entity: _Entity, props: ICollidableMovable2D) => createCollidable(createMovable2D(entity, props), props);

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

// const ballFactory = ()

export function ballFactory(world: World, props: ICollidableMovable2D) : _Entity{
    const ball: IMovable2D = world.createEntity("Ball");
    props.bounds = createBoundingBox(props);
    console.log(props);
    return createCollidableMovable2D(ball, props);
}