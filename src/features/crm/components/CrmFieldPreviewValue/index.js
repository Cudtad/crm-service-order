import React from 'react';
import "./styles.scss";
import { Button } from 'primereact/button';
import { XAvatar } from '@ui-lib/x-avatar/XAvatar';
import CommonFunction from '@lib/common';

export default function CrmFieldPreviewValue(props) {

    const { label, value, callBack, field, users, readOnly, subDescription, require } = props;

    const onClick = () => {
        if (callBack) {
            callBack(field)
        }
    }

    const renderUser = (user) => {
        return <div key={user.id} className="flex">
            <XAvatar
                className="employee-avatar"
                avatar={CommonFunction.getImageUrl(null, user.fullName, 15, 15)}
                name={user.fullName}
                label={() => <span>{user.fullName}</span>}
                size="15px"
            />
            {subDescription
                ? <span>{subDescription}</span>
                : null
            }
        </div>
    }

    return (
        <div className="flex py-1 border-bottom-1 border-gray-300 h-full mx-2">
            <div className="field-preview-label">
                <div className={`${require ? `field-require` : ``} pt-2 text-sm`} >
                    {label}
                </div>
            </div>
            <div className="w-auto pt-2 flex align-items-start">
                <div className='flex-1 text-sm'>
                    {users
                        ? users.map(renderUser)
                        : value
                    }
                </div>
                {/* <Button
                    icon="bx bx-pencil"
                    className="p-button-text p-0"
                    onClick={onClick}
                    disabled={readOnly}
                /> */}
            </div>
        </div>
    );
}


