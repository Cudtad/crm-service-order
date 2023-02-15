import React from 'react';
import PropTypes from 'prop-types';
import './scss/LoadingBar.scss'

LoadingBar.propTypes = {
    loading: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
};

LoadingBar.defaultProps = {
    loading: false,
    className: "",
    style: {}
}

function LoadingBar(props) {
    const { loading, className, style, top, right, bottom, left } = props;
    let _className = className ? `loading ${className}` : "loading";
    let _style = style ? style : {};
    _style.top = top ? `${top}px` : "0";
    _style.right = right ? `${right}px` : "0";
    _style.bottom = bottom ? `${bottom}px` : "0";
    _style.left = left ? `${left}px` : "0";

    if (loading) {
        return (
            <div className={_className} style={{..._style}} />
        );
    } else {
        return <></>
    }

}

export default LoadingBar;
