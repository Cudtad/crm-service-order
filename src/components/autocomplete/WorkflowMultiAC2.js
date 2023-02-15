import React, { useEffect, useRef, useState } from 'react';
import "./scss/UserAutoComplete.scss";

import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import WorkflowService from 'services/WorkflowService';


export const WorkflowMultiAC2 = (props) => {
    const { className, excludeIds, includeIds, multiple, style, placeholder, disabled, delay } = props;
    const [val, setVal] = useState(null);

    /**
     * onetime
     */
    useEffect( () => {let fn=async () => {
        // load default
        if (props.value) {
            let _vals = null;
            if (!Array.isArray(props.value)) {
                _vals = [props.value]
            } else {
                _vals = props.value
            }
            if (typeof _vals[0] !== 'object') {
                let _valDetails = await WorkflowService.byIds(_vals)
                if (_valDetails) {
                    setVal(_valDetails);
                }
            } else {
                setVal(_vals);
            }
        }
    };fn();

    }, []);

    const search = async (event) => {
      let res = await get(event);
      return {
        data: res.content,
        page: res.page,
        size: res.pageSize,
        total: res.total
      };
    };

    const get = async (payload) => {
      return await WorkflowService.search(payload)
    };

    const onChange = (e) => {
      setVal(e);
      props.onChange({value: e})
    };

    return (
        <XAutoComplete
            disabled={disabled}
            multiple={multiple}
            completeMethod={search}
            value={val}
            delay={delay || 500}
            onChange={onChange}
            className={`workflow-autocomplete ${className || ""}`}
            panelClassName="workflow-autocomplete-panel"
            style={style}
            placeholder={placeholder}
            itemTemplate={(item) => (
                <span>{ item.name } - { item.categoryName }</span>
            )}
            selectedItemTemplate={(item) => (
                <span>{ item.name }</span>
            )}
        />
    )
}
