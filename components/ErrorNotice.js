import React from 'react';
import {
    View,
    Text
} from 'react-native';

export default class ErrorNotice extends React.Component {
    render() {
        if (this.props.condition === false) return null;
        return (
            <View
                style={{
                    width: '95%',
                    borderWidth: 1,
                    borderColor: 'red',
                    backgroundColor: '#fff0f0',
                    padding: 6,
                    marginHorizontal: 6,
                    marginVertical: 10
                }}
            >
                <Text>{this.props.message}</Text>
            </View>
        )
    }
}