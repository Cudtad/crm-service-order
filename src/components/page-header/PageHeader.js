import React from 'react';
import PropTypes from 'prop-types';

import './scss/PageHeader.scss';
import { useNavigate } from 'react-router-dom';
import CommonFunction from '@lib/common';

PageHeader.propTypes = {
    title: PropTypes.string,
    breadcrumb: PropTypes.array,
    className: PropTypes.string
};

PageHeader.defaultProps = {
    title: '',
    breadcrumb: [],
    className: ""
}

function PageHeader(props) {
    const t = CommonFunction.t;
    const history = useNavigate();
    const {title, breadcrumb, className} = props;

    return (
        <div className={`page-header-container ${className}`}>
            <div className='title'>{title}</div>

            <div className="breadcrumb">
                <span
                    className="dashboard-link pointer small"
                    onClick={() => history("/dashboard")}
                >
                    {t("menu.dashboard")}
                </span>
                {breadcrumb.map((m, index) => (
                    <React.Fragment key={index}>
                        <span className="pl-1 pr-1 text-grey-5">/</span>
                        <span className="small">{m}</span>
                    </React.Fragment>
                ))}
            </div>

            {/* <nav>
                <ol className="breadcrumb p-0">
                    <li className="breadcrumb-item home">
                        <a href='/#/'>
                            {t("menu.dashboard")}
                        </a>
                    </li>
                    {breadcrumb.map((m, index) => (
                        <React.Fragment key={index}>
                            <li className="breadcrumb-item">{m}</li>
                        </React.Fragment>
                    ))}
                </ol>
            </nav> */}
        </div>
    );
}

export default PageHeader;
