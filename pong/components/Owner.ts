//@ts-nocheck
import { Component, Types } from "../deps/ecsy.ts";

type OwnerOption = "playerOne" | "playerTwo";

class Owner extends Component
{
    value: OwnerOption;
}

Owner.schema = {
    value: {
        type: Types.String
        , default: "playerOne"
    }
}

export default Owner;