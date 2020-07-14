//@ts-nocheck
import { System, _Entity, World } from "../deps/ecsy.ts";
import Renderable from "../components/Renderable.ts";
import Shape from "../components/Shape.ts";
import Position from "../components/Position.ts";
import TwoDimensions from "../components/TwoDimensions.ts";

class RenderableSystem extends System
{
   execute(delta: number, time: number)
    {
        RenderableSystem.context.fillStyle = "#000000";
        RenderableSystem.context.fillRect(0, 0, RenderableSystem.context.canvas.width, RenderableSystem.context.canvas.height);

        this.queries.renderable.results.forEach((entity: _Entity) => {
            const shape: Shape = entity.getComponent(Shape);
            const position: Position = entity.getComponent(Position);
            const dimensions: TwoDimensions = entity.getComponent(TwoDimensions);
            
            if (shape.primitive === "box")
            {
                this.drawBox(position, dimensions);
            }
        });
    }

    private drawBox(position: Position, dimensions: TwoDimensions)
    {
        RenderableSystem.context.beginPath();
        RenderableSystem.context.rect(position.x - dimensions.width / 2
                                    , position.y - dimensions.height / 2
                                    , dimensions.width
                                    , dimensions.height);
        RenderableSystem.context.fillStyle = "#ffffff";
        RenderableSystem.context.fill();
    }
}

RenderableSystem.queries = {
    renderable: {
        components: [Renderable, Shape]
    }
}

export { RenderableSystem };