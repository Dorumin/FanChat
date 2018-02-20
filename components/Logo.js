import React from 'react';
import {
    Animated,
    Dimensions
} from 'react-native';

export default class Logo extends React.Component {
    render() {
        return (
            <Animated.Image
                source={require('../img/logo.png')}
                style={{
                    width: 180,
                    height: 180,
                    marginTop: Dimensions.get('window').height / 2.5 - 100,
                    ...this.props.style
                }}
                onLoadEnd={this.props.onLoadEnd || (() => {})}
            />
        )
    }
}