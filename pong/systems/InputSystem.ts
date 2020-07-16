//@ts-nocheck
import { System, _Entity, World } from "../deps/ecsy.ts";
import KeyBoard from "../components/KeyBoard.ts";
import ControllerTag from "../components/ControllerTag.ts";
import { IController } from "../IController.ts";
import { PlayerOne, PlayerTwo } from "../components/PlayerTags.ts";
import GameControls from "../gameControls.ts";
import Velocity from "../components/Velocity.ts";
import Owner from "../components/Owner.ts";

class InputSystem extends System
{
    execute(delta: number, time: number)
    {
        const playerOnePaddle: _Entity = this.queries.playerOnePaddle.results[0];
        const playerTwoPladdle: _Entity = this.queries.playerTwoPaddle.results[0];

        this.queries.controllers.changed.forEach((entity: _Entity & IController) => {
            const keyBoard: KeyBoard = entity.getComponent(KeyBoard);
            const currentKey: GameControls = keyBoard.currentKey;
            const owner: Owner = entity.getComponent(Owner);

            if (owner.value === "playerOne")
            {
                if (!currentKey)
                    this.updatePaddleVelocity(0, playerOnePaddle);
                else if (currentKey === "w")
                    this.updatePaddleVelocity(-1, playerOnePaddle);
                else if (currentKey === "s")
                    this.updatePaddleVelocity(1, playerOnePaddle);
            }
            else if (owner.value === "playerTwo")
            {
                if (!currentKey)
                    this.updatePaddleVelocity(0, playerTwoPladdle);
                else if (currentKey === "ArrowUp")
                    this.updatePaddleVelocity(-1, playerTwoPladdle);
                else if (currentKey === "ArrowDown")
                    this.updatePaddleVelocity(1, playerTwoPladdle);
            }
        });
    }

    updatePaddleVelocity(magnitude: number, entity: _Entity) {
        const velocity: Velocity = entity.getMutableComponent(Velocity);
        velocity.y = magnitude;
        console.log(velocity);
    }
}

InputSystem.queries = {
    controllers: {
        components: [KeyBoard, ControllerTag]
        , listen: {
            changed: [KeyBoard]
        }
    }
    , playerOnePaddle: {
        components: [PlayerOne]
    }
    , playerTwoPaddle: {
        components: [PlayerTwo]
    }
}

export { InputSystem };