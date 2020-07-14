//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";
import Position from "./Position.ts";
import TwoDimensions from "./TwoDimensions.ts";

class AxisAlignedBoundingBox extends Component
{
    left: number;
    right: number;
    top: number;
    bottom: number;
}

AxisAlignedBoundingBox.schema = {
    left: { type: Types.Number }
    , right: { type: Types.Number }
    , top: { type: Types.Number }
    , bottom: { type: Types.Number }
}

export default AxisAlignedBoundingBox;