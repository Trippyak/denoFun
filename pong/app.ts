//@ts-nocheck
import { World, _Entity, Component, System } from "./deps/ecsy.ts";
import ScoreEmitter from "./emitters/ScoreEmitter.ts";
import { ScoreBoard } from "./ui/ScoreBoard/public/build/bundle.js";
import GameControls from './gameControls.ts';

import { ballFactory, controllerFactory, paddleFactory} from "./factories/GameEntityFactories.ts";
import { IController } from "./IController.ts";

import {
    Position
    , Velocity
    , TwoDimensions
    , Shape
    , Renderable
    , AxisAlignedBoundingBox
    , KeyBoard
    , ControllerTag
    , Owner
    , Paddle
    , Ball
    , Player
} from "./components/mod.ts";

import { 
    MovableSystem
    , RenderableSystem
    , CollidableSystem
    , ColliderDebuggingSystem
    , InputSystem
 } from "./systems/mod.ts";

import ControllerEmitter from "./emitters/ControllerEmitter.ts";

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

const SPEED_MULTIPLIER = 0.9;

const getRandomVelocity = () => {
    return {
        x: (Math.random() >= 0.5 ? 1 : -1) * SPEED_MULTIPLIER * 1.5
        , y: Math.random() * SPEED_MULTIPLIER * 1.5
    }
}

interface ICustomWorld
{
    context: any;
    scoreEmitter: ScoreEmitter;
    speed: number;
}

const worldFactory = (props: ICustomWorld, components: Component[], systems: System[]): World & ICustomWorld => {
    const world = new World(props);
    
    components.forEach(component => world.registerComponent(component));
    systems.forEach(system => world.registerSystem(system));

    return world;
}

const world = worldFactory({context, scoreEmitter, speed: 0.2}
                            , [
                                Owner
                                , KeyBoard
                                , Velocity
                                , Position
                                , TwoDimensions
                                , Shape
                                , AxisAlignedBoundingBox
                                , Renderable
                                , ControllerTag
                                , Player
                                , Paddle
                                , Ball
                            ]
                            , [
                                InputSystem
                                , MovableSystem
                                , CollidableSystem
                                , RenderableSystem
                                , ColliderDebuggingSystem
                            ]);

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

const paddleHeight = canvas.height * 0.30;
const paddleDimensions = {
    width: 20
    , height: paddleHeight
};

const paddleOne = paddleFactory(world, {
    position: {
        x: (center.x - (paddleDimensions.width / 2) ) - (canvas.width * 0.47)
        , y: center.y - (paddleDimensions.height / 2)
    }
    , dimensions: {
        width: 20
        , height: paddleHeight
    }
    , shape: {
        primitive: "box"
    }
    , velocity: {
        x: 0
        , y: 0
    }
    , player: {
        value: "one"
    }
});

const paddleTwo = paddleFactory(world, {
    position: {
        x: (center.x - (paddleDimensions.width / 2) ) - (1 - ((canvas.width * 0.47)))
        , y: center.y - (paddleDimensions.height / 2)
    }
    , dimensions: paddleDimensions
    , shape: {
        primitive: "box"
    }
    , velocity: {
        x: 0
        , y: 0
    }
    , player: {
        value: "two"
    }
});

const updatePaddleValocity = (yMagnitude: number) => (entity: _Entity) => {
    const velocity: Velocity = entity.getMutableComponent(Velocity);
    velocity.y = yMagnitude;
}

const movePaddleUp = updatePaddleValocity(-1);
const movePaddleDown = updatePaddleValocity(1);
const stopPaddle = updatePaddleValocity(0);

const movePaddleOneUp = () => movePaddleUp(paddleOne);
const movePaddleOneDown = () => movePaddleDown(paddleOne);
const stopPaddleOne = () => stopPaddle(paddleOne);

const movePaddleTwoUp = () => movePaddleUp(paddleTwo);
const movePaddleTwoDown = () => movePaddleDown(paddleTwo);
const stopPaddleTwo = () => stopPaddle(paddleTwo);

const playerOneControls = new ControllerEmitter();
playerOneControls
.on("w", movePaddleOneUp)
.on("s", movePaddleOneDown)
.on("STOP", stopPaddleOne);

const playerTwoControls = new ControllerEmitter();
playerTwoControls
.on("ArrowUp", movePaddleTwoUp)
.on("ArrowDown", movePaddleTwoDown)
.on("STOP", stopPaddleTwo);

const playerOneController = controllerFactory(world, {
    owner: {
        value: "playerOne"
    }
    , emitter: playerOneControls
});

const playerTwoController = controllerFactory(world, {
    owner: {
        value: "playerTwo"
    }
    , emitter: playerTwoControls
});

const serveBall = (ball: _Entity) => {
    const position: Position = ball.getMutableComponent(Position);
    const velocity: Velocity = ball.getMutableComponent(Velocity);
    const randoVelocity = getRandomVelocity();
    position.x = center.x;
    position.y = center.y;
    velocity.x = randoVelocity.x;
    velocity.y = randoVelocity.y;
}

const stopBall = (ball: _Entity) => {
    const position: Position = ball.getMutableComponent(Position);
    const velocity: Velocity = ball.getMutableComponent(Velocity);
    
    position.x = center.x;
    position.y = center.y;
    velocity.x = 0;
    velocity.y = 0;
    
    ball.removeComponent(Renderable);
}

let playerOneScore = 0;
let playerTwoScore = 0;

scoreEmitter.on("score", (data) => {
    const { playerScored } = data;
    if (playerScored === 1)
        playerOneScore += 1;
    else if (playerScored === 2)
        playerTwoScore += 1;

    scoreBoard.$set({
        playerOneScore
        , playerTwoScore
    });

    if (playerOneScore == 3 || playerTwoScore === 3)
    {
        import("./ui/WinScreen/public/build/bundle.js")
        .then((Module) => {
            const WinScreen = Module.WinScreen;
            const winScreen = new WinScreen({
                target: document.getElementById("win-screen")
                , props: {
                    winner: playerScored
                }
            });
        });
        stopBall(ball);
    }
    else
        serveBall(ball); 
});

const isValidKey = (key: string): key is GameControls => {
    const allowedKeys: GameControls[] = ["w", "s", "ArrowUp", "ArrowDown"]

    return allowedKeys.indexOf(key) !== -1;
}

const updateKeyBoard = (controller: _Entity & IController, isKeyDown: boolean, key: GameControls) => {
    let keyBoard: KeyBoard = controller.getComponent(KeyBoard);
    
    if (keyBoard[key] !== isKeyDown) 
    {
        keyBoard = controller.getMutableComponent(KeyBoard);
        keyBoard[key] = isKeyDown;
        keyBoard.currentKey = isKeyDown ? key : undefined;
    }
}

document.addEventListener("keydown", (event) => {
    const key: GameControls = event.key;
    if (key === "w" || key === "s")
        updateKeyBoard(playerOneController, true, key);
    else if (key === "ArrowUp" || key === "ArrowDown")
        updateKeyBoard(playerTwoController, true, key)
});

document.addEventListener("keyup", (event) => {
    const key: GameControls = event.key;
    if (key === "w" || key === "s")
        updateKeyBoard(playerOneController, false, key);
    else if (key === "ArrowUp" || key === "ArrowDown")
        updateKeyBoard(playerTwoController, false, key)
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