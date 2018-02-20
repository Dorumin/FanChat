import React from 'react';
import {
    View,
    Text,
    Image
} from 'react-native';
import Touchable from 'react-native-platform-touchable';

export default class User extends React.Component {
    render() {
        const { user, onPress, onLongPress } = this.props;
        return (
            <Touchable
                style={{
                    borderBottomColor: '#ccc',
                    justifyContent: 'center',
                    borderBottomWidth: 1,
                    height: 80
                }}
                onPress={() => onPress(user)}
                onLongPress={() => onLongPress(user)}
                background={Touchable.Ripple('#eef')}
                delayPressIn={0}
                activeOpacity={1}
            >
                <View
                    pointerEvents='box-only'
                    style={{
                        height: 80
                    }}
                >
                    <View
                        style={{
                            height: 50,
                            width: 50,
                            borderRadius: 25,
                            margin: 15,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <Image
                            source={{
                                uri: user.avatar
                            }}
                            style={{
                                height: 50,
                                width: 50
                            }}
                        />
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            justifyContent: 'center',
                            height: 80,
                            left: 80,
                            right: 0
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 20
                            }}
                            numberOfLines={1}
                        >
                            {user.name}
                        </Text>
                    </View>
                </View>
            </Touchable>
        )
    }
}