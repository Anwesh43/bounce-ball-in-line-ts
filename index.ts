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
            DrawingUtil.drawCircle(context, 0, r + (h - 3 * r) * sfj3, r * sfj1)
            DrawingUtil.drawLine(context, -r * sfj2, h - r, r * sfj2, h - r)
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

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }
    
    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    
    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(() => {
                cb()
            }, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class BBILNode {

    next : BBILNode 
    prev : BBILNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()    
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new BBILNode(this.i + 1)
            this.next.prev = this  
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawBBLNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BBILNode {
        var curr : BBILNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class BounceBallInLine {

    curr : BBILNode = new BBILNode(0)
    dir : number = 1 

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    bbil : BounceBallInLine = new BounceBallInLine()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.bbil.draw(context)
    }

    handleTap(cb : Function) {
        this.bbil.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.bbil.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}