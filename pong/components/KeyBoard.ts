//@ts-nocheck
import { Component, Types, createType } from "../deps/ecsy.ts";

interface IIndexable
{
    [index: string]: string;
}

class KeyBoard extends Component, implements IIndexable
{
    
}

const schema: IIndexable = {}

KeyBoard.schema = schema;

export default KeyBoard;