import Brush from './Brush'

class SimpleBrush extends Brush {

    constructor(drawingCtx) {
        super(drawingCtx);
       // this.drawingCtx.lineJoin = true;
    }

    draw(currentPos, brush) {
        super.draw(currentPos, brush);
        this.drawingCtx.strokeStyle = brush.color;
        this.drawingCtx.fillStyle = brush.color;
        this.drawingCtx.lineWidth = this.brushSize;
        let prevX 
        let prevY 
        if(this.positionBuffer.currentLength === 0) {
            prevX = currentPos.x;
            prevY = currentPos.y;
        } else {
            let prevElements = this.positionBuffer.getElements(this.positionBuffer.currentLength - 1);
            prevX = prevElements[0];
            prevY = prevElements[1];
        }
        let circle = new Path2D();
        let xOffset = currentPos.x - prevX;
        let yOffset = currentPos.y - prevY;
        let length;
        if(Math.abs(xOffset) < Math.abs(yOffset)) {
            length = Math.abs(yOffset);
          
        } else  {
            length = Math.abs(xOffset);
        }
        xOffset /= length;
        yOffset /= length;
        let size = this.brushSize;
        for(let i = 0; i < length; i++) {
            let x = xOffset * i;
            let y = yOffset * i;
            circle.moveTo(prevX + x, prevY + y);
            circle.arc(prevX + x, prevY + y, size, 0, 2 * Math.PI)    
        }
        this.drawingCtx.stroke();
        this.drawingCtx.fill(circle);
        this.positionBuffer.addElements(currentPos.x, currentPos.y);
    }
}

export default SimpleBrush;