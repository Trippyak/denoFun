//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";

class Shape extends Component
{
    primitive: string;
}

Shape.schema = {
    primitive: {
        type: Types.String
        , default: "box"
    }
}

export default Shape;