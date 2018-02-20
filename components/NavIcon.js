import React from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native';

export default class NavIcon extends React.Component {
    render() {
        return (
            <TouchableOpacity
                onPress={this.props.onPress}
                onLongPress={this.props.onLongPress}
                style={this.props.containerStyle}
            >
                <Image
                    source={this.props.source}
                    style={this.props.style}
                />
            </TouchableOpacity>
        )
    }
}