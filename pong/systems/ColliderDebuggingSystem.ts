//@ts-nocheck
import { System, _Entity } from "../deps/ecsy.ts";
import AxisAlignedBoundingBox from "../components/AxisAlignedBoundingBox.ts";
import Position from "../components/Position.ts";

class ColliderDebuggingSystem extends System
{
    execute(delta: number, time: number)
    {
        const ctx = ColliderDebuggingSystem.context;
        this.queries.collider.results.forEach((entity: _Entity) => {
            const bounds: AxisAlignedBoundingBox = entity.getComponent(AxisAlignedBoundingBox);
            this.drawDebugRect(ctx, bounds);
        });
    }
    
    drawDebugRect(ctx: any, bounds: AxisAlignedBoundingBox)
    {
        const width = bounds.right - bounds.left;
        const height = bounds.bottom - bounds.top;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00ff00";
        ctx.strokeRect(bounds.left - width / 2, bounds.top - height / 2, width, height);
        ctx.restore();
    }
}

ColliderDebuggingSystem.queries = {
    collider: {
        components: [ AxisAlignedBoundingBox ]
    }
}

export { ColliderDebuggingSystem };