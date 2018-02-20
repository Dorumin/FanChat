import React from 'react';
import {
    View,
    Text,
    Platform,
    ToastAndroid,
    TouchableWithoutFeedback
} from 'react-native';

export default class PopoutTag extends React.Component {
    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    render() {
        const { tag, message, condition } = this.props;
        if (this.props.hasOwnProperty('condition') && !condition) return null;
        return (
            <TouchableWithoutFeedback
                style={{
                    paddingz: 5,
                    justifyContent: 'center',
                    height: '100%'
                }}
                onPress={() => this.toast(message)}
            >
                <View
                    style={{
                        height: 24,
                        borderWidth: 1,
                        borderRadius: 3,
                        paddingTop: 2,
                        paddingHorizontal: 5,
                        marginHorizontal: 5,
                        marginTop: 10,
                        borderColor: '#aaa',
                        backgroundColor: '#eee'
                    }}
                >
                    <Text>{tag}</Text>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}