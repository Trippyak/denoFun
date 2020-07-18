//@ts-nocheck
import { System, _Entity, World } from "../deps/ecsy.ts";
import KeyBoard from "../components/KeyBoard.ts";
import ControllerTag from "../components/ControllerTag.ts";
import { IController } from "../IController.ts";
import GameControls from "../gameControls.ts";
import Velocity from "../components/Velocity.ts";
import Owner from "../components/Owner.ts";

class InputSystem extends System
{
    execute(delta: number, time: number)
    {
        this.queries.controllers.changed.forEach((entity: _Entity & IController) => {
            const keyBoard: KeyBoard = entity.getComponent(KeyBoard);
            const currentKey: GameControls = keyBoard.currentKey;
            const owner: Owner = entity.getComponent(Owner);

            if (owner.value === "playerOne")
            {
                console.log(keyBoard.currentKey)
                if (!currentKey)
                    entity.emitter.emit("STOP");
                else if (currentKey === "w")
                    entity.emitter.emit("w");
                else if (currentKey === "s")
                    entity.emitter.emit("s");
            }
            else if (owner.value === "playerTwo")
            {
                if (!currentKey)
                    entity.emitter.emit("STOP");
                else if (currentKey === "ArrowUp")
                    entity.emitter.emit("ArrowUp");
                else if (currentKey === "ArrowDown")
                    entity.emitter.emit("ArrowDown");
            }
        });
    }
}

InputSystem.queries = {
    controllers: {
        components: [KeyBoard, ControllerTag]
        , listen: {
            changed: [KeyBoard]
        }
    }
}

export { InputSystem };