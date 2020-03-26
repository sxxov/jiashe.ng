/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */
export class BezierUtility {
    constructor(mX1, mY1, mX2, mY2) {
        this.mX1 = mX1;
        this.mY1 = mY1;
        this.mX2 = mX2;
        this.mY2 = mY2;
        // These values are established by empiricism with tests (tradeoff: performance VS precision)
        this.NEWTON_ITERATIONS = 4;
        this.NEWTON_MIN_SLOPE = 0.001;
        this.SUBDIVISION_PRECISION = 0.0000001;
        this.SUBDIVISION_MAX_ITERATIONS = 10;
        this.kSplineTableSize = 11;
        this.kSampleStepSize = 1.0 / (this.kSplineTableSize - 1.0);
        this.sampleValues = (typeof Float32Array === 'function')
            ? new Float32Array(this.kSplineTableSize)
            : new Array(this.kSplineTableSize);
        if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
            throw new Error('bezier x values must be in [0, 1] range');
        }
        // LinearEasing
        if (mX1 === mY1 && mX2 === mY2) {
            return this;
        }
        // Precompute samples table
        for (let i = 0; i < this.kSplineTableSize; ++i) {
            this.sampleValues[i] = this.calcBezier(i * this.kSampleStepSize, mX1, mX2);
        }
    }
    getValue(value) {
        // LinearEasing
        if (this.mX1 === this.mY1
            && this.mX2 === this.mY2) {
            return value;
        }
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (value === 0 || value === 1) {
            return value;
        }
        // LinearEasing
        if (this.mX1 === this.mY1 && this.mX2 === this.mY2) {
            return value;
        }
        return this.calcBezier(this.getTForX(value, this.mX1, this.mX2), this.mY1, this.mY2);
    }
    getTForX(aX, mX1, mX2) {
        let intervalStart = 0.0;
        let currentSample = 1;
        const lastSample = this.kSplineTableSize - 1;
        for (; currentSample !== lastSample && this.sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += this.kSampleStepSize;
        }
        --currentSample;
        // Interpolate to provide an initial guess for t
        const dist = (aX - this.sampleValues[currentSample])
            / (this.sampleValues[currentSample + 1]
                - this.sampleValues[currentSample]);
        const guessForT = intervalStart + dist * this.kSampleStepSize;
        const initialSlope = this.getSlope(guessForT, mX1, mX2);
        if (initialSlope >= this.NEWTON_MIN_SLOPE) {
            return this.newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        if (initialSlope === 0.0) {
            return guessForT;
        }
        return this.binarySubdivide(aX, intervalStart, intervalStart + this.kSampleStepSize, mX1, mX2);
    }
    A(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    B(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
    }
    C(aA1) {
        return 3.0 * aA1;
    }
    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    calcBezier(aT, aA1, aA2) {
        return ((this.A(aA1, aA2) * aT + this.B(aA1, aA2)) * aT + this.C(aA1)) * aT;
    }
    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    getSlope(aT, aA1, aA2) {
        return 3.0 * this.A(aA1, aA2) * aT * aT + 2.0 * this.B(aA1, aA2) * aT + this.C(aA1);
    }
    binarySubdivide(aX, aA, aB, mX1, mX2) {
        let currentX;
        let currentT;
        let i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = this.calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            }
            else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > this.SUBDIVISION_PRECISION
            && ++i < this.SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    }
    newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (let i = 0; i < this.NEWTON_ITERATIONS; ++i) {
            const currentSlope = this.getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
                return aGuessT;
            }
            const currentX = this.calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
}
//# sourceMappingURL=bezier.utility.js.map