//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";

export type PlayerValue = "one" | "two";

class Player extends Component
{
    value: PlayerValue;
}

Player.schema = {
    value: {
        type: Types.String
        , default: "one"
    }
}

export default Player;