import CommonFunction from '@lib/common';
                    import React, {useEffect, useRef, useState} from "react";


// Utility
import _ from "lodash";

// Component
// API
import {Dropdown} from "primereact/dropdown";

export const PriorityDropdown = (props) => {

    const t = CommonFunction.t;

    const issuePrioritiesMenuItems = [
        {code: 'VERY_HIGH',name: t('priority-very-high'),score: 5,color: "#f51515"},
        {code: 'HIGH',name: t('priority-high'),score: 4,color: "#c94831"},
        {code: 'MEDIUM',name: t('priority-medium'),score: 3,color: "#ea821a"},
        {code: 'LOW',name: t('priority-low'),score: 2,color: "#f8ff76"},
        {code: 'VERY_LOW',name: t('priority-very-low'),score: 1,color: "#ffd15e"}];

    useEffect(() => {
        // console.log(props.value)
    }, []);

    const getColor = (code) =>{
        let _option;
        if(props.options){
            _option = _.find(props.options, {'code': code});
        }
        if(!_option || !_option.color){
            _option = _.find(issuePrioritiesMenuItems, {'code': code});
        }
        return _option.color || '#ffffff';
    }

    const valueTemplate = (item) => {
        if(item){
            return (
                <div className="flex justify-content-between align-items-center overflow-hidden">
                    <div>
                        <span className="bold-and-color">{item.name}</span>
                    </div>
                    <div>
                        <div style={{width: '30px', height: '5px', borderRadius: '5px', backgroundColor: getColor(item.code)}}/>
                    </div>
                </div>
            )
        }else{
            return (
                <div className="flex justify-content-between align-items-center overflow-hidden">
                    <div>
                        <span className="bold-and-color">---</span>
                    </div>
                    <div>
                        <div style={{width: '30px', height: '5px', borderRadius: '5px', backgroundColor: "#ffffff"}}/>
                    </div>
                </div>
            )
        }
    }

    const itemTemplate = (item) => {
        if(item){
            return (
                <div className="flex justify-content-between align-items-center overflow-hidden">
                    <div>
                        {item.name}
                    </div>
                    <div>
                        <div style={{width: '50px', height: '5px', borderRadius: '5px', backgroundColor: getColor(item.code)}}/>
                    </div>
                </div>
            )
        }
    }

    return (
        <Dropdown id={props.id}
                  options={props.options || issuePrioritiesMenuItems}
                  disabled={props.disabled}
                  onBlur={props.onBlur}
                  onChange={props.onChange}
                  value={props.value}
                  optionLabel="name"
                  optionValue="code"
                  display="chip"
                  showClear
                  className={props.className}
                  valueTemplate={(item) => valueTemplate(item)}
                  itemTemplate={(item) => itemTemplate(item)}
        />
    )
}
