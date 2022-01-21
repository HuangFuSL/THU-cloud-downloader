import React from 'react';

interface HalfCircleProps {
    start: number;
    end: number;
    className?: string;
    id?: string;
}

class HalfCircle extends React.Component<HalfCircleProps> {
    static calculatePoints(start: number, end: number) {
        const positiveMod = (x: number, y: number) => {
            return x >= 0 ? x % y : (x % y) + y;
        };
        const toRad = (deg: number) => {
            return (deg * Math.PI) / 180;
        };
        const toPoint = (deg: number) => {
            const cos = Math.cos(toRad(-deg)),
                sin = Math.sin(toRad(-deg));
            const a = cos / Math.max(Math.abs(cos), Math.abs(sin));
            const b = sin / Math.max(Math.abs(cos), Math.abs(sin));
            return `${50 + 50 * a}% ${50 + 50 * b}%`;
        };
        start = positiveMod(start, 360);
        end = positiveMod(end, 360);
        if (start >= end) end += 360;
        const ret = ['50% 50%', toPoint(start)];
        for (let i = 0; i < 4; i++)
            if (start < 90 * i + 45 && end > 90 * i + 45)
                ret.push(toPoint(90 * i + 45));
        ret.push(toPoint(end));
        return ret.join(', ');
    }

    render() {
        const points = HalfCircle.calculatePoints(
            this.props.start,
            this.props.end
        );
        const style: React.CSSProperties = { clipPath: `polygon(${points})` };
        console.log(this.props);
        console.log(style);
        return (
            <div
                id={this.props.id}
                className={this.props.className}
                style={style}
            ></div>
        );
    }
}

export { HalfCircle };
