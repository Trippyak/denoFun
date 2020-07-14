//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";

class Position extends Component {
    x: number;
    y: number;
}

Position.schema = {
    x: { type: Types.Number }
    , y: { type: Types.Number }
};

export default Position;