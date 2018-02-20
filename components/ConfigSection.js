import React from 'react';
import {
    View,
    Text,
    Image
} from 'react-native';
import Touchable from 'react-native-platform-touchable';

export default class ConfigSection extends React.Component {
    render() {
        const { source, text, onPress } = this.props;
        return (
            <Touchable
                onPress={onPress}
                background={Touchable.Ripple('#eef')}
            >
                <View
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Image
                        source={source}
                        style={{
                            height: 30,
                            width: 30,
                            marginRight: 20
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 16
                        }}
                    >
                        {text}
                    </Text>
                </View>
            </Touchable>
        )
    }
}