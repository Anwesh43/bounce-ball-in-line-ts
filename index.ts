const w : number = window.innerWidth
const h : number = window.innerHeight 
const parts : number = 3
const miniParts : number = 3 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const delay : number = 20 
const backColor : string = "#BDBDBD"
const colors : Array<string> = [
    "#f44336",
    "#673AB7",
    "#01579B",
    "#00C853",
    "#FFD600"
]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawBounceBallInLine(context : CanvasRenderingContext2D, scale : number) {
        const gap : number = w / (2 * parts + 1)
        const r : number = gap / 2 
        for (var j = 0; j < parts; j++) {
            const sj : number = ScaleUtil.divideScale(scale, j, parts)
            const sfj : number = ScaleUtil.sinify(sj)
            const sfj1 : number = ScaleUtil.divideScale(sfj, 0, miniParts)
            const sfj2 : number = ScaleUtil.divideScale(sfj, 1, miniParts)
            const sfj3 : number = ScaleUtil.divideScale(sfj, 2, miniParts)
            context.save()
            context.translate(gap * (2 * j + 1), 0)
            DrawingUtil.drawCircle(context, 0, r + (h - 2 * r) * sfj3, r * sfj1)
            DrawingUtil.drawLine(context, -r * sfj1, h - r, r * sfj1, h - r)
            context.restore()
        }
    }

    static drawBBLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.fillStyle = colors[i]
        context.strokeStyle = colors[i]
        DrawingUtil.drawBounceBallInLine(context, scale)    
    }
}