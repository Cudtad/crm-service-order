import React from 'react';

export default function CrmSmallIconBackground(props, ref) {
    const { size, bgColor, color, icon } = props;

    return (
        <div className='flex align-items-center justify-content-center border-round-xs' style={{width: `${size ? size : 24}px`, height: `${size ? size : 24}px`, backgroundColor: bgColor ? bgColor : '#007aff', color: color ? color : 'white'}}>
            <i className={icon}></i>
        </div>
    );
}
