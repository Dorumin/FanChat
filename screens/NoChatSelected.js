import React from 'react';
import {
    View,
    Text
} from 'react-native';

export default class NoChatSelected extends React.Component{ 
    render() {
        return (
            <View
                style={{
                    backgroundColor: '#fff',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 100
                }}
            >
                <Text
                    style={{
                        color: '#666'
                    }}
                >
                    {this.props.message}
                </Text>
            </View>
        )
    }
}