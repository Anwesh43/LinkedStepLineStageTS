const w : number = window.innerWidth, h : number = window.innerHeight, SL_NODES : number = 5

class LinkedStepLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    private sl : LinkedStepLine = new LinkedStepLine()

    private animator : SLAnimator = new SLAnimator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.sl.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.sl.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.sl.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedStepLineStage = new LinkedStepLineStage()
        stage.render()
        stage.handleTap()
    }
}

class SLState {

    scale : number = 0

    dir : number = 0

    prevScale : number = 0

    update(stopcb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            stopcb()
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class SLAnimator {
    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class SLNode {

    next : SLNode

    prev : SLNode

    state : SLState = new SLState()

    x : number = 0
    constructor(private i : number) {
        this.addNeighbor()

    }

    addNeighbor() {
        if (this.i < SL_NODES - 1) {
            this.next = new SLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const hGap : number = (2 * h / 3) / SL_NODES
        const xGap : number = (w / 2) / SL_NODES
        context.strokeStyle = '#673AB7'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 50
        var ox : number = 0
        if (this.prev) {
            ox = this.prev.x
            this.prev.draw(context)
        }
        this.x = ox + this.state.scale
        context.save()
        context.translate(this.x, h - this.i * hGap)
        context.moveTo(0, 0)
        context.lineTo(0, -hGap)
        context.stroke()
        context.restore()
        if (this.state.scale < 1) {
            this.next.draw(context)
        }
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNeighbor(dir : number, cb : Function) {
        var curr : SLNode = this.prev
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

class LinkedStepLine {

    curr : SLNode = new SLNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNeighbor(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
