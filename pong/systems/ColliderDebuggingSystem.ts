//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";
import Position from "../components/Position.ts";

class ColliderDebuggingSystem extends System
{
    init()
    {
        this.ctx = this.world.options.context;
    }

    execute(delta: number, time: number)
    {
        this.queries.collider.results.forEach((entity: _Entity) => {
            const bounds: AxisAlignedBoundingBox = entity.getComponent(AxisAlignedBoundingBox);
            this.drawDebugRect(this.ctx, bounds);
        });
    }
    
    drawDebugRect(ctx: any, bounds: AxisAlignedBoundingBox)
    {
        const width = bounds.right - bounds.left;
        const height = bounds.bottom - bounds.top;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00ff00";
        ctx.strokeRect(bounds.left, bounds.top, width, height);
        ctx.restore();
    }
}

ColliderDebuggingSystem.queries = {
    collider: {
        components: [ AxisAlignedBoundingBox ]
    }
}

export { ColliderDebuggingSystem };