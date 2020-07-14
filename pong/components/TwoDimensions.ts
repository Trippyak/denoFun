//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";

class TwoDimensions extends Component
{
    width: number;
    height: number;
}

TwoDimensions.schema = {
    width: { type: Types.Number }
    , height: { type: Types.Number }
}

export default TwoDimensions;