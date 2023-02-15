import React from 'react';
import PropTypes from 'prop-types';
import './scss/Badges.scss'

Badges.propTypes = {
    className: PropTypes.string,
    pill: PropTypes.bool,
    soft: PropTypes.bool,
    span: PropTypes.bool,
    style: PropTypes.object,
    severity: PropTypes.oneOf(["primary", "success", "info", "warning", "danger", "dark"]),
    color: PropTypes.oneOf(["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple", "grey"])
};

Badges.defaultProps = {
    className: "",
    pill: false,
    soft: false,
    span: false,
    severity: "primary"
}

function Badges(props) {
    const { span, severity, className, pill, soft, children, style, color, onClick, title } = props;
    let _classname = `badge ${severity ? severity : "primary"} ${pill ? "pill" : ""} ${soft ? "soft" : ""} ${color ? `color ${color}` : ""} ${className} ${onClick && typeof onClick === "function" ? "pointer" : ""}`.trim();

    if (span) {
        return (
            <span className={_classname} style={style || {}} onClick={onClick} title={title}>
                {children}
            </span>
        );
    } else {
        return (
            <div className={_classname} style={style || {}} onClick={onClick} title={title}>
                {children}
            </div>
        );
    }


}

export default Badges;
