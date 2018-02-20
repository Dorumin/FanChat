// https://stackoverflow.com/questions/29642685
import React from 'react';
import {
    View,
    Image
} from 'react-native';
import { connect } from 'react-redux';
import { cacheDimensions } from '../actions';

class FullHeightImage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: props.height
        };
    }

    mount() {
        this._mounted = true;
        const containerHeight = this.state.height,
        uri = this.props.source.uri,
        dimensions = this.props.dimensions[uri];

        if (this.props.ratio) {
            this.setState({
                width: containerHeight * this.props.ratio,
                height: containerHeight
            });
        } else if (
            dimensions &&
            this.state.width != dimensions.width &&
            this.state.height == dimensions.height
        ) {
            this.setState(dimensions);
        } else {
            Image.getSize(this.props.source.uri, (width, height) => {
                if (
                    !this._mounted ||
                    this.state.width == containerHeight * width / height
                ) return;
                const dims = {
                    width: containerHeight * width / height,
                    height: containerHeight
                };
                this.setState(dims);
                this.props.cache(uri, dims);
            });
        }
    }
    
    componentDidMount() {
        this.mount();
    }

    componentDidUpdate() {
        this.mount();
    }

    componentWillUnmount() {
        this._mounted = false;
      }

    render() {
        return (
            <View style={{
                height: this.state.height,
                ...this.props.containerStyle
            }}>
                <Image
                    source={this.props.source}
                    style={{
                        width: this.state.width,
                        height: this.state.height,
                        ...this.props.style
                    }}
                />
            </View>
        );
    }
}

export default connect(
    state => {
        return {
            dimensions: state.dimensions
        }
    },
    dispatch => {
        return {
            cache: (uri, dimensions) => dispatch(cacheDimensions(uri, dimensions))
        }
    }
)(FullHeightImage)