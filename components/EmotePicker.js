import React from 'react';
import {
    View,
    Image,
    Platform,
    ScrollView,
    Dimensions,
    ToastAndroid,
    TouchableOpacity
} from 'react-native';

export default class EmotePicker extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        try {
            return this.props.chat.key != nextProps.chat.key || this.props.visible != nextProps.visible;
        } catch(e) {
            return true;
        }
    }

    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    render() {
        const { chat, onPress, visible } = this.props,
        emoteList = Object.entries(chat.emoticons.images).map(pair =>
            <TouchableOpacity
                onPress={onPress.bind(this, pair[1])}
                onLongPress={this.toast.bind(this, pair[1])}
                key={pair[0]}
            >
                <Image
                    source={{
                        uri: pair[0]
                    }}
                    style={{
                        height: 25,
                        width: 25,
                        margin: 7
                    }}
                />
            </TouchableOpacity>
        );
        return (
            <View
                style={{
                    width: '100%',
                    alignItems: 'center',
                    borderTopColor: '#ccc',
                    height: visible ? ~~Math.min(10, Dimensions.get('window').height / 50) * 25 : 0,
                    borderTopWidth: 1
                }}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                    }}
                >
                    {emoteList}
                </ScrollView>
            </View>
        )
    }
}