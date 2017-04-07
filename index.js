
class SurfacePoint {
    constructor (id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.newY = 0;
    }
}

class App {

    constructor () {
        // constants
        this.NUMBER_OF_POINTS = 99;
        this.DISTANCE_BETWEEN_POINTS = 5;
        this.POINT_RADIUS = 2;
        this.SPRING_K = 1e-3;  // empirically determined

        // create and add SVG element
        const width = window.innerWidth - 50;
        const height = window.innerHeight - 50;
        this.svg = d3.select('body').insert('svg', ':first-child').attr('id', 'sandbox')
            .attr('width', width)
            .attr('height', height);

        // d3 scales
        const domainWidth = (this.NUMBER_OF_POINTS + 1) * this.DISTANCE_BETWEEN_POINTS;
        this.x = d3.scaleLinear().domain([0, domainWidth]).range([0, width]);
        this.y = d3.scaleLinear().domain([10, -10]).range([0, height]);

        this.initializePoints();

        this.fpsCount = 0;
        this.fpsAccMs = 0;
        requestAnimationFrame((time) => this.doFrame(0, time));
    }

    /**
     * Initialize model and view.
     */
    initializePoints() {
        this.pointsData = [];
        for (let i = 0; i < this.NUMBER_OF_POINTS; i++) {
            this.pointsData.push(new SurfacePoint(i, this.DISTANCE_BETWEEN_POINTS * (i + 1), 0));
        }

        // cause some disturbance on the middle point
        this.pointsData[Math.floor(this.NUMBER_OF_POINTS / 2)].y = 5;

        this.svg.selectAll('circle').data(this.pointsData).enter()
            // .each(point => console.info(`added point <${point.x}, ${point.y}>`))
            .append('circle')
            .classed('surface-point', true)
            .attr('cx', (point) => this.x(point.x))
            .attr('cy', (point) => this.y(point.y))
            .attr('r', (point) => this.x(this.POINT_RADIUS));
    }

    /**
     * Update physics parameters.
     *
     * @param dt elapsed time in ms
     */
    step(dt) {
        // ToDo calculate future y's here, but hold them into temp vars
        // ToDo take into account neighboring points
        for (let i = 0; i < this.pointsData.length; i++) {
            const point = this.pointsData[i];

            const leftDist = (i > 0) ? point.y - this.pointsData[i - 1].y : point.y;
            const rightDist = (i < this.pointsData.length - 1) ? point.y - this.pointsData[i + 1].y : point.y;

            point.speed -= this.SPRING_K * (leftDist + rightDist) * dt;
            point.newY = point.y + point.speed;
        }

        // ToDo replace current y values with the new ones
        for (let point of this.pointsData) {
            point.y = point.newY;
        }
    }

    /**
     * Update simulation.
     *
     * @param dt elapsed time in ms since last frame
     * @param currentTime current time
     */
    doFrame(dt, currentTime) {
        this.step(dt);

        this.svg.selectAll('circle').data(this.pointsData)
            .attr('cy', (point) => this.y(point.y));
        this.updateFps(dt);
        requestAnimationFrame((time) => this.doFrame(time - currentTime, time));
    }

    /**
     * Frames per second metric.
     *
     * @param dt elapsed time in ms
     */
    updateFps(dt) {
        this.fpsCount++;
        this.fpsAccMs += dt;
        if (this.fpsAccMs >= 1000) {
            const fps = this.fpsCount / (this.fpsAccMs / 1000);
            console.info('FPS: ' + fps.toFixed(0));
            this.fpsCount = 0;
            this.fpsAccMs = 0;
        }
    }
}

new App();
