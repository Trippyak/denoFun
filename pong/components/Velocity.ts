//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";

class Velocity extends Component
{
    x: number;
    y: number;
}

Velocity.schema = {
    x: { type: Types.Number }
    , y: { type: Types.Number }
};

export default Velocity;