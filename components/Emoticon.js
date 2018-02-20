import React from 'react';
import {
    Image,
    Platform,
    ToastAndroid,
    TouchableWithoutFeedback
} from 'react-native';

export default class Emoticon extends React.Component {
    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    render() {
        const { emote, icon, big, style } = this.props;
        return (
            <TouchableWithoutFeedback
                onPress={this.toast.bind(this, emote)}
            >
                <Image
                    source={{
                        uri: icon
                    }}
                    style={{
                        height: big ? 22 : 14,
                        width: big ? 22 : 14,
                        marginHorizontal: 3,
                        marginTop: 3,
                        ...style
                    }}
                />
            </TouchableWithoutFeedback>
        )
    }
}