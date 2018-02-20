import React from 'react';
import {
    Image
} from 'react-native';
import Touchable from 'react-native-platform-touchable';

export default class PopupIcon extends React.Component {
    render() {
        const { onPress, onLongPress, source, condition } = this.props;
        if (this.props.hasOwnProperty('condition') && !condition) return null;
        return (
            <Touchable
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 80,
                    width: 80,
                    borderRadius: 40,
                    flexShrink: 1,
                    overflow: 'hidden',
                    ...this.props.style
                }}
                onPress={onPress}
                onLongPress={onLongPress}
                background={Touchable.Ripple('#eee')}
                delayPressIn={0}
            >
                <Image
                    source={source}
                    style={{
                        width: 30,
                        height: 30
                    }}
                />
            </Touchable>
        )
    }
}