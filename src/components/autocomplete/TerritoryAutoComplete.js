import CommonFunction from '@lib/common';
                    import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useContext } from 'react';
import _ from "lodash";

import { InputText } from "primereact/inputtext";
import { TerritoryAutoCompleteDetail } from 'components/autocomplete/TerritoryAutoCompleteDetail';


function TerritoryAutoComplete(props, ref) {
    const t = CommonFunction.t;
    const { onChange, value ,locationValidate} = props;
    const typeTerritory = {
        country: 'COUNTRY',
        province: 'PROVINCE',
        district: 'DISTRICT',
        ward: 'WARD',
    };

    let emptyOtValidate = {
        reason: null,
        cancelReason: null,
        state: null,
        informUsers: null
    };

    let emptyLocationDetail = {
        countryCode: null,
        countriy: [],
        provinceCode: null,
        province: [],
        districtCode: null,
        district: [],
        wardCode: null,
        ward: [],
        timeZone: '',
    };
    const [locationDetail, setLocationDetail] = useState(emptyLocationDetail);
    useImperativeHandle(ref, () => ({

    }));

    // calendar
    useEffect(() => {
    }, []);

    /**
     * apply creating/editing service prop on input change
     * @param {string} prop
     * @param {*} val
     */
    const applyChange = (prop, val) => {
        // set state value
        let _current = _.cloneDeep(locationDetail);

        switch (prop) {
            case "country":
                _current.timeZone = (val && val[0] )?val[0].timeZone : null;
                _current.countryCode = (val && val[0] )?val[0].code : null;
                _current.provinceCode = null;
                _current.province = [];
                _current.districtCode = null;
                _current.district = [];
                _current.wardCode = null;
                _current.ward = [];
                break;
            case "province":
                _current.timeZone = (val && val[0] )?val[0].timeZone : null;
                _current.provinceCode = (val && val[0] )?val[0].code : null;
                _current.districtCode = null;
                _current.district = [];
                _current.wardCode = null;
                _current.ward = [];
                break;
            case "district":
                _current.districtCode = (val && val[0] )?val[0].code : null;
                _current.wardCode = null;
                _current.ward = [];
                break;
            case "ward":
                _current.wardCode = (val && val[0] )?val[0].code : null;
                break;
            default:
                break;
        }
        _current[prop] = (val || [] );

        if(onChange && typeof onChange === 'function' ){
            onChange(_current)
        }
        setLocationDetail(_current);
    }
    return (
        <>
            <div className="col-6">
                <span className="p-float-label">
                    <TerritoryAutoCompleteDetail
                        
                        type={typeTerritory.country}
                        value={(value && value.country) ? value.country : locationDetail.country}
                        onChange={(e) => applyChange("country", e)}
                    />
                    <label htmlFor="country"  className="require">{t('country')}</label>
                </span>
                {locationValidate.countryCode && <small className="p-invalid">{locationValidate.countryCode}</small>}
            </div>
            <div className="col-6">
                <span className="p-float-label">
                    <InputText id="time-zone"
                               value={(value && value.timeZone) ? value.timeZone : locationDetail.timeZone}
                        disabled
                        className='dense' />
                    <label htmlFor="time-zone">{t('project.setting.location.time-zone')}</label>
                </span>
            </div>
            <div className="col-6">
                <span className="p-float-label ">
                    <TerritoryAutoCompleteDetail
                        id="province"
                        
                        type={typeTerritory.province}
                        value={(value && value.province) ? value.province : locationDetail.province}
                        parent={value.countryCode}
                        disabled={value.countryCode ? false : true}
                        onChange={(e) => applyChange("province", e)}
                    />
                    <label htmlFor="province">{t('province')}</label>
                </span>
            </div>
            <div className="col-6">
                <span className="p-float-label ">
                    <TerritoryAutoCompleteDetail
                        id="district"
                        
                        type={typeTerritory.district}
                        value={(value && value.district) ? value.district : locationDetail.district}
                        parent={value.provinceCode}
                        disabled={value.provinceCode ? false : true}
                        onChange={(e) => applyChange("district", e)}
                    />
                    <label htmlFor="district">{t('district')}</label>
                </span>
            </div>
            <div className="col-6">
                <span className="p-float-label ">
                    <TerritoryAutoCompleteDetail
                        id="ward"
                        
                        type={typeTerritory.ward}
                        value={(value && value.ward) ? value.ward : locationDetail.ward}
                        parent={value.districtCode}
                        disabled={value.districtCode ? false : true}
                        onChange={(e) => applyChange("ward", e)}
                    />
                    <label htmlFor="ward">{t('ward')}</label>
                </span>
            </div>
        </>
    );
}
TerritoryAutoComplete = forwardRef(TerritoryAutoComplete);
export default TerritoryAutoComplete;
