//@ts-nocheck
import { World, _Entity } from "./deps/ecsy.ts";
import {ballFactory} from "./factories/BallFactory.ts";
import Position from "./components/Position.ts";
import Velocity from "./components/Velocity.ts";
import TwoDimensions from "./components/TwoDimensions.ts";
import Shape from "./components/Shape.ts";
import Renderable from "./components/Renderable.ts";
import { MovableSystem } from './systems/MovableSystem.ts';
import { RenderableSystem } from "./systems/RenderableSystem.ts";
import AxisAlignedBoundingBox from "./components/AxisAlignedBoundingBox.ts";
import { CollidableSystem } from "./systems/CollidableSystem.ts";
import { ColliderDebuggingSystem } from "./systems/ColliderDebuggingSystem.ts";
import ScoreEmitter from "./emitters/ScoreEmitter.ts";

import { ScoreBoard } from "./ui/ScoreBoard/public/build/bundle.js";

const scoreEmitter = new ScoreEmitter();
const scoreBoard = new ScoreBoard({
    target: document.getElementById("score-board")
});

const canvas = document.getElementById("game-area");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");

const center = {
    x: canvas.width / 2
    , y: canvas.height / 2
}

ColliderDebuggingSystem.context = context;

const SPEED_MULTIPLIER = 0.1;

const getRandomVelocity = () => {
    return {
        x: (Math.random() >= 0.5 ? 1 : -1) * SPEED_MULTIPLIER
        , y: Math.random() * SPEED_MULTIPLIER
    }
}

let world = new World({context, scoreEmitter}); 
world
.registerComponent(Velocity)
.registerComponent(Position)
.registerComponent(TwoDimensions)
.registerComponent(Shape)
.registerComponent(Renderable)
.registerComponent(AxisAlignedBoundingBox)
.registerSystem(MovableSystem)
.registerSystem(CollidableSystem)
.registerSystem(RenderableSystem)
.registerSystem(ColliderDebuggingSystem);

const ball = ballFactory(world, {
    position: center
    , dimensions: {
        width: 20
        , height: 20
    }
    , shape: {
        primitive: "box"
    }
    , velocity: getRandomVelocity()
});

const resetBall = (ball: _Entity) => {
    const position: Position = ball.getMutableComponent(Position);
    const velocity: Velocity = ball.getMutableComponent(Velocity);
    const randoVelocity = getRandomVelocity();
    position.x = center.x;
    position.y = center.y;
    velocity.x = randoVelocity.x;
    velocity.y = randoVelocity.y;
}

scoreEmitter.on("score", (data) => {
    console.log(data.playerScored);
    scoreBoard.updateScore(data);
    resetBall(ball);
});


document.addEventListener("keypress", (event) => {
    console.log(event.key)
});

document.addEventListener("keyup", (event) => {

});

function run()
{
    var time = performance.now();
    var delta = time - lastTime;
    world.execute(delta, time);

    lastTime = time;
    requestAnimationFrame(run);
}

var lastTime = performance.now();

run();