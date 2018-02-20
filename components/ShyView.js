import React from 'react';
import {
    KeyboardAvoidingView
} from 'react-native';
import { Constants } from 'expo';

export default class ShyView extends React.Component {
    render() {
        return (
            <KeyboardAvoidingView
                behavior='padding'
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    paddingTop: Constants.statusBarHeight,
                    overflow: 'visible',
                    ...this.props.style
                }}
            >
                {this.props.children}
            </KeyboardAvoidingView>
        )
    }
}