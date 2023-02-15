import CommonFunction from '@lib/common';
import { AutoComplete } from "primereact/autocomplete";
import React, { useRef, useState } from "react";
import PropTypes from 'prop-types';

import _ from "lodash";

XAutoComplete.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    delay: PropTypes.number,
    disabled: PropTypes.bool,
    value: PropTypes.any,
    field: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    completeMethod: PropTypes.func,
    selectedItemTemplate: PropTypes.func,
    itemTemplate: PropTypes.func,
    /** async function, input : ({page: page, size: size, search: search}, params), output: {data: data, page: page, size: size, total: total} */
    getDataFn: PropTypes.func,
    /** pass any parameter to this prop.eg: { param1: { prop1: value1 } } */
    params: PropTypes.object
};

XAutoComplete.defaultProps = {
    id: "",
    className: "",
    delay: 100,
    disabled: false,
    field: "value",
}

function XAutoComplete(props) {
    const t = CommonFunction.t;

    const { id, name, className, delay, disabled, value, onChange, onBlur, field, completeMethod, selectedItemTemplate, itemTemplate, params, multiple, placeholder, style, panelClassName } = props;
    const randomId = useRef(CommonFunction.getIdNumber());
    const renderId = CommonFunction.isEmpty(id) || id === false ? `x_auto_complete_${randomId.current}` : id;
    const renderClassName = `x-auto-compelete x-auto-compelete-for-${randomId.current} ${className}`.trim();

    const pageSize = 20;

    const [suggestions, setSuggestions] = useState([]);
    const loadingState = useRef({
        data: [],
        count: 0,
        total: 0,
        query: "",
        page: 0,
        loading: false
    });

    /**
     * on change
     */
    const handleOnChange = (e) => {
        if (typeof onChange === "function") {
            let val = [];
            if (e.value.length > 0) {
                val = multiple ? e.value : [e.value[e.value.length - 1]];
            }
            onChange(val, params);
        }
    }
    /**
     * on blur
     */
    const handleOnBlur = (e) => {
        if (typeof onBlur === "function") {
            let val = [];
            if (e.value && e.value.length > 0) {
                val = multiple ? e.value : [e.value[e.value.length - 1]];
            }
            onBlur(val, params);
        }
    }

    /**
     * complete method
     */
    const handleCompleteMethod = (e) => {
        let query = e.query.trim().toLowerCase();

        if (typeof completeMethod === "function") {
            completeMethod({ page: 0, size: pageSize, search: query }, params).then(res => {
                if (res) {
                    // apply loading state
                    let _loadingState = {
                        data: res.data,
                        count: res.data.length,
                        total: res.total,
                        query: query,
                        page: 0,
                        loading: false
                    }

                    // apply data
                    loadingState.current = _loadingState;
                    setSuggestions(res.data);

                    // check if data has more, apply scroll event to load
                    setTimeout(() => {
                        let els = document.getElementsByClassName(panelClassName); // find element
                        if (els && els.length > 0) {
                            let el = els[0];
                            if (_loadingState.count < _loadingState.total) {
                                el.addEventListener("scroll", loadMoreData);
                            } else {
                                el.removeEventListener("scroll", loadMoreData);
                            }
                        }
                    }, 100);
                } else {
                    setSuggestions([]);
                    loadingState.current = {
                        count: 0,
                        total: 0
                    }
                }
            })
        } else {
            setSuggestions([]);
        }
    }

    /**
     * load more data
     */
    const loadMoreData = (e) => {
        // check if element scroll to the end

        CommonFunction.debounce(50, () => {
            let el = e.target;

            if (el.scrollTop + el.clientHeight > el.scrollHeight - 30) {
                if (!loadingState.current.loading) {
                    loadingState.current.loading = true;
                    let _loadingState = _.cloneDeep(loadingState.current);
                    completeMethod({ page: _loadingState.page + 1, size: pageSize, search: _loadingState.query }, params).then(res => {
                        if (res) {
                            if (res.data && res.data.length > 0) {
                                // append more data
                                _loadingState.data = [
                                    ..._loadingState.data,
                                    ...res.data
                                ];
                            }

                            // set lazy param
                            _loadingState.total = res.total;
                            _loadingState.count = _loadingState.data.length;
                            _loadingState.page = res.page;

                            // set suggesstions
                            setSuggestions(_loadingState.data);
                        }

                        // set loading false
                        _loadingState.loading = false;
                        loadingState.current = _loadingState;

                        // remove event if all data loaded
                        if (_loadingState.count >= _loadingState.total) {
                            let els = document.getElementsByClassName(panelClassName); // find element
                            if (els && els.length > 0) {
                                let el = els[0];
                                el.removeEventListener("scroll", loadMoreData);
                            }
                        }

                    });
                }
            }
        })

    }

    /**
     * selected item template
     */
    const handleSelectedItemTemplate = (item) => {

        if (typeof selectedItemTemplate === "function") {
            return selectedItemTemplate(item, params);
        } else {
            return <div className="">{item[field || "value"]}</div>;
        }
    }

    /**
     * item template
     */
    const handleItemTemplate = (item) => {
        if (typeof itemTemplate === "function") {
            return itemTemplate(item, params);
        } else {
            return <div className="">{item[field || "value"]}</div>;
        }
    }

    return (
        <AutoComplete
            id={renderId}
            name={name}
            autoHighlight
            multiple
            delay={delay || 100}
            disabled={disabled}
            value={value}
            onChange={(e) => handleOnChange(e)}
            onBlur={(e) => handleOnBlur(e)}
            field={field || "value"}
            className={renderClassName}
            suggestions={suggestions}
            completeMethod={handleCompleteMethod}
            panelClassName={`p-autocomplete-for-${randomId.current} ${panelClassName}`}
            dropdown
            selectedItemTemplate={handleSelectedItemTemplate}
            itemTemplate={handleItemTemplate}
            placeholder={placeholder}
            style={style}
        />
    )
}

export default XAutoComplete;
