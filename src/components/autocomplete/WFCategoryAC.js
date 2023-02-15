import {AutoComplete} from "primereact/autocomplete";
import React, {useState, useEffect} from "react";
import WorkflowService from 'services/WorkflowService';

export const WFCategoryAC = (props) => {

    const [filtered, setFiltered] = useState(null);
    const [val, setVal] = useState(null);

    /**
     * onetime
     */

    useEffect( () => {
        let fn = async () => {
            if (props.value) {
                const id = typeof props.value === 'object' ? props.value.id : props.value
                await getDefaultById(id);
            }
        }
        fn();
    }, []);

    const getDefaultById = async (id) => {
        await WorkflowService.category.getById(id).then(data => {
            setVal(data)
        });
    };

    const search = (event, items) => {
        if (!event.query.trim().length) {
            setFiltered(items);
        } else {
            get(event.query.toLowerCase()).then(data => {
                setFiltered(data.content)
            });
        }
    };
    const get = async (searchTerm = []) => {
        return await WorkflowService.category.searchAll({
            filter: searchTerm,
            rows: 50
        })
    };

    const onChange = (e) => {
        setVal(e.value)
        props.onChange({value: e.value.id})
    };

    return (
      <AutoComplete
        id={props.id}
        autoHighlight
        // multiple={props.multiple}
        delay={100}
        disabled={props.disabled}
        value={val}
        onChange={onChange}
        onBlur={props.onBlur}
        field={props.field ? props.field : 'name'}
        className={props.className + ""}
        suggestions={filtered}
        completeMethod={search}
      />
    )
}
