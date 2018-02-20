import React from 'react';
import ShyView from '../components/ShyView';
import Logo from '../components/Logo';

export default class LoadingScreen extends React.Component {
    render() {
        return (
            <ShyView
                style={{
                    alignItems: 'center'
                }}
            >
                <Logo
                    onLoadEnd={this.props.onLoadEnd}
                />
            </ShyView>
        )
    }
}