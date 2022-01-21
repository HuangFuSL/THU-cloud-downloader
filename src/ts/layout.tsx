import React from 'react';

class AnyGrid extends React.Component<{
    id?: string;
    class?: string;
    splits: Array<string>;
    orient: 'h' | 'v';
}> {
    render() {
        const cssName =
            this.props.orient == 'h'
                ? 'gridTemplateRows'
                : 'gridTemplateColumns';
        const gridStyle: React.CSSProperties = {
            [cssName]: this.props.splits.join(' '),
            display: 'grid'
        };
        const className =
            'parent-panel' +
            (this.props.class !== undefined ? ' ' + this.props.class : '');
        return (
            <div id={this.props.id} className={className} style={gridStyle}>
                {this.props.children}
            </div>
        );
    }
}

class HorizontalGrid extends React.Component<{
    id?: string;
    class?: string;
    splits: Array<string>;
}> {
    render() {
        return (
            <AnyGrid
                id={this.props.id}
                class={this.props.class}
                splits={this.props.splits}
                orient="h"
            >
                {this.props.children}
            </AnyGrid>
        );
    }
}

class VerticalGrid extends React.Component<{
    id?: string;
    class?: string;
    splits: Array<string>;
}> {
    render() {
        return (
            <AnyGrid
                id={this.props.id}
                class={this.props.class}
                splits={this.props.splits}
                orient="v"
            >
                {this.props.children}
            </AnyGrid>
        );
    }
}

export { HorizontalGrid, VerticalGrid };
