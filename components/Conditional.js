import React from 'react';

export default class Conditional extends React.Component {
    render() {
        const { condition, children } = this.props;
        if (
            !condition ||
            typeof condition == 'function' &&
            !condition()
        ) return null;
        return children;
    }
}